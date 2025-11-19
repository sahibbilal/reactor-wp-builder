<?php
/**
 * Plugin Name: Reactor WP Builder
 * Plugin URI: https://wpcorex.com/products/reactor-wp-builder
 * Description: A modern WordPress page builder plugin with React-based admin interface.
 * Version: 1.0.0
 * Author: Bilal Mahmood
 * Author URI: https://wpcorex.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: reactor-wp-builder
 * Domain Path: /languages
 * Requires at least: 5.8
 * Requires PHP: 7.4
 * GitHub Plugin URI: https://github.com/sahibbilal/reactor-wp-builder
 */

namespace Reactor\WP\Builder;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Define plugin constants.
define( 'REACTOR_WP_BUILDER_VERSION', '1.0.0' );
define( 'REACTOR_WP_BUILDER_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'REACTOR_WP_BUILDER_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'REACTOR_WP_BUILDER_PLUGIN_FILE', __FILE__ );
define( 'REACTOR_WP_BUILDER_PLUGIN_BASENAME', plugin_basename( __FILE__ ) );

/**
 * Main plugin class.
 */
final class Plugin {

	/**
	 * Plugin instance.
	 *
	 * @var Plugin
	 */
	private static $instance = null;

	/**
	 * Get plugin instance.
	 *
	 * @return Plugin
	 */
	public static function get_instance(): Plugin {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Constructor.
	 */
	private function __construct() {
		$this->init();
	}

	/**
	 * Initialize plugin.
	 */
	private function init(): void {
		// Load autoloader.
		require_once REACTOR_WP_BUILDER_PLUGIN_DIR . 'includes/class-autoloader.php';
		Autoloader::register();

		// Initialize post editor integration VERY early to prevent script errors.
		// This must run before WordPress loads any admin scripts.
		if ( is_admin() ) {
			// Use 'plugins_loaded' with early priority to ensure we're loaded before admin scripts
			add_action( 'plugins_loaded', function() {
				if ( is_admin() ) {
					new Admin\Post_Editor();
				}
			}, 1 );
		}

		// Initialize components.
		$this->init_components();

		// Register activation/deactivation hooks.
		register_activation_hook( REACTOR_WP_BUILDER_PLUGIN_FILE, array( $this, 'activate' ) );
		register_deactivation_hook( REACTOR_WP_BUILDER_PLUGIN_FILE, array( $this, 'deactivate' ) );
	}

	/**
	 * Initialize plugin components.
	 */
	private function init_components(): void {
		// Initialize admin menu.
		if ( is_admin() ) {
			new Admin\Menu();
			new Admin\Settings();
			new Admin\Meta_Box();
			new Admin\Post_List();
			// Post_Editor is initialized earlier in init() to prevent script errors
		}

		// Initialize REST API.
		new API\Rest_Api();

		// Initialize post meta handler.
		new Includes\Post_Meta();
	}

	/**
	 * Plugin activation callback.
	 */
	public function activate(): void {
		// Flush rewrite rules.
		flush_rewrite_rules();

		// Set default options if needed.
		if ( ! get_option( 'reactor_wp_builder_version' ) ) {
			add_option( 'reactor_wp_builder_version', REACTOR_WP_BUILDER_VERSION );
		}
	}

	/**
	 * Plugin deactivation callback.
	 */
	public function deactivate(): void {
		// Flush rewrite rules.
		flush_rewrite_rules();
	}
}

/**
 * Initialize the plugin.
 */
function init(): void {
	Plugin::get_instance();
}

// Initialize plugin.
init();

