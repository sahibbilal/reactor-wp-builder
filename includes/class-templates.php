<?php
/**
 * Templates handler class.
 *
 * @package Reactor\WP\Builder
 */

namespace Reactor\WP\Builder\Includes;

/**
 * Templates handler.
 */
class Templates {

	/**
	 * Option name for templates.
	 *
	 * @var string
	 */
	const OPTION_TEMPLATES = 'reactor_builder_templates';

	/**
	 * Constructor.
	 */
	public function __construct() {
		// Templates are managed via REST API.
	}

	/**
	 * Get all templates.
	 *
	 * @return array
	 */
	public static function get_all(): array {
		$templates = get_option( self::OPTION_TEMPLATES, array() );
		return is_array( $templates ) ? $templates : array();
	}

	/**
	 * Get template by ID.
	 *
	 * @param string $template_id Template ID.
	 * @return array|null
	 */
	public static function get( string $template_id ) {
		$templates = self::get_all();
		return $templates[ $template_id ] ?? null;
	}

	/**
	 * Save template.
	 *
	 * @param string $template_id Template ID.
	 * @param string $name Template name.
	 * @param array  $layout Layout data.
	 * @return bool
	 */
	public static function save( string $template_id, string $name, array $layout ): bool {
		$templates = self::get_all();
		$templates[ $template_id ] = array(
			'id'      => $template_id,
			'name'    => $name,
			'layout'  => $layout,
			'created' => current_time( 'mysql' ),
		);
		return update_option( self::OPTION_TEMPLATES, $templates );
	}

	/**
	 * Delete template.
	 *
	 * @param string $template_id Template ID.
	 * @return bool
	 */
	public static function delete( string $template_id ): bool {
		$templates = self::get_all();
		if ( isset( $templates[ $template_id ] ) ) {
			unset( $templates[ $template_id ] );
			return update_option( self::OPTION_TEMPLATES, $templates );
		}
		return false;
	}
}

