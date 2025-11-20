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
		
		// Render layout on frontend.
		add_filter( 'the_content', array( $this, 'render_layout' ), 20 );
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
	
	/**
	 * Render layout on frontend.
	 *
	 * @param string $content Post content.
	 * @return string
	 */
	public function render_layout( string $content ): string {
		// Only render on frontend, not in admin or feeds.
		if ( is_admin() || is_feed() ) {
			return $content;
		}
		
		global $post;
		if ( ! $post ) {
			return $content;
		}
		
		$layout = get_post_meta( $post->ID, self::META_KEY, true );
		
		// If no layout, return original content.
		if ( ! $layout || ! is_array( $layout ) || ! isset( $layout['sections'] ) || empty( $layout['sections'] ) ) {
			return $content;
		}
		
		// Enqueue CSS file if it exists
		$css_url = get_post_meta( $post->ID, '_reactor_css_file', true );
		if ( $css_url ) {
			$handle = 'reactor-layout-' . $post->post_type . '-' . $post->ID;
			wp_enqueue_style( $handle, $css_url, array(), get_post_modified_time( 'U', $post ) );
		}

		// Render the layout instead of default content.
		ob_start();
		echo '<div class="reactor-layout">';
		$this->render_layout_html( $layout );
		echo '</div>';
		$layout_html = ob_get_clean();
		
		return $layout_html;
	}
	
	/**
	 * Render layout HTML.
	 *
	 * @param array $layout Layout data.
	 */
	private function render_layout_html( array $layout ): void {
		if ( ! isset( $layout['sections'] ) || ! is_array( $layout['sections'] ) ) {
			return;
		}
		
		foreach ( $layout['sections'] as $section ) {
			$this->render_block( $section );
		}
	}
	
	/**
	 * Render a block recursively.
	 *
	 * @param array $block Block data.
	 */
	private function render_block( array $block ): void {
		$type = $block['type'] ?? 'container';
		$props = $block['props'] ?? array();
		$children = $block['children'] ?? array();
		
		// Get block attributes.
		$block_id = $block['id'] ?? '';
		$classes = array( 'reactor-block', 'reactor-block-' . $type );
		if ( ! empty( $props['className'] ) ) {
			$classes[] = $props['className'];
		}
		
		// Add data-block-id attribute
		$data_attr = $block_id ? ' data-block-id="' . esc_attr( $block_id ) . '"' : '';
		$class_attr = ' class="' . esc_attr( implode( ' ', $classes ) ) . '"';
		
		// No inline styles - all styles are in external CSS file
		
		// Render based on block type.
		switch ( $type ) {
			case 'section':
				echo '<section' . $class_attr . $data_attr . '>';
				foreach ( $children as $child ) {
					$this->render_block( $child );
				}
				echo '</section>';
				break;
				
			case 'row':
				// All row styles are in external CSS file
				echo '<div' . $class_attr . $data_attr . '>';
				foreach ( $children as $child ) {
					$this->render_block( $child );
				}
				echo '</div>';
				break;
				
			case 'column':
				// All column styles are in external CSS file
				echo '<div' . $class_attr . $data_attr . '>';
				foreach ( $children as $child ) {
					$this->render_block( $child );
				}
				echo '</div>';
				break;
				
			case 'heading':
				$level = ! empty( $props['level'] ) ? absint( $props['level'] ) : 2;
				$level = min( max( $level, 1 ), 6 );
				$text = ! empty( $props['content'] ) ? wp_kses_post( $props['content'] ) : ( ! empty( $props['text'] ) ? wp_kses_post( $props['text'] ) : '' );
				echo '<h' . $level . $class_attr . $data_attr . '>' . $text . '</h' . $level . '>';
				break;
				
			case 'text':
				$text = ! empty( $props['content'] ) ? wp_kses_post( $props['content'] ) : ( ! empty( $props['text'] ) ? wp_kses_post( $props['text'] ) : '' );
				echo '<div' . $class_attr . $data_attr . '>' . wpautop( $text ) . '</div>';
				break;
				
			case 'image':
				$src = ! empty( $props['src'] ) ? esc_url( $props['src'] ) : '';
				$alt = ! empty( $props['alt'] ) ? esc_attr( $props['alt'] ) : '';
				$image_size = ! empty( $props['imageSize'] ) ? $props['imageSize'] : 'medium';
				$sizes = ! empty( $props['sizes'] ) && is_array( $props['sizes'] ) ? $props['sizes'] : array();
				
				// Use the selected image size if available
				if ( ! empty( $sizes ) && ! empty( $image_size ) ) {
					if ( $image_size === 'full' ) {
						// Use original full size URL
						$src = ! empty( $props['src'] ) ? esc_url( $props['src'] ) : '';
					} elseif ( ! empty( $sizes[ $image_size ] ) && ! empty( $sizes[ $image_size ]['url'] ) ) {
						$src = esc_url( $sizes[ $image_size ]['url'] );
					} elseif ( ! empty( $sizes['medium'] ) && ! empty( $sizes['medium']['url'] ) ) {
						// Fallback to medium
						$src = esc_url( $sizes['medium']['url'] );
					} elseif ( ! empty( $sizes['thumbnail'] ) && ! empty( $sizes['thumbnail']['url'] ) ) {
						// Fallback to thumbnail
						$src = esc_url( $sizes['thumbnail']['url'] );
					}
				}
				
				if ( $src ) {
					echo '<img src="' . $src . '" alt="' . $alt . '"' . $class_attr . $data_attr . ' />';
				}
				break;
				
			case 'button':
				$text = ! empty( $props['text'] ) ? esc_html( $props['text'] ) : '';
				$url = ! empty( $props['url'] ) ? esc_url( $props['url'] ) : ( ! empty( $props['link'] ) ? esc_url( $props['link'] ) : '#' );
				$target = ! empty( $props['target'] ) && $props['target'] === '_blank' ? ' target="_blank" rel="noopener noreferrer"' : '';
				echo '<a href="' . $url . '"' . $target . $class_attr . $data_attr . '>' . $text . '</a>';
				break;
				
			case 'divider':
				echo '<hr' . $class_attr . $data_attr . ' />';
				break;
				
			case 'gallery':
				$images = ! empty( $props['images'] ) && is_array( $props['images'] ) ? $props['images'] : array();
				$columns = ! empty( $props['columns'] ) ? absint( $props['columns'] ) : 3;
				$gap = ! empty( $props['gap'] ) ? esc_attr( $props['gap'] ) : '10px';
				$image_size = ! empty( $props['imageSize'] ) ? $props['imageSize'] : 'medium';
				
				// All gallery styles are in external CSS file
				if ( ! empty( $images ) && count( $images ) > 0 ) {
					echo '<div' . $class_attr . $data_attr . '>';
					foreach ( $images as $image ) {
						if ( ! is_array( $image ) ) {
							continue;
						}
						
						$image_src = ! empty( $image['url'] ) ? esc_url( $image['url'] ) : ( ! empty( $image['src'] ) ? esc_url( $image['src'] ) : '' );
						$image_alt = ! empty( $image['alt'] ) ? esc_attr( $image['alt'] ) : ( ! empty( $image['title'] ) ? esc_attr( $image['title'] ) : '' );
						
						// Use the selected image size if available
						if ( ! empty( $image['sizes'] ) && is_array( $image['sizes'] ) && ! empty( $image_size ) ) {
							if ( $image_size === 'full' ) {
								// Use original full size URL
								$image_src = ! empty( $image['url'] ) ? esc_url( $image['url'] ) : ( ! empty( $image['src'] ) ? esc_url( $image['src'] ) : '' );
							} elseif ( ! empty( $image['sizes'][ $image_size ] ) && ! empty( $image['sizes'][ $image_size ]['url'] ) ) {
								$image_src = esc_url( $image['sizes'][ $image_size ]['url'] );
							} elseif ( ! empty( $image['sizes']['medium'] ) && ! empty( $image['sizes']['medium']['url'] ) ) {
								// Fallback to medium
								$image_src = esc_url( $image['sizes']['medium']['url'] );
							} elseif ( ! empty( $image['sizes']['thumbnail'] ) && ! empty( $image['sizes']['thumbnail']['url'] ) ) {
								// Fallback to thumbnail
								$image_src = esc_url( $image['sizes']['thumbnail']['url'] );
							}
						}
						
						if ( $image_src ) {
							echo '<div class="reactor-gallery-item" style="position: relative; width: 100%; aspect-ratio: 1; overflow: hidden; border-radius: 4px;">';
							echo '<img src="' . $image_src . '" alt="' . $image_alt . '" style="width: 100%; height: 100%; object-fit: cover; display: block;" loading="lazy" />';
							echo '</div>';
						}
					}
					echo '</div>';
				}
				break;
				
			case 'container':
			default:
				echo '<div' . $class_attr . $data_attr . '>';
				foreach ( $children as $child ) {
					$this->render_block( $child );
				}
				echo '</div>';
				break;
		}
	}
}

