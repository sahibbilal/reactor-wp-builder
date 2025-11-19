<?php
/**
 * REST API class.
 *
 * @package Reactor\WP\Builder\API
 */

namespace Reactor\WP\Builder\API;

/**
 * REST API handler.
 */
class Rest_Api {

	/**
	 * Namespace.
	 *
	 * @var string
	 */
	const NAMESPACE = 'reactor/v1';

	/**
	 * Constructor.
	 */
	public function __construct() {
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	/**
	 * Register REST API routes.
	 */
	public function register_routes(): void {
		// Get layout endpoint.
		register_rest_route(
			self::NAMESPACE,
			'/layouts',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_layouts' ),
				'permission_callback' => array( $this, 'check_permissions' ),
				'args'                => array(
					'post_id' => array(
						'required' => false,
						'type'     => 'integer',
					),
				),
			)
		);
		
		// Get layout by post ID endpoint.
		register_rest_route(
			self::NAMESPACE,
			'/layouts/(?P<id>\d+)',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_layout' ),
				'permission_callback' => function( $request ) {
					return $this->check_permissions( $request );
				},
				'args'                => array(
					'id' => array(
						'required' => true,
						'type'     => 'integer',
					),
				),
			)
		);

		// Example: Save layout endpoint.
		register_rest_route(
			self::NAMESPACE,
			'/layouts/(?P<id>\d+)',
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'save_layout' ),
				'permission_callback' => function( $request ) {
					return $this->check_permissions( $request );
				},
				'args'                => array(
					'id' => array(
						'required' => true,
						'type'     => 'integer',
					),
				),
			)
		);

		// Example: Delete layout endpoint.
		register_rest_route(
			self::NAMESPACE,
			'/layouts/(?P<id>\d+)',
			array(
				'methods'             => \WP_REST_Server::DELETABLE,
				'callback'            => array( $this, 'delete_layout' ),
				'permission_callback' => array( $this, 'check_permissions' ),
				'args'                => array(
					'id' => array(
						'required' => true,
						'type'     => 'integer',
					),
				),
			)
		);
	}

	/**
	 * Check if user has permission.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return bool
	 */
	public function check_permissions( \WP_REST_Request $request = null ): bool {
		// For layout endpoints, check if user can edit the post
		if ( $request && strpos( $request->get_route(), '/layouts/' ) !== false ) {
			$post_id = $request->get_param( 'id' );
			if ( $post_id ) {
				$post = get_post( $post_id );
				if ( $post ) {
					return current_user_can( 'edit_post', $post_id );
				}
			}
		}
		
		// Default: require edit_posts capability
		return current_user_can( 'edit_posts' );
	}

	/**
	 * Get layouts callback.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function get_layouts( \WP_REST_Request $request ) {
		$post_id = $request->get_param( 'post_id' );
		
		if ( $post_id ) {
			$layout = get_post_meta( $post_id, '_reactor_layout', true );
			return new \WP_REST_Response(
				array(
					'layout' => $layout ?: null,
				),
				200
			);
		}
		
		// Return empty array if no post_id specified.
		return new \WP_REST_Response(
			array(
				'layouts' => array(),
			),
			200
		);
	}

	/**
	 * Get layout by post ID callback.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function get_layout( \WP_REST_Request $request ) {
		$post_id = $request->get_param( 'id' );

		// Validate post exists.
		if ( ! get_post( $post_id ) ) {
			return new \WP_Error(
				'invalid_post',
				__( 'Post not found.', 'reactor-wp-builder' ),
				array( 'status' => 404 )
			);
		}

		$layout = get_post_meta( $post_id, '_reactor_layout', true );

		return new \WP_REST_Response(
			array(
				'layout' => $layout ?: null,
			),
			200
		);
	}

	/**
	 * Save layout callback.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function save_layout( \WP_REST_Request $request ) {
		$post_id = $request->get_param( 'id' );
		$layout  = $request->get_json_params();

		// Validate post exists.
		if ( ! get_post( $post_id ) ) {
			return new \WP_Error(
				'invalid_post',
				__( 'Post not found.', 'reactor-wp-builder' ),
				array( 'status' => 404 )
			);
		}

		// Validate layout structure.
		if ( ! is_array( $layout ) || ! isset( $layout['sections'] ) ) {
			return new \WP_Error(
				'invalid_layout',
				__( 'Invalid layout structure.', 'reactor-wp-builder' ),
				array( 'status' => 400 )
			);
		}

		// Save layout to post meta.
		$updated = update_post_meta( $post_id, '_reactor_layout', $layout );

		if ( false === $updated ) {
			return new \WP_Error(
				'save_failed',
				__( 'Failed to save layout.', 'reactor-wp-builder' ),
				array( 'status' => 500 )
			);
		}

		return new \WP_REST_Response(
			array(
				'success' => true,
				'post_id' => $post_id,
				'layout'  => $layout,
			),
			200
		);
	}

	/**
	 * Delete layout callback.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function delete_layout( \WP_REST_Request $request ) {
		$post_id = $request->get_param( 'id' );

		// Validate post exists.
		if ( ! get_post( $post_id ) ) {
			return new \WP_Error(
				'invalid_post',
				__( 'Post not found.', 'reactor-wp-builder' ),
				array( 'status' => 404 )
			);
		}

		// Delete layout from post meta.
		$deleted = delete_post_meta( $post_id, '_reactor_layout' );

		if ( ! $deleted ) {
			return new \WP_Error(
				'delete_failed',
				__( 'Failed to delete layout.', 'reactor-wp-builder' ),
				array( 'status' => 500 )
			);
		}

		return new \WP_REST_Response(
			array(
				'success' => true,
				'post_id' => $post_id,
			),
			200
		);
	}
}

