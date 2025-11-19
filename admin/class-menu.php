<?php
/**
 * Admin menu class.
 *
 * @package Reactor\WP\Builder\Admin
 */

namespace Reactor\WP\Builder\Admin;

/**
 * Admin menu handler.
 */
class Menu {

	/**
	 * Menu slug.
	 *
	 * @var string
	 */
	const MENU_SLUG = 'reactor-builder';

	/**
	 * Constructor.
	 */
	public function __construct() {
		add_action( 'admin_menu', array( $this, 'add_admin_menu' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_scripts' ) );
	}

	/**
	 * Add admin menu page.
	 */
	public function add_admin_menu(): void {
		add_menu_page(
			__( 'Reactor Builder', 'reactor-wp-builder' ),
			__( 'Reactor Builder', 'reactor-wp-builder' ),
			'manage_options',
			self::MENU_SLUG,
			array( $this, 'render_page' ),
			'dashicons-layout',
			30
		);
	}

	/**
	 * Render admin page.
	 */
	public function render_page(): void {
		// Check user capabilities.
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'You do not have sufficient permissions to access this page.', 'reactor-wp-builder' ) );
		}

		// Load template.
		$template_path = REACTOR_WP_BUILDER_PLUGIN_DIR . 'templates/admin-page.php';
		if ( file_exists( $template_path ) ) {
			include $template_path;
		} else {
			echo '<div class="wrap"><h1>' . esc_html__( 'Reactor Builder', 'reactor-wp-builder' ) . '</h1>';
			echo '<div id="reactor-builder-root"></div></div>';
		}
	}

	/**
	 * Enqueue admin scripts and styles.
	 *
	 * @param string $hook Current admin page hook.
	 */
	public function enqueue_scripts( string $hook ): void {
		// Only load on our admin page.
		if ( 'toplevel_page_' . self::MENU_SLUG !== $hook ) {
			return;
		}

		// Enqueue React app.
		$script_handle = $this->enqueue_react_app();

		// Localize script with REST API data (only if script was enqueued).
		if ( $script_handle ) {
			// Get post_id from URL if available.
			$post_id = isset( $_GET['post_id'] ) ? absint( $_GET['post_id'] ) : null;
			
			wp_localize_script(
				$script_handle,
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
	}

	/**
	 * Enqueue React application.
	 *
	 * @return string|false Script handle or false if not enqueued.
	 */
	private function enqueue_react_app() {
		$app_dir = REACTOR_WP_BUILDER_PLUGIN_DIR;
		$app_url = REACTOR_WP_BUILDER_PLUGIN_URL;

		// Check if we're in development mode (Vite dev server).
		$is_dev = defined( 'WP_DEBUG' ) && WP_DEBUG && file_exists( $app_dir . '/.vite-dev' );

		if ( $is_dev ) {
			// Development: Load from Vite dev server.
			$dev_server = 'http://localhost:5173'; // Default Vite port.
			wp_enqueue_script(
				'reactor-builder-app',
				$dev_server . '/src/main.jsx',
				array(),
				REACTOR_WP_BUILDER_VERSION,
				true
			);
			return 'reactor-builder-app';
		} else {
			// Production: Load built assets.
			// Try manifest.json first (Vite default location).
			$manifest_path = $app_dir . 'dist/manifest.json';
			
			// Fallback to .vite/manifest.json if not found.
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
					return 'reactor-builder-app';
				}
			}
			
			// Fallback: Try to load from dist/assets if manifest doesn't exist or is invalid.
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
					return 'reactor-builder-app';
				}
			}
		}

		return false;
	}
}

