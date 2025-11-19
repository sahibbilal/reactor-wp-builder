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
	 * Whether builder mode is active.
	 *
	 * @var bool
	 */
	private $is_builder_mode = false;

	/**
	 * Current post ID in builder mode.
	 *
	 * @var int
	 */
	private $post_id = 0;

	/**
	 * Constructor.
	 */
	public function __construct() {
		add_action( 'admin_init', array( $this, 'check_builder_mode' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_builder_scripts' ), 5 );
		add_action( 'edit_form_after_title', array( $this, 'render_builder_interface' ) );
		
		// Use script_loader_tag filter for stub injection
		add_filter( 'script_loader_tag', array( $this, 'inject_stubs_via_script_tag' ), 1, 2 );
	}

	/**
	 * Check if builder mode is active.
	 */
	public function check_builder_mode(): void {
		// Check if all three required URL parameters are present
		if ( ! isset( $_GET['post'] ) ) {
			return;
		}

		if ( ! isset( $_GET['action'] ) || 'edit' !== $_GET['action'] ) {
			return;
		}

		if ( ! isset( $_GET['reactor_builder'] ) || '1' !== $_GET['reactor_builder'] ) {
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
		
		// Enqueue stub script with highest priority to load before WordPress scripts
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_stub_script' ), 0 );

		// Set flag to show builder interface.
		$this->is_builder_mode = true;
		$this->post_id         = $post_id;
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

		// Check if all three required URL parameters are present
		if ( ! isset( $_GET['post'] ) ) {
			return;
		}

		if ( ! isset( $_GET['action'] ) || 'edit' !== $_GET['action'] ) {
			return;
		}

		if ( ! isset( $_GET['reactor_builder'] ) || '1' !== $_GET['reactor_builder'] ) {
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
		
		// Enqueue WordPress Media Library with post ID
		wp_enqueue_media( array( 'post' => $post_id ) );
		
		// Ensure wp-backbone is loaded (required for wp.Backbone.View used by media-views)
		wp_enqueue_script( 'wp-backbone' );
		
		add_action( 'admin_footer', function() use ( $post_id ) {
			global $wp_scripts;
			
			if ( ! ( $wp_scripts instanceof \WP_Scripts ) ) {
				return;
			}
			
			$scripts_to_print = array();
			
			// Print dependencies in correct order
			if ( wp_script_is( 'underscore', 'enqueued' ) && ! wp_script_is( 'underscore', 'done' ) ) {
				$scripts_to_print[] = 'underscore';
			}
			if ( wp_script_is( 'backbone', 'enqueued' ) && ! wp_script_is( 'backbone', 'done' ) ) {
				$scripts_to_print[] = 'backbone';
			}
			if ( wp_script_is( 'wp-backbone', 'enqueued' ) && ! wp_script_is( 'wp-backbone', 'done' ) ) {
				$scripts_to_print[] = 'wp-backbone';
			}
			if ( wp_script_is( 'media-models', 'enqueued' ) && ! wp_script_is( 'media-models', 'done' ) ) {
				$scripts_to_print[] = 'media-models';
			}
			if ( wp_script_is( 'media-views', 'enqueued' ) && ! wp_script_is( 'media-views', 'done' ) ) {
				$scripts_to_print[] = 'media-views';
			}
			if ( wp_script_is( 'media-editor', 'enqueued' ) && ! wp_script_is( 'media-editor', 'done' ) ) {
				$scripts_to_print[] = 'media-editor';
			}
			
			if ( ! empty( $scripts_to_print ) ) {
				foreach ( $scripts_to_print as $handle ) {
					if ( isset( $wp_scripts->registered[ $handle ] ) ) {
						if ( ! in_array( $handle, $wp_scripts->queue, true ) ) {
							$wp_scripts->queue[] = $handle;
						}
						$wp_scripts->do_item( $handle );
					}
				}
			}
		}, 999 );
		
		// Ensure media modal appears above React app
		add_action( 'admin_head', function() {
			echo '<style>.media-modal { z-index: 999999 !important; }</style>';
		});

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
				array( 'wp-element', 'jquery' ),
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
						array( 'wp-element', 'jquery' ),
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
							array( 'wp-element', 'jquery' ),
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
		// Check if all three required URL parameters are present
		if ( ! isset( $_GET['post'] ) || ! isset( $_GET['action'] ) || 'edit' !== $_GET['action'] || ! isset( $_GET['reactor_builder'] ) || '1' !== $_GET['reactor_builder'] ) {
			return;
		}

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
		// Check if all three required URL parameters are present
		if ( ! isset( $_GET['post'] ) || ! isset( $_GET['action'] ) || 'edit' !== $_GET['action'] || ! isset( $_GET['reactor_builder'] ) || '1' !== $_GET['reactor_builder'] ) {
			return;
		}

		?>
		<style>
			/* Hide WordPress admin sidebar and topbar */
			#wpadminbar,
			#adminmenuback,
			#adminmenuwrap,
			#adminmenu,
			#wpfooter {
				display: none !important;
			}
			
			/* Hide default editor elements */
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
			
			/* Full screen builder */
			html.wp-toolbar {
				padding-top: 0 !important;
			}
			
			#wpcontent {
				margin-left: 0 !important;
				padding: 0 !important;
			}
			
			#wpbody {
				margin-top: 0 !important;
			}
			
			#wpbody-content {
				padding: 0 !important;
				margin: 0 !important;
			}
			
			.wrap {
				margin: 0 !important;
				padding: 0 !important;
			}
			
			#editor {
				min-height: 100vh;
				margin: 0;
				padding: 0;
			}
			
			body {
				overflow-x: hidden;
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
		// Check if all three required URL parameters are present
		if ( ! isset( $_GET['post'] ) ) {
			return;
		}

		if ( ! isset( $_GET['action'] ) || 'edit' !== $_GET['action'] ) {
			return;
		}

		if ( ! isset( $_GET['reactor_builder'] ) || '1' !== $_GET['reactor_builder'] ) {
			return;
		}

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
		<div id="editor" style="position: relative; z-index: 1; min-height: 400px;"></div>
		<script>
		// Ensure editor div is empty and ready for React
		(function() {
			var editor = document.getElementById('editor');
			if (editor) {
				editor.innerHTML = '';
			}
		})();
		</script>
		<?php
	}
	
	/**
	 * Start output buffering to inject stubs early.
	 */
	public function start_output_buffering(): void {
		// Check if all three required URL parameters are present
		if ( ! isset( $_GET['post'] ) || ! isset( $_GET['action'] ) || 'edit' !== $_GET['action'] || ! isset( $_GET['reactor_builder'] ) || '1' !== $_GET['reactor_builder'] ) {
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
		// Check if all three required URL parameters are present
		if ( ! isset( $_GET['post'] ) || ! isset( $_GET['action'] ) || 'edit' !== $_GET['action'] || ! isset( $_GET['reactor_builder'] ) || '1' !== $_GET['reactor_builder'] ) {
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
		
		// Don't start output buffering - it prevents media scripts from being printed
		// We rely on script_loader_tag filter for stub injection instead
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
		// Initialize WordPress stubs to prevent errors
		(function() {
			"use strict";
			if (typeof window.wp === "undefined") { window.wp = {}; }
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
		
		// Check if all three required URL parameters are present
		if ( ! isset( $_GET['post'] ) || ! isset( $_GET['action'] ) || 'edit' !== $_GET['action'] || ! isset( $_GET['reactor_builder'] ) || '1' !== $_GET['reactor_builder'] ) {
			return $tag;
		}
		
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

