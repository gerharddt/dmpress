<?php
/**
 * Block API compatibility layer.
 *
 * DMPress removes the block editor (Gutenberg) and its runtime from core,
 * but WordPress plugins routinely call the public block APIs without
 * function_exists() guards. This file provides inert implementations so
 * such plugins install, activate and run without fatal errors; their block
 * registrations are accepted and discarded.
 *
 * Content helpers behave as WordPress does for content that contains no
 * blocks: do_blocks() is a passthrough, has_blocks() is false, and
 * parse_blocks() returns a single freeform block.
 *
 * @package DMPress
 * @since 1.0.0
 */

if ( ! function_exists( 'has_blocks' ) ) {
	/**
	 * Determines whether a post or content string contains blocks.
	 *
	 * DMPress: always false; the block system has been removed.
	 *
	 * @param int|string|WP_Post|null $post Optional. Post content, post ID, or post object.
	 * @return bool False.
	 */
	function has_blocks( $post = null ) {
		return false;
	}
}

if ( ! function_exists( 'has_block' ) ) {
	/**
	 * Determines whether a $post or a string contains a specific block type.
	 *
	 * DMPress: always false; the block system has been removed.
	 *
	 * @param string                  $block_name Full block type to look for.
	 * @param int|string|WP_Post|null $post       Optional. Post content, post ID, or post object.
	 * @return bool False.
	 */
	function has_block( $block_name, $post = null ) {
		return false;
	}
}

if ( ! function_exists( 'do_blocks' ) ) {
	/**
	 * Parses dynamic blocks out of content and re-renders them.
	 *
	 * DMPress: passthrough; content is returned unchanged.
	 *
	 * @param string $content Post content.
	 * @return string Unchanged content.
	 */
	function do_blocks( $content ) {
		return $content;
	}
}

if ( ! function_exists( 'excerpt_remove_blocks' ) ) {
	/**
	 * Parses blocks out of a content string for the excerpt.
	 *
	 * DMPress: passthrough; content is returned unchanged.
	 *
	 * @param string $content The content to parse.
	 * @return string Unchanged content.
	 */
	function excerpt_remove_blocks( $content ) {
		return $content;
	}
}

if ( ! function_exists( 'parse_blocks' ) ) {
	/**
	 * Parses blocks out of a content string.
	 *
	 * DMPress: returns the whole content as a single freeform (classic)
	 * block, which is how WordPress represents non-block content.
	 *
	 * @param string $content Post content.
	 * @return array[] Array containing one freeform block structure.
	 */
	function parse_blocks( $content ) {
		return array(
			array(
				'blockName'    => null,
				'attrs'        => array(),
				'innerBlocks'  => array(),
				'innerHTML'    => $content,
				'innerContent' => array( $content ),
			),
		);
	}
}

if ( ! function_exists( 'serialize_block' ) ) {
	/**
	 * Returns the content of a parsed block, without block delimiters.
	 *
	 * @param array $block An associative array of a single parsed block object.
	 * @return string The block content.
	 */
	function serialize_block( $block ) {
		return isset( $block['innerHTML'] ) ? $block['innerHTML'] : '';
	}
}

if ( ! function_exists( 'serialize_blocks' ) ) {
	/**
	 * Returns a joined string of the content of parsed blocks, without block delimiters.
	 *
	 * @param array[] $blocks An array of parsed block objects.
	 * @return string The joined block content.
	 */
	function serialize_blocks( $blocks ) {
		return implode( '', array_map( 'serialize_block', (array) $blocks ) );
	}
}

if ( ! function_exists( 'block_version' ) ) {
	/**
	 * Returns the current version of the block format that the content string is using.
	 *
	 * DMPress: always 0 (no block content).
	 *
	 * @param string $content Content to test.
	 * @return int 0.
	 */
	function block_version( $content ) {
		return 0;
	}
}

if ( ! function_exists( 'get_block_wrapper_attributes' ) ) {
	/**
	 * Generates a string of attributes for a block's wrapper element.
	 *
	 * DMPress: builds a plain attribute string from the passed values;
	 * no block supports are applied.
	 *
	 * @param array $extra_attributes Optional. Extra attributes to render on the block wrapper.
	 * @return string String of HTML attributes.
	 */
	function get_block_wrapper_attributes( $extra_attributes = array() ) {
		$normalized = array();
		foreach ( (array) $extra_attributes as $key => $value ) {
			$normalized[] = $key . '="' . esc_attr( $value ) . '"';
		}
		return implode( ' ', $normalized );
	}
}

if ( ! function_exists( 'get_dynamic_block_names' ) ) {
	/**
	 * Returns an array of the names of all registered dynamic block types.
	 *
	 * DMPress: always empty.
	 *
	 * @return string[] Empty array.
	 */
	function get_dynamic_block_names() {
		return array();
	}
}

if ( ! function_exists( 'register_block_type' ) ) {
	/**
	 * Registers a block type.
	 *
	 * DMPress: block registration is accepted and discarded.
	 *
	 * @param string|WP_Block_Type $block_type Block type name, path to block.json, or WP_Block_Type instance.
	 * @param array                $args       Optional. Array of block type arguments.
	 * @return false Always false; blocks are not supported.
	 */
	function register_block_type( $block_type, $args = array() ) {
		return false;
	}
}

if ( ! function_exists( 'register_block_type_from_metadata' ) ) {
	/**
	 * Registers a block type from the metadata stored in the block.json file.
	 *
	 * DMPress: block registration is accepted and discarded.
	 *
	 * @param string $file_or_folder Path to a block.json file or its parent folder.
	 * @param array  $args           Optional. Array of block type arguments.
	 * @return false Always false; blocks are not supported.
	 */
	function register_block_type_from_metadata( $file_or_folder, $args = array() ) {
		return false;
	}
}

if ( ! function_exists( 'unregister_block_type' ) ) {
	/**
	 * Unregisters a block type.
	 *
	 * @param string|WP_Block_Type $name Block type name or instance.
	 * @return false Always false.
	 */
	function unregister_block_type( $name ) {
		return false;
	}
}

if ( ! function_exists( 'register_block_style' ) ) {
	/**
	 * Registers a new block style.
	 *
	 * @param string|string[] $block_name       Block type name(s).
	 * @param array           $style_properties Array containing the properties of the style.
	 * @return false Always false.
	 */
	function register_block_style( $block_name, $style_properties ) {
		return false;
	}
}

if ( ! function_exists( 'unregister_block_style' ) ) {
	/**
	 * Unregisters a block style.
	 *
	 * @param string $block_name       Block type name.
	 * @param string $block_style_name Block style name.
	 * @return false Always false.
	 */
	function unregister_block_style( $block_name, $block_style_name ) {
		return false;
	}
}

if ( ! function_exists( 'register_block_pattern' ) ) {
	/**
	 * Registers a new block pattern.
	 *
	 * @param string $pattern_name       Block pattern name.
	 * @param array  $pattern_properties List of properties for the block pattern.
	 * @return false Always false.
	 */
	function register_block_pattern( $pattern_name, $pattern_properties ) {
		return false;
	}
}

if ( ! function_exists( 'unregister_block_pattern' ) ) {
	/**
	 * Unregisters a block pattern.
	 *
	 * @param string $pattern_name Block pattern name.
	 * @return false Always false.
	 */
	function unregister_block_pattern( $pattern_name ) {
		return false;
	}
}

if ( ! function_exists( 'register_block_pattern_category' ) ) {
	/**
	 * Registers a new block pattern category.
	 *
	 * @param string $category_name       Pattern category name.
	 * @param array  $category_properties List of properties for the block pattern category.
	 * @return false Always false.
	 */
	function register_block_pattern_category( $category_name, $category_properties ) {
		return false;
	}
}

if ( ! function_exists( 'unregister_block_pattern_category' ) ) {
	/**
	 * Unregisters a block pattern category.
	 *
	 * @param string $category_name Pattern category name.
	 * @return false Always false.
	 */
	function unregister_block_pattern_category( $category_name ) {
		return false;
	}
}

if ( ! function_exists( 'register_block_bindings_source' ) ) {
	/**
	 * Registers a new block bindings source.
	 *
	 * @param string $source_name       The name of the source.
	 * @param array  $source_properties Properties of the source.
	 * @return false Always false.
	 */
	function register_block_bindings_source( $source_name, array $source_properties = array() ) {
		return false;
	}
}

if ( ! function_exists( 'unregister_block_bindings_source' ) ) {
	/**
	 * Unregisters a block bindings source.
	 *
	 * @param string $source_name The name of the source.
	 * @return false Always false.
	 */
	function unregister_block_bindings_source( $source_name ) {
		return false;
	}
}

if ( ! class_exists( 'WP_Block_Type' ) ) {
	/**
	 * Inert stand-in for the WordPress block type descriptor.
	 *
	 * DMPress: carries whatever a plugin passes so code holding a
	 * reference does not fatal; the block is never registered or rendered.
	 */
	#[AllowDynamicProperties]
	class WP_Block_Type {
		/**
		 * Block type key.
		 *
		 * @var string
		 */
		public $name;

		/**
		 * Block type attributes property schemas.
		 *
		 * @var array|null
		 */
		public $attributes = null;

		/**
		 * Constructor.
		 *
		 * @param string $block_type Block type name.
		 * @param array  $args       Optional. Array of block type arguments.
		 */
		public function __construct( $block_type, $args = array() ) {
			$this->name = $block_type;
			foreach ( (array) $args as $property_name => $property_value ) {
				$this->{$property_name} = $property_value;
			}
		}

		/**
		 * Renders the block type output.
		 *
		 * @param array  $attributes Optional. Block attributes.
		 * @param string $content    Optional. Block content.
		 * @return string Empty string.
		 */
		public function render( $attributes = array(), $content = '' ) {
			return '';
		}

		/**
		 * Returns true if the block type is dynamic.
		 *
		 * @return bool False.
		 */
		public function is_dynamic() {
			return false;
		}

		/**
		 * Returns attributes.
		 *
		 * @return array Attributes.
		 */
		public function get_attributes() {
			return is_array( $this->attributes ) ? $this->attributes : array();
		}
	}
}

if ( ! class_exists( 'WP_Block_Type_Registry' ) ) {
	/**
	 * Inert stand-in for the block type registry.
	 *
	 * DMPress: the registry is always empty and registrations are discarded.
	 */
	final class WP_Block_Type_Registry {
		/**
		 * Container for the main instance of the class.
		 *
		 * @var WP_Block_Type_Registry|null
		 */
		private static $instance = null;

		/**
		 * Registers a block type. Discarded.
		 *
		 * @param string|WP_Block_Type $name Block type name or instance.
		 * @param array                $args Optional. Array of block type arguments.
		 * @return false Always false.
		 */
		public function register( $name, $args = array() ) {
			return false;
		}

		/**
		 * Unregisters a block type.
		 *
		 * @param string|WP_Block_Type $name Block type name or instance.
		 * @return false Always false.
		 */
		public function unregister( $name ) {
			return false;
		}

		/**
		 * Retrieves a registered block type.
		 *
		 * @param string $name Block type name.
		 * @return null Always null.
		 */
		public function get_registered( $name ) {
			return null;
		}

		/**
		 * Retrieves all registered block types.
		 *
		 * @return WP_Block_Type[] Empty array.
		 */
		public function get_all_registered() {
			return array();
		}

		/**
		 * Checks if a block type is registered.
		 *
		 * @param string $name Block type name.
		 * @return bool False.
		 */
		public function is_registered( $name ) {
			return false;
		}

		/**
		 * Utility method to retrieve the main instance of the class.
		 *
		 * @return WP_Block_Type_Registry The main instance.
		 */
		public static function get_instance() {
			if ( null === self::$instance ) {
				self::$instance = new self();
			}
			return self::$instance;
		}
	}
}

if ( ! class_exists( 'WP_Block_Patterns_Registry' ) ) {
	/**
	 * Inert stand-in for the block patterns registry.
	 */
	final class WP_Block_Patterns_Registry {
		/**
		 * Container for the main instance of the class.
		 *
		 * @var WP_Block_Patterns_Registry|null
		 */
		private static $instance = null;

		/**
		 * Registers a block pattern. Discarded.
		 *
		 * @param string $pattern_name       Block pattern name.
		 * @param array  $pattern_properties List of properties for the block pattern.
		 * @return false Always false.
		 */
		public function register( $pattern_name, $pattern_properties ) {
			return false;
		}

		/**
		 * Unregisters a block pattern.
		 *
		 * @param string $pattern_name Block pattern name.
		 * @return false Always false.
		 */
		public function unregister( $pattern_name ) {
			return false;
		}

		/**
		 * Retrieves a registered pattern.
		 *
		 * @param string $pattern_name Block pattern name.
		 * @return null Always null.
		 */
		public function get_registered( $pattern_name ) {
			return null;
		}

		/**
		 * Retrieves all registered patterns.
		 *
		 * @param bool $outside_init_only Optional. Unused.
		 * @return array Empty array.
		 */
		public function get_all_registered( $outside_init_only = false ) {
			return array();
		}

		/**
		 * Checks if a pattern is registered.
		 *
		 * @param string $pattern_name Block pattern name.
		 * @return bool False.
		 */
		public function is_registered( $pattern_name ) {
			return false;
		}

		/**
		 * Utility method to retrieve the main instance of the class.
		 *
		 * @return WP_Block_Patterns_Registry The main instance.
		 */
		public static function get_instance() {
			if ( null === self::$instance ) {
				self::$instance = new self();
			}
			return self::$instance;
		}
	}
}
