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
		
		// Prevent 'post' script from loading.
		add_action( 'admin_enqueue_scripts', array( $this, 'prevent_post_script' ), 1 );

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
	 */
	public function dequeue_editor_scripts(): void {
		// Remove media editor scripts that expect editor elements.
		wp_dequeue_script( 'media-editor' );
		wp_dequeue_script( 'media-upload' );
		wp_dequeue_script( 'svg-painter' );
		wp_dequeue_script( 'editor' );
		wp_dequeue_script( 'word-count' );
		wp_dequeue_script( 'post' );
		wp_deregister_script( 'media-editor' );
		wp_deregister_script( 'media-upload' );
		wp_deregister_script( 'svg-painter' );
		wp_deregister_script( 'editor' );
		wp_deregister_script( 'word-count' );
		wp_deregister_script( 'post' );
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
			#reactor-builder-root {
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
		<div id="reactor-builder-root" style="position: relative; z-index: 1;"></div>
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
			
			// Initialize media stubs
			window.wp.media = window.wp.media || {};
			window.wp.media.view = window.wp.media.view || {};
			window.wp.media.controller = window.wp.media.controller || {};
			window.wp.media.editor = window.wp.media.editor || {
				initializeEditor: function() {},
				remove: function() {}
			};
			
			// Initialize SVG painter stub - MUST have interval property
			window.wp.svgPainter = window.wp.svgPainter || {
				init: function() {},
				interval: null,
				view: {}
			};
			// Ensure interval is always set
			if (window.wp.svgPainter.interval === undefined) {
				window.wp.svgPainter.interval = null;
			}
			
			// Prevent editor initialization
			window.wp.editor = window.wp.editor || {
				initialize: function() {},
				remove: function() {}
			};
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
			
			// Initialize media stubs immediately
			if (!window.wp.media) {
				window.wp.media = {};
			}
			if (!window.wp.media.view) {
				window.wp.media.view = {};
			}
			if (!window.wp.media.controller) {
				window.wp.media.controller = {};
			}
			if (!window.wp.media.editor) {
				window.wp.media.editor = {
					initializeEditor: function() {},
					remove: function() {}
				};
			}
			
			// Initialize SVG painter stub - CRITICAL: must have interval property
			// WordPress post.php tries to access wp.svgPainter.interval at line 2018
			if (!window.wp.svgPainter) {
				window.wp.svgPainter = {
					init: function() {},
					interval: null,
					view: {}
				};
			}
			// Ensure interval exists even if svgPainter was partially initialized
			if (window.wp.svgPainter.interval === undefined || window.wp.svgPainter.interval === null) {
				window.wp.svgPainter.interval = null;
			}
			
			// Prevent editor initialization
			if (!window.wp.editor) {
				window.wp.editor = {
					initialize: function() {},
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
		// Use output buffering level 0 to ensure we capture all output
		if ( ! ob_get_level() ) {
			ob_start( array( $this, 'inject_stubs_into_output' ) );
		}
	}
	
	/**
	 * Inject stub script into output buffer.
	 */
	public function inject_stubs_into_output( string $buffer ): string {
		$stub_script = '<script>
		// Initialize WordPress stubs IMMEDIATELY to prevent errors
		// This MUST run before any WordPress inline scripts
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
		
		// Inject immediately after <head> tag
		if ( preg_match( '/(<head[^>]*>)/i', $buffer, $matches, PREG_OFFSET_CAPTURE ) ) {
			$head_pos = $matches[0][1] + strlen( $matches[0][0] );
			$buffer = substr_replace( $buffer, $stub_script, $head_pos, 0 );
		} elseif ( preg_match( '/(<body[^>]*>)/i', $buffer, $matches, PREG_OFFSET_CAPTURE ) ) {
			// Fallback: inject after <body> if <head> not found
			$body_pos = $matches[0][1] + strlen( $matches[0][0] );
			$buffer = substr_replace( $buffer, $stub_script, $body_pos, 0 );
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
}

