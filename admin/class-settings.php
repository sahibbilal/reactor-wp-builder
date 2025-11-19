<?php
/**
 * Settings page class.
 *
 * @package Reactor\WP\Builder\Admin
 */

namespace Reactor\WP\Builder\Admin;

/**
 * Settings page handler.
 */
class Settings {

	/**
	 * Settings page slug.
	 *
	 * @var string
	 */
	const PAGE_SLUG = 'reactor-builder-settings';

	/**
	 * Option name for post types.
	 *
	 * @var string
	 */
	const OPTION_POST_TYPES = 'reactor_builder_post_types';

	/**
	 * Constructor.
	 */
	public function __construct() {
		add_action( 'admin_menu', array( $this, 'add_settings_page' ) );
		add_action( 'admin_init', array( $this, 'register_settings' ) );
	}

	/**
	 * Add settings submenu page.
	 */
	public function add_settings_page(): void {
		add_submenu_page(
			Menu::MENU_SLUG,
			__( 'Settings', 'reactor-wp-builder' ),
			__( 'Settings', 'reactor-wp-builder' ),
			'manage_options',
			self::PAGE_SLUG,
			array( $this, 'render_page' )
		);
	}

	/**
	 * Register settings.
	 */
	public function register_settings(): void {
		register_setting(
			'reactor_builder_settings',
			self::OPTION_POST_TYPES,
			array(
				'type'              => 'array',
				'sanitize_callback' => array( $this, 'sanitize_post_types' ),
				'default'           => array( 'post', 'page' ),
			)
		);
	}

	/**
	 * Sanitize post types.
	 *
	 * @param array $post_types Post types.
	 * @return array
	 */
	public function sanitize_post_types( array $post_types ): array {
		$valid_post_types = get_post_types( array( 'public' => true ), 'names' );
		return array_intersect( $post_types, $valid_post_types );
	}

	/**
	 * Render settings page.
	 */
	public function render_page(): void {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'You do not have sufficient permissions to access this page.', 'reactor-wp-builder' ) );
		}

		$post_types        = get_post_types( array( 'public' => true ), 'objects' );
		$selected_types   = get_option( self::OPTION_POST_TYPES, array( 'post', 'page' ) );
		$selected_types   = is_array( $selected_types ) ? $selected_types : array();

		?>
		<div class="wrap">
			<h1><?php echo esc_html( get_admin_page_title() ); ?></h1>
			
			<form method="post" action="options.php">
				<?php settings_fields( 'reactor_builder_settings' ); ?>
				
				<table class="form-table" role="presentation">
					<tbody>
						<tr>
							<th scope="row">
								<label for="reactor_post_types"><?php esc_html_e( 'Post Types', 'reactor-wp-builder' ); ?></label>
							</th>
							<td>
								<fieldset>
									<legend class="screen-reader-text">
										<span><?php esc_html_e( 'Select post types that can use Reactor Builder', 'reactor-wp-builder' ); ?></span>
									</legend>
									<?php foreach ( $post_types as $post_type ) : ?>
										<label for="post_type_<?php echo esc_attr( $post_type->name ); ?>">
											<input
												type="checkbox"
												name="<?php echo esc_attr( self::OPTION_POST_TYPES ); ?>[]"
												id="post_type_<?php echo esc_attr( $post_type->name ); ?>"
												value="<?php echo esc_attr( $post_type->name ); ?>"
												<?php checked( in_array( $post_type->name, $selected_types, true ) ); ?>
											/>
											<?php echo esc_html( $post_type->label ); ?>
											<span class="description">(<?php echo esc_html( $post_type->name ); ?>)</span>
										</label>
										<br />
									<?php endforeach; ?>
									<p class="description">
										<?php esc_html_e( 'Select which post types can be designed with Reactor Builder.', 'reactor-wp-builder' ); ?>
									</p>
								</fieldset>
							</td>
						</tr>
					</tbody>
				</table>
				
				<?php submit_button(); ?>
			</form>
		</div>
		<?php
	}

	/**
	 * Get enabled post types.
	 *
	 * @return array
	 */
	public static function get_enabled_post_types(): array {
		$post_types = get_option( self::OPTION_POST_TYPES, array( 'post', 'page' ) );
		return is_array( $post_types ) ? $post_types : array( 'post', 'page' );
	}
}

