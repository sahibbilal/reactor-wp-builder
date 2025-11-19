<?php
/**
 * Meta box class for post editor.
 *
 * @package Reactor\WP\Builder\Admin
 */

namespace Reactor\WP\Builder\Admin;

/**
 * Meta box handler for post editor.
 */
class Meta_Box {

	/**
	 * Constructor.
	 */
	public function __construct() {
		add_action( 'add_meta_boxes', array( $this, 'add_meta_box' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_scripts' ) );
	}

	/**
	 * Add meta box to enabled post types.
	 */
	public function add_meta_box(): void {
		$post_types = Settings::get_enabled_post_types();

		foreach ( $post_types as $post_type ) {
			add_meta_box(
				'reactor-builder-meta',
				__( 'Reactor Builder', 'reactor-wp-builder' ),
				array( $this, 'render_meta_box' ),
				$post_type,
				'side',
				'high'
			);
		}
	}

	/**
	 * Render meta box.
	 *
	 * @param \WP_Post $post Post object.
	 */
	public function render_meta_box( \WP_Post $post ): void {
		$layout = get_post_meta( $post->ID, '_reactor_layout', true );
		$has_layout = ! empty( $layout );
		
		// Add parameter to current URL instead of redirecting
		$current_url = admin_url( 'post.php?post=' . $post->ID . '&action=edit' );
		$builder_url = add_query_arg( 'reactor_builder', '1', $current_url );
		
		wp_nonce_field( 'reactor_builder_meta', 'reactor_builder_nonce' );
		?>
		<div class="reactor-builder-meta-box">
			<?php if ( $has_layout ) : ?>
				<p>
					<span class="dashicons dashicons-yes-alt" style="color: #46b450;"></span>
					<strong><?php esc_html_e( 'Layout configured', 'reactor-wp-builder' ); ?></strong>
				</p>
			<?php else : ?>
				<p>
					<span class="dashicons dashicons-info" style="color: #f56e28;"></span>
					<?php esc_html_e( 'No layout configured', 'reactor-wp-builder' ); ?>
				</p>
			<?php endif; ?>
			
			<p>
				<a href="<?php echo esc_url( $builder_url ); ?>" class="button button-primary button-large" style="width: 100%; text-align: center;">
					<?php esc_html_e( 'Edit with Reactor Builder', 'reactor-wp-builder' ); ?>
				</a>
			</p>
			
			<?php if ( $has_layout ) : ?>
				<p>
					<button type="button" class="button" id="reactor-clear-layout" data-post-id="<?php echo esc_attr( $post->ID ); ?>" style="width: 100%;">
						<?php esc_html_e( 'Clear Layout', 'reactor-wp-builder' ); ?>
					</button>
				</p>
			<?php endif; ?>
		</div>
		<?php
	}

	/**
	 * Enqueue scripts for meta box.
	 *
	 * @param string $hook Current admin page hook.
	 */
	public function enqueue_scripts( string $hook ): void {
		if ( ! in_array( $hook, array( 'post.php', 'post-new.php' ), true ) ) {
			return;
		}

		$screen = get_current_screen();
		if ( ! $screen || ! in_array( $screen->post_type, Settings::get_enabled_post_types(), true ) ) {
			return;
		}

		wp_enqueue_script(
			'reactor-builder-meta-box',
			REACTOR_WP_BUILDER_PLUGIN_URL . 'admin/js/meta-box.js',
			array( 'jquery' ),
			REACTOR_WP_BUILDER_VERSION,
			true
		);

		wp_localize_script(
			'reactor-builder-meta-box',
			'reactorBuilderMeta',
			array(
				'apiUrl' => rest_url( 'reactor/v1/' ),
				'nonce'  => wp_create_nonce( 'wp_rest' ),
			)
		);
	}
}

