<?php
/**
 * Post list table modifications.
 *
 * @package Reactor\WP\Builder\Admin
 */

namespace Reactor\WP\Builder\Admin;

/**
 * Post list table handler.
 */
class Post_List {

	/**
	 * Constructor.
	 */
	public function __construct() {
		add_filter( 'post_row_actions', array( $this, 'add_row_action' ), 10, 2 );
		add_filter( 'page_row_actions', array( $this, 'add_row_action' ), 10, 2 );
	}

	/**
	 * Add row action to post list table.
	 *
	 * @param array    $actions Existing actions.
	 * @param \WP_Post $post    Post object.
	 * @return array
	 */
	public function add_row_action( array $actions, \WP_Post $post ): array {
		$enabled_types = Settings::get_enabled_post_types();

		if ( ! in_array( $post->post_type, $enabled_types, true ) ) {
			return $actions;
		}

		$edit_url = admin_url( 'post.php?post=' . $post->ID . '&action=edit&reactor_builder=1' );

		$actions['reactor_builder'] = sprintf(
			'<a href="%s" aria-label="%s">%s</a>',
			esc_url( $edit_url ),
			esc_attr( sprintf( __( 'Edit %s with Reactor Builder', 'reactor-wp-builder' ), $post->post_title ) ),
			__( 'Edit with React Builder', 'reactor-wp-builder' )
		);

		return $actions;
	}
}

