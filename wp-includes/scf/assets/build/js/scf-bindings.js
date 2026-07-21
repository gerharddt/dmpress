/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./assets/src/js/bindings/block-editor.js":
/*!************************************************!*\
  !*** ./assets/src/js/bindings/block-editor.js ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_hooks__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/hooks */ "@wordpress/hooks");
/* harmony import */ var _wordpress_hooks__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_hooks__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_compose__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/compose */ "@wordpress/compose");
/* harmony import */ var _wordpress_compose__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_compose__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/block-editor */ "@wordpress/block-editor");
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./constants */ "./assets/src/js/bindings/constants.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./utils */ "./assets/src/js/bindings/utils.js");
/* harmony import */ var _hooks__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./hooks */ "./assets/src/js/bindings/hooks.js");
/**
 * WordPress dependencies
 */







/**
 * Internal dependencies
 */




/**
 * Add custom block binding controls to supported blocks.
 *
 * @since 6.5.0
 */
const withCustomControls = (0,_wordpress_compose__WEBPACK_IMPORTED_MODULE_2__.createHigherOrderComponent)(BlockEdit => {
  return props => {
    const bindableAttributes = (0,_utils__WEBPACK_IMPORTED_MODULE_7__.getBindableAttributes)(props.name);
    const {
      updateBlockBindings,
      removeAllBlockBindings
    } = (0,_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3__.useBlockBindingsUtils)();

    // Get editor context
    const {
      isSiteEditor,
      templatePostType
    } = (0,_hooks__WEBPACK_IMPORTED_MODULE_8__.useSiteEditorContext)();

    // Get fields based on editor context
    const postEditorFields = (0,_hooks__WEBPACK_IMPORTED_MODULE_8__.usePostEditorFields)();
    const {
      fields: siteEditorFields
    } = (0,_hooks__WEBPACK_IMPORTED_MODULE_8__.useSiteEditorFields)(templatePostType);

    // Use appropriate fields based on context
    const activeFields = isSiteEditor ? siteEditorFields : postEditorFields;

    // Convert fields to options format
    const allFieldOptions = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => (0,_utils__WEBPACK_IMPORTED_MODULE_7__.fieldsToOptions)(activeFields), [activeFields]);

    // Track bound fields
    const {
      boundFields,
      setBoundFields
    } = (0,_hooks__WEBPACK_IMPORTED_MODULE_8__.useBoundFields)(props.attributes);

    // Get filtered field options for a specific attribute
    const getAttributeFieldOptions = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useCallback)((attribute = null) => {
      return (0,_utils__WEBPACK_IMPORTED_MODULE_7__.getFilteredFieldOptions)(allFieldOptions, props.name, attribute);
    }, [allFieldOptions, props.name]);

    // Check if all attributes can use unified binding mode
    const canUseAllAttributesMode = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => (0,_utils__WEBPACK_IMPORTED_MODULE_7__.canUseUnifiedBinding)(props.name, bindableAttributes), [props.name, bindableAttributes]);

    // Handle field selection changes
    const handleFieldChange = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useCallback)((attribute, value) => {
      if (Array.isArray(attribute)) {
        // Handle multiple attributes at once
        const newBoundFields = {
          ...boundFields
        };
        const bindings = {};
        attribute.forEach(attr => {
          newBoundFields[attr] = value;
          bindings[attr] = value ? {
            source: _constants__WEBPACK_IMPORTED_MODULE_6__.BINDING_SOURCE,
            args: {
              key: value
            }
          } : undefined;
        });
        setBoundFields(newBoundFields);
        updateBlockBindings(bindings);
      } else {
        // Handle single attribute
        setBoundFields(prev => ({
          ...prev,
          [attribute]: value
        }));
        updateBlockBindings({
          [attribute]: value ? {
            source: _constants__WEBPACK_IMPORTED_MODULE_6__.BINDING_SOURCE,
            args: {
              key: value
            }
          } : undefined
        });
      }
    }, [boundFields, setBoundFields, updateBlockBindings]);

    // Handle reset all bindings
    const handleReset = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useCallback)(() => {
      removeAllBlockBindings();
      setBoundFields({});
    }, [removeAllBlockBindings, setBoundFields]);

    // Determine if we should show the panel
    const shouldShowPanel = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
      // In site editor, show panel if block has bindable attributes
      if (isSiteEditor) {
        return bindableAttributes && bindableAttributes.length > 0;
      }
      // In post editor, only show if we have fields available
      return allFieldOptions.length > 0 && bindableAttributes && bindableAttributes.length > 0;
    }, [isSiteEditor, allFieldOptions, bindableAttributes]);
    if (!shouldShowPanel) {
      return /*#__PURE__*/React.createElement(BlockEdit, props);
    }
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3__.InspectorControls, props, /*#__PURE__*/React.createElement(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.__experimentalToolsPanel, {
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_5__.__)('Connect to a field', 'secure-custom-fields'),
      resetAll: handleReset
    }, canUseAllAttributesMode ? /*#__PURE__*/React.createElement(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.__experimentalToolsPanelItem, {
      hasValue: () => !!boundFields[bindableAttributes[0]],
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_5__.__)('All attributes', 'secure-custom-fields'),
      onDeselect: () => handleFieldChange(bindableAttributes, null),
      isShownByDefault: true
    }, /*#__PURE__*/React.createElement(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.ComboboxControl, {
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_5__.__)('Field', 'secure-custom-fields'),
      placeholder: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_5__.__)('Select a field', 'secure-custom-fields'),
      options: getAttributeFieldOptions(),
      value: boundFields[bindableAttributes[0]] || '',
      onChange: value => handleFieldChange(bindableAttributes, value),
      __next40pxDefaultSize: true,
      __nextHasNoMarginBottom: true
    })) : bindableAttributes.map(attribute => /*#__PURE__*/React.createElement(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.__experimentalToolsPanelItem, {
      key: `scf-binding-${attribute}`,
      hasValue: () => !!boundFields[attribute],
      label: attribute,
      onDeselect: () => handleFieldChange(attribute, null),
      isShownByDefault: true
    }, /*#__PURE__*/React.createElement(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.ComboboxControl, {
      label: attribute,
      placeholder: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_5__.__)('Select a field', 'secure-custom-fields'),
      options: getAttributeFieldOptions(attribute),
      value: boundFields[attribute] || '',
      onChange: value => handleFieldChange(attribute, value),
      __next40pxDefaultSize: true,
      __nextHasNoMarginBottom: true
    }))))), /*#__PURE__*/React.createElement(BlockEdit, props));
  };
}, 'withCustomControls');
(0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_1__.addFilter)('editor.BlockEdit', 'secure-custom-fields/with-custom-controls', withCustomControls);

/***/ }),

/***/ "./assets/src/js/bindings/constants.js":
/*!*********************************************!*\
  !*** ./assets/src/js/bindings/constants.js ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BINDING_SOURCE: () => (/* binding */ BINDING_SOURCE),
/* harmony export */   BLOCK_BINDINGS_CONFIG: () => (/* binding */ BLOCK_BINDINGS_CONFIG)
/* harmony export */ });
/**
 * Block binding configuration
 *
 * Defines which SCF field types can be bound to specific block attributes.
 */
const BLOCK_BINDINGS_CONFIG = {
  'core/paragraph': {
    content: ['text', 'textarea', 'date_picker', 'number', 'range']
  },
  'core/heading': {
    content: ['text', 'textarea', 'date_picker', 'number', 'range']
  },
  'core/image': {
    id: ['image'],
    url: ['image'],
    title: ['image'],
    alt: ['image']
  },
  'core/button': {
    url: ['url'],
    text: ['text', 'checkbox', 'select', 'date_picker'],
    linkTarget: ['text', 'checkbox', 'select'],
    rel: ['text', 'checkbox', 'select']
  }
};

/**
 * Binding source identifier
 */
const BINDING_SOURCE = 'acf/field';

/***/ }),

/***/ "./assets/src/js/bindings/field-processing.js":
/*!****************************************************!*\
  !*** ./assets/src/js/bindings/field-processing.js ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   formatFieldLabel: () => (/* binding */ formatFieldLabel),
/* harmony export */   getFieldLabel: () => (/* binding */ getFieldLabel),
/* harmony export */   getSCFFields: () => (/* binding */ getSCFFields),
/* harmony export */   processFieldBinding: () => (/* binding */ processFieldBinding),
/* harmony export */   resolveImageAttribute: () => (/* binding */ resolveImageAttribute)
/* harmony export */ });
/**
 * Field processing utilities for block bindings
 *
 * @since 6.5.0
 */

/**
 * Gets the SCF fields from the post entity.
 *
 * @since 6.5.0
 *
 * @param {Object} post The post entity object.
 * @return {Object} The SCF fields object with source data.
 */
function getSCFFields(post) {
  if (!post?.acf) {
    return {};
  }

  // Extract only the _source fields which contain the formatted data
  const sourceFields = {};
  Object.entries(post.acf).forEach(([key, value]) => {
    if (key.endsWith('_source')) {
      // Remove the _source suffix to get the field name
      const fieldName = key.replace('_source', '');
      sourceFields[fieldName] = value;
    }
  });
  return sourceFields;
}

/**
 * Resolves image attribute values from an image object.
 *
 * @since 6.5.0
 *
 * @param {Object} imageObj  The image object from SCF field data.
 * @param {string} attribute The attribute to resolve (url, alt, title, id).
 * @return {string|number} The resolved attribute value.
 */
function resolveImageAttribute(imageObj, attribute) {
  if (!imageObj) {
    return '';
  }
  switch (attribute) {
    case 'url':
      return imageObj.url || '';
    case 'alt':
      return imageObj.alt || '';
    case 'title':
      return imageObj.title || '';
    case 'id':
      return imageObj.id || imageObj.ID || '';
    default:
      return '';
  }
}

/**
 * Processes a single field binding and returns its resolved value.
 *
 * @since 6.7.0
 *
 * @param {string} attribute The attribute being bound.
 * @param {Object} args      The binding arguments.
 * @param {Object} scfFields The SCF fields object.
 * @return {string} The resolved field value.
 */
function processFieldBinding(attribute, args, scfFields) {
  const fieldName = args?.key;
  const fieldConfig = scfFields[fieldName];
  if (!fieldConfig) {
    return '';
  }
  const fieldType = fieldConfig.type;
  const fieldValue = fieldConfig.formatted_value;
  switch (fieldType) {
    case 'image':
      return resolveImageAttribute(fieldValue, attribute);
    case 'checkbox':
      // For checkbox fields, join array values or return as string
      if (Array.isArray(fieldValue)) {
        return fieldValue.join(', ');
      }
      return fieldValue ? String(fieldValue) : '';
    case 'number':
    case 'range':
      return fieldValue ? String(fieldValue) : '';
    case 'date_picker':
    case 'text':
    case 'textarea':
    case 'url':
    case 'email':
    case 'select':
    default:
      return fieldValue ? String(fieldValue) : '';
  }
}

/**
 * Formats a field key into a human-readable label.
 *
 * @since 6.7.0
 *
 * @param {string} fieldKey The field key (e.g., 'my_field_name').
 * @return {string} Formatted label (e.g., 'My Field Name').
 */
function formatFieldLabel(fieldKey) {
  if (!fieldKey) {
    return '';
  }
  return fieldKey.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

/**
 * Gets the field label from metadata or formats the field key.
 *
 * @since 6.7.0
 * @param {string} fieldKey        The field key.
 * @param {Object} fieldMetadata   Optional field metadata object.
 * @param {string} defaultLabel    Optional default label to use.
 * @return {string} The field label.
 */
function getFieldLabel(fieldKey, fieldMetadata = null, defaultLabel = '') {
  if (!fieldKey) {
    return defaultLabel;
  }

  // Try to get the label from the provided metadata
  if (fieldMetadata && fieldMetadata[fieldKey]?.label) {
    return fieldMetadata[fieldKey].label;
  }

  // Fallback: format field key as a label
  return formatFieldLabel(fieldKey);
}

/***/ }),

/***/ "./assets/src/js/bindings/fieldMetadataCache.js":
/*!******************************************************!*\
  !*** ./assets/src/js/bindings/fieldMetadataCache.js ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   addFieldMetadata: () => (/* binding */ addFieldMetadata),
/* harmony export */   clearFieldMetadata: () => (/* binding */ clearFieldMetadata),
/* harmony export */   getAllFieldMetadata: () => (/* binding */ getAllFieldMetadata),
/* harmony export */   getFieldMetadata: () => (/* binding */ getFieldMetadata),
/* harmony export */   hasFieldMetadata: () => (/* binding */ hasFieldMetadata),
/* harmony export */   setFieldMetadata: () => (/* binding */ setFieldMetadata)
/* harmony export */ });
/**
 * SCF Field Metadata Cache
 *
 * @since 6.7.0
 * Simple cache for field metadata used in block bindings.
 */

let fieldMetadataCache = {};

/**
 * Set field metadata, replacing all existing data.
 *
 * @param {Object} fields - Field metadata object keyed by field key.
 */
const setFieldMetadata = fields => {
  fieldMetadataCache = fields || {};
};

/**
 * Add field metadata, merging with existing data.
 *
 * @param {Object} fields - Field metadata object keyed by field key.
 */
const addFieldMetadata = fields => {
  fieldMetadataCache = {
    ...fieldMetadataCache,
    ...fields
  };
};

/**
 * Clear all field metadata.
 */
const clearFieldMetadata = () => {
  fieldMetadataCache = {};
};

/**
 * Get field metadata for a specific field.
 *
 * @param {string} fieldKey - The field key to retrieve metadata for.
 * @return {Object|null} Field metadata object or null if not found.
 */
const getFieldMetadata = fieldKey => {
  return fieldMetadataCache[fieldKey] || null;
};

/**
 * Get all field metadata.
 *
 * @return {Object} All field metadata.
 */
const getAllFieldMetadata = () => {
  return fieldMetadataCache;
};

/**
 * Check if field metadata exists for a given key.
 *
 * @param {string} fieldKey - The field key to check.
 * @return {boolean} True if metadata exists, false otherwise.
 */
const hasFieldMetadata = fieldKey => {
  return !!fieldMetadataCache[fieldKey];
};

/***/ }),

/***/ "./assets/src/js/bindings/hooks.js":
/*!*****************************************!*\
  !*** ./assets/src/js/bindings/hooks.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useBoundFields: () => (/* binding */ useBoundFields),
/* harmony export */   usePostEditorFields: () => (/* binding */ usePostEditorFields),
/* harmony export */   useSiteEditorContext: () => (/* binding */ useSiteEditorContext),
/* harmony export */   useSiteEditorFields: () => (/* binding */ useSiteEditorFields)
/* harmony export */ });
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_core_data__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/core-data */ "@wordpress/core-data");
/* harmony import */ var _wordpress_core_data__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_core_data__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_editor__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/editor */ "@wordpress/editor");
/* harmony import */ var _wordpress_editor__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_editor__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @wordpress/api-fetch */ "@wordpress/api-fetch");
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _wordpress_url__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @wordpress/url */ "@wordpress/url");
/* harmony import */ var _wordpress_url__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_wordpress_url__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./utils */ "./assets/src/js/bindings/utils.js");
/* harmony import */ var _fieldMetadataCache__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./fieldMetadataCache */ "./assets/src/js/bindings/fieldMetadataCache.js");
/**
 * Custom hooks for block bindings
 */










/**
 * Custom hook to detect if we're in the site editor and get the template info.
 *
 * @since 6.7.0
 * @return {Object} Object containing isSiteEditor flag and templatePostType.
 */
function useSiteEditorContext() {
  return (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_1__.useSelect)(select => {
    const {
      getCurrentPostType,
      getCurrentPostId
    } = select(_wordpress_editor__WEBPACK_IMPORTED_MODULE_3__.store);
    const {
      getEditedEntityRecord
    } = select(_wordpress_core_data__WEBPACK_IMPORTED_MODULE_2__.store);
    const postType = getCurrentPostType();
    const postId = getCurrentPostId();
    const isSiteEditor = postType === 'wp_template';
    if (!isSiteEditor) {
      return {
        isSiteEditor: false,
        templatePostType: null
      };
    }
    const template = getEditedEntityRecord('postType', 'wp_template', postId);
    const templatePostType = (0,_utils__WEBPACK_IMPORTED_MODULE_6__.extractPostTypeFromTemplate)(template?.slug || '');
    return {
      isSiteEditor: true,
      templatePostType
    };
  }, []);
}

/**
 * Custom hook to get SCF fields for the current post editor context.
 *
 * @since 6.7.0
 * @return {Object} Object containing the fields map.
 */
function usePostEditorFields() {
  return (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_1__.useSelect)(select => {
    const {
      getCurrentPostType,
      getCurrentPostId
    } = select(_wordpress_editor__WEBPACK_IMPORTED_MODULE_3__.store);
    const {
      getEditedEntityRecord
    } = select(_wordpress_core_data__WEBPACK_IMPORTED_MODULE_2__.store);
    const postType = getCurrentPostType();
    const postId = getCurrentPostId();
    if (!postType || !postId || postType === 'wp_template') {
      return {};
    }
    const record = getEditedEntityRecord('postType', postType, postId);

    // Extract fields that have '_source' counterparts
    const sourcedFields = {};
    if (record?.acf) {
      Object.entries(record.acf).forEach(([key, value]) => {
        if (key.endsWith('_source')) {
          const baseFieldName = key.replace('_source', '');
          if (Object.hasOwn(record.acf, baseFieldName)) {
            sourcedFields[baseFieldName] = value;
          }
        }
      });
    }
    return sourcedFields;
  }, []);
}

/**
 * Custom hook to fetch and manage SCF field groups from the REST API.
 *
 * @since 6.7.0
 * @param {string|null} postType The post type to fetch fields for.
 * @return {Object} Object containing fields, isLoading, and error.
 */
function useSiteEditorFields(postType) {
  const [fields, setFields] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)({});
  const [isLoading, setIsLoading] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const [error, setError] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (!postType) {
      setFields({});
      setIsLoading(false);
      setError(null);
      return;
    }
    let isCancelled = false;
    setIsLoading(true);
    setError(null);
    const fetchFields = async () => {
      try {
        const path = (0,_wordpress_url__WEBPACK_IMPORTED_MODULE_5__.addQueryArgs)(`/wp/v2/types/${postType}`, {
          context: 'edit'
        });
        const postTypeData = await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_4___default()({
          path
        });
        if (isCancelled) {
          return;
        }
        const fieldsMap = (0,_utils__WEBPACK_IMPORTED_MODULE_6__.formatFieldGroupsData)(postTypeData.scf_field_groups);

        // Store field metadata in the data store
        (0,_fieldMetadataCache__WEBPACK_IMPORTED_MODULE_7__.addFieldMetadata)(fieldsMap);
        setFields(fieldsMap);
        setIsLoading(false);
      } catch (err) {
        if (!isCancelled) {
          setError(err);
          setIsLoading(false);
        }
      }
    };
    fetchFields();

    // Cleanup function to prevent state updates after unmount
    return () => {
      isCancelled = true;
    };
  }, [postType]);
  return {
    fields,
    isLoading,
    error
  };
}

/**
 * Custom hook to manage block bindings state.
 *
 * @since 6.7.0
 * @param {Object} blockAttributes The block attributes object.
 * @return {Object} Object containing boundFields and sync function.
 */
function useBoundFields(blockAttributes) {
  const [boundFields, setBoundFields] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)({});
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    const currentBindings = blockAttributes?.metadata?.bindings || {};
    const newBoundFields = {};
    Object.keys(currentBindings).forEach(attribute => {
      if (currentBindings[attribute]?.args?.key) {
        newBoundFields[attribute] = currentBindings[attribute].args.key;
      }
    });
    setBoundFields(newBoundFields);
  }, [blockAttributes?.metadata?.bindings]);
  return {
    boundFields,
    setBoundFields
  };
}

/***/ }),

/***/ "./assets/src/js/bindings/sources.js":
/*!*******************************************!*\
  !*** ./assets/src/js/bindings/sources.js ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _wordpress_blocks__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/blocks */ "@wordpress/blocks");
/* harmony import */ var _wordpress_blocks__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_blocks__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_core_data__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/core-data */ "@wordpress/core-data");
/* harmony import */ var _wordpress_core_data__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_core_data__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_editor__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/editor */ "@wordpress/editor");
/* harmony import */ var _wordpress_editor__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_editor__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _field_processing__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./field-processing */ "./assets/src/js/bindings/field-processing.js");
/* harmony import */ var _fieldMetadataCache__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./fieldMetadataCache */ "./assets/src/js/bindings/fieldMetadataCache.js");
/**
 * WordPress dependencies
 */





/**
 * Internal dependencies
 */



/**
 * Register the SCF field binding source.
 */
(0,_wordpress_blocks__WEBPACK_IMPORTED_MODULE_0__.registerBlockBindingsSource)({
  name: 'acf/field',
  label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__.__)('SCF Fields', 'secure-custom-fields'),
  getLabel({
    args,
    select
  }) {
    const fieldKey = args?.key;
    if (!fieldKey) {
      return (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__.__)('SCF Fields', 'secure-custom-fields');
    }
    const fieldMetadata = (0,_fieldMetadataCache__WEBPACK_IMPORTED_MODULE_5__.getFieldMetadata)(fieldKey);
    if (fieldMetadata?.label) {
      return fieldMetadata.label;
    }
    return (0,_field_processing__WEBPACK_IMPORTED_MODULE_4__.formatFieldLabel)(fieldKey);
  },
  getValues({
    context,
    bindings,
    select
  }) {
    const {
      getCurrentPostType
    } = select(_wordpress_editor__WEBPACK_IMPORTED_MODULE_2__.store);
    const currentPostType = getCurrentPostType();
    const isSiteEditor = currentPostType === 'wp_template';

    // In site editor, return field labels as placeholder values
    if (isSiteEditor) {
      const result = {};
      Object.entries(bindings).forEach(([attribute, {
        args
      } = {}]) => {
        const fieldKey = args?.key;
        if (!fieldKey) {
          result[attribute] = '';
          return;
        }
        const fieldMetadata = (0,_fieldMetadataCache__WEBPACK_IMPORTED_MODULE_5__.getFieldMetadata)(fieldKey);
        result[attribute] = fieldMetadata?.label || (0,_field_processing__WEBPACK_IMPORTED_MODULE_4__.formatFieldLabel)(fieldKey);
      });
      return result;
    }

    // Regular post editor - get actual field values
    const {
      getEditedEntityRecord
    } = select(_wordpress_core_data__WEBPACK_IMPORTED_MODULE_1__.store);
    const post = context?.postType && context?.postId ? getEditedEntityRecord('postType', context.postType, context.postId) : undefined;
    const scfFields = (0,_field_processing__WEBPACK_IMPORTED_MODULE_4__.getSCFFields)(post);
    const result = {};
    Object.entries(bindings).forEach(([attribute, {
      args
    } = {}]) => {
      const value = (0,_field_processing__WEBPACK_IMPORTED_MODULE_4__.processFieldBinding)(attribute, args, scfFields);
      result[attribute] = value;
    });
    return result;
  },
  canUserEditValue() {
    return false;
  }
});

/***/ }),

/***/ "./assets/src/js/bindings/utils.js":
/*!*****************************************!*\
  !*** ./assets/src/js/bindings/utils.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   canUseUnifiedBinding: () => (/* binding */ canUseUnifiedBinding),
/* harmony export */   extractPostTypeFromTemplate: () => (/* binding */ extractPostTypeFromTemplate),
/* harmony export */   fieldsToOptions: () => (/* binding */ fieldsToOptions),
/* harmony export */   formatFieldGroupsData: () => (/* binding */ formatFieldGroupsData),
/* harmony export */   getAllowedFieldTypes: () => (/* binding */ getAllowedFieldTypes),
/* harmony export */   getBindableAttributes: () => (/* binding */ getBindableAttributes),
/* harmony export */   getFilteredFieldOptions: () => (/* binding */ getFilteredFieldOptions)
/* harmony export */ });
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./constants */ "./assets/src/js/bindings/constants.js");
/**
 * Utility functions for block bindings
 */



/**
 * Gets the bindable attributes for a given block.
 *
 * @since 6.7.0
 * @param {string} blockName The name of the block.
 * @return {string[]} The bindable attributes for the block.
 */
function getBindableAttributes(blockName) {
  const config = _constants__WEBPACK_IMPORTED_MODULE_0__.BLOCK_BINDINGS_CONFIG[blockName];
  return config ? Object.keys(config) : [];
}

/**
 * Gets the allowed field types for a specific block attribute.
 *
 * @since 6.7.0
 * @param {string}      blockName The name of the block.
 * @param {string|null} attribute The attribute name, or null for all types.
 * @return {string[]|null} The allowed field types, or null if no restrictions.
 */
function getAllowedFieldTypes(blockName, attribute = null) {
  const blockConfig = _constants__WEBPACK_IMPORTED_MODULE_0__.BLOCK_BINDINGS_CONFIG[blockName];
  if (!blockConfig) {
    return null;
  }
  if (attribute) {
    return blockConfig[attribute] || null;
  }

  // Get all unique field types for the block
  return [...new Set(Object.values(blockConfig).flat())];
}

/**
 * Filters field options based on allowed field types.
 *
 * @since 6.7.0
 * @param {Array}       fieldOptions  Array of field option objects with value, label, and type.
 * @param {string}      blockName     The name of the block.
 * @param {string|null} attribute     The attribute name, or null for all types.
 * @return {Array} Filtered array of field options.
 */
function getFilteredFieldOptions(fieldOptions, blockName, attribute = null) {
  if (!fieldOptions || fieldOptions.length === 0) {
    return [];
  }
  const allowedTypes = getAllowedFieldTypes(blockName, attribute);
  if (!allowedTypes) {
    return fieldOptions;
  }
  return fieldOptions.filter(option => allowedTypes.includes(option.type));
}

/**
 * Checks if all bindable attributes for a block support the same field types.
 *
 * @since 6.7.0
 * @param {string}   blockName          The name of the block.
 * @param {string[]} bindableAttributes Array of bindable attribute names.
 * @return {boolean} True if all attributes support the same field types.
 */
function canUseUnifiedBinding(blockName, bindableAttributes) {
  if (!bindableAttributes || bindableAttributes.length <= 1) {
    return false;
  }
  const blockConfig = _constants__WEBPACK_IMPORTED_MODULE_0__.BLOCK_BINDINGS_CONFIG[blockName];
  if (!blockConfig) {
    return false;
  }
  const firstAttributeTypes = blockConfig[bindableAttributes[0]] || [];
  return bindableAttributes.every(attr => {
    const attrTypes = blockConfig[attr] || [];
    return attrTypes.length === firstAttributeTypes.length && attrTypes.every(type => firstAttributeTypes.includes(type));
  });
}

/**
 * Extracts the post type from a template slug.
 *
 * @since 6.7.0
 * @param {string} templateSlug The template slug (e.g., 'single-product', 'archive-post').
 * @return {string|null} The extracted post type, or null if not detected.
 */
function extractPostTypeFromTemplate(templateSlug) {
  if (!templateSlug) {
    return null;
  }

  // Handle single templates
  if (templateSlug.startsWith('single-')) {
    return templateSlug.replace('single-', '');
  }

  // Handle archive templates
  if (templateSlug.startsWith('archive-')) {
    return templateSlug.replace('archive-', '');
  }

  // Default single template maps to 'post'
  if (templateSlug === 'single') {
    return 'post';
  }
  return null;
}

/**
 * Formats field data from API response into a usable structure.
 *
 * @since 6.7.0
 * @param {Array} fieldGroups Array of field group objects from the API.
 * @return {Object} Formatted fields map with field name as key.
 */
function formatFieldGroupsData(fieldGroups) {
  const fieldsMap = {};
  if (!Array.isArray(fieldGroups)) {
    return fieldsMap;
  }
  fieldGroups.forEach(group => {
    if (Array.isArray(group.fields)) {
      group.fields.forEach(field => {
        fieldsMap[field.name] = {
          label: field.label,
          type: field.type
        };
      });
    }
  });
  return fieldsMap;
}

/**
 * Converts fields map to options array for ComboboxControl.
 *
 * @since 6.7.0
 * @param {Object} fieldsMap Object with field data.
 * @return {Array} Array of option objects with value, label, and type.
 */
function fieldsToOptions(fieldsMap) {
  if (!fieldsMap || Object.keys(fieldsMap).length === 0) {
    return [];
  }
  return Object.entries(fieldsMap).map(([fieldName, fieldConfig]) => ({
    value: fieldName,
    label: fieldConfig.label,
    type: fieldConfig.type
  }));
}

/***/ }),

/***/ "@wordpress/api-fetch":
/*!**********************************!*\
  !*** external ["wp","apiFetch"] ***!
  \**********************************/
/***/ ((module) => {

module.exports = window["wp"]["apiFetch"];

/***/ }),

/***/ "@wordpress/block-editor":
/*!*************************************!*\
  !*** external ["wp","blockEditor"] ***!
  \*************************************/
/***/ ((module) => {

module.exports = window["wp"]["blockEditor"];

/***/ }),

/***/ "@wordpress/blocks":
/*!********************************!*\
  !*** external ["wp","blocks"] ***!
  \********************************/
/***/ ((module) => {

module.exports = window["wp"]["blocks"];

/***/ }),

/***/ "@wordpress/components":
/*!************************************!*\
  !*** external ["wp","components"] ***!
  \************************************/
/***/ ((module) => {

module.exports = window["wp"]["components"];

/***/ }),

/***/ "@wordpress/compose":
/*!*********************************!*\
  !*** external ["wp","compose"] ***!
  \*********************************/
/***/ ((module) => {

module.exports = window["wp"]["compose"];

/***/ }),

/***/ "@wordpress/core-data":
/*!**********************************!*\
  !*** external ["wp","coreData"] ***!
  \**********************************/
/***/ ((module) => {

module.exports = window["wp"]["coreData"];

/***/ }),

/***/ "@wordpress/data":
/*!******************************!*\
  !*** external ["wp","data"] ***!
  \******************************/
/***/ ((module) => {

module.exports = window["wp"]["data"];

/***/ }),

/***/ "@wordpress/editor":
/*!********************************!*\
  !*** external ["wp","editor"] ***!
  \********************************/
/***/ ((module) => {

module.exports = window["wp"]["editor"];

/***/ }),

/***/ "@wordpress/element":
/*!*********************************!*\
  !*** external ["wp","element"] ***!
  \*********************************/
/***/ ((module) => {

module.exports = window["wp"]["element"];

/***/ }),

/***/ "@wordpress/hooks":
/*!*******************************!*\
  !*** external ["wp","hooks"] ***!
  \*******************************/
/***/ ((module) => {

module.exports = window["wp"]["hooks"];

/***/ }),

/***/ "@wordpress/i18n":
/*!******************************!*\
  !*** external ["wp","i18n"] ***!
  \******************************/
/***/ ((module) => {

module.exports = window["wp"]["i18n"];

/***/ }),

/***/ "@wordpress/url":
/*!*****************************!*\
  !*** external ["wp","url"] ***!
  \*****************************/
/***/ ((module) => {

module.exports = window["wp"]["url"];

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
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!*****************************************!*\
  !*** ./assets/src/js/bindings/index.js ***!
  \*****************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _sources_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./sources.js */ "./assets/src/js/bindings/sources.js");
/* harmony import */ var _block_editor_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./block-editor.js */ "./assets/src/js/bindings/block-editor.js");


})();

/******/ })()
;
//# sourceMappingURL=scf-bindings.js.map