/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./assets/src/js/pro/_acf-blocks-v3.js":
/*!*********************************************!*\
  !*** ./assets/src/js/pro/_acf-blocks-v3.js ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _blocks_v3_utils_post_locking__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./blocks-v3/utils/post-locking */ "./assets/src/js/pro/blocks-v3/utils/post-locking.js");
/* harmony import */ var _blocks_v3_components_jsx_parser__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./blocks-v3/components/jsx-parser */ "./assets/src/js/pro/blocks-v3/components/jsx-parser.js");
/* harmony import */ var _blocks_v3_register_block_type_v3__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./blocks-v3/register-block-type-v3 */ "./assets/src/js/pro/blocks-v3/register-block-type-v3.js");
/**
 * ACF Blocks Version 3 - Entry Point
 * Imports all modules and initializes the block system
 */

// Import utilities.


// Import JSX parser and expose on acf global.


// Import block registration (initializes automatically via acf.addAction).


/***/ }),

/***/ "./assets/src/js/pro/_acf-blocks.js":
/*!******************************************!*\
  !*** ./assets/src/js/pro/_acf-blocks.js ***!
  \******************************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const md5 = __webpack_require__(/*! md5 */ "./node_modules/md5/md5.js");
(($, undefined) => {
  // Dependencies.
  const {
    BlockControls,
    InspectorControls,
    InnerBlocks,
    useBlockProps,
    AlignmentToolbar,
    BlockVerticalAlignmentToolbar
  } = wp.blockEditor;
  const {
    ToolbarGroup,
    ToolbarButton,
    Placeholder,
    Spinner
  } = wp.components;
  const {
    Fragment
  } = wp.element;
  const {
    Component
  } = React;
  const {
    useSelect
  } = wp.data;
  const {
    createHigherOrderComponent
  } = wp.compose;

  // Potentially experimental dependencies.
  const BlockAlignmentMatrixToolbar = wp.blockEditor.__experimentalBlockAlignmentMatrixToolbar || wp.blockEditor.BlockAlignmentMatrixToolbar;
  // Gutenberg v10.x begins transition from Toolbar components to Control components.
  const BlockAlignmentMatrixControl = wp.blockEditor.__experimentalBlockAlignmentMatrixControl || wp.blockEditor.BlockAlignmentMatrixControl;
  const BlockFullHeightAlignmentControl = wp.blockEditor.__experimentalBlockFullHeightAligmentControl || wp.blockEditor.__experimentalBlockFullHeightAlignmentControl || wp.blockEditor.BlockFullHeightAlignmentControl;
  const useInnerBlocksProps = wp.blockEditor.__experimentalUseInnerBlocksProps || wp.blockEditor.useInnerBlocksProps;

  /**
   * Storage for registered block types.
   *
   * @since ACF 5.8.0
   * @var object
   */
  const blockTypes = {};

  /**
   * Data storage for Block Instances and their DynamicHTML components.
   * This is temporarily stored on the ACF object, but this will be replaced later.
   * Developers should not rely on reading or using any aspect of acf.blockInstances.
   *
   * @since ACF 6.3
   */
  acf.blockInstances = {};

  /**
   * Returns a block type for the given name.
   *
   * @date	20/2/19
   * @since	ACF 5.8.0
   *
   * @param	string name The block name.
   * @return	(object|false)
   */
  function getBlockType(name) {
    return blockTypes[name] || false;
  }

  /**
   * Returns a block version for a given block name
   *
   * @date 8/6/22
   * @since ACF 6.0
   *
   * @param string name The block name
   * @return int
   */
  function getBlockVersion(name) {
    const blockType = getBlockType(name);
    return blockType.acf_block_version || 1;
  }

  /**
   * Returns a block's validate property. Default true.
   *
   * @since ACF 6.3
   *
   * @param string name The block name
   * @return boolean
   */
  function blockSupportsValidation(name) {
    const blockType = getBlockType(name);
    return blockType.validate;
  }

  /**
   * Returns true if a block (identified by client ID) is nested in a query loop block.
   *
   * @date 17/1/22
   * @since ACF 5.12
   *
   * @param {string} clientId A block client ID
   * @return boolean
   */
  function isBlockInQueryLoop(clientId) {
    const parents = wp.data.select('core/block-editor').getBlockParents(clientId);
    const parentsData = wp.data.select('core/block-editor').getBlocksByClientId(parents);
    return parentsData.filter(block => block.name === 'core/query').length;
  }

  /**
   * Returns true if we're currently inside the WP 5.9+ site editor.
   *
   * @date 08/02/22
   * @since ACF 5.12
   *
   * @return boolean
   */
  function isSiteEditor() {
    return document.querySelectorAll('iframe[name="editor-canvas"]').length > 0;
  }

  /**
   * Returns true if the block editor is currently showing the desktop device type preview.
   *
   * This function will always return true in the site editor as it uses the
   * edit-post store rather than the edit-site store.
   *
   * @date 15/02/22
   * @since ACF 5.12
   *
   * @return boolean
   */
  function isDesktopPreviewDeviceType() {
    const editPostStore = select('core/edit-post');

    // Return true if the edit post store isn't available (such as in the widget editor)
    if (!editPostStore) return true;

    // Check if function exists (experimental or not) and return true if it's Desktop, or doesn't exist.
    if (editPostStore.__experimentalGetPreviewDeviceType) {
      return 'Desktop' === editPostStore.__experimentalGetPreviewDeviceType();
    } else if (editPostStore.getPreviewDeviceType) {
      return 'Desktop' === editPostStore.getPreviewDeviceType();
    } else {
      return true;
    }
  }

  /**
   * Returns true if the block editor is currently in template edit mode.
   *
   * @date 16/02/22
   * @since ACF 5.12
   *
   * @return boolean
   */
  function isEditingTemplate() {
    const editPostStore = select('core/edit-post');

    // Return false if the edit post store isn't available (such as in the widget editor)
    if (!editPostStore) return false;

    // Return false if the function doesn't exist
    if (!editPostStore.isEditingTemplate) return false;
    return editPostStore.isEditingTemplate();
  }

  /**
   * Returns true if we're currently inside an iFramed non-desktop device preview type (WP5.9+)
   *
   * @date 15/02/22
   * @since ACF 5.12
   *
   * @return boolean
   */
  function isiFramedMobileDevicePreview() {
    return $('iframe[name=editor-canvas]').length && !isDesktopPreviewDeviceType();
  }

  /**
   * Registers a block type.
   *
   * @date	19/2/19
   * @since	ACF 5.8.0
   *
   * @param	object blockType The block type settings localized from PHP.
   * @return	object The result from wp.blocks.registerBlockType().
   */
  function registerBlockType(blockType) {
    // Bail early if is excluded post_type.
    const allowedTypes = blockType.post_types || [];
    if (allowedTypes.length) {
      // Always allow block to appear on "Edit reusable Block" screen.
      allowedTypes.push('wp_block');

      // Check post type.
      const postType = acf.get('postType');
      if (!allowedTypes.includes(postType)) {
        return false;
      }
    }

    // Handle svg HTML.
    if (typeof blockType.icon === 'string' && blockType.icon.substr(0, 4) === '<svg') {
      const iconHTML = blockType.icon;
      blockType.icon = /*#__PURE__*/React.createElement(Div, null, iconHTML);
    }

    // Remove icon if empty to allow for default "block".
    // Avoids JS error preventing block from being registered.
    if (!blockType.icon) {
      delete blockType.icon;
    }

    // Check category exists and fallback to "common".
    const category = wp.blocks.getCategories().filter(({
      slug
    }) => slug === blockType.category).pop();
    if (!category) {
      //console.warn( `The block "${blockType.name}" is registered with an unknown category "${blockType.category}".` );
      blockType.category = 'common';
    }

    // Merge in block settings before local additions.
    blockType = acf.parseArgs(blockType, {
      title: '',
      name: '',
      category: '',
      api_version: 2,
      acf_block_version: 1
    });

    // Remove all empty attribute defaults from PHP values to allow serialisation.
    // https://github.com/WordPress/gutenberg/issues/7342
    for (const key in blockType.attributes) {
      if ('default' in blockType.attributes[key] && blockType.attributes[key].default.length === 0) {
        delete blockType.attributes[key].default;
      }
    }

    // Apply anchor supports to avoid block editor default writing to ID.
    if (blockType.supports.anchor) {
      blockType.attributes.anchor = {
        type: 'string'
      };
    }

    // Append edit and save functions.
    let ThisBlockEdit = BlockEdit;
    let ThisBlockSave = BlockSave;

    // Apply alignText functionality.
    if (blockType.supports.alignText || blockType.supports.align_text) {
      blockType.attributes = addBackCompatAttribute(blockType.attributes, 'align_text', 'string');
      ThisBlockEdit = withAlignTextComponent(ThisBlockEdit, blockType);
    }

    // Apply alignContent functionality.
    if (blockType.supports.alignContent || blockType.supports.align_content) {
      blockType.attributes = addBackCompatAttribute(blockType.attributes, 'align_content', 'string');
      ThisBlockEdit = withAlignContentComponent(ThisBlockEdit, blockType);
    }

    // Apply fullHeight functionality.
    if (blockType.supports.fullHeight || blockType.supports.full_height) {
      blockType.attributes = addBackCompatAttribute(blockType.attributes, 'full_height', 'boolean');
      ThisBlockEdit = withFullHeightComponent(ThisBlockEdit, blockType.blockType);
    }

    // Set edit and save functions.
    blockType.edit = props => {
      // Ensure we remove our save lock if a block is removed.
      wp.element.useEffect(() => {
        return () => {
          if (!wp.data.dispatch('core/editor')) return;
          wp.data.dispatch('core/editor').unlockPostSaving('acf/block/' + props.clientId);
        };
      }, []);
      return /*#__PURE__*/React.createElement(ThisBlockEdit, props);
    };
    blockType.save = () => /*#__PURE__*/React.createElement(ThisBlockSave, null);

    // Add to storage.
    blockTypes[blockType.name] = blockType;

    // Register with WP.
    const result = wp.blocks.registerBlockType(blockType.name, blockType);

    // Fix bug in 'core/anchor/attribute' filter overwriting attribute.
    // Required for < WP5.9
    // See https://github.com/WordPress/gutenberg/issues/15240
    if (result.attributes.anchor) {
      result.attributes.anchor = {
        type: 'string'
      };
    }

    // Return result.
    return result;
  }

  /**
   * Returns the wp.data.select() response with backwards compatibility.
   *
   * @date	17/06/2020
   * @since	ACF 5.9.0
   *
   * @param	string selector The selector name.
   * @return	mixed
   */
  function select(selector) {
    if (selector === 'core/block-editor') {
      return wp.data.select('core/block-editor') || wp.data.select('core/editor');
    }
    return wp.data.select(selector);
  }

  /**
   * Returns the wp.data.dispatch() response with backwards compatibility.
   *
   * @date	17/06/2020
   * @since	ACF 5.9.0
   *
   * @param	string selector The selector name.
   * @return	mixed
   */
  function dispatch(selector) {
    return wp.data.dispatch(selector);
  }

  /**
   * Returns an array of all blocks for the given args.
   *
   * @date	27/2/19
   * @since	ACF 5.7.13
   *
   * @param	{object} args An object of key=>value pairs used to filter results.
   * @return	array.
   */
  function getBlocks(args) {
    let blocks = [];

    // Local function to recurse through all child blocks and add to the blocks array.
    const recurseBlocks = block => {
      blocks.push(block);
      select('core/block-editor').getBlocks(block.clientId).forEach(recurseBlocks);
    };

    // Trigger initial recursion for parent level blocks.
    select('core/block-editor').getBlocks().forEach(recurseBlocks);

    // Loop over args and filter.
    for (const k in args) {
      blocks = blocks.filter(({
        attributes
      }) => attributes[k] === args[k]);
    }

    // Return results.
    return blocks;
  }

  /**
   * Storage for the AJAX queue.
   *
   * @const {array}
   */
  const ajaxQueue = {};

  /**
   * Storage for cached AJAX requests for block content.
   *
   * @since ACF 5.12
   * @const {array}
   */
  const fetchCache = {};

  /**
   * Fetches a JSON result from the AJAX API.
   *
   * @date	28/2/19
   * @since	ACF 5.7.13
   *
   * @param	object block The block props.
   * @query	object The query args used in AJAX callback.
   * @return	object The AJAX promise.
   */
  function fetchBlock(args) {
    const {
      attributes = {},
      context = {},
      query = {},
      clientId = null,
      delay = 0
    } = args;

    // Build a unique queue ID from block data, including the clientId for edit forms.
    const queueId = md5(JSON.stringify({
      ...attributes,
      ...context,
      ...query
    }));
    const data = ajaxQueue[queueId] || {
      query: {},
      timeout: false,
      promise: $.Deferred(),
      started: false
    };

    // Append query args to storage.
    data.query = {
      ...data.query,
      ...query
    };
    if (data.started) return data.promise;

    // Set fresh timeout.
    clearTimeout(data.timeout);
    data.timeout = setTimeout(() => {
      data.started = true;
      if (fetchCache[queueId]) {
        ajaxQueue[queueId] = null;
        data.promise.resolve.apply(fetchCache[queueId][0], fetchCache[queueId][1]);
      } else {
        $.ajax({
          url: acf.get('ajaxurl'),
          dataType: 'json',
          type: 'post',
          cache: false,
          data: acf.prepareForAjax({
            action: 'acf/ajax/fetch-block',
            block: JSON.stringify(attributes),
            clientId: clientId,
            context: JSON.stringify(context),
            query: data.query
          })
        }).always(() => {
          // Clean up queue after AJAX request is complete.
          ajaxQueue[queueId] = null;
        }).done(function () {
          fetchCache[queueId] = [this, arguments];
          data.promise.resolve.apply(this, arguments);
        }).fail(function () {
          data.promise.reject.apply(this, arguments);
        });
      }
    }, delay);

    // Update storage.
    ajaxQueue[queueId] = data;

    // Return promise.
    return data.promise;
  }

  /**
   * Returns true if both object are the same.
   *
   * @date	19/05/2020
   * @since	ACF 5.9.0
   *
   * @param	object obj1
   * @param	object obj2
   * @return	bool
   */
  function compareObjects(obj1, obj2) {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  }

  /**
   * Converts HTML into a React element.
   *
   * @date	19/05/2020
   * @since	ACF 5.9.0
   *
   * @param	string html The HTML to convert.
   * @param	int acfBlockVersion The ACF block version number.
   * @return	object Result of React.createElement().
   */
  acf.parseJSX = (html, acfBlockVersion) => {
    // Apply a temporary wrapper for the jQuery parse to prevent text nodes triggering errors.
    html = '<div>' + html + '</div>';
    // Correctly balance InnerBlocks tags for jQuery's initial parse.
    html = html.replace(/<InnerBlocks([^>]+)?\/>/, '<InnerBlocks$1></InnerBlocks>');
    return parseNode($(html)[0], acfBlockVersion, 0).props.children;
  };

  /**
   * Converts a DOM node into a React element.
   *
   * @date	19/05/2020
   * @since	ACF 5.9.0
   *
   * @param	DOM node The DOM node.
   * @param	int acfBlockVersion The ACF block version number.
   * @param	int level The recursion level.
   * @return	object Result of React.createElement().
   */
  function parseNode(node, acfBlockVersion, level = 0) {
    // Get node name.
    const nodeName = parseNodeName(node.nodeName.toLowerCase(), acfBlockVersion);
    if (!nodeName) {
      return null;
    }

    // Get node attributes in React friendly format.
    const nodeAttrs = {};
    if (level === 1 && nodeName !== 'ACFInnerBlocks') {
      // Top level (after stripping away the container div), create a ref for passing through to ACF's JS API.
      nodeAttrs.ref = React.createRef();
    }
    acf.arrayArgs(node.attributes).map(parseNodeAttr).forEach(({
      name,
      value
    }) => {
      nodeAttrs[name] = value;
    });
    if ('ACFInnerBlocks' === nodeName) {
      return /*#__PURE__*/React.createElement(ACFInnerBlocks, nodeAttrs);
    }

    // Define args for React.createElement().
    const args = [nodeName, nodeAttrs];
    acf.arrayArgs(node.childNodes).forEach(child => {
      if (child instanceof Text) {
        const text = child.textContent;
        if (text) {
          args.push(text);
        }
      } else {
        args.push(parseNode(child, acfBlockVersion, level + 1));
      }
    });

    // Return element.
    return React.createElement.apply(this, args);
  }

  /**
   * Converts a node or attribute name into it's JSX compliant name
   *
   * @date     05/07/2021
   * @since    ACF 5.9.8
   *
   * @param    string name The node or attribute name.
   * @return  string
   */
  function getJSXName(name) {
    const replacement = acf.isget(acf, 'jsxNameReplacements', name);
    if (replacement) return replacement;
    return name;
  }

  /**
   * A react Component for inline scripts.
   *
   * This Component uses a combination of React references and jQuery to append the
   * inline <script> HTML each time the component is rendered.
   *
   * @date	29/05/2020
   * @since	ACF 5.9.0
   *
   * @param	type Var Description.
   * @return	type Description.
   */
  class Script extends Component {
    render() {
      return /*#__PURE__*/React.createElement("div", {
        ref: el => this.el = el
      });
    }
    setHTML(html) {
      $(this.el).html(`<script>${html}</script>`);
    }
    componentDidUpdate() {
      this.setHTML(this.props.children);
    }
    componentDidMount() {
      this.setHTML(this.props.children);
    }
  }

  /**
   * Converts the given name into a React friendly name or component.
   *
   * @date	19/05/2020
   * @since	ACF 5.9.0
   *
   * @param	string name The node name in lowercase.
   * @param	int acfBlockVersion The ACF block version number.
   * @return	mixed
   */
  function parseNodeName(name, acfBlockVersion) {
    switch (name) {
      case 'innerblocks':
        if (acfBlockVersion < 2) {
          return InnerBlocks;
        }
        return 'ACFInnerBlocks';
      case 'script':
        return Script;
      case '#comment':
        return null;
      default:
        // Replace names for JSX counterparts.
        name = getJSXName(name);
    }
    return name;
  }

  /**
   * Functional component for ACFInnerBlocks.
   *
   * @since ACF 6.0.0
   *
   * @param obj props element properties.
   * @return DOM element
   */
  function ACFInnerBlocks(props) {
    const {
      className = 'acf-innerblocks-container'
    } = props;
    const innerBlockProps = useInnerBlocksProps({
      className: className
    }, props);
    return /*#__PURE__*/React.createElement("div", innerBlockProps, innerBlockProps.children);
  }

  /**
   * Converts the given attribute into a React friendly name and value object.
   *
   * @date	19/05/2020
   * @since	ACF 5.9.0
   *
   * @param	obj nodeAttr The node attribute.
   * @return	obj
   */
  function parseNodeAttr(nodeAttr) {
    let name = nodeAttr.name;
    let value = nodeAttr.value;

    // Allow overrides for third party libraries who might use specific attributes.
    let shortcut = acf.applyFilters('acf_blocks_parse_node_attr', false, nodeAttr);
    if (shortcut) return shortcut;
    switch (name) {
      // Class.
      case 'class':
        name = 'className';
        break;

      // Style.
      case 'style':
        const css = {};
        value.split(';').forEach(s => {
          const pos = s.indexOf(':');
          if (pos > 0) {
            let ruleName = s.substr(0, pos).trim();
            const ruleValue = s.substr(pos + 1).trim();

            // Rename core properties, but not CSS variables.
            if (ruleName.charAt(0) !== '-') {
              ruleName = acf.strCamelCase(ruleName);
            }
            css[ruleName] = ruleValue;
          }
        });
        value = css;
        break;

      // Default.
      default:
        // No formatting needed for "data-x" attributes.
        if (name.indexOf('data-') === 0) {
          break;
        }

        // Replace names for JSX counterparts.
        name = getJSXName(name);

        // Convert JSON values.
        const c1 = value.charAt(0);
        if (c1 === '[' || c1 === '{') {
          value = JSON.parse(value);
        }

        // Convert bool values.
        if (value === 'true' || value === 'false') {
          value = value === 'true';
        }
        break;
    }
    return {
      name,
      value
    };
  }

  /**
   * Higher Order Component used to set default block attribute values.
   *
   * By modifying block attributes directly, instead of defining defaults in registerBlockType(),
   * WordPress will include them always within the saved block serialized JSON.
   *
   * @date	31/07/2020
   * @since	ACF 5.9.0
   *
   * @param	Component BlockListBlock The BlockListBlock Component.
   * @return	Component
   */
  const withDefaultAttributes = createHigherOrderComponent(BlockListBlock => class WrappedBlockEdit extends Component {
    constructor(props) {
      super(props);

      // Extract vars.
      const {
        name,
        attributes
      } = this.props;

      // Only run on ACF Blocks.
      const blockType = getBlockType(name);
      if (!blockType) {
        return;
      }

      // Check and remove any empty string attributes to match PHP behaviour.
      Object.keys(attributes).forEach(key => {
        if (attributes[key] === '') {
          delete attributes[key];
        }
      });

      // Backward compatibility attribute replacement.
      const upgrades = {
        full_height: 'fullHeight',
        align_content: 'alignContent',
        align_text: 'alignText'
      };
      Object.keys(upgrades).forEach(key => {
        if (attributes[key] !== undefined) {
          attributes[upgrades[key]] = attributes[key];
        } else if (attributes[upgrades[key]] === undefined) {
          //Check for a default
          if (blockType[key] !== undefined) {
            attributes[upgrades[key]] = blockType[key];
          }
        }
        delete blockType[key];
        delete attributes[key];
      });

      // Set default attributes for those undefined.
      for (let attribute in blockType.attributes) {
        if (attributes[attribute] === undefined && blockType[attribute] !== undefined) {
          attributes[attribute] = blockType[attribute];
        }
      }
    }
    render() {
      return /*#__PURE__*/React.createElement(BlockListBlock, this.props);
    }
  }, 'withDefaultAttributes');
  wp.hooks.addFilter('editor.BlockListBlock', 'acf/with-default-attributes', withDefaultAttributes);

  /**
   * The BlockSave functional component.
   *
   * @date	08/07/2020
   * @since	ACF 5.9.0
   */
  function BlockSave() {
    return /*#__PURE__*/React.createElement(InnerBlocks.Content, null);
  }

  /**
   * The BlockEdit component.
   *
   * @date	19/2/19
   * @since	ACF 5.7.12
   */
  class BlockEdit extends Component {
    constructor(props) {
      super(props);
      this.setup();
    }
    setup() {
      const {
        name,
        attributes,
        clientId
      } = this.props;
      const blockType = getBlockType(name);

      // Restrict current mode.
      function restrictMode(modes) {
        if (!modes.includes(attributes.mode)) {
          attributes.mode = modes[0];
        }
      }
      if (isBlockInQueryLoop(clientId) || isSiteEditor()) {
        restrictMode(['preview']);
      } else {
        switch (blockType.mode) {
          case 'edit':
            restrictMode(['edit', 'preview']);
            break;
          case 'preview':
            restrictMode(['preview', 'edit']);
            break;
          default:
            restrictMode(['auto']);
            break;
        }
      }
    }
    render() {
      const {
        name,
        attributes,
        setAttributes,
        clientId
      } = this.props;
      const blockType = getBlockType(name);
      const forcePreview = isBlockInQueryLoop(clientId) || isSiteEditor();
      let {
        mode
      } = attributes;
      if (forcePreview) {
        mode = 'preview';
      }

      // Show toggle only for edit/preview modes and for blocks not in a query loop/FSE.
      let showToggle = blockType.supports.mode;
      if (mode === 'auto' || forcePreview) {
        showToggle = false;
      }

      // Configure toggle variables.
      const toggleText = mode === 'preview' ? acf.__('Switch to Edit') : acf.__('Switch to Preview');
      const toggleIcon = mode === 'preview' ? 'edit' : 'welcome-view-site';
      function toggleMode() {
        setAttributes({
          mode: mode === 'preview' ? 'edit' : 'preview'
        });
      }

      // Return template.
      return /*#__PURE__*/React.createElement(Fragment, null, /*#__PURE__*/React.createElement(BlockControls, null, showToggle && /*#__PURE__*/React.createElement(ToolbarGroup, null, /*#__PURE__*/React.createElement(ToolbarButton, {
        className: "components-icon-button components-toolbar__control",
        label: toggleText,
        icon: toggleIcon,
        onClick: toggleMode
      }))), /*#__PURE__*/React.createElement(InspectorControls, null, mode === 'preview' && /*#__PURE__*/React.createElement("div", {
        className: "acf-block-component acf-block-panel"
      }, /*#__PURE__*/React.createElement(BlockForm, this.props))), /*#__PURE__*/React.createElement(BlockBody, this.props));
    }
  }

  /**
   * The BlockBody functional component.
   *
   * @since	ACF 5.7.12
   */
  function BlockBody(props) {
    const {
      attributes,
      isSelected,
      name,
      clientId
    } = props;
    const {
      mode
    } = attributes;
    const index = useSelect(select => {
      const rootClientId = select('core/block-editor').getBlockRootClientId(clientId);
      return select('core/block-editor').getBlockIndex(clientId, rootClientId);
    });
    let showForm = true;
    let additionalClasses = 'acf-block-component acf-block-body';
    if (mode === 'auto' && !isSelected || mode === 'preview') {
      additionalClasses += ' acf-block-preview';
      showForm = false;
    }

    // Setup block cache if required, and update mode.
    if (!(clientId in acf.blockInstances)) {
      acf.blockInstances[clientId] = {
        validation_errors: false,
        mode: mode
      };
    }
    acf.blockInstances[clientId].mode = mode;
    if (!isSelected) {
      if (blockSupportsValidation(name) && acf.blockInstances[clientId].validation_errors) {
        additionalClasses += ' acf-block-has-validation-error';
      }
      acf.blockInstances[clientId].has_been_deselected = true;
    }
    if (getBlockVersion(name) > 1) {
      return /*#__PURE__*/React.createElement("div", useBlockProps({
        className: additionalClasses
      }), showForm ? /*#__PURE__*/React.createElement(BlockForm, _extends({}, props, {
        index: index
      })) : /*#__PURE__*/React.createElement(BlockPreview, _extends({}, props, {
        index: index
      })));
    } else {
      return /*#__PURE__*/React.createElement("div", useBlockProps(), /*#__PURE__*/React.createElement("div", {
        className: "acf-block-component acf-block-body"
      }, showForm ? /*#__PURE__*/React.createElement(BlockForm, _extends({}, props, {
        index: index
      })) : /*#__PURE__*/React.createElement(BlockPreview, _extends({}, props, {
        index: index
      }))));
    }
  }

  /**
   * A react component to append HTMl.
   *
   * @date	19/2/19
   * @since	ACF 5.7.12
   *
   * @param	string children The html to insert.
   * @return	void
   */
  class Div extends Component {
    render() {
      return /*#__PURE__*/React.createElement("div", {
        dangerouslySetInnerHTML: {
          __html: this.props.children
        }
      });
    }
  }

  /**
   * DynamicHTML Class.
   *
   * A react componenet to load and insert dynamic HTML.
   *
   * @date	19/2/19
   * @since	ACF 5.7.12
   *
   * @param	void
   * @return	void
   */
  class DynamicHTML extends Component {
    constructor(props) {
      super(props);

      // Bind callbacks.
      this.setRef = this.setRef.bind(this);

      // Define default props and call setup().
      this.id = '';
      this.el = false;
      this.subscribed = true;
      this.renderMethod = 'jQuery';
      this.passedValidation = false;
      this.setup(props);

      // Load state.
      this.loadState();
    }
    setup(props) {
      const constructor = this.constructor.name;
      const clientId = props.clientId;
      if (!(clientId in acf.blockInstances)) {
        acf.blockInstances[clientId] = {
          validation_errors: false,
          mode: props.mode
        };
      }
      if (!(constructor in acf.blockInstances[clientId])) {
        acf.blockInstances[clientId][constructor] = {};
      }
    }
    fetch() {
      // Do nothing.
    }
    maybePreload(blockId, clientId, form) {
      acf.debug('Preload check', blockId, clientId, form);

      // Early return if block is in query loop.
      if (isBlockInQueryLoop(this.props.clientId)) {
        acf.debug('Preload failed: Block is in query loop.');
        return false;
      }
      const preloadedBlocks = acf.get('preloadedBlocks');

      // Early return if no preloaded blocks exist.
      if (!preloadedBlocks || !preloadedBlocks[blockId]) {
        acf.debug('Preload failed: Block not preloaded.');
        return false;
      }

      // Create a copy to avoid mutating the original preloaded data.
      const preloadedBlock = {
        ...preloadedBlocks[blockId]
      };

      // Ensure we only preload the correct block state (form or preview).
      if (form && !preloadedBlock.form || !form && preloadedBlock.form) {
        acf.debug('Preload failed: Correct state not preloaded.', form ? 'form' : 'preview');
        return false;
      }

      // Replace blockId with clientId in HTML.
      preloadedBlock.html = preloadedBlock.html.replaceAll(blockId, clientId);

      // Replace blockId in validation errors.
      if (preloadedBlock.validation && preloadedBlock.validation.errors) {
        preloadedBlock.validation.errors = preloadedBlock.validation.errors.map(error => {
          error.input = error.input.replaceAll(blockId, clientId);
          return error;
        });
      }

      // Return preloaded object.
      acf.debug('Preload successful', preloadedBlock);
      return preloadedBlock;
    }
    loadState() {
      const client = acf.blockInstances[this.props.clientId] || {};
      this.state = client[this.constructor.name] || {};
    }
    setState(state) {
      acf.blockInstances[this.props.clientId][this.constructor.name] = {
        ...this.state,
        ...state
      };

      // Update component state if subscribed.
      // - Allows AJAX callback to update store without modifying state of an unmounted component.
      if (this.subscribed || acf.get('StrictMode')) {
        super.setState(state);
      }
      acf.debug('SetState', Object.assign({}, this), this.props.clientId, this.constructor.name, Object.assign({}, acf.blockInstances[this.props.clientId][this.constructor.name]));
    }
    setHtml(html) {
      html = html ? html.trim() : '';

      // Bail early if html has not changed.
      if (html === this.state.html) {
        return;
      }

      // Update state.
      const state = {
        html
      };
      if (this.renderMethod === 'jsx') {
        state.jsx = acf.parseJSX(html, getBlockVersion(this.props.name));

        // Handle templates which don't contain any valid JSX parsable elements.
        if (!state.jsx) {
          console.warn('Your ACF block template contains no valid HTML elements. Appending a empty div to prevent React JS errors.');
          state.html += '<div></div>';
          state.jsx = acf.parseJSX(state.html, getBlockVersion(this.props.name));
        }

        // If we've got an object (as an array) find the first valid React ref.
        if (Array.isArray(state.jsx)) {
          let refElement = state.jsx.find(element => React.isValidElement(element));
          state.ref = refElement.ref;
        } else {
          state.ref = state.jsx.ref;
        }
        state.$el = $(this.el);
      } else {
        state.$el = $(html);
      }
      this.setState(state);
    }
    setRef(el) {
      this.el = el;
    }
    render() {
      // Render JSX.
      if (this.state.jsx) {
        // If we're a v2+ block, use the jsx element itself as our ref.
        if (getBlockVersion(this.props.name) > 1) {
          this.setRef(this.state.jsx);
          return this.state.jsx;
        } else {
          return /*#__PURE__*/React.createElement("div", {
            ref: this.setRef
          }, this.state.jsx);
        }
      }

      // Return HTML.
      return /*#__PURE__*/React.createElement("div", {
        ref: this.setRef
      }, /*#__PURE__*/React.createElement(Placeholder, null, /*#__PURE__*/React.createElement(Spinner, null)));
    }
    shouldComponentUpdate({
      index
    }, {
      html
    }) {
      if (index !== this.props.index) {
        this.componentWillMove();
      }
      return html !== this.state.html;
    }
    display(context) {
      // This method is called after setting new HTML and the Component render.
      // The jQuery render method simply needs to move $el into place.
      if (this.renderMethod === 'jQuery') {
        const $el = this.state.$el;
        const $prevParent = $el.parent();
        const $thisParent = $(this.el);

        // Move $el into place.
        // Skip this in StrictMode unless context is 'append' or component is subscribed.
        if (!(acf.get('StrictMode') && context !== 'append' && !this.subscribed)) {
          $thisParent.html($el);
        }

        // Special case for reusable blocks.
        // Multiple instances of the same reusable block share the same block id.
        // This causes all instances to share the same state (cool), which unfortunately
        // pulls $el back and forth between the last rendered reusable block.
        // This simple fix leaves a "clone" behind :)
        if ($prevParent.length && $prevParent[0] !== $thisParent[0]) {
          $prevParent.html($el.clone());
        }
      }

      // Lock block if required.
      if (this.getValidationErrors() && this.isNotNewlyAdded()) {
        this.lockBlockForSaving();
      } else {
        this.unlockBlockForSaving();
      }

      // Call context specific method.
      switch (context) {
        case 'append':
          this.componentDidAppend();
          break;
        case 'remount':
          this.componentDidRemount();
          break;
      }
    }
    validate() {
      // Do nothing.
    }
    componentDidMount() {
      // Fetch on first load.
      if (this.state.html === undefined) {
        this.fetch();

        // Or remount existing HTML.
      } else {
        this.display('remount');
      }
    }
    componentDidUpdate(prevProps, prevState) {
      // HTML has changed.
      this.display('append');
    }
    componentDidAppend() {
      acf.doAction('append', this.state.$el);
    }
    componentWillUnmount() {
      // Only skip unmount action if in StrictMode AND component is not subscribed
      if (!acf.get('StrictMode') || this.subscribed) {
        acf.doAction('unmount', this.state.$el);
      }

      // Unsubscribe this component from state
      this.subscribed = false;
    }
    componentDidRemount() {
      this.subscribed = true;

      // Use setTimeout to avoid incorrect timing of events.
      // React will unmount and mount components in DOM order.
      // This means a new component can be mounted before an old one is unmounted.
      // ACF shares $el across new/old components which is un-React-like.
      // This timout ensures that unmounting occurs before remounting.
      setTimeout(() => {
        acf.doAction('remount', this.state.$el);
      });
    }
    componentWillMove() {
      acf.doAction('unmount', this.state.$el);
      setTimeout(() => {
        acf.doAction('remount', this.state.$el);
      });
    }
    isNotNewlyAdded() {
      return acf.blockInstances[this.props.clientId].has_been_deselected || false;
    }
    hasShownValidation() {
      return acf.blockInstances[this.props.clientId].shown_validation || false;
    }
    setShownValidation() {
      acf.blockInstances[this.props.clientId].shown_validation = true;
    }
    setValidationErrors(errors) {
      acf.blockInstances[this.props.clientId].validation_errors = errors;
    }
    getValidationErrors() {
      return acf.blockInstances[this.props.clientId].validation_errors;
    }
    getMode() {
      return acf.blockInstances[this.props.clientId].mode;
    }
    lockBlockForSaving() {
      if (!wp.data.dispatch('core/editor')) return;
      wp.data.dispatch('core/editor').lockPostSaving('acf/block/' + this.props.clientId);
    }
    unlockBlockForSaving() {
      if (!wp.data.dispatch('core/editor')) return;
      wp.data.dispatch('core/editor').unlockPostSaving('acf/block/' + this.props.clientId);
    }
    displayValidation($formEl) {
      if (!blockSupportsValidation(this.props.name)) {
        acf.debug('Block does not support validation');
        return;
      }
      if (!$formEl || $formEl.hasClass('acf-empty-block-fields')) {
        acf.debug('There is no edit form available to validate.');
        return;
      }
      const errors = this.getValidationErrors();
      acf.debug('Starting handle validation', Object.assign({}, this), Object.assign({}, $formEl), errors);
      this.setShownValidation();
      let validator = acf.getBlockFormValidator($formEl);
      validator.clearErrors();
      acf.doAction('blocks/validation/pre_apply', errors);
      if (errors) {
        validator.addErrors(errors);
        validator.showErrors('after');
        this.lockBlockForSaving();
      } else {
        // remove previous error message
        if (validator.has('notice')) {
          validator.get('notice').update({
            type: 'success',
            text: acf.__('Validation successful'),
            timeout: 1000
          });
          validator.set('notice', null);
        }
        this.unlockBlockForSaving();
      }
      acf.doAction('blocks/validation/post_apply', errors);
    }
  }

  /**
   * BlockForm Class.
   *
   * A react componenet to handle the block form.
   *
   * @date	19/2/19
   * @since	ACF 5.7.12
   *
   * @param	string id the block id.
   * @return	void
   */
  class BlockForm extends DynamicHTML {
    setup(props) {
      this.id = `BlockForm-${props.clientId}`;
      super.setup(props);
    }
    fetch(validate_only = false, data = false) {
      // Extract props.
      const {
        context,
        clientId,
        name
      } = this.props;
      let {
        attributes
      } = this.props;
      let query = {
        form: true
      };
      if (validate_only) {
        query = {
          validate: true
        };
        attributes.data = data;
      }
      const hash = createBlockAttributesHash(attributes, context);
      acf.debug('BlockForm fetch', attributes, query);

      // Try preloaded data first.
      const preloaded = this.maybePreload(hash, clientId, true);
      if (preloaded) {
        this.setHtml(acf.applyFilters('blocks/form/render', preloaded.html, true));
        if (preloaded.validation) this.setValidationErrors(preloaded.validation.errors);
        return;
      }
      if (!blockSupportsValidation(name)) {
        query.validate = false;
      }

      // Request AJAX and update HTML on complete.
      fetchBlock({
        attributes,
        context,
        clientId,
        query
      }).done(({
        data
      }) => {
        acf.debug('fetch block form promise');
        if (!data) {
          this.setHtml(`<div class="acf-block-fields acf-fields acf-empty-block-fields">${acf.__('Error loading block form')}</div>`);
          return;
        }
        if (data.form) {
          this.setHtml(acf.applyFilters('blocks/form/render', data.form.replaceAll(data.clientId, clientId), false));
        }
        if (data.validation) this.setValidationErrors(data.validation.errors);
        if (this.isNotNewlyAdded()) {
          acf.debug("Block has already shown it's invalid. The form needs to show validation errors");
          this.validate();
        }
      });
    }
    validate(loadState = true) {
      if (loadState) {
        this.loadState();
      }
      acf.debug('BlockForm calling validate with state', Object.assign({}, this));
      super.displayValidation(this.state.$el);
    }
    shouldComponentUpdate(nextProps, nextState) {
      if (blockSupportsValidation(this.props.name) && this.state.$el && this.isNotNewlyAdded() && !this.hasShownValidation()) {
        this.validate(false); // Shouldn't update state in shouldComponentUpdate.
      }
      return super.shouldComponentUpdate(nextProps, nextState);
    }
    componentWillUnmount() {
      super.componentWillUnmount();

      //TODO: either delete this, or clear validations here (if that's a sensible idea)

      acf.debug('BlockForm Component did unmount');
    }
    componentDidRemount() {
      super.componentDidRemount();
      acf.debug('BlockForm component did remount');
      const {
        $el
      } = this.state;
      if (blockSupportsValidation(this.props.name) && this.isNotNewlyAdded()) {
        acf.debug("Block has already shown it's invalid. The form needs to show validation errors");
        this.validate();
      }

      // Make sure our on append events are registered.
      if ($el.data('acf-events-added') !== true) {
        this.componentDidAppend();
      }
    }
    componentDidAppend() {
      super.componentDidAppend();
      acf.debug('BlockForm component did append');

      // Extract props.
      const {
        attributes,
        setAttributes,
        clientId,
        name
      } = this.props;
      const thisBlockForm = this;
      const {
        $el
      } = this.state;

      // Callback for updating block data and validation status if we're in an edit only mode.
      function serializeData(silent = false) {
        const data = acf.serialize($el, `acf-block_${clientId}`);
        if (silent) {
          attributes.data = data;
        } else {
          setAttributes({
            data
          });
        }
        if (blockSupportsValidation(name) && !silent && thisBlockForm.getMode() === 'edit') {
          acf.debug('No block preview currently available. Need to trigger a validation only fetch.');
          thisBlockForm.fetch(true, data);
        }
      }

      // Add events.
      let timeout = false;
      $el.on('change keyup', () => {
        clearTimeout(timeout);
        timeout = setTimeout(serializeData, 300);
      });

      // Log initialization for remount check on the persistent element.
      $el.data('acf-events-added', true);

      // Ensure newly added block is saved with data.
      // Do it silently to avoid triggering a preview render.
      if (!attributes.data) {
        serializeData(true);
      }
    }
  }

  /**
   * BlockPreview Class.
   *
   * A react componenet to handle the block preview.
   *
   * @date	19/2/19
   * @since	ACF 5.7.12
   *
   * @param	string id the block id.
   * @return	void
   */
  class BlockPreview extends DynamicHTML {
    setup(props) {
      const blockType = getBlockType(props.name);
      const contextPostId = acf.isget(this.props, 'context', 'postId');
      this.id = `BlockPreview-${props.clientId}`;
      super.setup(props);

      // Apply the contextPostId to the ID if set to stop query loop ID duplication.
      if (contextPostId) {
        this.id = `BlockPreview-${props.clientId}-${contextPostId}`;
      }
      if (blockType.supports.jsx) {
        this.renderMethod = 'jsx';
      }
    }
    fetch(args = {}) {
      const {
        attributes = this.props.attributes,
        clientId = this.props.clientId,
        context = this.props.context,
        delay = 0
      } = args;
      const {
        name
      } = this.props;

      // Remember attributes used to fetch HTML.
      this.setState({
        prevAttributes: attributes,
        prevContext: context
      });
      const hash = createBlockAttributesHash(attributes, context);

      // Try preloaded data first.
      let preloaded = this.maybePreload(hash, clientId, false);
      if (preloaded) {
        if (getBlockVersion(name) == 1) {
          preloaded.html = '<div class="acf-block-preview">' + preloaded.html + '</div>';
        }
        this.setHtml(acf.applyFilters('blocks/preview/render', preloaded.html, true));
        if (preloaded.validation) this.setValidationErrors(preloaded.validation.errors);
        return;
      }
      let query = {
        preview: true
      };
      if (!blockSupportsValidation(name)) {
        query.validate = false;
      }

      // Request AJAX and update HTML on complete.
      fetchBlock({
        attributes,
        context,
        clientId,
        query,
        delay
      }).done(({
        data
      }) => {
        if (!data) {
          this.setHtml(`<div class="acf-block-fields acf-fields acf-empty-block-fields">${acf.__('Error previewing block')}</div>`);
          return;
        }
        let replaceHtml = data.preview.replaceAll(data.clientId, clientId);
        if (getBlockVersion(name) == 1) {
          replaceHtml = '<div class="acf-block-preview">' + replaceHtml + '</div>';
        }
        acf.debug('fetch block render promise');
        this.setHtml(acf.applyFilters('blocks/preview/render', replaceHtml, false));
        if (data.validation) {
          this.setValidationErrors(data.validation.errors);
        }
        if (this.isNotNewlyAdded()) {
          this.validate();
        }
      });
    }
    validate() {
      // Check we've got a block form for this instance.
      const client = acf.blockInstances[this.props.clientId] || {};
      const blockFormState = client.BlockForm || false;
      if (blockFormState) {
        super.displayValidation(blockFormState.$el);
      }
    }
    componentDidAppend() {
      super.componentDidAppend();
      this.renderBlockPreviewEvent();
    }
    shouldComponentUpdate(nextProps, nextState) {
      const nextAttributes = nextProps.attributes;
      const thisAttributes = this.props.attributes;

      // Update preview if block data has changed.
      if (!compareObjects(nextAttributes, thisAttributes) || !compareObjects(nextProps.context, this.props.context)) {
        let delay = 0;

        // Delay fetch when editing className or anchor to simulate consistent logic to custom fields.
        if (nextAttributes.className !== thisAttributes.className) {
          delay = 300;
        }
        if (nextAttributes.anchor !== thisAttributes.anchor) {
          delay = 300;
        }
        acf.debug('Triggering fetch from block preview shouldComponentUpdate');
        this.fetch({
          attributes: nextAttributes,
          context: nextProps.context,
          delay
        });
      }
      return super.shouldComponentUpdate(nextProps, nextState);
    }
    renderBlockPreviewEvent() {
      // Extract props.
      const {
        attributes,
        name
      } = this.props;
      const {
        $el,
        ref
      } = this.state;
      var blockElement;

      // Generate action friendly type.
      const type = attributes.name.replace('acf/', '');
      if (ref && ref.current) {
        // We've got a react ref from a JSX container. Use the parent as the blockElement
        blockElement = $(ref.current).parent();
      } else if (getBlockVersion(name) == 1) {
        blockElement = $el;
      } else {
        blockElement = $el.parents('.acf-block-preview');
      }

      // Do action.
      acf.doAction('render_block_preview', blockElement, attributes);
      acf.doAction(`render_block_preview/type=${type}`, blockElement, attributes);
    }
    componentDidRemount() {
      super.componentDidRemount();
      acf.debug('Checking if fetch is required in BlockPreview componentDidRemount', Object.assign({}, this.state.prevAttributes), Object.assign({}, this.props.attributes), Object.assign({}, this.state.prevContext), Object.assign({}, this.props.context));

      // Update preview if data has changed since last render (changing from "edit" to "preview").
      if (!compareObjects(this.state.prevAttributes, this.props.attributes) || !compareObjects(this.state.prevContext, this.props.context)) {
        acf.debug('Triggering block preview fetch from componentDidRemount');
        this.fetch();
      }

      // Fire the block preview event so blocks can reinit JS elements.
      // React reusing DOM elements covers any potential race condition from the above fetch.
      this.renderBlockPreviewEvent();
    }
  }

  /**
   * Initializes ACF Blocks logic and registration.
   *
   * @since ACF 5.9.0
   */
  function initialize() {
    // Add support for WordPress versions before 5.2.
    if (!wp.blockEditor) {
      wp.blockEditor = wp.editor;
    }

    // Register block types.
    const blockTypes = acf.get('blockTypes');
    if (blockTypes) {
      // Only register blocks with version <= 2 (v3+ blocks are registered separately).
      blockTypes.forEach(blockType => {
        parseInt(blockType.acf_block_version) <= 2 && registerBlockType(blockType);
      });
    }
  }

  // Run the initialize callback during the "prepare" action.
  // This ensures that all localized data is available and that blocks are registered before the WP editor has been instantiated.
  acf.addAction('prepare', initialize);

  /**
   * Returns a valid vertical alignment.
   *
   * @date	07/08/2020
   * @since	ACF 5.9.0
   *
   * @param	string align A vertical alignment.
   * @return	string
   */
  function validateVerticalAlignment(align) {
    const ALIGNMENTS = ['top', 'center', 'bottom'];
    const DEFAULT = 'top';
    return ALIGNMENTS.includes(align) ? align : DEFAULT;
  }

  /**
   * Returns a valid horizontal alignment.
   *
   * @date	07/08/2020
   * @since	ACF 5.9.0
   *
   * @param	string align A horizontal alignment.
   * @return	string
   */
  function validateHorizontalAlignment(align) {
    const ALIGNMENTS = ['left', 'center', 'right'];
    const DEFAULT = acf.get('rtl') ? 'right' : 'left';
    return ALIGNMENTS.includes(align) ? align : DEFAULT;
  }

  /**
   * Returns a valid matrix alignment.
   *
   * Written for "upgrade-path" compatibility from vertical alignment to matrix alignment.
   *
   * @date	07/08/2020
   * @since	ACF 5.9.0
   *
   * @param	string align A matrix alignment.
   * @return	string
   */
  function validateMatrixAlignment(align) {
    const DEFAULT = 'center center';
    if (align) {
      const [y, x] = align.split(' ');
      return `${validateVerticalAlignment(y)} ${validateHorizontalAlignment(x)}`;
    }
    return DEFAULT;
  }

  /**
   * A higher order component adding alignContent editing functionality.
   *
   * @date	08/07/2020
   * @since	ACF 5.9.0
   *
   * @param	component OriginalBlockEdit The original BlockEdit component.
   * @param	object blockType The block type settings.
   * @return	component
   */
  function withAlignContentComponent(OriginalBlockEdit, blockType) {
    // Determine alignment vars
    let type = blockType.supports.align_content || blockType.supports.alignContent;
    let AlignmentComponent;
    let validateAlignment;
    switch (type) {
      case 'matrix':
        AlignmentComponent = BlockAlignmentMatrixControl || BlockAlignmentMatrixToolbar;
        validateAlignment = validateMatrixAlignment;
        break;
      default:
        AlignmentComponent = BlockVerticalAlignmentToolbar;
        validateAlignment = validateVerticalAlignment;
        break;
    }

    // Ensure alignment component exists.
    if (AlignmentComponent === undefined) {
      console.warn(`The "${type}" alignment component was not found.`);
      return OriginalBlockEdit;
    }

    // Ensure correct block attribute data is sent in intial preview AJAX request.
    blockType.alignContent = validateAlignment(blockType.alignContent);

    // Return wrapped component.
    return class WrappedBlockEdit extends Component {
      render() {
        const {
          attributes,
          setAttributes
        } = this.props;
        const {
          alignContent
        } = attributes;
        function onChangeAlignContent(alignContent) {
          setAttributes({
            alignContent: validateAlignment(alignContent)
          });
        }
        return /*#__PURE__*/React.createElement(Fragment, null, /*#__PURE__*/React.createElement(BlockControls, {
          group: "block"
        }, /*#__PURE__*/React.createElement(AlignmentComponent, {
          label: acf.__('Change content alignment'),
          value: validateAlignment(alignContent),
          onChange: onChangeAlignContent
        })), /*#__PURE__*/React.createElement(OriginalBlockEdit, this.props));
      }
    };
  }

  /**
   * A higher order component adding alignText editing functionality.
   *
   * @date	08/07/2020
   * @since	ACF 5.9.0
   *
   * @param	component OriginalBlockEdit The original BlockEdit component.
   * @param	object blockType The block type settings.
   * @return	component
   */
  function withAlignTextComponent(OriginalBlockEdit, blockType) {
    const validateAlignment = validateHorizontalAlignment;

    // Ensure correct block attribute data is sent in intial preview AJAX request.
    blockType.alignText = validateAlignment(blockType.alignText);

    // Return wrapped component.
    return class WrappedBlockEdit extends Component {
      render() {
        const {
          attributes,
          setAttributes
        } = this.props;
        const {
          alignText
        } = attributes;
        function onChangeAlignText(alignText) {
          setAttributes({
            alignText: validateAlignment(alignText)
          });
        }
        return /*#__PURE__*/React.createElement(Fragment, null, /*#__PURE__*/React.createElement(BlockControls, {
          group: "block"
        }, /*#__PURE__*/React.createElement(AlignmentToolbar, {
          value: validateAlignment(alignText),
          onChange: onChangeAlignText
        })), /*#__PURE__*/React.createElement(OriginalBlockEdit, this.props));
      }
    };
  }

  /**
   * A higher order component adding full height support.
   *
   * @date	19/07/2021
   * @since	ACF 5.10.0
   *
   * @param	component OriginalBlockEdit The original BlockEdit component.
   * @param	object blockType The block type settings.
   * @return	component
   */
  function withFullHeightComponent(OriginalBlockEdit, blockType) {
    if (!BlockFullHeightAlignmentControl) return OriginalBlockEdit;

    // Return wrapped component.
    return class WrappedBlockEdit extends Component {
      render() {
        const {
          attributes,
          setAttributes
        } = this.props;
        const {
          fullHeight
        } = attributes;
        function onToggleFullHeight(fullHeight) {
          setAttributes({
            fullHeight
          });
        }
        return /*#__PURE__*/React.createElement(Fragment, null, /*#__PURE__*/React.createElement(BlockControls, {
          group: "block"
        }, /*#__PURE__*/React.createElement(BlockFullHeightAlignmentControl, {
          isActive: fullHeight,
          onToggle: onToggleFullHeight
        })), /*#__PURE__*/React.createElement(OriginalBlockEdit, this.props));
      }
    };
  }

  /**
   * Appends a backwards compatibility attribute for conversion.
   *
   * @since	ACF 6.0
   *
   * @param	object attributes The block type attributes.
   * @return	object
   */
  function addBackCompatAttribute(attributes, new_attribute, type) {
    attributes[new_attribute] = {
      type: type
    };
    return attributes;
  }

  /**
   * Create a block hash from attributes
   *
   * @since ACF 6.0
   *
   * @param object attributes The block type attributes.
   * @param object context The current block context object.
   * @return string
   */
  function createBlockAttributesHash(attributes, context) {
    attributes['_acf_context'] = sortObjectByKey(context);
    return md5(JSON.stringify(sortObjectByKey(attributes)));
  }

  /**
   * Key sort an object
   *
   * @since ACF 6.3.1
   *
   * @param object toSort The object to be sorted
   * @return object
   */
  function sortObjectByKey(toSort) {
    return Object.keys(toSort).sort().reduce((acc, currValue) => {
      acc[currValue] = toSort[currValue];
      return acc;
    }, {});
  }
})(jQuery);

/***/ }),

/***/ "./assets/src/js/pro/_acf-jsx-names.js":
/*!*********************************************!*\
  !*** ./assets/src/js/pro/_acf-jsx-names.js ***!
  \*********************************************/
/***/ (() => {

(function ($, undefined) {
  acf.jsxNameReplacements = {
    'accent-height': 'accentHeight',
    accentheight: 'accentHeight',
    'accept-charset': 'acceptCharset',
    acceptcharset: 'acceptCharset',
    accesskey: 'accessKey',
    'alignment-baseline': 'alignmentBaseline',
    alignmentbaseline: 'alignmentBaseline',
    allowedblocks: 'allowedBlocks',
    allowfullscreen: 'allowFullScreen',
    allowreorder: 'allowReorder',
    'arabic-form': 'arabicForm',
    arabicform: 'arabicForm',
    attributename: 'attributeName',
    attributetype: 'attributeType',
    autocapitalize: 'autoCapitalize',
    autocomplete: 'autoComplete',
    autocorrect: 'autoCorrect',
    autofocus: 'autoFocus',
    autoplay: 'autoPlay',
    autoreverse: 'autoReverse',
    autosave: 'autoSave',
    basefrequency: 'baseFrequency',
    'baseline-shift': 'baselineShift',
    baselineshift: 'baselineShift',
    baseprofile: 'baseProfile',
    calcmode: 'calcMode',
    'cap-height': 'capHeight',
    capheight: 'capHeight',
    cellpadding: 'cellPadding',
    cellspacing: 'cellSpacing',
    charset: 'charSet',
    class: 'className',
    classid: 'classID',
    classname: 'className',
    'clip-path': 'clipPath',
    'clip-rule': 'clipRule',
    clippath: 'clipPath',
    clippathunits: 'clipPathUnits',
    cliprule: 'clipRule',
    'color-interpolation': 'colorInterpolation',
    'color-interpolation-filters': 'colorInterpolationFilters',
    'color-profile': 'colorProfile',
    'color-rendering': 'colorRendering',
    colorinterpolation: 'colorInterpolation',
    colorinterpolationfilters: 'colorInterpolationFilters',
    colorprofile: 'colorProfile',
    colorrendering: 'colorRendering',
    colspan: 'colSpan',
    contenteditable: 'contentEditable',
    contentscripttype: 'contentScriptType',
    contentstyletype: 'contentStyleType',
    contextmenu: 'contextMenu',
    controlslist: 'controlsList',
    crossorigin: 'crossOrigin',
    dangerouslysetinnerhtml: 'dangerouslySetInnerHTML',
    datetime: 'dateTime',
    defaultchecked: 'defaultChecked',
    defaultvalue: 'defaultValue',
    diffuseconstant: 'diffuseConstant',
    disablepictureinpicture: 'disablePictureInPicture',
    disableremoteplayback: 'disableRemotePlayback',
    'dominant-baseline': 'dominantBaseline',
    dominantbaseline: 'dominantBaseline',
    edgemode: 'edgeMode',
    'enable-background': 'enableBackground',
    enablebackground: 'enableBackground',
    enctype: 'encType',
    enterkeyhint: 'enterKeyHint',
    externalresourcesrequired: 'externalResourcesRequired',
    'fill-opacity': 'fillOpacity',
    'fill-rule': 'fillRule',
    fillopacity: 'fillOpacity',
    fillrule: 'fillRule',
    filterres: 'filterRes',
    filterunits: 'filterUnits',
    'flood-color': 'floodColor',
    'flood-opacity': 'floodOpacity',
    floodcolor: 'floodColor',
    floodopacity: 'floodOpacity',
    'font-family': 'fontFamily',
    'font-size': 'fontSize',
    'font-size-adjust': 'fontSizeAdjust',
    'font-stretch': 'fontStretch',
    'font-style': 'fontStyle',
    'font-variant': 'fontVariant',
    'font-weight': 'fontWeight',
    fontfamily: 'fontFamily',
    fontsize: 'fontSize',
    fontsizeadjust: 'fontSizeAdjust',
    fontstretch: 'fontStretch',
    fontstyle: 'fontStyle',
    fontvariant: 'fontVariant',
    fontweight: 'fontWeight',
    for: 'htmlFor',
    foreignobject: 'foreignObject',
    formaction: 'formAction',
    formenctype: 'formEncType',
    formmethod: 'formMethod',
    formnovalidate: 'formNoValidate',
    formtarget: 'formTarget',
    frameborder: 'frameBorder',
    'glyph-name': 'glyphName',
    'glyph-orientation-horizontal': 'glyphOrientationHorizontal',
    'glyph-orientation-vertical': 'glyphOrientationVertical',
    glyphname: 'glyphName',
    glyphorientationhorizontal: 'glyphOrientationHorizontal',
    glyphorientationvertical: 'glyphOrientationVertical',
    glyphref: 'glyphRef',
    gradienttransform: 'gradientTransform',
    gradientunits: 'gradientUnits',
    'horiz-adv-x': 'horizAdvX',
    'horiz-origin-x': 'horizOriginX',
    horizadvx: 'horizAdvX',
    horizoriginx: 'horizOriginX',
    hreflang: 'hrefLang',
    htmlfor: 'htmlFor',
    'http-equiv': 'httpEquiv',
    httpequiv: 'httpEquiv',
    'image-rendering': 'imageRendering',
    imagerendering: 'imageRendering',
    innerhtml: 'innerHTML',
    inputmode: 'inputMode',
    itemid: 'itemID',
    itemprop: 'itemProp',
    itemref: 'itemRef',
    itemscope: 'itemScope',
    itemtype: 'itemType',
    kernelmatrix: 'kernelMatrix',
    kernelunitlength: 'kernelUnitLength',
    keyparams: 'keyParams',
    keypoints: 'keyPoints',
    keysplines: 'keySplines',
    keytimes: 'keyTimes',
    keytype: 'keyType',
    lengthadjust: 'lengthAdjust',
    'letter-spacing': 'letterSpacing',
    letterspacing: 'letterSpacing',
    'lighting-color': 'lightingColor',
    lightingcolor: 'lightingColor',
    limitingconeangle: 'limitingConeAngle',
    marginheight: 'marginHeight',
    marginwidth: 'marginWidth',
    'marker-end': 'markerEnd',
    'marker-mid': 'markerMid',
    'marker-start': 'markerStart',
    markerend: 'markerEnd',
    markerheight: 'markerHeight',
    markermid: 'markerMid',
    markerstart: 'markerStart',
    markerunits: 'markerUnits',
    markerwidth: 'markerWidth',
    maskcontentunits: 'maskContentUnits',
    maskunits: 'maskUnits',
    maxlength: 'maxLength',
    mediagroup: 'mediaGroup',
    minlength: 'minLength',
    nomodule: 'noModule',
    novalidate: 'noValidate',
    numoctaves: 'numOctaves',
    'overline-position': 'overlinePosition',
    'overline-thickness': 'overlineThickness',
    overlineposition: 'overlinePosition',
    overlinethickness: 'overlineThickness',
    'paint-order': 'paintOrder',
    paintorder: 'paintOrder',
    'panose-1': 'panose1',
    pathlength: 'pathLength',
    patterncontentunits: 'patternContentUnits',
    patterntransform: 'patternTransform',
    patternunits: 'patternUnits',
    playsinline: 'playsInline',
    'pointer-events': 'pointerEvents',
    pointerevents: 'pointerEvents',
    pointsatx: 'pointsAtX',
    pointsaty: 'pointsAtY',
    pointsatz: 'pointsAtZ',
    preservealpha: 'preserveAlpha',
    preserveaspectratio: 'preserveAspectRatio',
    primitiveunits: 'primitiveUnits',
    radiogroup: 'radioGroup',
    readonly: 'readOnly',
    referrerpolicy: 'referrerPolicy',
    refx: 'refX',
    refy: 'refY',
    'rendering-intent': 'renderingIntent',
    renderingintent: 'renderingIntent',
    repeatcount: 'repeatCount',
    repeatdur: 'repeatDur',
    requiredextensions: 'requiredExtensions',
    requiredfeatures: 'requiredFeatures',
    rowspan: 'rowSpan',
    'shape-rendering': 'shapeRendering',
    shaperendering: 'shapeRendering',
    specularconstant: 'specularConstant',
    specularexponent: 'specularExponent',
    spellcheck: 'spellCheck',
    spreadmethod: 'spreadMethod',
    srcdoc: 'srcDoc',
    srclang: 'srcLang',
    srcset: 'srcSet',
    startoffset: 'startOffset',
    stddeviation: 'stdDeviation',
    stitchtiles: 'stitchTiles',
    'stop-color': 'stopColor',
    'stop-opacity': 'stopOpacity',
    stopcolor: 'stopColor',
    stopopacity: 'stopOpacity',
    'strikethrough-position': 'strikethroughPosition',
    'strikethrough-thickness': 'strikethroughThickness',
    strikethroughposition: 'strikethroughPosition',
    strikethroughthickness: 'strikethroughThickness',
    'stroke-dasharray': 'strokeDasharray',
    'stroke-dashoffset': 'strokeDashoffset',
    'stroke-linecap': 'strokeLinecap',
    'stroke-linejoin': 'strokeLinejoin',
    'stroke-miterlimit': 'strokeMiterlimit',
    'stroke-opacity': 'strokeOpacity',
    'stroke-width': 'strokeWidth',
    strokedasharray: 'strokeDasharray',
    strokedashoffset: 'strokeDashoffset',
    strokelinecap: 'strokeLinecap',
    strokelinejoin: 'strokeLinejoin',
    strokemiterlimit: 'strokeMiterlimit',
    strokeopacity: 'strokeOpacity',
    strokewidth: 'strokeWidth',
    suppresscontenteditablewarning: 'suppressContentEditableWarning',
    suppresshydrationwarning: 'suppressHydrationWarning',
    surfacescale: 'surfaceScale',
    systemlanguage: 'systemLanguage',
    tabindex: 'tabIndex',
    tablevalues: 'tableValues',
    targetx: 'targetX',
    targety: 'targetY',
    templatelock: 'templateLock',
    'text-anchor': 'textAnchor',
    'text-decoration': 'textDecoration',
    'text-rendering': 'textRendering',
    textanchor: 'textAnchor',
    textdecoration: 'textDecoration',
    textlength: 'textLength',
    textrendering: 'textRendering',
    'underline-position': 'underlinePosition',
    'underline-thickness': 'underlineThickness',
    underlineposition: 'underlinePosition',
    underlinethickness: 'underlineThickness',
    'unicode-bidi': 'unicodeBidi',
    'unicode-range': 'unicodeRange',
    unicodebidi: 'unicodeBidi',
    unicoderange: 'unicodeRange',
    'units-per-em': 'unitsPerEm',
    unitsperem: 'unitsPerEm',
    usemap: 'useMap',
    'v-alphabetic': 'vAlphabetic',
    'v-hanging': 'vHanging',
    'v-ideographic': 'vIdeographic',
    'v-mathematical': 'vMathematical',
    valphabetic: 'vAlphabetic',
    'vector-effect': 'vectorEffect',
    vectoreffect: 'vectorEffect',
    'vert-adv-y': 'vertAdvY',
    'vert-origin-x': 'vertOriginX',
    'vert-origin-y': 'vertOriginY',
    vertadvy: 'vertAdvY',
    vertoriginx: 'vertOriginX',
    vertoriginy: 'vertOriginY',
    vhanging: 'vHanging',
    videographic: 'vIdeographic',
    viewbox: 'viewBox',
    viewtarget: 'viewTarget',
    vmathematical: 'vMathematical',
    'word-spacing': 'wordSpacing',
    wordspacing: 'wordSpacing',
    'writing-mode': 'writingMode',
    writingmode: 'writingMode',
    'x-height': 'xHeight',
    xchannelselector: 'xChannelSelector',
    xheight: 'xHeight',
    'xlink:actuate': 'xlinkActuate',
    'xlink:arcrole': 'xlinkArcrole',
    'xlink:href': 'xlinkHref',
    'xlink:role': 'xlinkRole',
    'xlink:show': 'xlinkShow',
    'xlink:title': 'xlinkTitle',
    'xlink:type': 'xlinkType',
    xlinkactuate: 'xlinkActuate',
    xlinkarcrole: 'xlinkArcrole',
    xlinkhref: 'xlinkHref',
    xlinkrole: 'xlinkRole',
    xlinkshow: 'xlinkShow',
    xlinktitle: 'xlinkTitle',
    xlinktype: 'xlinkType',
    'xml:base': 'xmlBase',
    'xml:lang': 'xmlLang',
    'xml:space': 'xmlSpace',
    xmlbase: 'xmlBase',
    xmllang: 'xmlLang',
    'xmlns:xlink': 'xmlnsXlink',
    xmlnsxlink: 'xmlnsXlink',
    xmlspace: 'xmlSpace',
    ychannelselector: 'yChannelSelector',
    zoomandpan: 'zoomAndPan'
  };
})(jQuery);

/***/ }),

/***/ "./assets/src/js/pro/blocks-v3/components/block-edit.js":
/*!**************************************************************!*\
  !*** ./assets/src/js/pro/blocks-v3/components/block-edit.js ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BlockEdit: () => (/* binding */ BlockEdit)
/* harmony export */ });
/* harmony import */ var md5__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! md5 */ "./node_modules/md5/md5.js");
/* harmony import */ var md5__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(md5__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/block-editor */ "@wordpress/block-editor");
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _block_placeholder__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./block-placeholder */ "./assets/src/js/pro/blocks-v3/components/block-placeholder.js");
/* harmony import */ var _block_form__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./block-form */ "./assets/src/js/pro/blocks-v3/components/block-form.js");
/* harmony import */ var _block_preview__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./block-preview */ "./assets/src/js/pro/blocks-v3/components/block-preview.js");
/* harmony import */ var _error_boundary__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./error-boundary */ "./assets/src/js/pro/blocks-v3/components/error-boundary.js");
/* harmony import */ var _block_toolbar_fields__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./block-toolbar-fields */ "./assets/src/js/pro/blocks-v3/components/block-toolbar-fields.js");
/* harmony import */ var _inline_editing_toolbar__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./inline-editing-toolbar */ "./assets/src/js/pro/blocks-v3/components/inline-editing-toolbar.js");
/* harmony import */ var _popover_wrapper__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./popover-wrapper */ "./assets/src/js/pro/blocks-v3/components/popover-wrapper.js");
/* harmony import */ var _utils_post_locking__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../utils/post-locking */ "./assets/src/js/pro/blocks-v3/utils/post-locking.js");
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * BlockEdit Component
 * Main component for editing ACF blocks in the Gutenberg editor
 * Handles form fetching, validation, preview rendering, and user interactions
 */













/**
 * InspectorBlockFormContainer
 * Small helper component that manages the inspector panel container ref
 * Sets the current form container when the inspector panel is available
 *
 * @param {Object} props
 * @param {React.RefObject} props.inspectorBlockFormRef - Ref to inspector container
 * @param {Function} props.setCurrentBlockFormContainer - Setter for current container
 */
const InspectorBlockFormContainer = ({
  inspectorBlockFormRef,
  setCurrentBlockFormContainer
}) => {
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    setCurrentBlockFormContainer(inspectorBlockFormRef.current);
  }, []);
  return /*#__PURE__*/React.createElement("div", {
    ref: inspectorBlockFormRef
  });
};
const isBlockEditorInspectorSidebarOpen = () => {
  const interfaceStore = wp.data.select('core/interface');
  return typeof interfaceStore?.getActiveComplementaryArea === 'function' && interfaceStore.getActiveComplementaryArea('core') === 'edit-post/block';
};
const useBlockEditorInspectorSidebarOpen = () => {
  const [isOpen, setIsOpen] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(() => isBlockEditorInspectorSidebarOpen());
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    if (typeof wp.data.subscribe !== 'function') {
      return;
    }
    const unsubscribe = wp.data.subscribe(() => {
      setIsOpen(isBlockEditorInspectorSidebarOpen());
    });
    return () => {
      unsubscribe();
    };
  }, []);
  return isOpen;
};

/**
 * Main BlockEdit component wrapper
 * Manages block data fetching and initial setup
 *
 * @param {Object} props - Component props
 * @param {Object} props.attributes - Block attributes
 * @param {Function} props.setAttributes - Function to update block attributes
 * @param {Object} props.context - Block context
 * @param {boolean} props.isSelected - Whether block is currently selected
 * @param {jQuery} props.$ - jQuery instance
 * @param {Object} props.blockType - ACF block type configuration
 * @returns {JSX.Element} - Rendered block editor
 */
const BlockEdit = props => {
  const {
    attributes,
    setAttributes,
    context,
    isSelected,
    $,
    blockType
  } = props;
  const shouldValidate = blockType.validate;
  const {
    clientId
  } = (0,_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__.useBlockEditContext)();
  const preloadedData = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useMemo)(() => {
    return checkPreloadedData(generateAttributesHash(attributes, context), clientId, isSelected);
  }, []);
  const [validationErrors, setValidationErrors] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(() => {
    return preloadedData?.validation?.errors ?? null;
  });
  const [showValidationErrors, setShowValidationErrors] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const [theSerializedAcfData, setTheSerializedAcfData] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const [blockFormHtml, setBlockFormHtml] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(() => preloadedData?.form ?? '');
  const [blockPreviewHtml, setBlockPreviewHtml] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(() => {
    if (preloadedData?.html) {
      return acf.applyFilters('blocks/preview/render', preloadedData.html, true);
    }
    return 'acf-block-preview-loading';
  });
  const [userHasInteractedWithForm, setUserHasInteractedWithForm] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  const [hasFetchedOnce, setHasFetchedOnce] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  const [ajaxRequest, setAjaxRequest] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)();
  const [isFetchingBlock, setIsFetchingBlock] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(false);

  // New state for inline editing features
  const [blockToolbarFields, setBlockToolbarFields] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)([]);
  const [blockFieldInfo, setBlockFieldInfo] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(() => preloadedData?.fields ?? null);
  const [gutenbergIframeOrDocument, setGutenbergIframeOrDocument] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(() => {
    const iframe = document.querySelector('[name="editor-canvas"]');
    return iframe ? iframe.contentDocument || iframe.contentWindow.document : document;
  });
  const [currentInlineEditingElement, setCurrentInlineEditingElement] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const [currentInlineEditingElementUid, setCurrentInlineEditingElementUid] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const [currentContentEditableElement, setCurrentContentEditableElement] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const [inlineEditingToolbarHasFocus, setInlineEditingToolbarHasFocus] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  const [contentEditableChangeInProgress, setContentEditableChangeInProgress] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  const [acfDynamicStylesElement, setAcfDynamicStylesElement] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const [freezeInlineToolbarDuringReRender, setFreezeInlineToolbarDuringReRender] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)('');
  const blockEditorInspectorSidebarOpen = useBlockEditorInspectorSidebarOpen();
  const acfFormRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useRef)(null);
  const previewRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useRef)(null);
  const debounceRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useRef)(null);

  // Initialize acf.blockEdit namespace for jsx-parser to use
  if (!acf.blockEdit) {
    acf.blockEdit = {};
  }
  acf.blockEdit.setCurrentInlineEditingElementUid = setCurrentInlineEditingElementUid;
  acf.blockEdit.setCurrentInlineEditingElement = setCurrentInlineEditingElement;
  acf.blockEdit.setCurrentContentEditableElement = setCurrentContentEditableElement;
  acf.blockEdit.getBlockFieldInfo = () => blockFieldInfo;
  const attributesWithoutError = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useMemo)(() => {
    const {
      hasAcfError,
      ...rest
    } = attributes;
    return rest;
  }, [attributes]);

  /**
   * Fetches block data from server (form HTML, preview HTML, validation)
   *
   * @param {Object} params - Fetch parameters
   * @param {Object} params.theAttributes - Block attributes to fetch for
   * @param {string} params.theClientId - Block client ID
   * @param {Object} params.theContext - Block context
   * @param {boolean} params.isSelected - Whether block is selected
   */
  function fetchBlockData({
    theAttributes,
    theClientId,
    theContext,
    isSelected
  }) {
    if (!theAttributes) return;

    // NEW: Abort any pending request
    if (ajaxRequest) {
      ajaxRequest.abort();
    }

    // Generate hash of attributes for preload cache lookup
    const attributesHash = generateAttributesHash(theAttributes, context);

    // Check for preloaded block data
    const preloadedData = checkPreloadedData(attributesHash, theClientId, isSelected);
    if (preloadedData) {
      handlePreloadedData(preloadedData);
      (0,_utils_post_locking__WEBPACK_IMPORTED_MODULE_11__.unlockPostSavingByName)('acf-fetching-block');
      setIsFetchingBlock(false);
      return;
    }

    // Prepare query options
    const queryOptions = {
      preview: true,
      form: true,
      validate: true
    };
    if (!blockFormHtml) {
      queryOptions.validate = false;
    }
    if (!shouldValidate) {
      queryOptions.validate = false;
    }
    const blockData = {
      ...theAttributes
    };
    (0,_utils_post_locking__WEBPACK_IMPORTED_MODULE_11__.lockPostSavingByName)('acf-fetching-block');
    setIsFetchingBlock(true);

    // Fetch block data via AJAX
    const request = $.ajax({
      url: acf.get('ajaxurl'),
      dataType: 'json',
      type: 'post',
      cache: false,
      data: acf.prepareForAjax({
        action: 'acf/ajax/fetch-block',
        block: JSON.stringify(blockData),
        clientId: theClientId,
        context: JSON.stringify(theContext),
        query: queryOptions
      })
    }).done(response => {
      (0,_utils_post_locking__WEBPACK_IMPORTED_MODULE_11__.unlockPostSavingByName)('acf-fetching-block');
      setIsFetchingBlock(false);
      setBlockFormHtml(response.data.form);

      // Handle new field metadata for inline editing
      if (response.data.fields) {
        setBlockFieldInfo(response.data.fields);
      }

      // Handle block toolbar fields configuration
      if (response.data.blockToolbarFields) {
        setBlockToolbarFields(response.data.blockToolbarFields);
      }
      if (response.data.preview) {
        setBlockPreviewHtml(acf.applyFilters('blocks/preview/render', response.data.preview, false));
      } else {
        setBlockPreviewHtml(acf.applyFilters('blocks/preview/render', 'acf-block-preview-no-html', false));
      }
      if (response.data?.validation && !response.data.validation.valid && response.data.validation.errors) {
        setValidationErrors(response.data.validation.errors);
      } else {
        setValidationErrors(null);
      }
      setHasFetchedOnce(true);
    }).fail(function () {
      setHasFetchedOnce(true);
      (0,_utils_post_locking__WEBPACK_IMPORTED_MODULE_11__.unlockPostSavingByName)('acf-fetching-block');
      setIsFetchingBlock(false);
    });
    setAjaxRequest(request);
  }

  /**
   * Generates a hash of block attributes for caching
   *
   * @param {Object} attrs - Block attributes
   * @param {Object} ctx - Block context
   * @returns {string} - MD5 hash of serialized attributes
   */
  function generateAttributesHash(attrs, ctx) {
    delete attrs.hasAcfError;
    attrs._acf_context = (0,_utils_post_locking__WEBPACK_IMPORTED_MODULE_11__.sortObjectKeys)(ctx);
    return md5__WEBPACK_IMPORTED_MODULE_0___default()(JSON.stringify((0,_utils_post_locking__WEBPACK_IMPORTED_MODULE_11__.sortObjectKeys)(attrs)));
  }

  /**
   * Checks if block data was preloaded and returns it
   *
   * @param {string} hash - Attributes hash
   * @param {string} clientId - Block client ID
   * @param {boolean} selected - Whether block is selected
   * @returns {Object|boolean} - Preloaded data or false
   */
  function checkPreloadedData(hash, clientId, selected) {
    if (selected) return false;
    acf.debug('Preload check', hash, clientId);

    // Don't preload blocks inside Query Loop blocks
    if (isInQueryLoop(clientId)) {
      return false;
    }
    const data = getPreloadedBlockData(hash, clientId, acf.get('preloadedBlocks'));
    if (!data) {
      acf.debug('Preload failed: not preloaded.');
      return false;
    }
    acf.debug('Preload successful', data);
    return data;
  }

  /**
   * Returns a copy of a preloaded block entry with the placeholder hash
   * replaced by the actual client ID.
   *
   * Works on a deep clone so the shared preloaded entry is never mutated —
   * duplicating a block with identical attributes reuses the same hash, and
   * an in-place replacement would corrupt the entry for the duplicate.
   *
   * @param {string} hash            - Attributes hash
   * @param {string} blockClientId   - Block client ID
   * @param {Object} preloadedBlocks - The preloaded blocks store
   * @return {Object|boolean} - Preloaded data or false
   */
  function getPreloadedBlockData(hash, blockClientId, preloadedBlocks) {
    if (!preloadedBlocks || !preloadedBlocks[hash]) {
      return false;
    }
    const data = JSON.parse(JSON.stringify(preloadedBlocks[hash]));

    // Replace placeholder client ID with actual client ID
    data.html = data.html.replaceAll(hash, blockClientId);
    data.form = data.form.replaceAll(hash, blockClientId);
    if (data?.validation?.errors) {
      data.validation.errors = data.validation.errors.map(error => {
        error.input = error.input.replaceAll(hash, blockClientId);
        return error;
      });
    }
    return data;
  }

  /**
   * Checks if block is inside a Query Loop block
   *
   * @param {string} clientId - Block client ID
   * @returns {boolean} - True if inside Query Loop
   */
  function isInQueryLoop(clientId) {
    const parentIds = wp.data.select('core/block-editor').getBlockParents(clientId);
    return wp.data.select('core/block-editor').getBlocksByClientId(parentIds).filter(block => block.name === 'core/query').length > 0;
  }

  /**
   * Handles preloaded block data
   *
   * @param {Object} data - Preloaded data
   */
  function handlePreloadedData(data) {
    if (data.form) {
      setBlockFormHtml(data.form);
    }
    if (data.html) {
      setBlockPreviewHtml(acf.applyFilters('blocks/preview/render', data.html, true));
    } else {
      setBlockPreviewHtml(acf.applyFilters('blocks/preview/render', 'acf-block-preview-no-html', true));
    }

    // Handle block toolbar fields from preloaded data
    if (data?.blockToolbarFields) {
      setBlockToolbarFields(data.blockToolbarFields);
    }

    // Handle field info from preloaded data
    if (data?.fields) {
      setBlockFieldInfo(data.fields);
    }
    if (data?.validation && !data.validation.valid && data.validation.errors) {
      setValidationErrors(data.validation.errors);
    } else {
      setValidationErrors(null);
    }
  }

  // Initial fetch on mount and when selection changes
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    function trackUserInteraction() {
      setUserHasInteractedWithForm(true);
      window.removeEventListener('click', trackUserInteraction);
      window.removeEventListener('keydown', trackUserInteraction);
    }
    window.addEventListener('click', trackUserInteraction);
    window.addEventListener('keydown', trackUserInteraction);
    return () => {
      window.removeEventListener('click', trackUserInteraction);
      window.removeEventListener('keydown', trackUserInteraction);
    };
  }, []);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    if (isSelected) {
      return;
    }
    setCurrentInlineEditingElementUid(null);
    setCurrentInlineEditingElement(null);
    setCurrentContentEditableElement(null);
  }, [isSelected]);

  // Update hasAcfError attribute based on validation errors
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    setAttributes(validationErrors ? {
      hasAcfError: true
    } : {
      hasAcfError: false
    });
  }, [validationErrors, setAttributes]);

  // Listen for validation error events from other blocks
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    const handleErrorEvent = event => {
      // Only handle if this event is for this specific block
      if (clientId === event.detail.acfBlocksWithValidationErrors) {
        (0,_utils_post_locking__WEBPACK_IMPORTED_MODULE_11__.lockPostSaving)(clientId);
        setShowValidationErrors(true);
        setCurrentInlineEditingElementUid(null);
      }
    };
    document.addEventListener('acf/block/has-error', handleErrorEvent);
    return () => {
      document.removeEventListener('acf/block/has-error', handleErrorEvent);
    };
  }, []);

  // Cleanup: unlock post saving on unmount
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => () => {
    (0,_utils_post_locking__WEBPACK_IMPORTED_MODULE_11__.unlockPostSaving)(props.clientId);
  }, []);

  // Handle form data changes with debouncing
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    clearTimeout(debounceRef.current);
    (0,_utils_post_locking__WEBPACK_IMPORTED_MODULE_11__.lockPostSavingByName)('acf-fetching-block');
    setIsFetchingBlock(true);
    debounceRef.current = setTimeout(() => {
      const parsedData = JSON.parse(theSerializedAcfData);
      if (!parsedData) {
        return void fetchBlockData({
          theAttributes: attributesWithoutError,
          theClientId: clientId,
          theContext: context,
          isSelected: isSelected
        });
      }
      if (theSerializedAcfData === JSON.stringify(attributesWithoutError.data)) {
        return void fetchBlockData({
          theAttributes: attributesWithoutError,
          theClientId: clientId,
          theContext: context,
          isSelected: isSelected
        });
      }

      // Use original attributes (with hasAcfError) when updating
      const updatedAttributes = {
        ...attributes,
        data: {
          ...parsedData
        }
      };
      setAttributes(updatedAttributes);
    }, 200);

    // Cleanup function to unlock post saving
    return () => {
      clearTimeout(debounceRef.current);
      (0,_utils_post_locking__WEBPACK_IMPORTED_MODULE_11__.unlockPostSavingByName)('acf-fetching-block');
      setIsFetchingBlock(false);
    };
  }, [theSerializedAcfData, attributesWithoutError]);

  // Trigger ACF actions when preview is rendered
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    if (previewRef.current && blockPreviewHtml) {
      const blockName = attributes.name.replace('acf/', '');
      const $preview = $(previewRef.current);
      acf.doAction('render_block_preview', $preview, attributes);
      acf.doAction(`render_block_preview/type=${blockName}`, $preview, attributes);

      // If there's an active inline editing element, re-initialize it after preview renders
      if (currentInlineEditingElementUid) {
        const inlineElement = previewRef?.current.querySelector(`[data-acf-inline-fields-uid="${currentInlineEditingElementUid}"]`);
        setCurrentInlineEditingElement(inlineElement);
      }
    }
  }, [blockPreviewHtml]);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    if (currentContentEditableElement && !inlineEditingToolbarHasFocus || !currentInlineEditingElement) {
      return;
    }
    const toolbar = document.querySelector('.acf-inline-editing-toolbar');
    if (toolbar?.style?.cssText) {
      setFreezeInlineToolbarDuringReRender(toolbar.style.cssText.replaceAll(';', '!important;'));
    }
    setTimeout(() => {
      setCurrentInlineEditingElement(currentInlineEditingElement);
      setTimeout(() => {
        setFreezeInlineToolbarDuringReRender(null);
      }, 0);
    }, 0);
  }, [currentInlineEditingElement]);
  return /*#__PURE__*/React.createElement(BlockEditInner, _extends({}, props, {
    validationErrors: validationErrors,
    showValidationErrors: showValidationErrors,
    theSerializedAcfData: theSerializedAcfData,
    setTheSerializedAcfData: setTheSerializedAcfData,
    acfFormRef: acfFormRef,
    blockFormHtml: blockFormHtml,
    blockPreviewHtml: blockPreviewHtml,
    blockFetcher: fetchBlockData,
    userHasInteractedWithForm: userHasInteractedWithForm,
    setUserHasInteractedWithForm: setUserHasInteractedWithForm,
    previewRef: previewRef,
    hasFetchedOnce: hasFetchedOnce,
    blockToolbarFields: blockToolbarFields,
    blockFieldInfo: blockFieldInfo,
    gutenbergIframeOrDocument: gutenbergIframeOrDocument,
    setGutenbergIframeOrDocument: setGutenbergIframeOrDocument,
    currentInlineEditingElement: currentInlineEditingElement,
    setCurrentInlineEditingElement: setCurrentInlineEditingElement,
    currentInlineEditingElementUid: currentInlineEditingElementUid,
    setCurrentInlineEditingElementUid: setCurrentInlineEditingElementUid,
    currentContentEditableElement: currentContentEditableElement,
    setCurrentContentEditableElement: setCurrentContentEditableElement,
    inlineEditingToolbarHasFocus: inlineEditingToolbarHasFocus,
    setInlineEditingToolbarHasFocus: setInlineEditingToolbarHasFocus,
    contentEditableChangeInProgress: contentEditableChangeInProgress,
    setContentEditableChangeInProgress: setContentEditableChangeInProgress,
    acfDynamicStylesElement: acfDynamicStylesElement,
    setAcfDynamicStylesElement: setAcfDynamicStylesElement,
    blockEditorInspectorSidebarOpen: blockEditorInspectorSidebarOpen,
    freezeInlineToolbarDuringReRender: freezeInlineToolbarDuringReRender,
    isFetchingBlock: isFetchingBlock
  }));
};

/**
 * Inner component that handles rendering and portals
 * Separated to manage refs and portal targets properly
 */
function BlockEditInner(props) {
  const {
    blockType,
    $,
    isSelected,
    attributes,
    context,
    validationErrors,
    showValidationErrors,
    theSerializedAcfData,
    setTheSerializedAcfData,
    acfFormRef,
    blockFormHtml,
    blockPreviewHtml,
    blockFetcher,
    userHasInteractedWithForm,
    setUserHasInteractedWithForm,
    previewRef,
    hasFetchedOnce,
    blockToolbarFields,
    blockFieldInfo,
    gutenbergIframeOrDocument,
    setGutenbergIframeOrDocument,
    currentInlineEditingElement,
    setCurrentInlineEditingElement,
    currentInlineEditingElementUid,
    setCurrentInlineEditingElementUid,
    currentContentEditableElement,
    setCurrentContentEditableElement,
    inlineEditingToolbarHasFocus,
    setInlineEditingToolbarHasFocus,
    contentEditableChangeInProgress,
    setContentEditableChangeInProgress,
    acfDynamicStylesElement,
    setAcfDynamicStylesElement,
    blockEditorInspectorSidebarOpen,
    freezeInlineToolbarDuringReRender,
    isFetchingBlock
  } = props;
  const {
    clientId
  } = (0,_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__.useBlockEditContext)();
  const inspectorControlsRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useRef)();
  const [blockFormModalOpen, setBlockFormModalOpen] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  const modalFormContainerRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useRef)();
  const [currentFormContainer, setCurrentFormContainer] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)();
  const [canRenderForm, setCanRenderForm] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  const [shouldShowModalDoneFallback, setShouldShowModalDoneFallback] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  const [invisibleBlockFormContainer, setInvisibleBlockFormContainer] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)();
  const closeBlockFormModal = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useCallback)(() => {
    setCurrentFormContainer(null);
    setBlockFormModalOpen(false);
  }, []);
  const setModalFormContainer = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useCallback)(container => {
    modalFormContainerRef.current = container;
    if (container && blockFormModalOpen) {
      setCurrentFormContainer(container);
    }
  }, [blockFormModalOpen]);

  // Render counter for debugging
  const renderCount = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useRef)(0);
  renderCount.current++;

  // Detect Gutenberg iframe or document
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    const gutenbergIframe = document.querySelector('iframe[name="editor-canvas"]');
    if (gutenbergIframe?.contentDocument) {
      setGutenbergIframeOrDocument(gutenbergIframe.contentDocument);
    } else {
      setGutenbergIframeOrDocument(document);
    }
  }, []);

  // Create/get dynamic styles element for inline field highlighting
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    if (!gutenbergIframeOrDocument) return;
    let styleElement = gutenbergIframeOrDocument.getElementById('acf-dynamic-styles');
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'acf-dynamic-styles';
      gutenbergIframeOrDocument.head.appendChild(styleElement);
    }
    setAcfDynamicStylesElement(styleElement);
  }, [gutenbergIframeOrDocument]);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    let invisibleContainer = document.getElementById('invisible-acf-form-element');
    if (!invisibleContainer) {
      invisibleContainer = document.createElement('div');
      invisibleContainer.id = 'invisible-acf-form-element';
      invisibleContainer.style.display = 'none';
      document.body.appendChild(invisibleContainer);
    }
    setInvisibleBlockFormContainer(invisibleContainer);
  }, [blockEditorInspectorSidebarOpen]);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    if (blockFormModalOpen) {
      return;
    }
    setCurrentFormContainer(blockEditorInspectorSidebarOpen ? inspectorControlsRef.current : invisibleBlockFormContainer);
  }, [blockEditorInspectorSidebarOpen, invisibleBlockFormContainer, blockFormModalOpen]);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    if (!blockFormModalOpen) {
      return;
    }
    const setModalContainer = () => {
      if (modalFormContainerRef?.current) {
        setCurrentFormContainer(modalFormContainerRef.current);
      }
    };
    setModalContainer();
    const timeout = setTimeout(setModalContainer, 0);
    return () => {
      clearTimeout(timeout);
    };
  }, [blockFormModalOpen]);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    if (!blockFormModalOpen) {
      setShouldShowModalDoneFallback(false);
      return;
    }
    const updateFallbackVisibility = () => {
      const modal = modalFormContainerRef?.current?.closest('.acf-block-form-modal');
      const hasHeaderActions = modal?.querySelector('.components-modal__header .components-button');
      setShouldShowModalDoneFallback(!hasHeaderActions);
    };
    updateFallbackVisibility();
    const timeout = setTimeout(updateFallbackVisibility, 0);
    return () => {
      clearTimeout(timeout);
    };
  }, [blockFormModalOpen]);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    if (blockFormModalOpen) {
      return;
    }
    if (blockEditorInspectorSidebarOpen) {
      setCurrentFormContainer(inspectorControlsRef.current);
      return;
    }
    setCurrentFormContainer(invisibleBlockFormContainer);
  }, [blockEditorInspectorSidebarOpen, invisibleBlockFormContainer, blockFormModalOpen]);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    if (isSelected && inspectorControlsRef?.current) {
      setCanRenderForm(true);
    } else if (isSelected && !inspectorControlsRef?.current) {
      setTimeout(() => {
        setCanRenderForm(true);
      }, 1);
    }
  }, [isSelected, inspectorControlsRef, inspectorControlsRef.current]);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    if (isSelected && validationErrors && showValidationErrors && blockType?.hide_fields_in_sidebar) {
      setBlockFormModalOpen(true);
    }
  }, [isSelected, showValidationErrors, validationErrors, blockType]);

  // Build block CSS classes
  let blockClasses = 'acf-block-component acf-block-body';
  blockClasses += ' acf-block-preview';
  if (validationErrors && showValidationErrors) {
    blockClasses += ' acf-block-has-validation-error';
  }
  const blockProps = {
    ...(0,_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__.useBlockProps)({
      className: blockClasses,
      ref: previewRef
    })
  };

  // Update field value from contentEditable changes (matches 6.7.0.2)
  const updateFieldValueFromContentEditable = (content, fieldSlug) => {
    if (!acfFormRef?.current || !fieldSlug) return;
    const fieldWrapper = acfFormRef.current.querySelector(`[data-name=${fieldSlug}]`);
    if (!fieldWrapper) return;
    const fieldKey = fieldWrapper.attributes.getNamedItem('data-key')?.value;
    if (!fieldKey) return;
    const fieldInput = acfFormRef.current.querySelector(`[name="acf-block_${clientId}[${fieldKey}]"`);
    if (!fieldInput) return;

    // Update field value and trigger serialization (debouncing happens in useEffect)
    if (content) {
      setUserHasInteractedWithForm(true);
    }
    setContentEditableChangeInProgress(false);
    fieldInput.value = content;
    const $form = $(acfFormRef?.current);
    const serializedData = acf.serialize($form, `acf-block_${clientId}`);
    if (serializedData) {
      setTheSerializedAcfData(JSON.stringify(serializedData));
    } else {
      setUserHasInteractedWithForm(false);
    }
  };

  // Watch for changes in contentEditable fields using MutationObserver
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    if (!gutenbergIframeOrDocument || !blockPreviewHtml) return;
    const observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        // Handle text content changes
        if (mutation.type === 'characterData') {
          let element = mutation.target.parentNode;
          const blockElement = element?.closest('[data-block]');
          const blockId = blockElement?.getAttribute('data-block');
          if (!element || !blockElement || blockId !== clientId) return;

          // Find the contentEditable element
          if (element && !element.hasAttribute('data-acf-inline-contenteditable')) {
            element = element.closest('[data-acf-inline-contenteditable]');
          }
          if (element && element.hasAttribute('data-acf-inline-contenteditable')) {
            const fieldSlug = element.attributes.getNamedItem('data-acf-inline-contenteditable-field-slug').value;
            let content = element.innerHTML.trim();
            if (!content) content = '';
            updateFieldValueFromContentEditable(content, fieldSlug);
          }
        }
        // Handle attribute or child list changes
        else {
          const element = mutation.target.closest('[data-acf-inline-contenteditable]');
          const blockElement = element?.closest('[data-block]');
          if (!element || !blockElement || blockElement.getAttribute('data-block') !== clientId) return;
          if (element) {
            const fieldSlug = element.attributes.getNamedItem('data-acf-inline-contenteditable-field-slug').value;
            let content = element.innerHTML.trim();

            // Handle empty content - remove empty BR tags
            if (!content || element.textContent.trim().length === 0 && element.children.length === 1 && element.firstElementChild && element.firstElementChild.nodeName === 'BR') {
              element.innerHTML = '';
              content = '';
            }
            updateFieldValueFromContentEditable(content, fieldSlug);
          }
        }
      }
    });

    // Observe the gutenberg iframe/document for changes
    observer.observe(gutenbergIframeOrDocument, {
      attributes: true,
      childList: true,
      subtree: true,
      characterData: true,
      attributeFilter: ['data-acf-inline-contenteditable']
    });

    // Cleanup
    return () => {
      observer.disconnect();
    };
  }, [blockPreviewHtml, gutenbergIframeOrDocument]);

  // Callback when a new inline editing element is selected
  const handleNewInlineEditingElementSelected = uid => {
    setTimeout(() => {
      setCurrentInlineEditingElementUid(uid);
      const element = previewRef?.current.querySelector(`[data-acf-inline-fields-uid="${uid}"]`);
      setCurrentInlineEditingElement(element);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }
    }, 1);
  };

  // Callback when a new contentEditable element is selected
  const handleNewContentEditableElementSelected = fieldSlug => {
    if (fieldSlug) {
      const element = previewRef?.current.querySelector(`[data-acf-inline-contenteditable-field-slug="${fieldSlug}"]`);
      setCurrentContentEditableElement(element);
    } else {
      setCurrentContentEditableElement(null);
    }
  };
  let portalTarget = blockEditorInspectorSidebarOpen && inspectorControlsRef?.current ? inspectorControlsRef.current : invisibleBlockFormContainer;
  if (currentFormContainer) {
    portalTarget = currentFormContainer;
  }

  // Determine inline editing toolbar anchor (matches 6.7.0.2 logic)
  let inlineEditingToolbarAnchor = null;
  if (currentInlineEditingElement && currentContentEditableElement) {
    inlineEditingToolbarAnchor = currentInlineEditingElement;
  } else if (currentInlineEditingElement && !currentContentEditableElement) {
    inlineEditingToolbarAnchor = currentInlineEditingElement;
  } else if (!currentInlineEditingElement && currentContentEditableElement) {
    inlineEditingToolbarAnchor = currentContentEditableElement;
  }
  // Ensure anchor is connected to DOM
  if (inlineEditingToolbarAnchor && !inlineEditingToolbarAnchor.isConnected) {
    inlineEditingToolbarAnchor = null;
  }
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(_block_toolbar_fields__WEBPACK_IMPORTED_MODULE_8__.BlockToolbarFields, {
    blockToolbarFields: blockToolbarFields,
    blockFieldInfo: blockFieldInfo,
    setCurrentBlockFormContainer: setCurrentFormContainer,
    gutenbergIframeOrDocument: gutenbergIframeOrDocument,
    setBlockFormModalOpen: setBlockFormModalOpen,
    blockFormModalOpen: blockFormModalOpen,
    invisibleBlockFormContainer: invisibleBlockFormContainer,
    currentInlineEditingElement: currentInlineEditingElement,
    setCurrentInlineEditingElement: setCurrentInlineEditingElement,
    currentInlineEditingElementUid: currentInlineEditingElementUid,
    hideExpandedEditorBtnInToolbar: blockType?.expanded_editor_buttons === false || Array.isArray(blockType?.expanded_editor_buttons) && !blockType?.expanded_editor_buttons.includes('toolbar') || !blockFieldInfo || blockFieldInfo?.length === 0,
    onNewInlineEditingElementSelected: handleNewInlineEditingElementSelected
  }), /*#__PURE__*/React.createElement(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__.InspectorControls, null, blockFieldInfo?.length > 0 && (blockType?.expanded_editor_buttons === true || Array.isArray(blockType?.expanded_editor_buttons) && blockType?.expanded_editor_buttons.includes('sidebar')) && /*#__PURE__*/React.createElement(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.PanelBody, null, /*#__PURE__*/React.createElement(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Button, {
    className: "acf-blocks-open-expanded-editor-btn",
    variant: "secondary",
    onClick: () => {
      setBlockFormModalOpen(true);
    },
    icon: "edit"
  }, blockType?.expanded_editor_button_text || acf.__('Open Expanded Editor'))), /*#__PURE__*/React.createElement(InspectorBlockFormContainer, {
    inspectorBlockFormRef: inspectorControlsRef,
    setCurrentBlockFormContainer: setCurrentFormContainer
  })), portalTarget && canRenderForm && (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createPortal)(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(_block_form__WEBPACK_IMPORTED_MODULE_5__.BlockForm, {
    $: $,
    clientId: clientId,
    blockFormHtml: blockFormHtml,
    onChange: function ($form) {
      const serializedData = acf.serialize($form, `acf-block_${clientId}`);
      if (serializedData) {
        setTheSerializedAcfData(JSON.stringify(serializedData));
      }
    },
    validationErrors: validationErrors,
    showValidationErrors: showValidationErrors,
    acfFormRef: acfFormRef,
    userHasInteractedWithForm: userHasInteractedWithForm,
    attributes: attributes,
    hideFieldsInSidebar: blockType?.auto_inline_editing && blockType?.hide_fields_in_sidebar === undefined && currentFormContainer === inspectorControlsRef.current || blockType?.hide_fields_in_sidebar && currentFormContainer === inspectorControlsRef.current
  }), freezeInlineToolbarDuringReRender && /*#__PURE__*/React.createElement("style", null, `.acf-inline-editing-toolbar{${freezeInlineToolbarDuringReRender}}`)), portalTarget), /*#__PURE__*/React.createElement(React.Fragment, null, blockFormModalOpen && /*#__PURE__*/React.createElement(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Modal, {
    className: "acf-block-form-modal",
    overlayClassName: acf.applyFilters('blocks/expanded_editor_overlay_class', 'acf-expanded-editor-panel-overlay'),
    isFullScreen: true,
    title: blockType.title,
    onRequestClose: () => {
      if (!isFetchingBlock || validationErrors) {
        setBlockFormModalOpen(false);
      }
    },
    shouldCloseOnEsc: !isFetchingBlock || validationErrors,
    isDismissible: false,
    headerActions: [/*#__PURE__*/React.createElement(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Button, {
      key: "done",
      variant: "primary",
      disabled: isFetchingBlock && !validationErrors,
      isBusy: isFetchingBlock,
      onClick: closeBlockFormModal
    }, acf.__('Done'))]
  }, shouldShowModalDoneFallback && /*#__PURE__*/React.createElement("div", {
    className: "acf-block-form-modal__actions"
  }, /*#__PURE__*/React.createElement(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Button, {
    className: "acf-block-form-modal__done-button",
    variant: "primary",
    disabled: isFetchingBlock && !validationErrors,
    isBusy: isFetchingBlock,
    onClick: closeBlockFormModal
  }, acf.__('Done'))), /*#__PURE__*/React.createElement("div", {
    className: "acf-modal-block-form-container",
    ref: setModalFormContainer
  }))), inlineEditingToolbarAnchor && /*#__PURE__*/React.createElement(_popover_wrapper__WEBPACK_IMPORTED_MODULE_10__.PopoverWrapper, {
    key: currentContentEditableElement,
    focusOnMount: (() => {
      const activeElement = document.activeElement;
      return activeElement && activeElement.isContentEditable, false;
    })(),
    variant: "unstyled",
    anchor: inlineEditingToolbarAnchor,
    className: "acf-inline-editing-toolbar block-editor-block-list__block-popover",
    placement: "top-start",
    onClose: event => {
      // Don't close if clicking toolbar button
      if (event.key !== 'Escape' && event.target.closest('.acf-toolbar-button')) {
        return false;
      }

      // Handle Escape key
      if (event.key === 'Escape') {
        return !document.querySelector('.acf-inline-fields-popover-inner') && !currentContentEditableElement && (currentInlineEditingElement && currentInlineEditingElement.focus(), setCurrentInlineEditingElementUid(null), setCurrentContentEditableElement(null), true);
      }

      // Don't close if clicking on contenteditable element
      if (event.target.getAttribute('data-acf-inline-contenteditable')) {
        return false;
      }

      // Don't close if clicking inside popover or modal
      const inlineFieldsPopover = event.target.closest('.acf-inline-fields-popover-inner');
      const modal = event.target.closest('.components-modal__content');
      return inlineFieldsPopover || modal || (setCurrentInlineEditingElementUid(null), setCurrentContentEditableElement(null)), true;
    },
    gutenbergIframeOrDocument: gutenbergIframeOrDocument,
    hidePrimaryBlockToolbar: true
  }, /*#__PURE__*/React.createElement(_inline_editing_toolbar__WEBPACK_IMPORTED_MODULE_9__.InlineEditingToolbar, {
    key: currentInlineEditingElementUid,
    blockIcon: blockType.icon,
    blockFieldInfo: blockFieldInfo,
    acfFormRef: acfFormRef,
    setInlineEditingToolbarHasFocus: setInlineEditingToolbarHasFocus,
    currentContentEditableElement: currentContentEditableElement,
    currentInlineEditingElement: currentInlineEditingElement,
    currentInlineEditingElementUid: currentInlineEditingElementUid,
    gutenbergIframeOrDocument: gutenbergIframeOrDocument,
    setCurrentBlockFormContainer: setCurrentFormContainer,
    contentEditableChangeInProgress: contentEditableChangeInProgress
  })), currentInlineEditingElementUid && acfDynamicStylesElement && (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createPortal)(/*#__PURE__*/React.createElement("style", null, `
				[data-acf-inline-fields-uid="${currentInlineEditingElementUid}"]{
					outline: 2px solid var( --wp-admin-theme-color );
					outline-offset: 2px;
				}
			`), acfDynamicStylesElement), /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(_block_preview__WEBPACK_IMPORTED_MODULE_6__.BlockPreview, {
    blockPreviewHtml: blockPreviewHtml,
    blockProps: blockProps
  }, /*#__PURE__*/React.createElement(_error_boundary__WEBPACK_IMPORTED_MODULE_7__.ErrorBoundary, {
    fallbackRender: ({
      error
    }) => /*#__PURE__*/React.createElement(_error_boundary__WEBPACK_IMPORTED_MODULE_7__.BlockPreviewErrorFallback, {
      blockLabel: blockType?.title || acf.__('ACF Block'),
      setBlockFormModalOpen: setBlockFormModalOpen,
      error: error
    })
  }, blockPreviewHtml === 'acf-block-preview-no-html' ? /*#__PURE__*/React.createElement(_block_placeholder__WEBPACK_IMPORTED_MODULE_4__.BlockPlaceholder, {
    setBlockFormModalOpen: setBlockFormModalOpen,
    blockLabel: blockType.title
  }) : null, blockPreviewHtml === 'acf-block-preview-loading' && /*#__PURE__*/React.createElement(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Placeholder, null, /*#__PURE__*/React.createElement(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Spinner, null)), blockPreviewHtml !== 'acf-block-preview-loading' && blockPreviewHtml !== 'acf-block-preview-no-html' && blockPreviewHtml && acf.parseJSX(blockPreviewHtml, handleNewInlineEditingElementSelected, updateFieldValueFromContentEditable, handleNewContentEditableElementSelected, blockFieldInfo, $)))));
}

/***/ }),

/***/ "./assets/src/js/pro/blocks-v3/components/block-form.js":
/*!**************************************************************!*\
  !*** ./assets/src/js/pro/blocks-v3/components/block-form.js ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BlockForm: () => (/* binding */ BlockForm)
/* harmony export */ });
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _utils_post_locking__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/post-locking */ "./assets/src/js/pro/blocks-v3/utils/post-locking.js");
/**
 * BlockForm Component
 * Renders the ACF fields form inside a block and handles form changes, validation, and remounting
 */




/**
 * BlockForm component
 * Manages ACF field forms within Gutenberg blocks, including validation and change detection
 *
 * @param {Object} props - Component props
 * @param {jQuery} props.$ - jQuery instance
 * @param {string} props.clientId - Block client ID
 * @param {string} props.blockFormHtml - HTML markup for the ACF form
 * @param {Function} props.onMount - Callback when the form mounts
 * @param {Function} props.onChange - Callback when form data changes
 * @param {Array} props.validationErrors - Array of validation error objects
 * @param {boolean} props.showValidationErrors - Whether to display validation errors
 * @param {React.RefObject} props.acfFormRef - Ref to the form container element
 * @param {boolean} props.userHasInteractedWithForm - Whether user has interacted with the form
 * @param {Object} props.attributes - Block attributes
 * @returns {JSX.Element} - Rendered form component
 */
const BlockForm = ({
  $,
  clientId,
  blockFormHtml,
  onMount,
  onChange,
  validationErrors,
  showValidationErrors,
  acfFormRef,
  userHasInteractedWithForm,
  attributes,
  hideFieldsInSidebar
}) => {
  const [formHtml, setFormHtml] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(blockFormHtml);
  const [pendingChange, setPendingChange] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const debounceTimer = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  const [userInteracted, setUserInteracted] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const [hasRemounted, setHasRemounted] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(false);

  // Trigger onChange when there's a pending change
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (pendingChange && (userHasInteractedWithForm || userInteracted)) {
      onChange(pendingChange);
      setPendingChange(false);
    }
  }, [pendingChange, userHasInteractedWithForm, userInteracted, setPendingChange, onChange]);

  // Update form HTML when blockFormHtml prop changes
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (!formHtml && blockFormHtml) {
      setFormHtml(blockFormHtml);
    }
  }, [blockFormHtml]);

  // Handle validation errors
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (!acfFormRef?.current) return;
    const validator = acf.getBlockFormValidator($(acfFormRef.current).find('.acf-block-fields'));
    validator.clearErrors();
    validator.set('notice', null);
    acf.doAction('blocks/validation/pre_apply', validationErrors);
    if (validationErrors) {
      if (showValidationErrors) {
        (0,_utils_post_locking__WEBPACK_IMPORTED_MODULE_1__.lockPostSaving)(clientId);
        validator.$el.find('.acf-notice').remove();
        validator.addErrors(validationErrors);
        validator.showErrors('after');
      }
    } else {
      // Handle successful validation
      if (validator.$el.find('.acf-notice').length > 0 && showValidationErrors) {
        validator.$el.find('.acf-notice').remove();
        validator.addErrors([{
          message: acf.__('Validation successful')
        }]);
        validator.showErrors('after');
        validator.get('notice').update({
          type: 'success',
          text: acf.__('Validation successful'),
          timeout: 1000
        });
        validator.set('notice', null);
        setTimeout(() => {
          validator.$el.find('.acf-notice').remove();
        }, 1001);
        const noticeDispatch = wp.data.dispatch('core/notices');

        /**
         * Recursively checks for ACF errors in blocks
         * @param {Array} blocks - Array of block objects
         * @returns {Promise<boolean>} - True if error found
         */
        function checkForErrors(blocks) {
          return new Promise(function (resolve) {
            blocks.forEach(block => {
              if (block.innerBlocks.length > 0) {
                checkForErrors(block.innerBlocks).then(hasError => {
                  if (hasError) return resolve(true);
                });
              }
              if (block.attributes.hasAcfError && block.clientId !== clientId) {
                return resolve(true);
              }
            });
            return resolve(false);
          });
        }
        checkForErrors(wp.data.select('core/block-editor').getBlocks()).then(hasError => {
          if (hasError) {
            noticeDispatch.createErrorNotice(acf.__('An ACF Block on this page requires attention before you can save.'), {
              id: 'acf-blocks-validation',
              isDismissible: true
            });
          } else {
            noticeDispatch.removeNotice('acf-blocks-validation');
          }
        });
      }
      (0,_utils_post_locking__WEBPACK_IMPORTED_MODULE_1__.unlockPostSaving)(clientId);
    }
    acf.doAction('blocks/validation/post_apply', validationErrors);
  }, [validationErrors, clientId, showValidationErrors]);

  // Handle form remounting and change detection
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (!acfFormRef?.current || !formHtml) return;
    acf.debug('Remounting ACF Form');
    const formElement = acfFormRef.current;
    const $form = $(formElement);
    let isActive = true;
    if (!hasRemounted) {
      acf.debug('Remounting ACF Form');
      acf.doAction('remount', $form);
      onMount?.($form);
      setHasRemounted(true);
    }
    const handleChange = () => {
      onChange($form);
    };
    const scheduleChange = () => {
      if (!isActive) return;
      const inputs = formElement.querySelectorAll('input, textarea');
      const selects = formElement.querySelectorAll('select');
      inputs.forEach(input => {
        input.removeEventListener('input', handleChange);
        input.addEventListener('input', handleChange);
        input.removeEventListener('change', handleChange);
        input.addEventListener('change', handleChange);
      });
      selects.forEach(select => {
        select.removeEventListener('change', handleChange);
        select.addEventListener('change', handleChange);
      });
      clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        if (isActive) {
          setPendingChange($form);
        }
      }, 300);
    };

    // Observe DOM changes to detect field additions/removals
    const domObserver = new MutationObserver(scheduleChange);

    // Observe iframe content changes (for WYSIWYG editors)
    const iframeObserver = new MutationObserver(() => {
      if (isActive) {
        setUserInteracted(true);
        scheduleChange();
      }
    });
    const observerConfig = {
      attributes: true,
      childList: true,
      subtree: true,
      characterData: true
    };
    domObserver.observe(formElement, observerConfig);

    // Watch for changes in iframes (WYSIWYG fields)
    [...formElement.querySelectorAll('iframe')].forEach(iframe => {
      if (iframe && iframe.contentDocument) {
        const iframeBody = iframe.contentDocument.body;
        if (iframeBody) {
          iframeObserver.observe(iframeBody, observerConfig);
        }
      }
    });

    // Attach event listeners to form inputs
    formElement.querySelectorAll('input, textarea').forEach(input => {
      input.addEventListener('input', handleChange);
      input.addEventListener('change', handleChange);
    });
    formElement.querySelectorAll('select').forEach(select => {
      select.addEventListener('change', handleChange);
    });
    if (userHasInteractedWithForm) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        if (isActive) {
          setPendingChange($form);
        }
      }, 300);
    }

    // Cleanup function
    return () => {
      isActive = false;
      domObserver.disconnect();
      iframeObserver.disconnect();
      clearTimeout(debounceTimer.current);
      if (formElement) {
        formElement.querySelectorAll('input, textarea').forEach(input => {
          input.removeEventListener('input', handleChange);
          input.removeEventListener('change', handleChange);
        });
        formElement.querySelectorAll('select').forEach(select => {
          select.removeEventListener('change', handleChange);
        });
      }
    };
  }, [acfFormRef, attributes, formHtml, onMount, userHasInteractedWithForm]);
  return /*#__PURE__*/React.createElement("div", {
    ref: acfFormRef,
    className: "acf-block-component acf-block-panel",
    style: {
      display: hideFieldsInSidebar ? 'none' : null
    },
    dangerouslySetInnerHTML: {
      __html: acf.applyFilters('blocks/form/render', formHtml, true)
    }
  });
};

/***/ }),

/***/ "./assets/src/js/pro/blocks-v3/components/block-placeholder.js":
/*!*********************************************************************!*\
  !*** ./assets/src/js/pro/blocks-v3/components/block-placeholder.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BlockPlaceholder: () => (/* binding */ BlockPlaceholder)
/* harmony export */ });
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__);
/**
 * BlockPlaceholder Component
 * Displays a placeholder UI when block has no preview HTML
 */


/**
 * SVG icon for the block placeholder
 * Represents a generic block/form icon
 */
const blockIcon = /*#__PURE__*/React.createElement("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  width: "24",
  height: "24",
  "aria-hidden": "true",
  focusable: "false"
}, /*#__PURE__*/React.createElement("path", {
  d: "M19 8h-1V6h-5v2h-2V6H6v2H5c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2zm.5 10c0 .3-.2.5-.5.5H5c-.3 0-.5-.2-.5-.5v-8c0-.3.2-.5.5-.5h14c.3 0 .5.2.5.5v8z"
}));

/**
 * BlockPlaceholder component
 * Shows when a block has no preview HTML available
 * Prompts user to open the block form to edit fields
 *
 * @param {Object} props - Component props
 * @param {Function} props.setBlockFormModalOpen - Function to open the block form modal
 * @param {string} props.blockLabel - The block's title/label
 * @returns {JSX.Element} - Rendered placeholder
 */
const BlockPlaceholder = ({
  setBlockFormModalOpen,
  blockLabel,
  instructions
}) => {
  return /*#__PURE__*/React.createElement(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Placeholder, {
    icon: /*#__PURE__*/React.createElement(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Icon, {
      icon: blockIcon
    }),
    label: blockLabel,
    instructions: instructions
  }, /*#__PURE__*/React.createElement(_wordpress_components__WEBPACK_IMPORTED_MODULE_0__.Button, {
    variant: "primary",
    onClick: () => {
      setBlockFormModalOpen(true);
    }
  }, acf.__('Edit Block')));
};

/***/ }),

/***/ "./assets/src/js/pro/blocks-v3/components/block-preview.js":
/*!*****************************************************************!*\
  !*** ./assets/src/js/pro/blocks-v3/components/block-preview.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BlockPreview: () => (/* binding */ BlockPreview)
/* harmony export */ });
/**
 * BlockPreview Component
 * Simple wrapper component that renders block preview HTML with block props
 */

/**
 * BlockPreview component
 * Wraps block preview content with the appropriate block props from useBlockProps
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child elements to render
 * @param {Object} props.blockProps - Block props from useBlockProps hook
 * @returns {JSX.Element} - Rendered preview wrapper
 */
const BlockPreview = ({
  children,
  blockProps
}) => /*#__PURE__*/React.createElement("div", blockProps, children);

/***/ }),

/***/ "./assets/src/js/pro/blocks-v3/components/block-toolbar-fields.js":
/*!************************************************************************!*\
  !*** ./assets/src/js/pro/blocks-v3/components/block-toolbar-fields.js ***!
  \************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BlockToolbarFields: () => (/* binding */ BlockToolbarFields)
/* harmony export */ });
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_blockEditor__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/blockEditor */ "@wordpress/block-editor");
/* harmony import */ var _wordpress_blockEditor__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_blockEditor__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _popover_wrapper__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./popover-wrapper */ "./assets/src/js/pro/blocks-v3/components/popover-wrapper.js");
/**
 * BlockToolbarFields Component
 * Renders field buttons in the WordPress block toolbar (top toolbar)
 * Allows quick access to edit specific fields from the block toolbar
 */

/* global acf */






/**
 * BlockToolbarFields component
 * Displays field editing buttons in the WordPress block toolbar
 *
 * @param {Object}                     props                                - Component props
 * @param {Array}                      props.blockToolbarFields             - Array of field names or field config objects to show in toolbar
 * @param {Array}                      props.blockFieldInfo                 - Array of all field information
 * @param {Function}                   props.setCurrentBlockFormContainer   - Setter for form container ref
 * @param {Document|HTMLIFrameElement} props.gutenbergIframeOrDocument      - Document or iframe reference
 * @param {Function}                   props.setBlockFormModalOpen          - Setter for block form modal state
 * @param {boolean}                    props.blockFormModalOpen             - Whether block form modal is open
 * @param {boolean}                    props.hideExpandedEditorBtnInToolbar - Whether to hide the expanded editor button in the toolbar
 * @return {JSX.Element} - Rendered toolbar controls
 */
const BlockToolbarFields = ({
  blockToolbarFields,
  blockFieldInfo,
  setCurrentBlockFormContainer,
  gutenbergIframeOrDocument,
  setBlockFormModalOpen,
  blockFormModalOpen,
  hideExpandedEditorBtnInToolbar
}) => {
  const [selectedFieldKey, setSelectedFieldKey] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
  const [selectedFieldButtonRef, setSelectedFieldButtonRef] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)();
  const [usePopover, setUsePopover] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(true);
  const fieldPopoverContainerRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useRef)();

  /**
   * Get field type class name from field name
   *
   * @param {string} fieldName Field name.
   * @return {string} Field type class name.
   */
  const getFieldTypeClassName = fieldName => {
    if (!fieldName || !blockFieldInfo) {
      return '';
    }
    const field = blockFieldInfo.find(f => f.name === fieldName);
    return field?.type ? field.type.replace(/_/g, '-') : '';
  };

  /**
   * Get field info object from field name
   *
   * @param {string} fieldName Field name.
   * @return {Object|null} Field info object.
   */
  const getFieldInfo = fieldName => {
    return fieldName && blockFieldInfo ? blockFieldInfo.find(f => f.name === fieldName) : null;
  };

  /**
   * Get field label from field name
   *
   * @param {string} fieldName Field name.
   * @return {string} Field label.
   */
  const getFieldLabel = fieldName => {
    if (!fieldName || !blockFieldInfo) {
      return fieldName || '';
    }
    const field = blockFieldInfo.find(f => f.name === fieldName);
    // Fallback to fieldName when label not found to ensure toolbar shows a title
    return field?.label || fieldName || '';
  };
  return /*#__PURE__*/React.createElement(_wordpress_blockEditor__WEBPACK_IMPORTED_MODULE_1__.BlockControls, null, !hideExpandedEditorBtnInToolbar && /*#__PURE__*/React.createElement(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.ToolbarGroup, null, /*#__PURE__*/React.createElement(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.ToolbarButton, {
    className: "components-icon-button components-toolbar__control",
    label: acf.__('Edit Block'),
    icon: "edit",
    onClick: () => {
      setBlockFormModalOpen(true);
    },
    isPressed: blockFormModalOpen
  })), blockToolbarFields.length > 0 && /*#__PURE__*/React.createElement(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.ToolbarGroup, null, (() => {
    const styleContent = `[data-name="${selectedFieldKey}"]{ display: block!important; }`;
    return /*#__PURE__*/React.createElement("style", null, styleContent);
  })(), blockToolbarFields && blockToolbarFields.map(field => {
    let fieldName = '';
    let fieldIconSvg = null;
    let fieldLabel = null;

    // Handle field config object or simple string
    if (typeof field === 'object') {
      fieldName = field.fieldName ? field.fieldName : field.index;
      fieldIconSvg = field.fieldIcon ? window.atob(field.fieldIcon) : null;
      fieldLabel = field.fieldLabel ? field.fieldLabel : fieldName;
    } else {
      fieldName = field;
    }
    return /*#__PURE__*/React.createElement(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.ToolbarButton, {
      key: fieldName,
      icon: fieldIconSvg ? /*#__PURE__*/React.createElement("i", {
        dangerouslySetInnerHTML: {
          __html: fieldIconSvg
        }
      }) : /*#__PURE__*/React.createElement("i", {
        className: `field-type-icon field-type-icon-${getFieldTypeClassName(fieldName)}`
      }),
      label: fieldLabel || getFieldLabel(fieldName),
      isPressed: fieldName === selectedFieldKey,
      ref: fieldName === selectedFieldKey ? setSelectedFieldButtonRef : null,
      onMouseDown: () => {
        if (selectedFieldKey === fieldName) {
          setSelectedFieldKey(null);
        } else {
          setSelectedFieldKey(null);
          setTimeout(() => {
            const fieldInfo = getFieldInfo(fieldName);
            // Use modal for complex field types
            if (fieldInfo?.type === 'flexible_content' || fieldInfo?.type === 'repeater') {
              setUsePopover(false);
            } else {
              setUsePopover(true);
            }
            setSelectedFieldKey(fieldName);
          });
        }
      }
    });
  }), selectedFieldKey && selectedFieldButtonRef && usePopover && /*#__PURE__*/React.createElement(_popover_wrapper__WEBPACK_IMPORTED_MODULE_3__.PopoverWrapper, {
    focusOnMount: false,
    className: "acf-inline-fields-popover",
    anchor: selectedFieldButtonRef,
    animate: true,
    onClose: event => {
      // Don't close on certain events
      if (event.key !== 'Escape' && (event?.target.closest('.media-modal') || event?.target.closest('.acf-tooltip') || event?.target && fieldPopoverContainerRef?.current && fieldPopoverContainerRef?.current.contains(event.target) || selectedFieldButtonRef?.current && selectedFieldButtonRef?.current.contains(event?.target))) {
        return false;
      }
      setSelectedFieldKey(null);
      return true;
    },
    variant: "unstyled",
    gutenbergIframeOrDocument: gutenbergIframeOrDocument
  }, /*#__PURE__*/React.createElement("div", {
    ref: fieldPopoverContainerRef
  }, /*#__PURE__*/React.createElement("div", {
    className: "acf-inline-fields-popover-inner",
    style: {
      minWidth: '300px'
    },
    ref: setCurrentBlockFormContainer
  }))), selectedFieldKey && selectedFieldButtonRef && !usePopover && /*#__PURE__*/React.createElement(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Modal, {
    className: "acf-block-form-modal",
    isFullScreen: true,
    title: getFieldInfo(selectedFieldKey)?.label,
    onRequestClose: () => {
      setSelectedFieldKey(null);
    }
  }, /*#__PURE__*/React.createElement("div", {
    ref: fieldPopoverContainerRef
  }, /*#__PURE__*/React.createElement("div", {
    className: "acf-inline-fields-popover-inner",
    style: {
      minWidth: '300px'
    },
    ref: setCurrentBlockFormContainer
  })))));
};

/***/ }),

/***/ "./assets/src/js/pro/blocks-v3/components/error-boundary.js":
/*!******************************************************************!*\
  !*** ./assets/src/js/pro/blocks-v3/components/error-boundary.js ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BlockPreviewErrorFallback: () => (/* binding */ BlockPreviewErrorFallback),
/* harmony export */   ErrorBoundary: () => (/* binding */ ErrorBoundary),
/* harmony export */   ErrorBoundaryContext: () => (/* binding */ ErrorBoundaryContext)
/* harmony export */ });
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _block_placeholder__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./block-placeholder */ "./assets/src/js/pro/blocks-v3/components/block-placeholder.js");



// Create context outside the class
const ErrorBoundaryContext = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createContext)(null);

// Initial state constant
const initialState = {
  didCatch: false,
  error: null
};

// Error Boundary Component
class ErrorBoundary extends _wordpress_element__WEBPACK_IMPORTED_MODULE_0__.Component {
  constructor(props) {
    super(props);
    this.resetErrorBoundary = this.resetErrorBoundary.bind(this);
    this.state = initialState;
  }
  static getDerivedStateFromError(error) {
    return {
      didCatch: true,
      error: error
    };
  }
  resetErrorBoundary() {
    const {
      error
    } = this.state;
    if (error !== null) {
      // Collect all arguments passed to reset
      const args = Array.from(arguments);

      // Call optional onReset callback with context
      if (this.props.onReset) {
        this.props.onReset({
          args: args,
          reason: 'imperative-api'
        });
      }
      this.setState(initialState);
    }
  }
  componentDidCatch(error, errorInfo) {
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }
  componentDidUpdate(prevProps, prevState) {
    const {
      didCatch
    } = this.state;
    const {
      resetKeys
    } = this.props;

    // Auto-reset if resetKeys prop changed
    if (didCatch && prevState.error !== null && hasResetKeysChanged(prevProps.resetKeys, resetKeys)) {
      if (this.props.onReset) {
        this.props.onReset({
          next: resetKeys,
          prev: prevProps.resetKeys,
          reason: 'keys'
        });
      }
      this.setState(initialState);
    }
  }
  render() {
    const {
      children,
      fallbackRender,
      FallbackComponent,
      fallback
    } = this.props;
    const {
      didCatch,
      error
    } = this.state;
    let content = children;
    if (didCatch) {
      const errorProps = {
        error: error,
        resetErrorBoundary: this.resetErrorBoundary
      };
      if (typeof fallbackRender === 'function') {
        content = fallbackRender(errorProps);
      } else if (FallbackComponent) {
        content = /*#__PURE__*/React.createElement(FallbackComponent, errorProps);
      } else if (fallback !== undefined) {
        content = fallback;
      } else {
        throw error;
      }
    }
    return /*#__PURE__*/React.createElement(ErrorBoundaryContext.Provider, {
      value: {
        didCatch,
        error,
        resetErrorBoundary: this.resetErrorBoundary
      }
    }, content);
  }
}

// Helper function to check if reset keys changed
function hasResetKeysChanged(prevKeys = [], nextKeys = []) {
  return prevKeys.length !== nextKeys.length || prevKeys.some((key, index) => !Object.is(key, nextKeys[index]));
}
const BlockPreviewErrorFallback = ({
  setBlockFormModalOpen,
  blockLabel,
  error
}) => {
  let errorMessage = null;
  if (error) {
    acf.debug('Block preview error:', error);
    errorMessage = acf.__('Error previewing block v3');
  }
  return /*#__PURE__*/React.createElement(_block_placeholder__WEBPACK_IMPORTED_MODULE_1__.BlockPlaceholder, {
    setBlockFormModalOpen: setBlockFormModalOpen,
    blockLabel: blockLabel,
    instructions: errorMessage
  });
};

/***/ }),

/***/ "./assets/src/js/pro/blocks-v3/components/inline-editing-toolbar.js":
/*!**************************************************************************!*\
  !*** ./assets/src/js/pro/blocks-v3/components/inline-editing-toolbar.js ***!
  \**************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   InlineEditingToolbar: () => (/* binding */ InlineEditingToolbar)
/* harmony export */ });
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _popover_wrapper__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./popover-wrapper */ "./assets/src/js/pro/blocks-v3/components/popover-wrapper.js");
/**
 * InlineEditingToolbar Component
 * Main inline editing toolbar for ACF blocks
 * Handles field selection and editing for inline editable elements
 */





/**
 * InlineEditingToolbar component
 * Displays a toolbar with field buttons for inline editing
 *
 * @param {Object} props - Component props
 * @param {Object} props.blockIcon - Block icon configuration
 * @param {Array} props.blockFieldInfo - Array of field information
 * @param {Function} props.setInlineEditingToolbarHasFocus - Setter for toolbar focus state
 * @param {Element|null} props.currentContentEditableElement - Current content editable element
 * @param {Element|null} props.currentInlineEditingElement - Current inline editing element
 * @param {string|null} props.currentInlineEditingElementUid - Current element UID
 * @param {Document|HTMLIFrameElement} props.gutenbergIframeOrDocument - Document or iframe reference
 * @param {Function} props.setCurrentBlockFormContainer - Setter for form container
 * @param {boolean} props.contentEditableChangeInProgress - Whether content change is in progress
 * @returns {JSX.Element|null} - Rendered toolbar or null
 */
const InlineEditingToolbar = ({
  blockIcon,
  blockFieldInfo,
  setInlineEditingToolbarHasFocus,
  currentContentEditableElement,
  currentInlineEditingElement,
  currentInlineEditingElementUid,
  gutenbergIframeOrDocument,
  setCurrentBlockFormContainer,
  contentEditableChangeInProgress
}) => {
  const [selectedFieldKey, setSelectedFieldKey] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
  const [selectedFieldConfig, setSelectedFieldConfig] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)();
  const [selectedFieldButtonRef, setSelectedFieldButtonRef] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)();
  const [usePopover, setUsePopover] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(true);
  const fieldPopoverContainerRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useRef)();

  // Get inline fields from data attribute
  const inlineFieldsAttr = currentInlineEditingElement ? currentInlineEditingElement.getAttribute('data-acf-inline-fields') : null;
  let inlineFields = [];
  try {
    inlineFields = JSON.parse(inlineFieldsAttr);
  } catch (e) {
    acf.debug('Inline fields were not a properly formatted JSON array', inlineFieldsAttr);
  }

  /**
   * Get field type class name from field name
   */
  function getFieldTypeClassName(fieldName) {
    if (!fieldName || !blockFieldInfo) return '';
    const field = blockFieldInfo.find(f => f.name === fieldName);
    return field?.type ? field.type.replace(/_/g, '-') : '';
  }

  /**
   * Get field label from field name
   */
  function getFieldLabel(fieldName) {
    if (!fieldName || !blockFieldInfo) return '';
    const field = blockFieldInfo.find(f => f.name === fieldName);
    return field ? field.label : '';
  }

  // Clear selected field when content editable changes
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    setSelectedFieldKey(null);
  }, [contentEditableChangeInProgress]);

  // Generate toolbar icon
  const toolbarIcon = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
    let icon = currentContentEditableElement && !currentInlineEditingElement ? currentContentEditableElement.getAttribute('data-acf-toolbar-icon') : null;
    if (!icon && currentInlineEditingElement) {
      icon = currentInlineEditingElement ? currentInlineEditingElement.getAttribute('data-acf-toolbar-icon') : null;
    }
    if (icon) {
      icon = /*#__PURE__*/React.createElement("i", {
        dangerouslySetInnerHTML: {
          __html: icon
        }
      });
    }
    if (!icon && currentContentEditableElement && !currentInlineEditingElement) {
      const fieldSlug = currentContentEditableElement.getAttribute('data-acf-inline-contenteditable-field-slug');
      icon = /*#__PURE__*/React.createElement("i", {
        className: `field-type-icon field-type-icon-${getFieldTypeClassName(fieldSlug)}`
      });
    }
    if (!icon) {
      icon = React.isValidElement(blockIcon) ? blockIcon : /*#__PURE__*/React.createElement("span", {
        className: `dashicon dashicons dashicons-${blockIcon}`
      });
    }
    return icon;
  }, [blockFieldInfo, currentContentEditableElement, currentInlineEditingElement]);

  // Generate toolbar title
  const toolbarTitle = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
    let fieldName;
    if (currentContentEditableElement && !currentInlineEditingElement) {
      const title = currentContentEditableElement.getAttribute('data-acf-toolbar-title');
      if (title) return title;
      fieldName = currentContentEditableElement.getAttribute('data-acf-inline-contenteditable-field-slug');
    } else if (currentInlineEditingElement) {
      const title = currentInlineEditingElement.getAttribute('data-acf-toolbar-title');
      if (title) return title;
      if (inlineFields.length > 1) {
        const elementTypeLabels = {
          A: 'Link',
          DIV: 'Division',
          P: 'Paragraph',
          SPAN: 'Span',
          INPUT: 'Input',
          BUTTON: 'Button',
          IMG: 'Image',
          UL: 'Unordered List',
          OL: 'Ordered List',
          LI: 'List Item',
          H1: 'Heading 1',
          H2: 'Heading 2',
          H3: 'Heading 3',
          H4: 'Heading 4',
          H5: 'Heading 5',
          H6: 'Heading 6',
          TABLE: 'Table',
          TR: 'Table Row',
          TD: 'Table Cell',
          TH: 'Table Header',
          FORM: 'Form',
          TEXTAREA: 'Text Area',
          SELECT: 'Select',
          OPTION: 'Option'
        };
        return elementTypeLabels[currentInlineEditingElement.tagName];
      }
      fieldName = typeof inlineFields[0] === 'object' ? inlineFields[0].fieldName : inlineFields[0];
    }
    return getFieldLabel(fieldName);
  }, [currentInlineEditingElement, currentContentEditableElement, blockFieldInfo]);
  return /*#__PURE__*/React.createElement(React.Fragment, null, selectedFieldKey && selectedFieldButtonRef && usePopover && currentInlineEditingElementUid && /*#__PURE__*/React.createElement(_popover_wrapper__WEBPACK_IMPORTED_MODULE_2__.PopoverWrapper, {
    focusOnMount: false,
    className: "acf-inline-fields-popover",
    anchor: selectedFieldButtonRef,
    onClose: event => {
      if (event.key === 'Escape') {
        setSelectedFieldKey(null);
        return true;
      }
      // Don't close if clicking inside the popover or anchor
      if (event?.target && fieldPopoverContainerRef?.current && fieldPopoverContainerRef?.current.contains(event.target) || selectedFieldButtonRef?.current && selectedFieldButtonRef?.current.contains(event?.target)) {
        return false;
      }
      return undefined;
    },
    variant: usePopover ? 'toolbar' : 'unstyled',
    gutenbergIframeOrDocument: gutenbergIframeOrDocument,
    hidePrimaryBlockToolbar: true,
    animate: true
  }, /*#__PURE__*/React.createElement("div", {
    ref: fieldPopoverContainerRef,
    onClick: () => {
      setInlineEditingToolbarHasFocus(true);
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "acf-inline-fields-popover-inner",
    style: {
      minWidth: selectedFieldConfig?.popoverMinWidth ? selectedFieldConfig?.popoverMinWidth : '300px'
    },
    ref: setCurrentBlockFormContainer
  }))), selectedFieldKey && selectedFieldButtonRef && !usePopover && currentInlineEditingElementUid && /*#__PURE__*/React.createElement(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Modal, {
    className: "acf-block-form-modal",
    isFullScreen: true,
    title: blockFieldInfo && selectedFieldKey ? blockFieldInfo.find(f => f.name === selectedFieldKey)?.label : '',
    onRequestClose: () => {
      setSelectedFieldKey(null);
    }
  }, /*#__PURE__*/React.createElement("div", {
    ref: fieldPopoverContainerRef,
    onClick: () => {
      setInlineEditingToolbarHasFocus(true);
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "acf-inline-fields-popover-inner",
    style: {
      minWidth: selectedFieldConfig?.popoverMinWidth ? selectedFieldConfig?.popoverMinWidth : '300px'
    },
    ref: setCurrentBlockFormContainer
  }))), /*#__PURE__*/React.createElement(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Toolbar, {
    orientation: "horizontal",
    className: "components-accessible-toolbar block-editor-block-contextual-toolbar",
    style: {
      width: 'max-content'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "block-editor-block-toolbar"
  }, /*#__PURE__*/React.createElement(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.ToolbarGroup, {
    style: {
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "acf-blocks-toolbar-icon components-toolbar-group block-editor-block-toolbar__block-controls",
    label: toolbarTitle
  }, toolbarIcon, /*#__PURE__*/React.createElement("span", null, toolbarTitle))), /*#__PURE__*/React.createElement(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.ToolbarGroup, null, (() => {
    if (!inlineFields || inlineFields.length === 0) {
      return null;
    }
    const buttons = inlineFields.map((field, index) => {
      let fieldName = '';
      let fieldIconSvg = null;
      let fieldLabel = null;
      if (typeof field === 'object') {
        fieldName = field.fieldName ? field.fieldName : index;
        fieldIconSvg = field.fieldIcon ? window.atob(field.fieldIcon) : null;
        fieldLabel = field.fieldLabel ? field.fieldLabel : fieldName;
      } else {
        fieldName = field;
      }

      // Use 'edit' icon if field has useExpandedEditor flag
      if (!fieldIconSvg && field?.useExpandedEditor) {
        fieldIconSvg = 'edit';
      }
      return /*#__PURE__*/React.createElement(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.ToolbarButton, {
        key: fieldName,
        disabled: contentEditableChangeInProgress,
        className: "acf-toolbar-button",
        icon: fieldIconSvg ? typeof fieldIconSvg === 'string' && fieldIconSvg === 'edit' ? 'edit' : /*#__PURE__*/React.createElement("i", {
          dangerouslySetInnerHTML: {
            __html: fieldIconSvg
          }
        }) : /*#__PURE__*/React.createElement("i", {
          className: `field-type-icon field-type-icon-${getFieldTypeClassName(fieldName)}`
        }),
        label: fieldLabel || getFieldLabel(fieldName),
        isPressed: fieldName === selectedFieldKey,
        ref: fieldName === selectedFieldKey ? setSelectedFieldButtonRef : null,
        onClick: () => {
          setInlineEditingToolbarHasFocus(true);
          if (selectedFieldKey === fieldName) {
            setSelectedFieldKey(null);
          } else {
            // Determine if we should use modal or popover
            setUsePopover(!field?.useExpandedEditor);
            setSelectedFieldKey(fieldName);
            setSelectedFieldConfig(field);
          }
        }
      });
    });
    return buttons;
  })()))), (() => {
    const styleContent = `[data-name="${selectedFieldKey}"]{ display: block!important; }`;
    return /*#__PURE__*/React.createElement("style", null, styleContent);
  })());
};

/***/ }),

/***/ "./assets/src/js/pro/blocks-v3/components/jsx-parser.js":
/*!**************************************************************!*\
  !*** ./assets/src/js/pro/blocks-v3/components/jsx-parser.js ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   parseJSX: () => (/* binding */ parseJSX)
/* harmony export */ });
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! jquery */ "jquery");
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(jquery__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__);
/**
 * JSX Parser for ACF Blocks - Based on 6.7.0.2
 * Converts HTML strings to React/JSX elements for rendering in the block editor
 */

/* global acf, React, Text */

// eslint-disable-next-line import/no-unresolved -- WordPress provides jquery as an external script dependency.


const useInnerBlocksProps = wp.blockEditor.__experimentalUseInnerBlocksProps || wp.blockEditor.useInnerBlocksProps;

/**
 * Gets the JSX-compatible name for an HTML attribute
 *
 * @param {string} attrName Attribute name.
 * @return {string} JSX-compatible attribute name.
 */
function getJSXNameReplacement(attrName) {
  return acf.isget(acf, 'jsxNameReplacements', attrName) || attrName;
}

/**
 * ACF InnerBlocks wrapper component
 *
 * @param {Object} props Component props.
 * @return {JSX.Element} InnerBlocks wrapper element.
 */
function ACFInnerBlocksComponent(props) {
  const {
    className = 'acf-innerblocks-container'
  } = props;
  const innerBlocksProps = useInnerBlocksProps({
    className
  }, props);
  return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)('div', {
    ...innerBlocksProps,
    children: innerBlocksProps.children
  });
}

/**
 * Script component for handling <script> tags
 */
class ScriptComponent extends React.Component {
  render() {
    return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)('div', {
      ref: element => this.el = element
    });
  }
  setHTML(scriptContent) {
    jquery__WEBPACK_IMPORTED_MODULE_0___default()(this.el).html(`<script>${scriptContent}</script>`);
  }
  componentDidUpdate() {
    this.setHTML(this.props.children);
  }
  componentDidMount() {
    this.setHTML(this.props.children);
  }
}

/**
 * Helper function to parse style attribute string into object
 *
 * @param {string} styleString Style attribute value.
 * @return {Object} Parsed style object.
 */
function parseStyleAttribute(styleString) {
  const styleObj = {};
  if (!styleString) {
    return styleObj;
  }
  styleString.split(';').forEach(rule => {
    const colonIndex = rule.indexOf(':');
    if (colonIndex > 0) {
      let property = rule.substr(0, colonIndex).trim();
      const value = rule.substr(colonIndex + 1).trim();

      // Convert to camelCase
      if (property.charAt(0) !== '-') {
        property = acf.strCamelCase(property);
      }
      styleObj[property] = value;
    }
  });
  return styleObj;
}

/**
 * Parses and transforms a DOM attribute to React props format
 * Based on 6.7.0.2's implementation
 *
 * @param {Attr} attribute DOM attribute.
 * @return {Object} React prop name and value.
 */
function parseAttribute(attribute) {
  let attrName = attribute.name;
  let attrValue = attribute.value;

  // Allow custom filtering
  const customParsed = acf.applyFilters('acf_blocks_parse_node_attr', false, attribute);
  if (customParsed) {
    return customParsed;
  }
  switch (attrName) {
    case 'class':
      attrName = 'className';
      break;
    case 'style':
      const styleObj = {};
      attrValue.split(';').forEach(rule => {
        const colonIndex = rule.indexOf(':');
        if (colonIndex > 0) {
          let property = rule.substr(0, colonIndex).trim();
          const value = rule.substr(colonIndex + 1).trim();
          if (property.charAt(0) !== '-') {
            property = acf.strCamelCase(property);
          }
          styleObj[property] = value;
        }
      });
      attrValue = styleObj;
      break;
    default:
      // Skip data- attributes processing, keep them as-is
      if (attrName.indexOf('data-') === 0) {
        break;
      }
      attrName = getJSXNameReplacement(attrName);
      const firstChar = attrValue.charAt(0);
      if (firstChar === '[' || firstChar === '{') {
        attrValue = JSON.parse(attrValue);
      }
      if (attrValue === 'true' || attrValue === 'false') {
        attrValue = attrValue === 'true';
      }
  }
  return {
    name: attrName,
    value: attrValue
  };
}

/**
 * Main parseNodeToJSX function - Based on 6.7.0.2's function `O`
 * Recursively converts DOM nodes to React/JSX elements
 *
 * @param {Node}   node  DOM node.
 * @param {number} depth Recursion depth.
 * @return {JSX.Element|null} Parsed JSX element.
 */
function parseNodeToJSX(node, depth = 0, callbacks = {}) {
  const {
    onNewInlineEditingElementSelected,
    onNewContentEditableElementSelected,
    blockFieldInfo
  } = callbacks;
  const selectInlineEditingElement = (uid, element = null) => {
    if (onNewInlineEditingElementSelected) {
      onNewInlineEditingElementSelected(uid);
      return;
    }
    if (acf.blockEdit?.setCurrentInlineEditingElementUid) {
      acf.blockEdit.setCurrentInlineEditingElementUid(uid);
    }
    if (acf.blockEdit?.setCurrentInlineEditingElement) {
      acf.blockEdit.setCurrentInlineEditingElement(element);
    }
  };
  const selectContentEditableElement = (fieldSlug, element = null) => {
    if (onNewContentEditableElementSelected) {
      onNewContentEditableElementSelected(fieldSlug);
      return;
    }
    if (acf.blockEdit?.setCurrentContentEditableElement) {
      acf.blockEdit.setCurrentContentEditableElement(element);
    }
  };

  // Determine component type
  const nodeName = node.nodeName.toLowerCase();
  let componentType;
  switch (nodeName) {
    case 'innerblocks':
      componentType = 'ACFInnerBlocks';
      break;
    case 'script':
      componentType = ScriptComponent;
      break;
    case '#comment':
      return null;
    default:
      componentType = getJSXNameReplacement(nodeName);
  }
  if (!componentType) {
    return null;
  }
  const props = {};

  // Add ref to first-level elements (except ACFInnerBlocks)
  if (depth === 1 && componentType !== 'ACFInnerBlocks') {
    props.ref = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createRef)();
  }

  // Parse attributes
  acf.arrayArgs(node.attributes).map(parseAttribute).forEach(({
    name,
    value
  }) => {
    props[name] = value;
  });

  // Handle data-acf-inline-fields attributes
  if (node.hasAttribute('data-acf-inline-fields')) {
    props.style = {
      ...parseStyleAttribute(node.getAttribute('style') || ''),
      pointerEvents: 'all'
    };
    props.role = 'button';
    props.tabIndex = 0;
    props.onFocus = event => {
      event.stopPropagation();
      const uid = node.attributes.getNamedItem('data-acf-inline-fields-uid').value;
      selectInlineEditingElement(uid, event.currentTarget);
    };
    props.onMouseDown = event => event.stopPropagation();
    props.onClick = event => {
      event.stopPropagation();
      const link = event.target.closest('a');
      if (link && link.tagName === 'A') {
        event.preventDefault();
        acf.debug(`Navigation prevented for ${link.href}`);
      }
      if (!event.target.hasAttribute('data-acf-inline-contenteditable')) {
        const uid = node.attributes.getNamedItem('data-acf-inline-fields-uid').value;
        selectInlineEditingElement(uid, event.currentTarget);
      }
    };
    props.onKeyDown = event => {
      if (event.key === 'Tab' && event.shiftKey) {
        event.preventDefault();
        const toolbar = document.querySelector('.acf-inline-editing-toolbar');
        const button = toolbar?.querySelector('button');
        if (button) {
          button.focus();
          const uid = node.attributes.getNamedItem('data-acf-inline-fields-uid').value;
          selectInlineEditingElement(uid, event.currentTarget);
        }
      }
      if (event.key === 'Enter') {
        event.stopPropagation();
        const link = event.target.closest('a');
        if (link && link.tagName === 'A') {
          event.preventDefault();
          acf.debug(`Navigation prevented for ${link.href}`);
        }
        const uid = node.attributes.getNamedItem('data-acf-inline-fields-uid').value;
        selectInlineEditingElement(uid, event.currentTarget);
      }
    };
  }

  // Handle data-acf-inline-contenteditable attributes
  if (node.hasAttribute('data-acf-inline-contenteditable')) {
    const fieldSlug = node.attributes.getNamedItem('data-acf-inline-contenteditable-field-slug').value;
    const fieldInfo = blockFieldInfo || acf.blockEdit?.getBlockFieldInfo?.();
    const editableFields = fieldInfo ? fieldInfo.filter(field => field.name === fieldSlug && (field.type === 'text' || field.type === 'textarea')) : [];
    if (editableFields.length > 0) {
      props.contentEditable = true;
      props.suppressContentEditableWarning = true;
      props.role = 'input';
      props.tabIndex = 0;
      props.onFocus = event => {
        const link = event.target.closest('a');
        if (link && link.tagName === 'A') {
          event.preventDefault();
          acf.debug(`Navigation prevented for ${link.href}`);
        }
        event.stopPropagation();
        selectContentEditableElement(fieldSlug, event.currentTarget);
        if (node.hasAttribute('data-acf-inline-fields')) {
          const uid = node.attributes.getNamedItem('data-acf-inline-fields-uid').value;
          selectInlineEditingElement(uid, event.currentTarget);
        } else {
          selectInlineEditingElement(null);
        }
      };
      props.onPaste = event => {
        event.preventDefault();
        const text = event.clipboardData.getData('text/plain');
        event.currentTarget.textContent = event.currentTarget.textContent + text;
      };
    } else {
      // Remove invalid contentEditable attributes
      delete props['data-acf-inline-contenteditable-field-slug'];
      delete props['data-acf-inline-contenteditable'];
    }
  }

  // Add click handler to clear selection if clicking outside inline fields
  if (!node.hasAttribute('data-acf-inline-fields') && !node.hasAttribute('data-acf-inline-contenteditable')) {
    props.onClick = event => {
      if (event.target === event.currentTarget) {
        selectInlineEditingElement(null);
        selectContentEditableElement(null);
      }
    };
  }

  // Handle ACFInnerBlocks component
  if (componentType === 'ACFInnerBlocks') {
    return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement)(ACFInnerBlocksComponent, {
      ...props
    });
  }

  // Build element with children
  const elementArgs = [componentType, props];
  acf.arrayArgs(node.childNodes).forEach(childNode => {
    if (childNode instanceof Text) {
      const textContent = childNode.textContent;
      if (textContent) {
        elementArgs.push(textContent);
      }
    } else {
      elementArgs.push(parseNodeToJSX(childNode, depth + 1, callbacks));
    }
  });
  const element = _wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createElement.apply(this, elementArgs);
  return element;
}

// Preserve the legacy parser for v1/v2 blocks, which pass the block version
// as the second argument.
const legacyParseJSX = acf.parseJSX;

/**
 * Main parseJSX function exposed on the acf global object
 * Matches 6.7.0.2's implementation exactly
 *
 * @param {string}   htmlString                         HTML string.
 * @param {Function} onNewInlineEditingElementSelected  Inline element selection callback or jQuery parser.
 * @param {Function} onContentEditableChange            ContentEditable change callback.
 * @param {Function} onNewContentEditableElementSelected ContentEditable selection callback.
 * @param {Array}    blockFieldInfo                     Field metadata.
 * @param {Function} $                                  jQuery-compatible parser.
 * @return {JSX.Element|Array} Parsed JSX children.
 */
function parseJSX(htmlString, onNewInlineEditingElementSelected = (jquery__WEBPACK_IMPORTED_MODULE_0___default()), onContentEditableChange = null, onNewContentEditableElementSelected = null, blockFieldInfo = null, $ = null) {
  if (typeof onNewInlineEditingElementSelected === 'number' && typeof legacyParseJSX === 'function') {
    return legacyParseJSX(htmlString, onNewInlineEditingElementSelected);
  }
  const isJQueryParser = typeof onNewInlineEditingElementSelected === 'function' && (arguments.length === 2 || onNewInlineEditingElementSelected.fn && onNewInlineEditingElementSelected.fn.jquery);
  const parser = isJQueryParser ? onNewInlineEditingElementSelected : $ || (jquery__WEBPACK_IMPORTED_MODULE_0___default());
  const callbacks = isJQueryParser ? {} : {
    onNewInlineEditingElementSelected,
    onContentEditableChange,
    onNewContentEditableElementSelected,
    blockFieldInfo
  };

  // Wrap in div to ensure valid HTML structure
  htmlString = '<div>' + htmlString + '</div>';

  // Handle self-closing InnerBlocks tags
  htmlString = htmlString.replace(/<InnerBlocks([^>]+)?\/>/, '<InnerBlocks$1></InnerBlocks>');

  // Parse with jQuery, convert to React, and extract children from wrapper div
  const parsedElement = parseNodeToJSX(parser(htmlString)[0], 0, callbacks);
  return parsedElement.props.children;
}
acf.parseJSXV3 = parseJSX;
acf.parseJSX = parseJSX;

/***/ }),

/***/ "./assets/src/js/pro/blocks-v3/components/popover-wrapper.js":
/*!*******************************************************************!*\
  !*** ./assets/src/js/pro/blocks-v3/components/popover-wrapper.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PopoverWrapper: () => (/* binding */ PopoverWrapper)
/* harmony export */ });
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__);
/**
 * PopoverWrapper Component
 * Custom Popover wrapper that handles inline editing toolbar behavior
 * - Escape key to close
 * - Click outside to close
 * - Focus management
 * - Hiding primary block toolbar when active
 */




/**
 * PopoverWrapper component
 * Wraps the WordPress Popover component with custom event handlers
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child elements to render inside popover
 * @param {string} props.className - CSS class for the popover
 * @param {Element|null} props.anchor - Anchor element for positioning
 * @param {string} props.placement - Placement relative to anchor (e.g., 'top-start')
 * @param {Function} props.onClose - Callback when popover should close
 * @param {boolean|string} props.focusOnMount - Whether to focus on mount
 * @param {string} props.variant - Popover variant (e.g., 'unstyled')
 * @param {boolean} props.animate - Whether to animate popover
 * @param {Document|HTMLIFrameElement} props.gutenbergIframeOrDocument - Document or iframe reference
 * @param {boolean} props.hidePrimaryBlockToolbar - Whether to hide the primary block toolbar
 * @returns {JSX.Element} - Wrapped Popover component
 */
const PopoverWrapper = ({
  children,
  className,
  anchor,
  placement,
  onClose,
  focusOnMount,
  variant,
  animate = false,
  gutenbergIframeOrDocument,
  hidePrimaryBlockToolbar = false
}) => {
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    const doc = gutenbergIframeOrDocument?.contentDocument ? gutenbergIframeOrDocument.contentDocument : gutenbergIframeOrDocument || document;
    const handleEscapeKey = event => {
      if (event.key === 'Escape') {
        onClose?.(event);
      }
    };
    const handleClickOutside = event => {
      if (event?.key) {
        return;
      }
      const popoverSelector = className ? `.${className.split(' ').filter(Boolean).join('.')}` : null;
      const popoverElement = popoverSelector ? event.target.closest(popoverSelector) : null;
      if (!popoverElement) {
        onClose?.(event);
      }
    };
    doc.addEventListener('keydown', handleEscapeKey, true);
    doc.addEventListener('mousedown', handleClickOutside, true);
    if (hidePrimaryBlockToolbar) {
      const toolbar = doc.querySelector('.block-editor-block-list__block.is-selected > .block-editor-block-contextual-toolbar');
      if (toolbar) {
        toolbar.style.display = 'none';
      }
    }
    return () => {
      doc.removeEventListener('keydown', handleEscapeKey, true);
      doc.removeEventListener('mousedown', handleClickOutside, true);
      if (hidePrimaryBlockToolbar) {
        const toolbar = doc.querySelector('.block-editor-block-list__block.is-selected > .block-editor-block-contextual-toolbar');
        if (toolbar) {
          toolbar.style.display = '';
        }
      }
    };
  }, [gutenbergIframeOrDocument, onClose, className, hidePrimaryBlockToolbar]);
  return /*#__PURE__*/React.createElement(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.Popover, {
    focusOnMount: focusOnMount,
    variant: variant,
    anchor: anchor,
    className: className,
    placement: placement,
    animate: animate
  }, hidePrimaryBlockToolbar && /*#__PURE__*/React.createElement("style", null, `
					.components-popover.block-editor-block-popover.block-editor-block-list__block-popover{
						display: none!important;
					}
				`), children);
};

/***/ }),

/***/ "./assets/src/js/pro/blocks-v3/high-order-components/with-align-content.js":
/*!*********************************************************************************!*\
  !*** ./assets/src/js/pro/blocks-v3/high-order-components/with-align-content.js ***!
  \*********************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   withAlignContent: () => (/* binding */ withAlignContent)
/* harmony export */ });
/**
 * withAlignContent Higher-Order Component
 * Adds content alignment toolbar controls to ACF blocks
 * Supports both vertical alignment and matrix alignment (horizontal + vertical)
 */

const {
  Fragment,
  Component
} = wp.element;
const {
  BlockControls,
  BlockVerticalAlignmentToolbar
} = wp.blockEditor;

// Matrix alignment control (experimental)
const BlockAlignmentMatrixControl = wp.blockEditor.__experimentalBlockAlignmentMatrixControl || wp.blockEditor.BlockAlignmentMatrixControl;
const BlockAlignmentMatrixToolbar = wp.blockEditor.__experimentalBlockAlignmentMatrixToolbar || wp.blockEditor.BlockAlignmentMatrixToolbar;

/**
 * Normalizes vertical alignment value
 *
 * @param {string} alignment - Alignment value
 * @returns {string} - Normalized alignment (top, center, or bottom)
 */
const normalizeVerticalAlignment = alignment => {
  return ['top', 'center', 'bottom'].includes(alignment) ? alignment : 'top';
};

/**
 * Gets the default horizontal alignment based on RTL setting
 *
 * @param {string} alignment - Current alignment value
 * @returns {string} - Normalized alignment value (left, center, or right)
 */
const getDefaultHorizontalAlignment = alignment => {
  const defaultAlign = acf.get('rtl') ? 'right' : 'left';
  return ['left', 'center', 'right'].includes(alignment) ? alignment : defaultAlign;
};

/**
 * Normalizes matrix alignment value (vertical + horizontal)
 * Format: "top left", "center center", etc.
 *
 * @param {string} alignment - Alignment value
 * @returns {string} - Normalized matrix alignment
 */
const normalizeMatrixAlignment = alignment => {
  if (alignment) {
    const [vertical, horizontal] = alignment.split(' ');
    return `${normalizeVerticalAlignment(vertical)} ${getDefaultHorizontalAlignment(horizontal)}`;
  }
  return 'center center';
};

/**
 * Higher-order component that adds content alignment controls
 * Supports either vertical-only or matrix (2D) alignment based on block config
 *
 * @param {React.Component} BlockComponent - The component to wrap
 * @param {Object} blockConfig - ACF block configuration
 * @returns {React.Component} - Enhanced component with content alignment controls
 */
const withAlignContent = (BlockComponent, blockConfig) => {
  let AlignmentControl;
  let normalizeAlignment;

  // Determine which alignment control to use based on block supports
  if (blockConfig.supports.align_content === 'matrix' || blockConfig.supports.alignContent === 'matrix') {
    // Use matrix control (horizontal + vertical)
    AlignmentControl = BlockAlignmentMatrixControl || BlockAlignmentMatrixToolbar;
    normalizeAlignment = normalizeMatrixAlignment;
  } else {
    // Use vertical-only control
    AlignmentControl = BlockVerticalAlignmentToolbar;
    normalizeAlignment = normalizeVerticalAlignment;
  }

  // If alignment control is not available, return original component
  if (AlignmentControl === undefined) {
    return BlockComponent;
  }

  // Set default alignment on block config
  blockConfig.alignContent = normalizeAlignment(blockConfig.alignContent);
  return class extends Component {
    render() {
      const {
        attributes,
        setAttributes
      } = this.props;
      const {
        alignContent
      } = attributes;
      return /*#__PURE__*/React.createElement(Fragment, null, /*#__PURE__*/React.createElement(BlockControls, {
        group: "block"
      }, /*#__PURE__*/React.createElement(AlignmentControl, {
        label: acf.__('Change content alignment'),
        value: normalizeAlignment(alignContent),
        onChange: function (newAlignment) {
          setAttributes({
            alignContent: normalizeAlignment(newAlignment)
          });
        }
      })), /*#__PURE__*/React.createElement(BlockComponent, this.props));
    }
  };
};

/***/ }),

/***/ "./assets/src/js/pro/blocks-v3/high-order-components/with-align-text.js":
/*!******************************************************************************!*\
  !*** ./assets/src/js/pro/blocks-v3/high-order-components/with-align-text.js ***!
  \******************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   withAlignText: () => (/* binding */ withAlignText)
/* harmony export */ });
/**
 * withAlignText Higher-Order Component
 * Adds text alignment toolbar controls to ACF blocks
 */

const {
  Fragment,
  Component
} = wp.element;
const {
  BlockControls,
  AlignmentToolbar
} = wp.blockEditor;

/**
 * Gets the default text alignment based on RTL setting
 *
 * @param {string} alignment - Current alignment value
 * @returns {string} - Normalized alignment value (left, center, or right)
 */
const getDefaultAlignment = alignment => {
  const defaultAlign = acf.get('rtl') ? 'right' : 'left';
  return ['left', 'center', 'right'].includes(alignment) ? alignment : defaultAlign;
};

/**
 * Higher-order component that adds text alignment controls
 * Wraps a block component and adds AlignmentToolbar to BlockControls
 *
 * @param {React.Component} BlockComponent - The component to wrap
 * @param {Object} blockConfig - ACF block configuration
 * @returns {React.Component} - Enhanced component with text alignment controls
 */
const withAlignText = (BlockComponent, blockConfig) => {
  const normalizeAlignment = getDefaultAlignment;

  // Set default alignment on block config
  blockConfig.alignText = normalizeAlignment(blockConfig.alignText);
  return class extends Component {
    render() {
      const {
        attributes,
        setAttributes
      } = this.props;
      const {
        alignText
      } = attributes;
      return /*#__PURE__*/React.createElement(Fragment, null, /*#__PURE__*/React.createElement(BlockControls, {
        group: "block"
      }, /*#__PURE__*/React.createElement(AlignmentToolbar, {
        value: normalizeAlignment(alignText),
        onChange: function (newAlignment) {
          setAttributes({
            alignText: normalizeAlignment(newAlignment)
          });
        }
      })), /*#__PURE__*/React.createElement(BlockComponent, this.props));
    }
  };
};

/***/ }),

/***/ "./assets/src/js/pro/blocks-v3/high-order-components/with-full-height.js":
/*!*******************************************************************************!*\
  !*** ./assets/src/js/pro/blocks-v3/high-order-components/with-full-height.js ***!
  \*******************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   withFullHeight: () => (/* binding */ withFullHeight)
/* harmony export */ });
/**
 * withFullHeight Higher-Order Component
 * Adds full height toggle control to ACF blocks
 */

const {
  Fragment,
  Component
} = wp.element;
const {
  BlockControls
} = wp.blockEditor;

// Full height control (experimental)
const BlockFullHeightAlignmentControl = wp.blockEditor.__experimentalBlockFullHeightAligmentControl || wp.blockEditor.__experimentalBlockFullHeightAlignmentControl || wp.blockEditor.BlockFullHeightAlignmentControl;

/**
 * Higher-order component that adds full height toggle controls
 * Allows blocks to expand to full available height
 *
 * @param {React.Component} BlockComponent - The component to wrap
 * @returns {React.Component} - Enhanced component with full height controls
 */
const withFullHeight = BlockComponent => {
  // If control is not available, return original component
  if (!BlockFullHeightAlignmentControl) {
    return BlockComponent;
  }
  return class extends Component {
    render() {
      const {
        attributes,
        setAttributes
      } = this.props;
      const {
        fullHeight
      } = attributes;
      return /*#__PURE__*/React.createElement(Fragment, null, /*#__PURE__*/React.createElement(BlockControls, {
        group: "block"
      }, /*#__PURE__*/React.createElement(BlockFullHeightAlignmentControl, {
        isActive: fullHeight,
        onToggle: function (newValue) {
          setAttributes({
            fullHeight: newValue
          });
        }
      })), /*#__PURE__*/React.createElement(BlockComponent, this.props));
    }
  };
};

/***/ }),

/***/ "./assets/src/js/pro/blocks-v3/register-block-type-v3.js":
/*!***************************************************************!*\
  !*** ./assets/src/js/pro/blocks-v3/register-block-type-v3.js ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getRegisteredBlock: () => (/* binding */ getRegisteredBlock),
/* harmony export */   registerACFBlockType: () => (/* binding */ registerACFBlockType)
/* harmony export */ });
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! jquery */ "jquery");
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(jquery__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _components_block_edit__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./components/block-edit */ "./assets/src/js/pro/blocks-v3/components/block-edit.js");
/* harmony import */ var _high_order_components_with_align_text__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./high-order-components/with-align-text */ "./assets/src/js/pro/blocks-v3/high-order-components/with-align-text.js");
/* harmony import */ var _high_order_components_with_align_content__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./high-order-components/with-align-content */ "./assets/src/js/pro/blocks-v3/high-order-components/with-align-content.js");
/* harmony import */ var _high_order_components_with_full_height__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./high-order-components/with-full-height */ "./assets/src/js/pro/blocks-v3/high-order-components/with-full-height.js");
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * ACF Block Type Registration - Version 3
 * Handles registration of ACF blocks (version 3) with WordPress Gutenberg
 * Includes attribute setup, higher-order component composition, and block filtering
 */






const {
  InnerBlocks
} = wp.blockEditor;
const {
  Component
} = wp.element;
const {
  createHigherOrderComponent
} = wp.compose;

// Registry to store registered block configurations
const registeredBlocks = {};

/**
 * Adds an attribute to the block configuration
 *
 * @param {Object} attributes - Existing attributes object
 * @param {string} attributeName - Name of the attribute to add
 * @param {string} attributeType - Type of the attribute (string, boolean, etc.)
 * @returns {Object} - Updated attributes object
 */
const addAttribute = (attributes, attributeName, attributeType) => {
  attributes[attributeName] = {
    type: attributeType
  };
  return attributes;
};

/**
 * Checks if block should be registered for current post type
 *
 * @param {Object} blockConfig - Block configuration
 * @returns {boolean} - True if block should be registered
 */
function shouldRegisterBlock(blockConfig) {
  const allowedPostTypes = blockConfig.post_types || [];
  if (allowedPostTypes.length) {
    // Always allow in reusable blocks
    allowedPostTypes.push('wp_block');
    const currentPostType = acf.get('postType');
    if (!allowedPostTypes.includes(currentPostType)) {
      return false;
    }
  }
  return true;
}

/**
 * Processes and normalizes block icon
 *
 * @param {Object} blockConfig - Block configuration
 */
function processBlockIcon(blockConfig) {
  // Convert SVG string to JSX element
  if (typeof blockConfig.icon === 'string' && blockConfig.icon.substr(0, 4) === '<svg') {
    const iconSvg = blockConfig.icon;
    blockConfig.icon = /*#__PURE__*/React.createElement("div", {
      dangerouslySetInnerHTML: {
        __html: iconSvg
      }
    });
  }

  // Remove icon if empty/invalid
  if (!blockConfig.icon) {
    delete blockConfig.icon;
  }
}

/**
 * Validates and normalizes block category
 * Falls back to 'common' if category doesn't exist
 *
 * @param {Object} blockConfig - Block configuration
 */
function validateBlockCategory(blockConfig) {
  const categoryExists = wp.blocks.getCategories().filter(({
    slug
  }) => slug === blockConfig.category).pop();
  if (!categoryExists) {
    blockConfig.category = 'common';
  }
}

/**
 * Sets default values for block configuration
 *
 * @param {Object} blockConfig - Block configuration
 * @returns {Object} - Block configuration with defaults applied
 */
function applyBlockDefaults(blockConfig) {
  return acf.parseArgs(blockConfig, {
    title: '',
    name: '',
    category: '',
    api_version: 2,
    acf_block_version: 3,
    attributes: {},
    supports: {}
  });
}

/**
 * Cleans up block attributes
 * Removes empty default values
 *
 * @param {Object} blockConfig - Block configuration
 */
function cleanBlockAttributes(blockConfig) {
  for (const attributeName in blockConfig.attributes) {
    if ('default' in blockConfig.attributes[attributeName] && blockConfig.attributes[attributeName].default.length === 0) {
      delete blockConfig.attributes[attributeName].default;
    }
  }
}

/**
 * Configures anchor support if enabled
 *
 * @param {Object} blockConfig - Block configuration
 */
function configureAnchorSupport(blockConfig) {
  if (blockConfig.supports && blockConfig.supports.anchor) {
    blockConfig.attributes.anchor = {
      type: 'string'
    };
  }
}

/**
 * Applies higher-order components based on block supports
 *
 * @param {React.Component} EditComponent - Base edit component
 * @param {Object} blockConfig - Block configuration
 * @returns {React.Component} - Enhanced edit component
 */
function applyHigherOrderComponents(EditComponent, blockConfig) {
  let enhancedComponent = EditComponent;

  // Add text alignment support
  if (blockConfig.supports.alignText || blockConfig.supports.align_text) {
    blockConfig.attributes = addAttribute(blockConfig.attributes, 'align_text', 'string');
    enhancedComponent = (0,_high_order_components_with_align_text__WEBPACK_IMPORTED_MODULE_2__.withAlignText)(enhancedComponent, blockConfig);
  }

  // Add content alignment support
  if (blockConfig.supports.alignContent || blockConfig.supports.align_content) {
    blockConfig.attributes = addAttribute(blockConfig.attributes, 'align_content', 'string');
    enhancedComponent = (0,_high_order_components_with_align_content__WEBPACK_IMPORTED_MODULE_3__.withAlignContent)(enhancedComponent, blockConfig);
  }

  // Add full height support
  if (blockConfig.supports.fullHeight || blockConfig.supports.full_height) {
    blockConfig.attributes = addAttribute(blockConfig.attributes, 'full_height', 'boolean');
    enhancedComponent = (0,_high_order_components_with_full_height__WEBPACK_IMPORTED_MODULE_4__.withFullHeight)(enhancedComponent);
  }
  return enhancedComponent;
}

/**
 * Registers an ACF block type (version 3) with WordPress
 *
 * @param {Object} blockConfig - ACF block configuration object
 * @returns {Object|boolean} - Registered block type or false if not registered
 */
function registerACFBlockType(blockConfig) {
  // Check if block should be registered for current post type
  if (!shouldRegisterBlock(blockConfig)) {
    return false;
  }

  // Process icon
  processBlockIcon(blockConfig);

  // Validate category
  validateBlockCategory(blockConfig);

  // Apply default values
  blockConfig = applyBlockDefaults(blockConfig);

  // Clean up attributes
  cleanBlockAttributes(blockConfig);

  // Configure anchor support
  configureAnchorSupport(blockConfig);

  // Start with base BlockEdit component
  let EditComponent = _components_block_edit__WEBPACK_IMPORTED_MODULE_1__.BlockEdit;

  // Apply higher-order components based on supports
  EditComponent = applyHigherOrderComponents(EditComponent, blockConfig);

  // Create edit function that passes blockConfig and jQuery
  blockConfig.edit = function (props) {
    return /*#__PURE__*/React.createElement(EditComponent, _extends({}, props, {
      blockType: blockConfig,
      $: (jquery__WEBPACK_IMPORTED_MODULE_0___default())
    }));
  };

  // Create save function (ACF blocks save to post content as HTML comments)
  blockConfig.save = () => /*#__PURE__*/React.createElement(InnerBlocks.Content, null);

  // Store in registry
  registeredBlocks[blockConfig.name] = blockConfig;

  // Register with WordPress
  const registeredBlockType = wp.blocks.registerBlockType(blockConfig.name, blockConfig);

  // Ensure anchor attribute is properly configured
  if (registeredBlockType && registeredBlockType.attributes && registeredBlockType.attributes.anchor) {
    registeredBlockType.attributes.anchor = {
      type: 'string'
    };
  }
  return registeredBlockType;
}

/**
 * Retrieves a registered block configuration by name
 *
 * @param {string} blockName - Name of the block
 * @returns {Object|boolean} - Block configuration or false
 */
function getRegisteredBlock(blockName) {
  return registeredBlocks[blockName] || false;
}

/**
 * Higher-order component to migrate legacy attribute names to new format
 * Handles backward compatibility for align_text -> alignText, etc.
 */
const withDefaultAttributes = createHigherOrderComponent(BlockListBlock => class extends Component {
  constructor(props) {
    super(props);
    const {
      name,
      attributes
    } = this.props;
    const blockConfig = getRegisteredBlock(name);
    if (!blockConfig) return;

    // Remove empty string attributes
    Object.keys(attributes).forEach(key => {
      if (attributes[key] === '') {
        delete attributes[key];
      }
    });

    // Map old attribute names to new camelCase names
    const attributeMap = {
      full_height: 'fullHeight',
      align_content: 'alignContent',
      align_text: 'alignText'
    };
    Object.keys(attributeMap).forEach(oldKey => {
      const newKey = attributeMap[oldKey];
      if (attributes[oldKey] !== undefined) {
        // Migrate old key to new key
        attributes[newKey] = attributes[oldKey];
      } else if (attributes[newKey] === undefined && blockConfig[oldKey] !== undefined) {
        // Set default from block config if not present
        attributes[newKey] = blockConfig[oldKey];
      }

      // Clean up old attribute names
      delete blockConfig[oldKey];
      delete attributes[oldKey];
    });

    // Apply default values from block config for missing attributes
    for (let key in blockConfig.attributes) {
      if (attributes[key] === undefined && blockConfig[key] !== undefined) {
        attributes[key] = blockConfig[key];
      }
    }
  }
  render() {
    return /*#__PURE__*/React.createElement(BlockListBlock, this.props);
  }
}, 'withDefaultAttributes');

/**
 * Initialize ACF blocks on the 'prepare' action
 * Registers all ACF blocks with version 3 or higher
 */
acf.addAction('prepare', function () {
  // Ensure wp.blockEditor exists (backward compatibility)
  if (!wp.blockEditor) {
    wp.blockEditor = wp.editor;
  }
  const blockTypes = acf.get('blockTypes');
  if (blockTypes) {
    blockTypes.forEach(blockType => {
      // Only register blocks with version 3 or higher
      if (parseInt(blockType.acf_block_version) >= 3) {
        registerACFBlockType(blockType);
      }
    });
  }
});

/**
 * Register WordPress filter for attribute migration
 * Ensures backward compatibility with legacy attribute names
 */
wp.hooks.addFilter('editor.BlockListBlock', 'acf/with-default-attributes', withDefaultAttributes);

// Export for testing/external use


/***/ }),

/***/ "./assets/src/js/pro/blocks-v3/utils/post-locking.js":
/*!***********************************************************!*\
  !*** ./assets/src/js/pro/blocks-v3/utils/post-locking.js ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   isPostSavingLocked: () => (/* binding */ isPostSavingLocked),
/* harmony export */   lockPostSaving: () => (/* binding */ lockPostSaving),
/* harmony export */   lockPostSavingByName: () => (/* binding */ lockPostSavingByName),
/* harmony export */   sortObjectKeys: () => (/* binding */ sortObjectKeys),
/* harmony export */   unlockPostSaving: () => (/* binding */ unlockPostSaving),
/* harmony export */   unlockPostSavingByName: () => (/* binding */ unlockPostSavingByName)
/* harmony export */ });
/**
 * WordPress post locking utilities for ACF blocks
 * Handles locking/unlocking post saving during block operations
 */

/**
 * Locks post saving in the WordPress editor for a specific block
 * Used when block operations are in progress for a specific block instance
 *
 * @param {string} clientId - The block's client ID
 */
const lockPostSaving = clientId => {
  const dispatch = wp.data.dispatch('core/editor');
  if (dispatch) {
    dispatch.lockPostSaving('acf/block/' + clientId);
  }
};

/**
 * Unlocks post saving in the WordPress editor for a specific block
 * Called when block operations are complete for a specific block instance
 *
 * @param {string} clientId - The block's client ID
 */
const unlockPostSaving = clientId => {
  const dispatch = wp.data.dispatch('core/editor');
  if (dispatch) {
    dispatch.unlockPostSaving('acf/block/' + clientId);
  }
};

/**
 * Checks if post saving is currently locked for a specific block
 *
 * @param {string} clientId - The block's client ID
 * @returns {boolean} - True if post saving is locked for this block
 */
const isPostSavingLocked = clientId => {
  const dispatch = wp.data.dispatch('core/editor');
  if (!dispatch) {
    return false;
  }
  return wp.data.select('core/editor').isPostSavingLocked(`acf/block/${clientId}`);
};

/**
 * Locks post saving with a custom lock name
 * Used for global operations that aren't tied to a specific block
 *
 * @param {string} lockName - The name of the lock
 */
const lockPostSavingByName = lockName => {
  const dispatch = wp.data.dispatch('core/editor');
  if (dispatch) {
    dispatch.lockPostSaving('acf/block/' + lockName);
  }
};

/**
 * Unlocks post saving with a custom lock name
 * Used for global operations that aren't tied to a specific block
 *
 * @param {string} lockName - The name of the lock
 */
const unlockPostSavingByName = lockName => {
  const dispatch = wp.data.dispatch('core/editor');
  if (dispatch) {
    dispatch.unlockPostSaving('acf/block/' + lockName);
  }
};

/**
 * Sorts an object's keys alphabetically and returns a new object
 * Used for consistent object serialization and comparison
 * Ensures that objects with same properties in different order produce same hash
 *
 * @param {Object} obj - Object to sort
 * @returns {Object} - New object with sorted keys in alphabetical order
 */
const sortObjectKeys = obj => {
  return Object.keys(obj).sort().reduce((sortedObj, key) => {
    sortedObj[key] = obj[key];
    return sortedObj;
  }, {});
};

/***/ }),

/***/ "./node_modules/charenc/charenc.js":
/*!*****************************************!*\
  !*** ./node_modules/charenc/charenc.js ***!
  \*****************************************/
/***/ ((module) => {

var charenc = {
  // UTF-8 encoding
  utf8: {
    // Convert a string to a byte array
    stringToBytes: function(str) {
      return charenc.bin.stringToBytes(unescape(encodeURIComponent(str)));
    },

    // Convert a byte array to a string
    bytesToString: function(bytes) {
      return decodeURIComponent(escape(charenc.bin.bytesToString(bytes)));
    }
  },

  // Binary encoding
  bin: {
    // Convert a string to a byte array
    stringToBytes: function(str) {
      for (var bytes = [], i = 0; i < str.length; i++)
        bytes.push(str.charCodeAt(i) & 0xFF);
      return bytes;
    },

    // Convert a byte array to a string
    bytesToString: function(bytes) {
      for (var str = [], i = 0; i < bytes.length; i++)
        str.push(String.fromCharCode(bytes[i]));
      return str.join('');
    }
  }
};

module.exports = charenc;


/***/ }),

/***/ "./node_modules/crypt/crypt.js":
/*!*************************************!*\
  !*** ./node_modules/crypt/crypt.js ***!
  \*************************************/
/***/ ((module) => {

(function() {
  var base64map
      = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',

  crypt = {
    // Bit-wise rotation left
    rotl: function(n, b) {
      return (n << b) | (n >>> (32 - b));
    },

    // Bit-wise rotation right
    rotr: function(n, b) {
      return (n << (32 - b)) | (n >>> b);
    },

    // Swap big-endian to little-endian and vice versa
    endian: function(n) {
      // If number given, swap endian
      if (n.constructor == Number) {
        return crypt.rotl(n, 8) & 0x00FF00FF | crypt.rotl(n, 24) & 0xFF00FF00;
      }

      // Else, assume array and swap all items
      for (var i = 0; i < n.length; i++)
        n[i] = crypt.endian(n[i]);
      return n;
    },

    // Generate an array of any length of random bytes
    randomBytes: function(n) {
      for (var bytes = []; n > 0; n--)
        bytes.push(Math.floor(Math.random() * 256));
      return bytes;
    },

    // Convert a byte array to big-endian 32-bit words
    bytesToWords: function(bytes) {
      for (var words = [], i = 0, b = 0; i < bytes.length; i++, b += 8)
        words[b >>> 5] |= bytes[i] << (24 - b % 32);
      return words;
    },

    // Convert big-endian 32-bit words to a byte array
    wordsToBytes: function(words) {
      for (var bytes = [], b = 0; b < words.length * 32; b += 8)
        bytes.push((words[b >>> 5] >>> (24 - b % 32)) & 0xFF);
      return bytes;
    },

    // Convert a byte array to a hex string
    bytesToHex: function(bytes) {
      for (var hex = [], i = 0; i < bytes.length; i++) {
        hex.push((bytes[i] >>> 4).toString(16));
        hex.push((bytes[i] & 0xF).toString(16));
      }
      return hex.join('');
    },

    // Convert a hex string to a byte array
    hexToBytes: function(hex) {
      for (var bytes = [], c = 0; c < hex.length; c += 2)
        bytes.push(parseInt(hex.substr(c, 2), 16));
      return bytes;
    },

    // Convert a byte array to a base-64 string
    bytesToBase64: function(bytes) {
      for (var base64 = [], i = 0; i < bytes.length; i += 3) {
        var triplet = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
        for (var j = 0; j < 4; j++)
          if (i * 8 + j * 6 <= bytes.length * 8)
            base64.push(base64map.charAt((triplet >>> 6 * (3 - j)) & 0x3F));
          else
            base64.push('=');
      }
      return base64.join('');
    },

    // Convert a base-64 string to a byte array
    base64ToBytes: function(base64) {
      // Remove non-base-64 characters
      base64 = base64.replace(/[^A-Z0-9+\/]/ig, '');

      for (var bytes = [], i = 0, imod4 = 0; i < base64.length;
          imod4 = ++i % 4) {
        if (imod4 == 0) continue;
        bytes.push(((base64map.indexOf(base64.charAt(i - 1))
            & (Math.pow(2, -2 * imod4 + 8) - 1)) << (imod4 * 2))
            | (base64map.indexOf(base64.charAt(i)) >>> (6 - imod4 * 2)));
      }
      return bytes;
    }
  };

  module.exports = crypt;
})();


/***/ }),

/***/ "./node_modules/is-buffer/index.js":
/*!*****************************************!*\
  !*** ./node_modules/is-buffer/index.js ***!
  \*****************************************/
/***/ ((module) => {

/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */

// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually
module.exports = function (obj) {
  return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
}

function isBuffer (obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}

// For Node v0.10 support. Remove this eventually.
function isSlowBuffer (obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0))
}


/***/ }),

/***/ "./node_modules/md5/md5.js":
/*!*********************************!*\
  !*** ./node_modules/md5/md5.js ***!
  \*********************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

(function(){
  var crypt = __webpack_require__(/*! crypt */ "./node_modules/crypt/crypt.js"),
      utf8 = (__webpack_require__(/*! charenc */ "./node_modules/charenc/charenc.js").utf8),
      isBuffer = __webpack_require__(/*! is-buffer */ "./node_modules/is-buffer/index.js"),
      bin = (__webpack_require__(/*! charenc */ "./node_modules/charenc/charenc.js").bin),

  // The core
  md5 = function (message, options) {
    // Convert to byte array
    if (message.constructor == String)
      if (options && options.encoding === 'binary')
        message = bin.stringToBytes(message);
      else
        message = utf8.stringToBytes(message);
    else if (isBuffer(message))
      message = Array.prototype.slice.call(message, 0);
    else if (!Array.isArray(message) && message.constructor !== Uint8Array)
      message = message.toString();
    // else, assume byte array already

    var m = crypt.bytesToWords(message),
        l = message.length * 8,
        a =  1732584193,
        b = -271733879,
        c = -1732584194,
        d =  271733878;

    // Swap endian
    for (var i = 0; i < m.length; i++) {
      m[i] = ((m[i] <<  8) | (m[i] >>> 24)) & 0x00FF00FF |
             ((m[i] << 24) | (m[i] >>>  8)) & 0xFF00FF00;
    }

    // Padding
    m[l >>> 5] |= 0x80 << (l % 32);
    m[(((l + 64) >>> 9) << 4) + 14] = l;

    // Method shortcuts
    var FF = md5._ff,
        GG = md5._gg,
        HH = md5._hh,
        II = md5._ii;

    for (var i = 0; i < m.length; i += 16) {

      var aa = a,
          bb = b,
          cc = c,
          dd = d;

      a = FF(a, b, c, d, m[i+ 0],  7, -680876936);
      d = FF(d, a, b, c, m[i+ 1], 12, -389564586);
      c = FF(c, d, a, b, m[i+ 2], 17,  606105819);
      b = FF(b, c, d, a, m[i+ 3], 22, -1044525330);
      a = FF(a, b, c, d, m[i+ 4],  7, -176418897);
      d = FF(d, a, b, c, m[i+ 5], 12,  1200080426);
      c = FF(c, d, a, b, m[i+ 6], 17, -1473231341);
      b = FF(b, c, d, a, m[i+ 7], 22, -45705983);
      a = FF(a, b, c, d, m[i+ 8],  7,  1770035416);
      d = FF(d, a, b, c, m[i+ 9], 12, -1958414417);
      c = FF(c, d, a, b, m[i+10], 17, -42063);
      b = FF(b, c, d, a, m[i+11], 22, -1990404162);
      a = FF(a, b, c, d, m[i+12],  7,  1804603682);
      d = FF(d, a, b, c, m[i+13], 12, -40341101);
      c = FF(c, d, a, b, m[i+14], 17, -1502002290);
      b = FF(b, c, d, a, m[i+15], 22,  1236535329);

      a = GG(a, b, c, d, m[i+ 1],  5, -165796510);
      d = GG(d, a, b, c, m[i+ 6],  9, -1069501632);
      c = GG(c, d, a, b, m[i+11], 14,  643717713);
      b = GG(b, c, d, a, m[i+ 0], 20, -373897302);
      a = GG(a, b, c, d, m[i+ 5],  5, -701558691);
      d = GG(d, a, b, c, m[i+10],  9,  38016083);
      c = GG(c, d, a, b, m[i+15], 14, -660478335);
      b = GG(b, c, d, a, m[i+ 4], 20, -405537848);
      a = GG(a, b, c, d, m[i+ 9],  5,  568446438);
      d = GG(d, a, b, c, m[i+14],  9, -1019803690);
      c = GG(c, d, a, b, m[i+ 3], 14, -187363961);
      b = GG(b, c, d, a, m[i+ 8], 20,  1163531501);
      a = GG(a, b, c, d, m[i+13],  5, -1444681467);
      d = GG(d, a, b, c, m[i+ 2],  9, -51403784);
      c = GG(c, d, a, b, m[i+ 7], 14,  1735328473);
      b = GG(b, c, d, a, m[i+12], 20, -1926607734);

      a = HH(a, b, c, d, m[i+ 5],  4, -378558);
      d = HH(d, a, b, c, m[i+ 8], 11, -2022574463);
      c = HH(c, d, a, b, m[i+11], 16,  1839030562);
      b = HH(b, c, d, a, m[i+14], 23, -35309556);
      a = HH(a, b, c, d, m[i+ 1],  4, -1530992060);
      d = HH(d, a, b, c, m[i+ 4], 11,  1272893353);
      c = HH(c, d, a, b, m[i+ 7], 16, -155497632);
      b = HH(b, c, d, a, m[i+10], 23, -1094730640);
      a = HH(a, b, c, d, m[i+13],  4,  681279174);
      d = HH(d, a, b, c, m[i+ 0], 11, -358537222);
      c = HH(c, d, a, b, m[i+ 3], 16, -722521979);
      b = HH(b, c, d, a, m[i+ 6], 23,  76029189);
      a = HH(a, b, c, d, m[i+ 9],  4, -640364487);
      d = HH(d, a, b, c, m[i+12], 11, -421815835);
      c = HH(c, d, a, b, m[i+15], 16,  530742520);
      b = HH(b, c, d, a, m[i+ 2], 23, -995338651);

      a = II(a, b, c, d, m[i+ 0],  6, -198630844);
      d = II(d, a, b, c, m[i+ 7], 10,  1126891415);
      c = II(c, d, a, b, m[i+14], 15, -1416354905);
      b = II(b, c, d, a, m[i+ 5], 21, -57434055);
      a = II(a, b, c, d, m[i+12],  6,  1700485571);
      d = II(d, a, b, c, m[i+ 3], 10, -1894986606);
      c = II(c, d, a, b, m[i+10], 15, -1051523);
      b = II(b, c, d, a, m[i+ 1], 21, -2054922799);
      a = II(a, b, c, d, m[i+ 8],  6,  1873313359);
      d = II(d, a, b, c, m[i+15], 10, -30611744);
      c = II(c, d, a, b, m[i+ 6], 15, -1560198380);
      b = II(b, c, d, a, m[i+13], 21,  1309151649);
      a = II(a, b, c, d, m[i+ 4],  6, -145523070);
      d = II(d, a, b, c, m[i+11], 10, -1120210379);
      c = II(c, d, a, b, m[i+ 2], 15,  718787259);
      b = II(b, c, d, a, m[i+ 9], 21, -343485551);

      a = (a + aa) >>> 0;
      b = (b + bb) >>> 0;
      c = (c + cc) >>> 0;
      d = (d + dd) >>> 0;
    }

    return crypt.endian([a, b, c, d]);
  };

  // Auxiliary functions
  md5._ff  = function (a, b, c, d, x, s, t) {
    var n = a + (b & c | ~b & d) + (x >>> 0) + t;
    return ((n << s) | (n >>> (32 - s))) + b;
  };
  md5._gg  = function (a, b, c, d, x, s, t) {
    var n = a + (b & d | c & ~d) + (x >>> 0) + t;
    return ((n << s) | (n >>> (32 - s))) + b;
  };
  md5._hh  = function (a, b, c, d, x, s, t) {
    var n = a + (b ^ c ^ d) + (x >>> 0) + t;
    return ((n << s) | (n >>> (32 - s))) + b;
  };
  md5._ii  = function (a, b, c, d, x, s, t) {
    var n = a + (c ^ (b | ~d)) + (x >>> 0) + t;
    return ((n << s) | (n >>> (32 - s))) + b;
  };

  // Package private blocksize
  md5._blocksize = 16;
  md5._digestsize = 16;

  module.exports = function (message, options) {
    if (message === undefined || message === null)
      throw new Error('Illegal argument ' + message);

    var digestbytes = crypt.wordsToBytes(md5(message, options));
    return options && options.asBytes ? digestbytes :
        options && options.asString ? bin.bytesToString(digestbytes) :
        crypt.bytesToHex(digestbytes);
  };

})();


/***/ }),

/***/ "@wordpress/block-editor":
/*!*************************************!*\
  !*** external ["wp","blockEditor"] ***!
  \*************************************/
/***/ ((module) => {

"use strict";
module.exports = window["wp"]["blockEditor"];

/***/ }),

/***/ "@wordpress/components":
/*!************************************!*\
  !*** external ["wp","components"] ***!
  \************************************/
/***/ ((module) => {

"use strict";
module.exports = window["wp"]["components"];

/***/ }),

/***/ "@wordpress/element":
/*!*********************************!*\
  !*** external ["wp","element"] ***!
  \*********************************/
/***/ ((module) => {

"use strict";
module.exports = window["wp"]["element"];

/***/ }),

/***/ "jquery":
/*!*************************!*\
  !*** external "jQuery" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = window["jQuery"];

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be in strict mode.
(() => {
"use strict";
/*!*********************************************!*\
  !*** ./assets/src/js/pro/acf-pro-blocks.js ***!
  \*********************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _acf_jsx_names_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_acf-jsx-names.js */ "./assets/src/js/pro/_acf-jsx-names.js");
/* harmony import */ var _acf_jsx_names_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_acf_jsx_names_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _acf_blocks_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./_acf-blocks.js */ "./assets/src/js/pro/_acf-blocks.js");
/* harmony import */ var _acf_blocks_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_acf_blocks_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _acf_blocks_v3_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./_acf-blocks-v3.js */ "./assets/src/js/pro/_acf-blocks-v3.js");



})();

/******/ })()
;
//# sourceMappingURL=acf-pro-blocks.js.map