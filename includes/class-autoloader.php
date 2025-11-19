<?php
/**
 * Autoloader class.
 *
 * @package Reactor\WP\Builder
 */

namespace Reactor\WP\Builder;

/**
 * Autoloader for plugin classes.
 */
class Autoloader {

	/**
	 * Register autoloader.
	 */
	public static function register(): void {
		spl_autoload_register( array( __CLASS__, 'autoload' ) );
	}

	/**
	 * Autoload classes.
	 *
	 * @param string $class_name Class name.
	 */
	public static function autoload( string $class_name ): void {
		// Only load our plugin classes.
		if ( strpos( $class_name, __NAMESPACE__ ) !== 0 ) {
			return;
		}

		// Remove namespace prefix.
		$relative_class = str_replace( __NAMESPACE__ . '\\', '', $class_name );

		// Split into parts (e.g., "Admin\Menu" -> ["Admin", "Menu"]).
		$parts = explode( '\\', $relative_class );

		// Get the class name (last part).
		$class_name_part = array_pop( $parts );

		// Convert class name to file name (Class_Name -> class-name.php).
		$file_name = 'class-' . str_replace( '_', '-', strtolower( $class_name_part ) ) . '.php';

		// Build directory path from namespace parts.
		$directory_parts = array();
		foreach ( $parts as $part ) {
			$directory_parts[] = strtolower( $part );
		}

		// Try different directory structures.
		$possible_paths = array();

		// If we have directory parts, build path with them.
		if ( ! empty( $directory_parts ) ) {
			$dir_path = implode( DIRECTORY_SEPARATOR, $directory_parts );
			$possible_paths[] = REACTOR_WP_BUILDER_PLUGIN_DIR . $dir_path . DIRECTORY_SEPARATOR . $file_name;
		}

		// Try includes directory with subdirectories.
		if ( ! empty( $directory_parts ) ) {
			$dir_path = implode( DIRECTORY_SEPARATOR, $directory_parts );
			$possible_paths[] = REACTOR_WP_BUILDER_PLUGIN_DIR . 'includes' . DIRECTORY_SEPARATOR . $dir_path . DIRECTORY_SEPARATOR . $file_name;
		}

		// Try root directory.
		$possible_paths[] = REACTOR_WP_BUILDER_PLUGIN_DIR . $file_name;

		// Try includes directory.
		$possible_paths[] = REACTOR_WP_BUILDER_PLUGIN_DIR . 'includes' . DIRECTORY_SEPARATOR . $file_name;

		// Try admin directory.
		$possible_paths[] = REACTOR_WP_BUILDER_PLUGIN_DIR . 'admin' . DIRECTORY_SEPARATOR . $file_name;

		// Try each possible path.
		foreach ( $possible_paths as $file_path ) {
			if ( file_exists( $file_path ) ) {
				require_once $file_path;
				return;
			}
		}
	}
}

