<?php
/**
 * Admin page template.
 *
 * @package Reactor\WP\Builder
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>
<div class="wrap">
	<h1><?php echo esc_html( get_admin_page_title() ); ?></h1>
	<div id="reactor-builder-root">
		<p><?php esc_html_e( 'Loading Reactor Builder...', 'reactor-wp-builder' ); ?></p>
		<noscript>
			<div class="notice notice-error">
				<p><?php esc_html_e( 'JavaScript is required for Reactor Builder to work. Please enable JavaScript in your browser.', 'reactor-wp-builder' ); ?></p>
			</div>
		</noscript>
	</div>
</div>

