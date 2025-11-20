<?php
/**
 * CSS Generator class.
 *
 * @package Reactor\WP\Builder
 */

namespace Reactor\WP\Builder\Includes;

/**
 * CSS Generator for Reactor layouts.
 */
class CSS_Generator {

	/**
	 * Generate CSS from layout data.
	 *
	 * @param array  $layout Layout data.
	 * @param int    $post_id Post ID.
	 * @param string $post_type Post type.
	 * @return string Generated CSS.
	 */
	public function generate_css( array $layout, int $post_id, string $post_type = 'post' ): string {
		$css = '';
		
		if ( ! isset( $layout['sections'] ) || ! is_array( $layout['sections'] ) ) {
			return $css;
		}

		foreach ( $layout['sections'] as $section ) {
			$css .= $this->generate_block_css( $section, $post_id );
		}

		return $css;
	}

	/**
	 * Generate CSS for a block recursively.
	 *
	 * @param array $block Block data.
	 * @param int   $post_id Post ID.
	 * @return string Generated CSS.
	 */
	private function generate_block_css( array $block, int $post_id ): string {
		$css = '';
		$block_id = $block['id'] ?? '';
		$type = $block['type'] ?? '';
		$props = $block['props'] ?? array();
		$children = $block['children'] ?? array();

		if ( ! $block_id ) {
			return $css;
		}

		// Generate selector
		$selector = ".reactor-layout [data-block-id=\"{$block_id}\"]";

		// Build CSS properties
		$properties = array();

		if ( ! empty( $props['padding'] ) ) {
			$properties[] = 'padding: ' . esc_attr( $props['padding'] ) . ';';
		}
		if ( ! empty( $props['margin'] ) ) {
			$properties[] = 'margin: ' . esc_attr( $props['margin'] ) . ';';
		}
		if ( ! empty( $props['backgroundColor'] ) ) {
			$properties[] = 'background-color: ' . esc_attr( $props['backgroundColor'] ) . ';';
		}
		if ( ! empty( $props['backgroundImage'] ) ) {
			$bg_image_url = esc_url( $props['backgroundImage'] );
			$properties[] = 'background-image: url(' . $bg_image_url . ');';
			$properties[] = 'background-size: ' . ( ! empty( $props['backgroundSize'] ) ? esc_attr( $props['backgroundSize'] ) : 'cover' ) . ';';
			$properties[] = 'background-position: ' . ( ! empty( $props['backgroundPosition'] ) ? esc_attr( $props['backgroundPosition'] ) : 'center' ) . ';';
			$properties[] = 'background-repeat: ' . ( ! empty( $props['backgroundRepeat'] ) ? esc_attr( $props['backgroundRepeat'] ) : 'no-repeat' ) . ';';
		}
		if ( ! empty( $props['color'] ) ) {
			$properties[] = 'color: ' . esc_attr( $props['color'] ) . ';';
		}
		if ( ! empty( $props['fontSize'] ) ) {
			$properties[] = 'font-size: ' . esc_attr( $props['fontSize'] ) . ';';
		}
		if ( ! empty( $props['fontWeight'] ) ) {
			$properties[] = 'font-weight: ' . esc_attr( $props['fontWeight'] ) . ';';
		}
		if ( ! empty( $props['textAlign'] ) ) {
			$properties[] = 'text-align: ' . esc_attr( $props['textAlign'] ) . ';';
		}
		if ( ! empty( $props['lineHeight'] ) ) {
			$properties[] = 'line-height: ' . esc_attr( $props['lineHeight'] ) . ';';
		}
		if ( ! empty( $props['letterSpacing'] ) ) {
			$properties[] = 'letter-spacing: ' . esc_attr( $props['letterSpacing'] ) . ';';
		}
		if ( ! empty( $props['borderWidth'] ) ) {
			$properties[] = 'border-width: ' . esc_attr( $props['borderWidth'] ) . ';';
			$properties[] = 'border-style: ' . ( ! empty( $props['borderStyle'] ) ? esc_attr( $props['borderStyle'] ) : 'solid' ) . ';';
		}
		if ( ! empty( $props['borderRadius'] ) ) {
			$properties[] = 'border-radius: ' . esc_attr( $props['borderRadius'] ) . ';';
		}
		if ( ! empty( $props['borderColor'] ) ) {
			$properties[] = 'border-color: ' . esc_attr( $props['borderColor'] ) . ';';
		}
		if ( ! empty( $props['width'] ) ) {
			$properties[] = 'width: ' . esc_attr( $props['width'] ) . ';';
		}
		if ( ! empty( $props['height'] ) ) {
			$properties[] = 'height: ' . esc_attr( $props['height'] ) . ';';
		}
		if ( ! empty( $props['opacity'] ) ) {
			$properties[] = 'opacity: ' . esc_attr( $props['opacity'] ) . ';';
		}
		if ( ! empty( $props['boxShadow'] ) ) {
			$properties[] = 'box-shadow: ' . esc_attr( $props['boxShadow'] ) . ';';
		}
		if ( ! empty( $props['transform'] ) ) {
			$properties[] = 'transform: ' . esc_attr( $props['transform'] ) . ';';
		}
		if ( ! empty( $props['transition'] ) ) {
			$properties[] = 'transition: ' . esc_attr( $props['transition'] ) . ';';
		}

		// Type-specific properties
		if ( $type === 'row' ) {
			$properties[] = 'display: flex;';
			if ( ! empty( $props['gap'] ) ) {
				$properties[] = 'gap: ' . esc_attr( $props['gap'] ) . ';';
			}
			if ( ! empty( $props['justifyContent'] ) ) {
				$properties[] = 'justify-content: ' . esc_attr( $props['justifyContent'] ) . ';';
			}
			if ( ! empty( $props['alignItems'] ) ) {
				$properties[] = 'align-items: ' . esc_attr( $props['alignItems'] ) . ';';
			}
		}

		if ( $type === 'column' ) {
			if ( ! empty( $props['width'] ) ) {
				$properties[] = 'width: ' . esc_attr( $props['width'] ) . ';';
			}
		}

		// Gallery specific styles
		if ( $type === 'gallery' ) {
			$properties[] = 'display: grid;';
			if ( ! empty( $props['columns'] ) ) {
				$columns = absint( $props['columns'] );
				$properties[] = 'grid-template-columns: repeat(' . $columns . ', 1fr);';
			} else {
				$properties[] = 'grid-template-columns: repeat(3, 1fr);';
			}
			if ( ! empty( $props['gap'] ) ) {
				$properties[] = 'gap: ' . esc_attr( $props['gap'] ) . ';';
			} else {
				$properties[] = 'gap: 10px;';
			}
		}

		// Section specific styles
		if ( $type === 'section' ) {
			$properties[] = 'box-sizing: border-box;';
			$properties[] = 'overflow: hidden;';
			if ( ! empty( $props['minHeight'] ) ) {
				$properties[] = 'min-height: ' . esc_attr( $props['minHeight'] ) . ';';
			}
		}

		// Container specific styles
		if ( $type === 'container' ) {
			$properties[] = 'box-sizing: border-box;';
			$properties[] = 'overflow: hidden;';
		}

		// Add custom CSS
		if ( ! empty( $props['customCSS'] ) ) {
			$properties[] = $props['customCSS'];
		}

		// Generate CSS rule
		if ( ! empty( $properties ) ) {
			$css .= $selector . ' {' . "\n";
			$css .= '  ' . implode( "\n  ", $properties ) . "\n";
			$css .= '}' . "\n\n";
		}

		// Responsive CSS
		if ( ! empty( $props['mobileCSS'] ) ) {
			$css .= '@media (max-width: 768px) {' . "\n";
			$css .= '  ' . $selector . ' {' . "\n";
			$css .= '    ' . $props['mobileCSS'] . "\n";
			$css .= '  }' . "\n";
			$css .= '}' . "\n\n";
		}

		if ( ! empty( $props['tabletCSS'] ) ) {
			$css .= '@media (max-width: 1024px) {' . "\n";
			$css .= '  ' . $selector . ' {' . "\n";
			$css .= '    ' . $props['tabletCSS'] . "\n";
			$css .= '  }' . "\n";
			$css .= '}' . "\n\n";
		}

		if ( ! empty( $props['desktopCSS'] ) ) {
			$css .= '@media (min-width: 1025px) {' . "\n";
			$css .= '  ' . $selector . ' {' . "\n";
			$css .= '    ' . $props['desktopCSS'] . "\n";
			$css .= '  }' . "\n";
			$css .= '}' . "\n\n";
		}

		// Process children
		if ( ! empty( $children ) && is_array( $children ) ) {
			foreach ( $children as $child ) {
				$css .= $this->generate_block_css( $child, $post_id );
			}
		}

		return $css;
	}

	/**
	 * Save CSS to file.
	 *
	 * @param string $css CSS content.
	 * @param int    $post_id Post ID.
	 * @param string $post_type Post type.
	 * @return string|false File path on success, false on failure.
	 */
	public function save_css_file( string $css, int $post_id, string $post_type = 'post' ) {
		$upload_dir = wp_upload_dir();
		$reactor_dir = $upload_dir['basedir'] . '/reactor-css';

		// Create directory if it doesn't exist
		if ( ! file_exists( $reactor_dir ) ) {
			wp_mkdir_p( $reactor_dir );
		}

		// Generate filename
		$filename = "reactor-{$post_type}-{$post_id}.css";
		$filepath = $reactor_dir . '/' . $filename;

		// Write CSS to file
		$result = file_put_contents( $filepath, $css );

		if ( false === $result ) {
			return false;
		}

		// Return URL
		return $upload_dir['baseurl'] . '/reactor-css/' . $filename;
	}

	/**
	 * Delete CSS file.
	 *
	 * @param int    $post_id Post ID.
	 * @param string $post_type Post type.
	 * @return bool True on success, false on failure.
	 */
	public function delete_css_file( int $post_id, string $post_type = 'post' ): bool {
		$upload_dir = wp_upload_dir();
		$filename = "reactor-{$post_type}-{$post_id}.css";
		$filepath = $upload_dir['basedir'] . '/reactor-css/' . $filename;

		if ( file_exists( $filepath ) ) {
			return unlink( $filepath );
		}

		return true;
	}
}

