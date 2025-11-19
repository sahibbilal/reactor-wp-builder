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
		// Templates endpoints.
		register_rest_route(
			self::NAMESPACE,
			'/templates',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_templates' ),
				'permission_callback' => array( $this, 'check_permissions' ),
			)
		);

		register_rest_route(
			self::NAMESPACE,
			'/templates',
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'save_template' ),
				'permission_callback' => array( $this, 'check_permissions' ),
			)
		);

		register_rest_route(
			self::NAMESPACE,
			'/templates/(?P<id>[a-zA-Z0-9_-]+)',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_template' ),
				'permission_callback' => array( $this, 'check_permissions' ),
				'args'                => array(
					'id' => array(
						'required' => true,
						'type'     => 'string',
					),
				),
			)
		);

		register_rest_route(
			self::NAMESPACE,
			'/templates/(?P<id>[a-zA-Z0-9_-]+)',
			array(
				'methods'             => \WP_REST_Server::DELETABLE,
				'callback'            => array( $this, 'delete_template' ),
				'permission_callback' => array( $this, 'check_permissions' ),
				'args'                => array(
					'id' => array(
						'required' => true,
						'type'     => 'string',
					),
				),
			)
		);
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
				'permission_callback' => array( $this, 'check_permissions' ),
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
				'permission_callback' => array( $this, 'check_permissions' ),
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
	 * @return bool
	 */
	public function check_permissions(): bool {
		return current_user_can( 'manage_options' );
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

	/**
	 * Get templates callback.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response
	 */
	public function get_templates( \WP_REST_Request $request ) {
		$templates = \Reactor\WP\Builder\Includes\Templates::get_all();
		return new \WP_REST_Response(
			array(
				'templates' => array_values( $templates ),
			),
			200
		);
	}

	/**
	 * Get template callback.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function get_template( \WP_REST_Request $request ) {
		$template_id = $request->get_param( 'id' );
		$template    = \Reactor\WP\Builder\Includes\Templates::get( $template_id );

		if ( ! $template ) {
			return new \WP_Error(
				'template_not_found',
				__( 'Template not found.', 'reactor-wp-builder' ),
				array( 'status' => 404 )
			);
		}

		return new \WP_REST_Response( $template, 200 );
	}

	/**
	 * Save template callback.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function save_template( \WP_REST_Request $request ) {
		$params = $request->get_json_params();
		$name   = $params['name'] ?? '';
		$layout = $params['layout'] ?? array();

		if ( empty( $name ) ) {
			return new \WP_Error(
				'invalid_name',
				__( 'Template name is required.', 'reactor-wp-builder' ),
				array( 'status' => 400 )
			);
		}

		if ( empty( $layout ) || ! isset( $layout['sections'] ) ) {
			return new \WP_Error(
				'invalid_layout',
				__( 'Invalid layout structure.', 'reactor-wp-builder' ),
				array( 'status' => 400 )
			);
		}

		$template_id = sanitize_title( $name ) . '-' . time();
		$saved        = \Reactor\WP\Builder\Includes\Templates::save( $template_id, $name, $layout );

		if ( ! $saved ) {
			return new \WP_Error(
				'save_failed',
				__( 'Failed to save template.', 'reactor-wp-builder' ),
				array( 'status' => 500 )
			);
		}

		return new \WP_REST_Response(
			array(
				'success'     => true,
				'template_id' => $template_id,
				'template'    => \Reactor\WP\Builder\Includes\Templates::get( $template_id ),
			),
			200
		);
	}

	/**
	 * Delete template callback.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function delete_template( \WP_REST_Request $request ) {
		$template_id = $request->get_param( 'id' );
		$deleted     = \Reactor\WP\Builder\Includes\Templates::delete( $template_id );

		if ( ! $deleted ) {
			return new \WP_Error(
				'delete_failed',
				__( 'Failed to delete template.', 'reactor-wp-builder' ),
				array( 'status' => 500 )
			);
		}

		return new \WP_REST_Response(
			array(
				'success' => true,
			),
			200
		);
	}
}

