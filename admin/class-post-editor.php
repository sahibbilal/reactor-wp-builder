<?php
/**
 * Post editor integration class.
 *
 * @package Reactor\WP\Builder\Admin
 */

namespace Reactor\WP\Builder\Admin;

/**
 * Post editor builder integration.
 */
class Post_Editor {

	/**
	 * Constructor.
	 */
	public function __construct() {
		// Inject stubs IMMEDIATELY - before any other hooks
		$this->inject_stubs_immediately();
		
		add_action( 'admin_init', array( $this, 'check_builder_mode' ) );
		// Enqueue media library FIRST, before React app
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_media_library' ), 1 );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_builder_scripts' ), 5 );
		add_action( 'edit_form_after_title', array( $this, 'render_builder_interface' ) );
		add_action( 'admin_head', array( $this, 'prevent_editor_errors' ), -999 ); // Very early priority
		add_action( 'admin_print_scripts', array( $this, 'prevent_editor_errors_early' ), -999 ); // Very early priority
		add_action( 'admin_footer', array( $this, 'prevent_editor_errors_footer' ), 999 );
		add_action( 'admin_print_footer_scripts', array( $this, 'prevent_editor_errors_footer' ), 0 );
		
		// Use output buffering to inject stubs before WordPress inline scripts
		add_action( 'admin_init', array( $this, 'start_output_buffering' ), 1 );
		// Also inject via script loader tag filter
		add_filter( 'script_loader_tag', array( $this, 'inject_stubs_via_script_tag' ), 1, 2 );
		// Use shutdown hook to ensure output buffering works
		add_action( 'shutdown', array( $this, 'flush_output_buffer' ), 0 );
	}
	
	/**
	 * Inject stubs immediately via inline script in head.
	 * This runs as early as possible to prevent errors.
	 */
	private function inject_stubs_immediately(): void {
		// Check if we're on a post editor page
		if ( ! isset( $_GET['post'] ) || ! isset( $_GET['action'] ) || 'edit' !== $_GET['action'] ) {
			return;
		}
		
		$post_id = absint( $_GET['post'] );
		$post = get_post( $post_id );
		
		if ( ! $post ) {
			return;
		}
		
		$settings = new Settings();
		$enabled_types = $settings->get_enabled_post_types();
		
		if ( ! in_array( $post->post_type, $enabled_types, true ) ) {
			return;
		}
		
		// Output script immediately - this will be in the page before WordPress's inline scripts
		add_action( 'admin_head', function() {
			echo '<script>
			// Initialize WordPress stubs IMMEDIATELY - MUST run before WordPress inline scripts
			// CRITICAL: This must execute before line 2105 in post.php
			(function() {
				"use strict";
				if (typeof window.wp === "undefined") { window.wp = {}; }
				
				// Initialize SVG painter FIRST - this is accessed very early
				if (typeof window.wp.svgPainter === "undefined") {
					window.wp.svgPainter = { init: function() {}, interval: null, view: {} };
				}
				if (!window.wp.svgPainter.hasOwnProperty("interval") || window.wp.svgPainter.interval === undefined) {
					window.wp.svgPainter.interval = null;
				}
				if (typeof window.wp.svgPainter.view === "undefined") {
					window.wp.svgPainter.view = {};
				}
				
				// Initialize editor stub
				if (typeof window.wp.editor === "undefined") {
					window.wp.editor = { initialize: function() {}, remove: function() {} };
				}
				
				// Initialize media structure - but don\'t override if it\'s already a function
				// wp_enqueue_media() will set wp.media as a function, so we only set structure if undefined
				if (typeof window.wp.media === "undefined") {
					window.wp.media = {};
				}
				if (typeof window.wp.media.view === "undefined") {
					window.wp.media.view = {};
				}
				if (typeof window.wp.media.controller === "undefined") {
					window.wp.media.controller = {};
				}
				if (typeof window.wp.media.editor === "undefined") {
					window.wp.media.editor = { initializeEditor: function() {}, remove: function() {} };
				}
			})();
			</script>';
		}, -9999 ); // Extremely early priority
	}

	/**
	 * Check if builder mode is active.
	 */
	public function check_builder_mode(): void {
		if ( ! isset( $_GET['post'] ) ) {
			return;
		}

		$post_id = absint( $_GET['post'] );
		$post    = get_post( $post_id );

		if ( ! $post ) {
			return;
		}

		$enabled_types = Settings::get_enabled_post_types();

		if ( ! in_array( $post->post_type, $enabled_types, true ) ) {
			return;
		}

		// Prevent WordPress from loading editor scripts.
		add_filter( 'user_can_richedit', '__return_false' );
		add_filter( 'wp_editor_expand', '__return_false' );
		
		// Prevent 'post' script from loading - this is critical to prevent errors
		add_action( 'admin_enqueue_scripts', array( $this, 'prevent_post_script' ), 1 );
		add_action( 'admin_print_scripts', array( $this, 'prevent_post_script_inline' ), 1 );
		
		// Enqueue stub script with highest priority to load before WordPress scripts
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_stub_script' ), 0 );

		// Set flag to show builder interface.
		$this->is_builder_mode = true;
		$this->post_id         = $post_id;
	}

	/**
	 * Prevent post script from loading.
	 */
	public function prevent_post_script(): void {
		wp_dequeue_script( 'post' );
		wp_deregister_script( 'post' );
		wp_dequeue_script( 'editor-expand' );
		wp_deregister_script( 'editor-expand' );
	}

	/**
	 * Enqueue WordPress Media Library scripts early.
	 * This must run before React app to ensure wp.media is available.
	 *
	 * @param string $hook Current admin page hook.
	 */
	public function enqueue_media_library( string $hook ): void {
		if ( 'post.php' !== $hook ) {
			return;
		}

		if ( ! isset( $_GET['post'] ) ) {
			return;
		}

		$post_id = absint( $_GET['post'] );
		$post    = get_post( $post_id );

		if ( ! $post ) {
			return;
		}

		$enabled_types = Settings::get_enabled_post_types();

		if ( ! in_array( $post->post_type, $enabled_types, true ) ) {
			return;
		}

		// Enqueue WordPress Media Library - this sets wp.media as a function
		// Must be called early to ensure it loads before React app
		wp_enqueue_media( array( 'post' => $post_id ) );
		
		// Explicitly enqueue all media-related scripts to ensure they're loaded
		// These are dependencies for wp.media to work properly
		wp_enqueue_script( 'jquery' );
		wp_enqueue_script( 'jquery-ui-core' );
		wp_enqueue_script( 'jquery-ui-widget' );
		wp_enqueue_script( 'jquery-ui-mouse' );
		wp_enqueue_script( 'jquery-ui-sortable' );
		wp_enqueue_script( 'jquery-ui-draggable' );
		wp_enqueue_script( 'jquery-ui-droppable' );
		wp_enqueue_script( 'jquery-ui-resizable' );
		wp_enqueue_script( 'jquery-ui-button' );
		wp_enqueue_script( 'jquery-ui-position' );
		wp_enqueue_script( 'jquery-ui-dialog' );
		wp_enqueue_script( 'jquery-ui-tabs' );
		wp_enqueue_script( 'jquery-ui-tooltip' );
		wp_enqueue_script( 'wp-util' );
		wp_enqueue_script( 'wp-backbone' );
		wp_enqueue_script( 'media-models' );
		wp_enqueue_script( 'media-views' );
		wp_enqueue_script( 'media-editor' );
		wp_enqueue_script( 'media-upload' );
		wp_enqueue_script( 'media-grid' );
		wp_enqueue_script( 'media-audiovideo' );
		
		// Enqueue media-related styles
		wp_enqueue_style( 'wp-mediaelement' );
		wp_enqueue_style( 'media-views' );
		wp_enqueue_style( 'mediaelementplayer' );
	}

	/**
	 * Enqueue builder scripts on post editor.
	 *
	 * @param string $hook Current admin page hook.
	 */
	public function enqueue_builder_scripts( string $hook ): void {
		if ( 'post.php' !== $hook ) {
			return;
		}

		if ( ! isset( $_GET['post'] ) ) {
			return;
		}

		$post_id = absint( $_GET['post'] );
		$post    = get_post( $post_id );

		if ( ! $post ) {
			return;
		}

		$enabled_types = Settings::get_enabled_post_types();

		if ( ! in_array( $post->post_type, $enabled_types, true ) ) {
			return;
		}

		// Prevent WordPress from loading editor scripts.
		add_filter( 'user_can_richedit', '__return_false' );
		add_action( 'admin_head', array( $this, 'hide_default_editor' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'dequeue_editor_scripts' ), 999 );

		// Enqueue React app.
		$app_dir = REACTOR_WP_BUILDER_PLUGIN_DIR;
		$app_url = REACTOR_WP_BUILDER_PLUGIN_URL;

		// Check if we're in development mode (Vite dev server).
		$is_dev = defined( 'WP_DEBUG' ) && WP_DEBUG && file_exists( $app_dir . '/.vite-dev' );

		if ( $is_dev ) {
			// Development: Load from Vite dev server.
			$dev_server = 'http://localhost:5173';
			wp_enqueue_script(
				'reactor-builder-app',
				$dev_server . '/src/main.jsx',
				array(),
				REACTOR_WP_BUILDER_VERSION,
				true
			);
		} else {
			// Production: Load built assets.
			$manifest_path = $app_dir . 'dist/manifest.json';
			
			if ( ! file_exists( $manifest_path ) ) {
				$manifest_path = $app_dir . 'dist/.vite/manifest.json';
			}
			
			if ( file_exists( $manifest_path ) ) {
				$manifest = json_decode( file_get_contents( $manifest_path ), true );
				$main_js  = $manifest['src/main.jsx']['file'] ?? '';

				if ( $main_js ) {
					wp_enqueue_script(
						'reactor-builder-app',
						$app_url . 'dist/' . $main_js,
						array(),
						REACTOR_WP_BUILDER_VERSION,
						true
					);

					// Enqueue CSS if available.
					if ( isset( $manifest['src/main.jsx']['css'] ) ) {
						foreach ( $manifest['src/main.jsx']['css'] as $css_file ) {
							wp_enqueue_style(
								'reactor-builder-app-style',
								$app_url . 'dist/' . $css_file,
								array(),
								REACTOR_WP_BUILDER_VERSION
							);
						}
					}
				}
			} else {
				// Fallback: Try to load from dist/assets.
				$dist_dir = $app_dir . 'dist/assets/';
				if ( is_dir( $dist_dir ) ) {
					$js_files = glob( $dist_dir . '*.js' );
					if ( ! empty( $js_files ) ) {
						$js_file = basename( $js_files[0] );
						wp_enqueue_script(
							'reactor-builder-app',
							$app_url . 'dist/assets/' . $js_file,
							array(),
							REACTOR_WP_BUILDER_VERSION,
							true
						);
					}
				}
			}
		}

		// Media Library is already enqueued in enqueue_media_library() method
		// Just ensure media scripts are loaded
		if ( ! wp_script_is( 'media-views', 'enqueued' ) ) {
			wp_enqueue_script( 'media-views' );
		}
		if ( ! wp_script_is( 'media-editor', 'enqueued' ) ) {
			wp_enqueue_script( 'media-editor' );
		}
		if ( ! wp_script_is( 'media-upload', 'enqueued' ) ) {
			wp_enqueue_script( 'media-upload' );
		}
		if ( ! wp_script_is( 'media-models', 'enqueued' ) ) {
			wp_enqueue_script( 'media-models' );
		}

		// Localize script.
		wp_localize_script(
			'reactor-builder-app',
			'reactorBuilder',
			array(
				'apiUrl'   => rest_url( 'reactor/v1/' ),
				'nonce'    => wp_create_nonce( 'wp_rest' ),
				'root'     => esc_url_raw( rest_url() ),
				'version'  => REACTOR_WP_BUILDER_VERSION,
				'postId'   => $post_id,
			)
		);
	}

	/**
	 * Dequeue editor scripts that cause conflicts.
	 * Note: We keep ALL media-related scripts for Media Library functionality.
	 */
	public function dequeue_editor_scripts(): void {
		// Remove editor scripts that expect editor elements, but keep ALL media library scripts.
		// We need ALL media scripts (media-upload, media-editor, media-views, etc.) for the Media Library to work.
		wp_dequeue_script( 'svg-painter' );
		wp_dequeue_script( 'editor' );
		wp_dequeue_script( 'word-count' );
		wp_dequeue_script( 'post' );
		wp_deregister_script( 'svg-painter' );
		wp_deregister_script( 'editor' );
		wp_deregister_script( 'word-count' );
		wp_deregister_script( 'post' );
		
		// CRITICAL: Re-enqueue ALL media scripts to ensure Media Library works
		// These must be present for wp.media to function properly
		$media_scripts = array(
			'jquery',
			'jquery-ui-core',
			'jquery-ui-widget',
			'jquery-ui-mouse',
			'jquery-ui-sortable',
			'jquery-ui-draggable',
			'jquery-ui-droppable',
			'jquery-ui-resizable',
			'jquery-ui-button',
			'jquery-ui-position',
			'jquery-ui-dialog',
			'jquery-ui-tabs',
			'jquery-ui-tooltip',
			'wp-util',
			'wp-backbone',
			'media-models',
			'media-views',
			'media-editor',
			'media-upload',
			'media-grid',
			'media-audiovideo',
		);
		
		foreach ( $media_scripts as $script ) {
			if ( ! wp_script_is( $script, 'enqueued' ) ) {
				wp_enqueue_script( $script );
			}
		}
		
		// Re-enqueue media styles
		$media_styles = array(
			'wp-mediaelement',
			'media-views',
			'mediaelementplayer',
		);
		
		foreach ( $media_styles as $style ) {
			if ( ! wp_style_is( $style, 'enqueued' ) ) {
				wp_enqueue_style( $style );
			}
		}
	}
	
	/**
	 * Prevent post script inline code from executing.
	 */
	public function prevent_post_script_inline(): void {
		// This runs in admin_print_scripts to prevent inline scripts from executing
		// We can't prevent inline scripts directly, but we ensure stubs are in place
		// The stubs should already be initialized by this point via other methods
	}
	
	/**
	 * Enqueue stub script with highest priority.
	 */
	public function enqueue_stub_script(): void {
		// Enqueue stub script that loads before WordPress scripts
		wp_enqueue_script(
			'reactor-builder-stubs',
			REACTOR_WP_BUILDER_PLUGIN_URL . 'admin/js/post-editor-stubs.js',
			array(), // No dependencies - must load first
			REACTOR_WP_BUILDER_VERSION,
			false // Load in header, not footer
		);
	}

	/**
	 * Hide default editor when in builder mode.
	 */
	public function hide_default_editor(): void {
		?>
		<style>
			#postdivrich,
			#post-body-content,
			.wp-editor-wrap,
			#post-status-info,
			#minor-publishing-actions,
			#misc-publishing-actions,
			#post-body .postbox:not(#reactor-builder-meta),
			#normal-sortables .postbox:not(#reactor-builder-meta),
			#side-sortables .postbox:not(#reactor-builder-meta) {
				display: none !important;
			}
			#editor {
				min-height: calc(100vh - 200px);
				margin: 20px 0;
			}
			.wrap {
				margin: 0;
			}
			#wpbody-content {
				padding: 0;
			}
		</style>
		<?php
	}

	/**
	 * Render builder interface.
	 *
	 * @param \WP_Post $post Post object.
	 */
	public function render_builder_interface( \WP_Post $post ): void {
		$enabled_types = Settings::get_enabled_post_types();

		if ( ! in_array( $post->post_type, $enabled_types, true ) ) {
			return;
		}

		// Add back to editor link.
		$edit_url = admin_url( 'post.php?post=' . $post->ID . '&action=edit' );
		?>
		<div style="padding: 20px; background: #fff; border-bottom: 1px solid #ddd;">
			<a href="<?php echo esc_url( $edit_url ); ?>" class="button">
				← <?php esc_html_e( 'Back to Editor', 'reactor-wp-builder' ); ?>
			</a>
		</div>
		<div id="editor" style="position: relative; z-index: 1;"></div>
		<?php
	}

	/**
	 * Prevent editor JavaScript errors (early in head).
	 */
	public function prevent_editor_errors(): void {
		?>
		<script>
		// Initialize stubs BEFORE WordPress scripts load - CRITICAL for preventing errors
		(function() {
			// Create wp object immediately
			if (typeof window.wp === 'undefined') {
				window.wp = {};
			}
			
			// Initialize SVG painter stub FIRST - MUST have interval property
			// This is accessed very early by WordPress scripts
			if (typeof window.wp.svgPainter === 'undefined') {
				window.wp.svgPainter = {
					init: function() {},
					interval: null,
					view: {}
				};
			}
			if (!window.wp.svgPainter.hasOwnProperty('interval') || window.wp.svgPainter.interval === undefined) {
				window.wp.svgPainter.interval = null;
			}
			if (typeof window.wp.svgPainter.view === 'undefined') {
				window.wp.svgPainter.view = {};
			}
			
			// Initialize editor stub
			if (typeof window.wp.editor === 'undefined') {
				window.wp.editor = {
					initialize: function() {},
					remove: function() {}
				};
			}
			
			// Initialize media structure - but DON'T override if it's already a function
			// wp_enqueue_media() sets wp.media as a function, so we only set structure if undefined
			if (typeof window.wp.media === 'undefined') {
				window.wp.media = {};
			}
			if (typeof window.wp.media.view === 'undefined') {
				window.wp.media.view = {};
			}
			if (typeof window.wp.media.controller === 'undefined') {
				window.wp.media.controller = {};
			}
			if (typeof window.wp.media.editor === 'undefined') {
				window.wp.media.editor = {
					initializeEditor: function() {},
					remove: function() {}
				};
			}
		})();
		</script>
		<?php
	}

	/**
	 * Prevent editor errors before scripts print.
	 */
	public function prevent_editor_errors_early(): void {
		?>
		<script>
		// Initialize stubs as early as possible - runs in admin_print_scripts with priority 0
		// This executes before WordPress's inline scripts in post.php
		(function() {
			'use strict';
			// Create wp object if it doesn't exist
			if (typeof window.wp === 'undefined') {
				window.wp = {};
			}
			
			// Initialize SVG painter stub FIRST - CRITICAL: must have interval property
			// WordPress post.php tries to access wp.svgPainter.interval at line 2105
			if (typeof window.wp.svgPainter === 'undefined') {
				window.wp.svgPainter = {
					init: function() {},
					interval: null,
					view: {}
				};
			}
			if (!window.wp.svgPainter.hasOwnProperty('interval') || window.wp.svgPainter.interval === undefined) {
				window.wp.svgPainter.interval = null;
			}
			if (typeof window.wp.svgPainter.view === 'undefined') {
				window.wp.svgPainter.view = {};
			}
			
			// Initialize editor stub
			if (typeof window.wp.editor === 'undefined') {
				window.wp.editor = {
					initialize: function() {},
					remove: function() {}
				};
			}
			
			// Initialize media structure - but DON'T override if it's already a function
			// wp_enqueue_media() sets wp.media as a function, so we only set structure if undefined
			if (typeof window.wp.media === 'undefined') {
				window.wp.media = {};
			}
			if (typeof window.wp.media.view === 'undefined') {
				window.wp.media.view = {};
			}
			if (typeof window.wp.media.controller === 'undefined') {
				window.wp.media.controller = {};
			}
			if (typeof window.wp.media.editor === 'undefined') {
				window.wp.media.editor = {
					initializeEditor: function() {},
					remove: function() {}
				};
			}
		})();
		</script>
		<?php
	}

	/**
	 * Prevent editor JavaScript errors (in footer).
	 */
	public function prevent_editor_errors_footer(): void {
		?>
		<script>
		(function() {
			// Ensure stubs are in place
			if (typeof window.wp !== 'undefined') {
				if (!window.wp.media) {
					window.wp.media = {};
				}
				if (!window.wp.media.editor) {
					window.wp.media.editor = {
						initializeEditor: function() {},
						remove: function() {}
					};
				}
				if (!window.wp.svgPainter) {
					window.wp.svgPainter = {
						init: function() {},
						interval: null
					};
				}
				if (!window.wp.editor) {
					window.wp.editor = {
						initialize: function() {},
						remove: function() {}
					};
				}
			}
			
			// Override any existing media editor initialization
			jQuery(document).ready(function($) {
				// Remove any media editor event handlers
				$(document).off('click', '.insert-media');
				$(document).off('click', '.add_media');
				
				// Prevent editor initialization attempts
				if (window.wp && window.wp.editor) {
					var originalInit = window.wp.editor.initialize;
					window.wp.editor.initialize = function() {
						// Do nothing
					};
				}
			});
		})();
		</script>
		<?php
	}
	
	/**
	 * Start output buffering to inject stubs early.
	 */
	public function start_output_buffering(): void {
		// Only run on post editor pages
		if ( ! isset( $_GET['post'] ) || ! isset( $_GET['action'] ) || 'edit' !== $_GET['action'] ) {
			return;
		}
		
		$post_id = absint( $_GET['post'] );
		$post = get_post( $post_id );
		
		if ( ! $post ) {
			return;
		}
		
		$settings = new Settings();
		$enabled_types = $settings->get_enabled_post_types();
		
		if ( ! in_array( $post->post_type, $enabled_types, true ) ) {
			return;
		}
		
		// Start output buffering to inject stubs before WordPress inline scripts
		// We need to start buffering early, but WordPress may already have buffering active
		// So we'll use a different approach - inject via template_redirect or admin_init
		// Actually, let's use the template_redirect hook which runs before output starts
		add_action( 'template_redirect', array( $this, 'start_output_buffering_early' ), 1 );
		add_action( 'admin_init', array( $this, 'start_output_buffering_early' ), 1 );
	}
	
	/**
	 * Start output buffering early (before any output).
	 */
	public function start_output_buffering_early(): void {
		// Only run on post editor pages
		if ( ! isset( $_GET['post'] ) || ! isset( $_GET['action'] ) || 'edit' !== $_GET['action'] ) {
			return;
		}
		
		$post_id = absint( $_GET['post'] );
		$post = get_post( $post_id );
		
		if ( ! $post ) {
			return;
		}
		
		$settings = new Settings();
		$enabled_types = $settings->get_enabled_post_types();
		
		if ( ! in_array( $post->post_type, $enabled_types, true ) ) {
			return;
		}
		
		// Start output buffering if not already active
		// We check the level to avoid nested buffering issues
		$current_level = ob_get_level();
		if ( $current_level === 0 ) {
			ob_start( array( $this, 'inject_stubs_into_output' ) );
		}
	}
	
	/**
	 * Inject stub script into output buffer.
	 */
	public function inject_stubs_into_output( string $buffer ): string {
		// Only process if this is HTML output
		if ( strpos( $buffer, '<!DOCTYPE' ) === false && strpos( $buffer, '<html' ) === false ) {
			return $buffer;
		}
		
		// Check if stub is already injected to avoid duplicates
		if ( strpos( $buffer, 'window.wp.svgPainter' ) !== false && strpos( $buffer, 'interval: null' ) !== false ) {
			return $buffer;
		}
		
		$stub_script = '<script>
		// Initialize WordPress stubs IMMEDIATELY to prevent errors
		// This MUST run before any WordPress inline scripts
		// CRITICAL: This script must execute synchronously before line 2105 in post.php
		(function() {
			"use strict";
			if (typeof window.wp === "undefined") { window.wp = {}; }
			window.wp.media = window.wp.media || {};
			window.wp.media.view = window.wp.media.view || {};
			window.wp.media.controller = window.wp.media.controller || {};
			window.wp.media.editor = window.wp.media.editor || { initializeEditor: function() {}, remove: function() {} };
			window.wp.svgPainter = window.wp.svgPainter || { init: function() {}, interval: null, view: {} };
			if (window.wp.svgPainter.interval === undefined || window.wp.svgPainter.interval === null) { window.wp.svgPainter.interval = null; }
			window.wp.editor = window.wp.editor || { initialize: function() {}, remove: function() {} };
		})();
		</script>';
		
		// Try multiple injection points to ensure we catch it
		// First, try to inject right after <head> tag
		if ( preg_match( '/(<head[^>]*>)/i', $buffer, $matches, PREG_OFFSET_CAPTURE ) ) {
			$head_pos = $matches[0][1] + strlen( $matches[0][0] );
			$buffer = substr_replace( $buffer, "\n" . $stub_script . "\n", $head_pos, 0 );
		} elseif ( preg_match( '/(<html[^>]*>)/i', $buffer, $matches, PREG_OFFSET_CAPTURE ) ) {
			// Fallback: inject after <html> if <head> not found
			$html_pos = $matches[0][1] + strlen( $matches[0][0] );
			$buffer = substr_replace( $buffer, "\n" . $stub_script . "\n", $html_pos, 0 );
		} elseif ( preg_match( '/(<body[^>]*>)/i', $buffer, $matches, PREG_OFFSET_CAPTURE ) ) {
			// Last resort: inject after <body>
			$body_pos = $matches[0][1] + strlen( $matches[0][0] );
			$buffer = substr_replace( $buffer, "\n" . $stub_script . "\n", $body_pos, 0 );
		}
		
		return $buffer;
	}
	
	/**
	 * Inject stubs via script loader tag filter (runs for each script).
	 */
	public function inject_stubs_via_script_tag( string $tag, string $handle ): string {
		static $injected = false;
		
		// Only inject once, before the first script
		if ( ! $injected ) {
			$screen = get_current_screen();
			if ( $screen && 'post' === $screen->base ) {
				$post = get_post();
				if ( $post ) {
					$settings = new Settings();
					$enabled_types = $settings->get_enabled_post_types();
					
					if ( in_array( $post->post_type, $enabled_types, true ) ) {
						$stub_script = '<script>
						// Initialize WordPress stubs IMMEDIATELY to prevent errors
						(function() {
							"use strict";
							if (typeof window.wp === "undefined") { window.wp = {}; }
							window.wp.media = window.wp.media || {};
							window.wp.media.view = window.wp.media.view || {};
							window.wp.media.controller = window.wp.media.controller || {};
							window.wp.media.editor = window.wp.media.editor || { initializeEditor: function() {}, remove: function() {} };
							window.wp.svgPainter = window.wp.svgPainter || { init: function() {}, interval: null, view: {} };
							if (window.wp.svgPainter.interval === undefined) { window.wp.svgPainter.interval = null; }
							window.wp.editor = window.wp.editor || { initialize: function() {}, remove: function() {} };
						})();
						</script>';
						$injected = true;
						return $stub_script . $tag;
					}
				}
			}
		}
		
		return $tag;
	}
	
	/**
	 * Flush output buffer on shutdown.
	 */
	public function flush_output_buffer(): void {
		// Ensure output buffer is flushed if we started one
		// This is a safety measure to ensure output buffering works correctly
		if ( ob_get_level() > 0 ) {
			ob_end_flush();
		}
	}
}

