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
		
		// Render the layout instead of default content.
		ob_start();
		$this->render_layout_html( $layout );
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
		
		echo '<div class="reactor-layout">';
		
		foreach ( $layout['sections'] as $section ) {
			$this->render_block( $section );
		}
		
		echo '</div>';
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
		$classes = array( 'reactor-block', 'reactor-block-' . $type );
		if ( ! empty( $props['className'] ) ) {
			$classes[] = $props['className'];
		}
		
		// Build styles array with all properties.
		$styles = array();
		if ( ! empty( $props['padding'] ) ) {
			$styles[] = 'padding: ' . esc_attr( $props['padding'] );
		}
		if ( ! empty( $props['margin'] ) ) {
			$styles[] = 'margin: ' . esc_attr( $props['margin'] );
		}
		if ( ! empty( $props['backgroundColor'] ) ) {
			$styles[] = 'background-color: ' . esc_attr( $props['backgroundColor'] );
		}
		if ( ! empty( $props['color'] ) ) {
			$styles[] = 'color: ' . esc_attr( $props['color'] );
		}
		if ( ! empty( $props['borderWidth'] ) ) {
			$styles[] = 'border-width: ' . esc_attr( $props['borderWidth'] );
			$styles[] = 'border-style: solid';
		}
		if ( ! empty( $props['borderRadius'] ) ) {
			$styles[] = 'border-radius: ' . esc_attr( $props['borderRadius'] );
		}
		if ( ! empty( $props['borderColor'] ) ) {
			$styles[] = 'border-color: ' . esc_attr( $props['borderColor'] );
		}
		if ( ! empty( $props['fontSize'] ) ) {
			$styles[] = 'font-size: ' . esc_attr( $props['fontSize'] );
		}
		if ( ! empty( $props['fontWeight'] ) ) {
			$styles[] = 'font-weight: ' . esc_attr( $props['fontWeight'] );
		}
		if ( ! empty( $props['textAlign'] ) ) {
			$styles[] = 'text-align: ' . esc_attr( $props['textAlign'] );
		}
		
		$style_attr = ! empty( $styles ) ? ' style="' . implode( '; ', $styles ) . '"' : '';
		$class_attr = ' class="' . esc_attr( implode( ' ', $classes ) ) . '"';
		
		// Render based on block type.
		switch ( $type ) {
			case 'section':
				echo '<section' . $class_attr . $style_attr . '>';
				foreach ( $children as $child ) {
					$this->render_block( $child );
				}
				echo '</section>';
				break;
				
			case 'row':
				// Add flex styles for rows.
				$row_styles = $styles;
				$row_styles[] = 'display: flex';
				if ( ! empty( $props['gap'] ) ) {
					$row_styles[] = 'gap: ' . esc_attr( $props['gap'] );
				}
				if ( ! empty( $props['justifyContent'] ) ) {
					$row_styles[] = 'justify-content: ' . esc_attr( $props['justifyContent'] );
				}
				if ( ! empty( $props['alignItems'] ) ) {
					$row_styles[] = 'align-items: ' . esc_attr( $props['alignItems'] );
				}
				$row_style_attr = ! empty( $row_styles ) ? ' style="' . implode( '; ', $row_styles ) . '"' : '';
				echo '<div' . $class_attr . $row_style_attr . '>';
				foreach ( $children as $child ) {
					$this->render_block( $child );
				}
				echo '</div>';
				break;
				
			case 'column':
				$col_styles = $styles;
				if ( ! empty( $props['width'] ) ) {
					$col_styles[] = 'width: ' . esc_attr( $props['width'] );
				}
				$col_style_attr = ! empty( $col_styles ) ? ' style="' . implode( '; ', $col_styles ) . '"' : '';
				echo '<div' . $class_attr . $col_style_attr . '>';
				foreach ( $children as $child ) {
					$this->render_block( $child );
				}
				echo '</div>';
				break;
				
			case 'heading':
				$level = ! empty( $props['level'] ) ? absint( $props['level'] ) : 2;
				$level = min( max( $level, 1 ), 6 );
				$text = ! empty( $props['content'] ) ? wp_kses_post( $props['content'] ) : ( ! empty( $props['text'] ) ? wp_kses_post( $props['text'] ) : '' );
				echo '<h' . $level . $class_attr . $style_attr . '>' . $text . '</h' . $level . '>';
				break;
				
			case 'text':
				$text = ! empty( $props['content'] ) ? wp_kses_post( $props['content'] ) : ( ! empty( $props['text'] ) ? wp_kses_post( $props['text'] ) : '' );
				echo '<div' . $class_attr . $style_attr . '>' . wpautop( $text ) . '</div>';
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
					echo '<img src="' . $src . '" alt="' . $alt . '"' . $class_attr . $style_attr . ' />';
				}
				break;
				
			case 'button':
				$text = ! empty( $props['text'] ) ? esc_html( $props['text'] ) : '';
				$url = ! empty( $props['url'] ) ? esc_url( $props['url'] ) : ( ! empty( $props['link'] ) ? esc_url( $props['link'] ) : '#' );
				$target = ! empty( $props['target'] ) && $props['target'] === '_blank' ? ' target="_blank" rel="noopener noreferrer"' : '';
				echo '<a href="' . $url . '"' . $target . $class_attr . $style_attr . '>' . $text . '</a>';
				break;
				
			case 'divider':
				echo '<hr' . $class_attr . $style_attr . ' />';
				break;
				
			case 'gallery':
				$images = ! empty( $props['images'] ) && is_array( $props['images'] ) ? $props['images'] : array();
				$columns = ! empty( $props['columns'] ) ? absint( $props['columns'] ) : 3;
				$gap = ! empty( $props['gap'] ) ? esc_attr( $props['gap'] ) : '10px';
				$image_size = ! empty( $props['imageSize'] ) ? $props['imageSize'] : 'medium';
				
				$gallery_styles = $styles;
				$gallery_styles[] = 'display: grid';
				$gallery_styles[] = 'grid-template-columns: repeat(' . $columns . ', 1fr)';
				$gallery_styles[] = 'gap: ' . $gap;
				$gallery_style_attr = ! empty( $gallery_styles ) ? ' style="' . implode( '; ', $gallery_styles ) . '"' : '';
				
				if ( ! empty( $images ) && count( $images ) > 0 ) {
					echo '<div' . $class_attr . $gallery_style_attr . '>';
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
				echo '<div' . $class_attr . $style_attr . '>';
				foreach ( $children as $child ) {
					$this->render_block( $child );
				}
				echo '</div>';
				break;
		}
	}
}

