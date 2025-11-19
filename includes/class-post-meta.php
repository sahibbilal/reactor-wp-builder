<?php
/**
 * Post meta handler class.
 *
 * @package Reactor\WP\Builder
 */

namespace Reactor\WP\Builder\Includes;

/**
 * Post meta handler for _reactor_layout.
 */
class Post_Meta {

	/**
	 * Meta key.
	 *
	 * @var string
	 */
	const META_KEY = '_reactor_layout';

	/**
	 * Constructor.
	 */
	public function __construct() {
		// Register meta field for REST API.
		add_action( 'rest_api_init', array( $this, 'register_meta' ) );

		// Add meta box to post editor (optional).
		add_action( 'add_meta_boxes', array( $this, 'add_meta_box' ) );
	}

	/**
	 * Register meta field for REST API.
	 */
	public function register_meta(): void {
		$post_types = get_post_types( array( 'public' => true ), 'names' );

		foreach ( $post_types as $post_type ) {
			register_post_meta(
				$post_type,
				self::META_KEY,
				array(
					'show_in_rest'      => true,
					'single'            => true,
					'type'              => 'object',
					'sanitize_callback' => array( $this, 'sanitize_layout' ),
					'auth_callback'     => array( $this, 'check_permissions' ),
				)
			);
		}
	}

	/**
	 * Sanitize layout data.
	 *
	 * @param mixed $meta_value Meta value.
	 * @return array
	 */
	public function sanitize_layout( $meta_value ): array {
		// Ensure it's an array.
		if ( ! is_array( $meta_value ) ) {
			return array();
		}

		// Add sanitization logic here as needed.
		return $meta_value;
	}

	/**
	 * Check if user has permission.
	 *
	 * @return bool
	 */
	public function check_permissions(): bool {
		return current_user_can( 'edit_posts' );
	}

	/**
	 * Add meta box to post editor.
	 */
	public function add_meta_box(): void {
		$post_types = get_post_types( array( 'public' => true ), 'names' );

		foreach ( $post_types as $post_type ) {
			add_meta_box(
				'reactor-layout-meta',
				__( 'Reactor Layout', 'reactor-wp-builder' ),
				array( $this, 'render_meta_box' ),
				$post_type,
				'side',
				'default'
			);
		}
	}

	/**
	 * Render meta box.
	 *
	 * @param \WP_Post $post Post object.
	 */
	public function render_meta_box( \WP_Post $post ): void {
		$layout = get_post_meta( $post->ID, self::META_KEY, true );

		wp_nonce_field( 'reactor_layout_meta', 'reactor_layout_nonce' );

		echo '<p>';
		echo '<label for="reactor-layout-status">';
		echo esc_html__( 'Layout Status:', 'reactor-wp-builder' );
		echo '</label> ';
		echo '<span id="reactor-layout-status">';
		echo $layout ? esc_html__( 'Layout saved', 'reactor-wp-builder' ) : esc_html__( 'No layout', 'reactor-wp-builder' );
		echo '</span>';
		echo '</p>';
	}
}

