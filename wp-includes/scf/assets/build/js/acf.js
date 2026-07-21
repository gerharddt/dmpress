/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./assets/src/js/_acf-hooks.js":
/*!*************************************!*\
  !*** ./assets/src/js/_acf-hooks.js ***!
  \*************************************/
/***/ (() => {

(function (window, undefined) {
  'use strict';

  /**
   * Handles managing all events for whatever you plug it into. Priorities for hooks are based on lowest to highest in
   * that, lowest priority hooks are fired first.
   */
  var EventManager = function () {
    /**
     * Maintain a reference to the object scope so our public methods never get confusing.
     */
    var MethodsAvailable = {
      removeFilter: removeFilter,
      applyFilters: applyFilters,
      addFilter: addFilter,
      removeAction: removeAction,
      doAction: doAction,
      addAction: addAction,
      storage: getStorage
    };

    /**
     * Contains the hooks that get registered with this EventManager. The array for storage utilizes a "flat"
     * object literal such that looking up the hook utilizes the native object literal hash.
     */
    var STORAGE = {
      actions: {},
      filters: {}
    };
    function getStorage() {
      return STORAGE;
    }

    /**
     * Adds an action to the event manager.
     *
     * @param action Must contain namespace.identifier
     * @param callback Must be a valid callback function before this action is added
     * @param [priority=10] Used to control when the function is executed in relation to other callbacks bound to the same hook
     * @param [context] Supply a value to be used for this
     */
    function addAction(action, callback, priority, context) {
      if (typeof action === 'string' && typeof callback === 'function') {
        priority = parseInt(priority || 10, 10);
        _addHook('actions', action, callback, priority, context);
      }
      return MethodsAvailable;
    }

    /**
     * Performs an action if it exists. You can pass as many arguments as you want to this function; the only rule is
     * that the first argument must always be the action.
     */
    function doAction(/* action, arg1, arg2, ... */
    ) {
      var args = Array.prototype.slice.call(arguments);
      var action = args.shift();
      if (typeof action === 'string') {
        _runHook('actions', action, args);
      }
      return MethodsAvailable;
    }

    /**
     * Removes the specified action if it contains a namespace.identifier & exists.
     *
     * @param action The action to remove
     * @param [callback] Callback function to remove
     */
    function removeAction(action, callback) {
      if (typeof action === 'string') {
        _removeHook('actions', action, callback);
      }
      return MethodsAvailable;
    }

    /**
     * Adds a filter to the event manager.
     *
     * @param filter Must contain namespace.identifier
     * @param callback Must be a valid callback function before this action is added
     * @param [priority=10] Used to control when the function is executed in relation to other callbacks bound to the same hook
     * @param [context] Supply a value to be used for this
     */
    function addFilter(filter, callback, priority, context) {
      if (typeof filter === 'string' && typeof callback === 'function') {
        priority = parseInt(priority || 10, 10);
        _addHook('filters', filter, callback, priority, context);
      }
      return MethodsAvailable;
    }

    /**
     * Performs a filter if it exists. You should only ever pass 1 argument to be filtered. The only rule is that
     * the first argument must always be the filter.
     */
    function applyFilters(/* filter, filtered arg, arg2, ... */
    ) {
      var args = Array.prototype.slice.call(arguments);
      var filter = args.shift();
      if (typeof filter === 'string') {
        return _runHook('filters', filter, args);
      }
      return MethodsAvailable;
    }

    /**
     * Removes the specified filter if it contains a namespace.identifier & exists.
     *
     * @param filter The action to remove
     * @param [callback] Callback function to remove
     */
    function removeFilter(filter, callback) {
      if (typeof filter === 'string') {
        _removeHook('filters', filter, callback);
      }
      return MethodsAvailable;
    }

    /**
     * Removes the specified hook by resetting the value of it.
     *
     * @param type Type of hook, either 'actions' or 'filters'
     * @param hook The hook (namespace.identifier) to remove
     * @private
     */
    function _removeHook(type, hook, callback, context) {
      if (!STORAGE[type][hook]) {
        return;
      }
      if (!callback) {
        STORAGE[type][hook] = [];
      } else {
        var handlers = STORAGE[type][hook];
        var i;
        if (!context) {
          for (i = handlers.length; i--;) {
            if (handlers[i].callback === callback) {
              handlers.splice(i, 1);
            }
          }
        } else {
          for (i = handlers.length; i--;) {
            var handler = handlers[i];
            if (handler.callback === callback && handler.context === context) {
              handlers.splice(i, 1);
            }
          }
        }
      }
    }

    /**
     * Adds the hook to the appropriate storage container
     *
     * @param type 'actions' or 'filters'
     * @param hook The hook (namespace.identifier) to add to our event manager
     * @param callback The function that will be called when the hook is executed.
     * @param priority The priority of this hook. Must be an integer.
     * @param [context] A value to be used for this
     * @private
     */
    function _addHook(type, hook, callback, priority, context) {
      var hookObject = {
        callback: callback,
        priority: priority,
        context: context
      };

      // Utilize 'prop itself' : http://jsperf.com/hasownproperty-vs-in-vs-undefined/19
      var hooks = STORAGE[type][hook];
      if (hooks) {
        hooks.push(hookObject);
        hooks = _hookInsertSort(hooks);
      } else {
        hooks = [hookObject];
      }
      STORAGE[type][hook] = hooks;
    }

    /**
     * Use an insert sort for keeping our hooks organized based on priority. This function is ridiculously faster
     * than bubble sort, etc: http://jsperf.com/javascript-sort
     *
     * @param hooks The custom array containing all of the appropriate hooks to perform an insert sort on.
     * @private
     */
    function _hookInsertSort(hooks) {
      var tmpHook, j, prevHook;
      for (var i = 1, len = hooks.length; i < len; i++) {
        tmpHook = hooks[i];
        j = i;
        while ((prevHook = hooks[j - 1]) && prevHook.priority > tmpHook.priority) {
          hooks[j] = hooks[j - 1];
          --j;
        }
        hooks[j] = tmpHook;
      }
      return hooks;
    }

    /**
     * Runs the specified hook. If it is an action, the value is not modified but if it is a filter, it is.
     *
     * @param type 'actions' or 'filters'
     * @param hook The hook ( namespace.identifier ) to be ran.
     * @param args Arguments to pass to the action/filter. If it's a filter, args is actually a single parameter.
     * @private
     */
    function _runHook(type, hook, args) {
      var handlers = STORAGE[type][hook];
      if (!handlers) {
        return type === 'filters' ? args[0] : false;
      }
      var i = 0,
        len = handlers.length;
      if (type === 'filters') {
        for (; i < len; i++) {
          args[0] = handlers[i].callback.apply(handlers[i].context, args);
        }
      } else {
        for (; i < len; i++) {
          handlers[i].callback.apply(handlers[i].context, args);
        }
      }
      return type === 'filters' ? args[0] : true;
    }

    // return all of the publicly available methods
    return MethodsAvailable;
  };

  // instantiate
  acf.hooks = new EventManager();
})(window);

/***/ }),

/***/ "./assets/src/js/_acf-modal.js":
/*!*************************************!*\
  !*** ./assets/src/js/_acf-modal.js ***!
  \*************************************/
/***/ (() => {

(function ($, undefined) {
  acf.models.Modal = acf.Model.extend({
    data: {
      title: '',
      content: '',
      toolbar: ''
    },
    events: {
      'click .acf-modal-close': 'onClickClose'
    },
    setup: function (props) {
      $.extend(this.data, props);
      this.$el = $();
      this.render();
    },
    initialize: function () {
      this.open();
    },
    render: function () {
      // Extract vars.
      var title = this.get('title');
      var content = this.get('content');
      var toolbar = this.get('toolbar');

      // Create element.
      var $el = $(['<div>', '<div class="acf-modal">', '<div class="acf-modal-title">', '<h2>' + title + '</h2>', '<button class="acf-modal-close" type="button"><span class="dashicons dashicons-no"></span></button>', '</div>', '<div class="acf-modal-content">' + content + '</div>', '<div class="acf-modal-toolbar">' + toolbar + '</div>', '</div>', '<div class="acf-modal-backdrop acf-modal-close"></div>', '</div>'].join(''));

      // Update DOM.
      if (this.$el) {
        this.$el.replaceWith($el);
      }
      this.$el = $el;

      // Trigger action.
      acf.doAction('append', $el);
    },
    update: function (props) {
      this.data = acf.parseArgs(props, this.data);
      this.render();
    },
    title: function (title) {
      this.$('.acf-modal-title h2').html(title);
    },
    content: function (content) {
      this.$('.acf-modal-content').html(content);
    },
    toolbar: function (toolbar) {
      this.$('.acf-modal-toolbar').html(toolbar);
    },
    open: function () {
      $('body').append(this.$el);
    },
    close: function () {
      this.remove();
    },
    onClickClose: function (e, $el) {
      e.preventDefault();
      this.close();
    },
    /**
     * Places focus within the popup.
     */
    focus: function () {
      this.$el.find('.acf-icon').first().trigger('focus');
    },
    /**
     * Locks focus within the modal.
     *
     * @param {boolean} locked True to lock focus, false to unlock.
     */
    lockFocusToModal: function (locked) {
      let inertElement = $('#wpwrap');
      if (!inertElement.length) {
        return;
      }
      inertElement[0].inert = locked;
      inertElement.attr('aria-hidden', locked);
    },
    /**
     * Returns focus to the element that opened the popup
     * if it still exists in the DOM.
     */
    returnFocusToOrigin: function () {
      if (this.data.openedBy instanceof $ && this.data.openedBy.closest('body').length > 0) {
        this.data.openedBy.trigger('focus');
      }
    }
  });

  /**
   * Returns a new modal.
   *
   * @date	21/4/20
   * @since	ACF 5.9.0
   *
   * @param	object props The modal props.
   * @return	object
   */
  acf.newModal = function (props) {
    return new acf.models.Modal(props);
  };
})(jQuery);

/***/ }),

/***/ "./assets/src/js/_acf-model.js":
/*!*************************************!*\
  !*** ./assets/src/js/_acf-model.js ***!
  \*************************************/
/***/ (() => {

(function ($, undefined) {
  // Cached regex to split keys for `addEvent`.
  var delegateEventSplitter = /^(\S+)\s*(.*)$/;

  /**
   *  extend
   *
   *  Helper function to correctly set up the prototype chain for subclasses
   *  Heavily inspired by backbone.js
   *
   *  @date	14/12/17
   *  @since	ACF 5.6.5
   *
   *  @param	object protoProps New properties for this object.
   *  @return	function.
   */

  var extend = function (protoProps) {
    // vars
    var Parent = this;
    var Child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent constructor.
    if (protoProps && protoProps.hasOwnProperty('constructor')) {
      Child = protoProps.constructor;
    } else {
      Child = function () {
        return Parent.apply(this, arguments);
      };
    }

    // Add static properties to the constructor function, if supplied.
    $.extend(Child, Parent);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function and add the prototype properties.
    Child.prototype = Object.create(Parent.prototype);
    $.extend(Child.prototype, protoProps);
    Child.prototype.constructor = Child;

    // Set a convenience property in case the parent's prototype is needed later.
    //Child.prototype.__parent__ = Parent.prototype;

    // return
    return Child;
  };

  /**
   *  Model
   *
   *  Base class for all inheritance
   *
   *  @date	14/12/17
   *  @since	ACF 5.6.5
   *
   *  @param	object props
   *  @return	function.
   */

  var Model = acf.Model = function () {
    // generate unique client id
    this.cid = acf.uniqueId('acf');

    // set vars to avoid modifying prototype
    this.data = $.extend(true, {}, this.data);

    // pass props to setup function
    this.setup.apply(this, arguments);

    // store on element (allow this.setup to create this.$el)
    if (this.$el && !this.$el.data('acf')) {
      this.$el.data('acf', this);
    }

    // initialize
    var initialize = function () {
      this.initialize();
      this.addEvents();
      this.addActions();
      this.addFilters();
    };

    // initialize on action
    if (this.wait && !acf.didAction(this.wait)) {
      this.addAction(this.wait, initialize);

      // initialize now
    } else {
      initialize.apply(this);
    }
  };

  // Attach all inheritable methods to the Model prototype.
  $.extend(Model.prototype, {
    // Unique model id
    id: '',
    // Unique client id
    cid: '',
    // jQuery element
    $el: null,
    // Data specific to this instance
    data: {},
    // toggle used when changing data
    busy: false,
    changed: false,
    // Setup events hooks
    events: {},
    actions: {},
    filters: {},
    // class used to avoid nested event triggers
    eventScope: '',
    // action to wait until initialize
    wait: false,
    // action priority default
    priority: 10,
    /**
     *  get
     *
     *  Gets a specific data value
     *
     *  @date	14/12/17
     *  @since	ACF 5.6.5
     *
     *  @param	string name
     *  @return	mixed
     */

    get: function (name) {
      return this.data[name];
    },
    /**
     *  has
     *
     *  Returns `true` if the data exists and is not null
     *
     *  @date	14/12/17
     *  @since	ACF 5.6.5
     *
     *  @param	string name
     *  @return	boolean
     */

    has: function (name) {
      return this.get(name) != null;
    },
    /**
     *  set
     *
     *  Sets a specific data value
     *
     *  @date	14/12/17
     *  @since	ACF 5.6.5
     *
     *  @param	string name
     *  @param	mixed value
     *  @return	this
     */

    set: function (name, value, silent) {
      // bail if unchanged
      var prevValue = this.get(name);
      if (prevValue == value) {
        return this;
      }

      // set data
      this.data[name] = value;

      // trigger events
      if (!silent) {
        this.changed = true;
        this.trigger('changed:' + name, [value, prevValue]);
        this.trigger('changed', [name, value, prevValue]);
      }

      // return
      return this;
    },
    /**
     *  inherit
     *
     *  Inherits the data from a jQuery element
     *
     *  @date	14/12/17
     *  @since	ACF 5.6.5
     *
     *  @param	jQuery $el
     *  @return	this
     */

    inherit: function (data) {
      // allow jQuery
      if (data instanceof jQuery) {
        data = data.data();
      }

      // extend
      $.extend(this.data, data);

      // return
      return this;
    },
    /**
     *  prop
     *
     *  mimics the jQuery prop function
     *
     *  @date	4/6/18
     *  @since	ACF 5.6.9
     *
     *  @param	type $var Description. Default.
     *  @return	type Description.
     */

    prop: function () {
      return this.$el.prop.apply(this.$el, arguments);
    },
    /**
     *  setup
     *
     *  Run during constructor function
     *
     *  @date	14/12/17
     *  @since	ACF 5.6.5
     *
     *  @param	n/a
     *  @return	n/a
     */

    setup: function (props) {
      $.extend(this, props);
    },
    /**
     *  initialize
     *
     *  Also run during constructor function
     *
     *  @date	14/12/17
     *  @since	ACF 5.6.5
     *
     *  @param	n/a
     *  @return	n/a
     */

    initialize: function () {},
    /**
     *  addElements
     *
     *  Adds multiple jQuery elements to this object
     *
     *  @date	9/5/18
     *  @since	ACF 5.6.9
     *
     *  @param	type $var Description. Default.
     *  @return	type Description.
     */

    addElements: function (elements) {
      elements = elements || this.elements || null;
      if (!elements || !Object.keys(elements).length) return false;
      for (var i in elements) {
        this.addElement(i, elements[i]);
      }
    },
    /**
     *  addElement
     *
     *  description
     *
     *  @date	9/5/18
     *  @since	ACF 5.6.9
     *
     *  @param	type $var Description. Default.
     *  @return	type Description.
     */

    addElement: function (name, selector) {
      this['$' + name] = this.$(selector);
    },
    /**
     *  addEvents
     *
     *  Adds multiple event handlers
     *
     *  @date	14/12/17
     *  @since	ACF 5.6.5
     *
     *  @param	object events {event1 : callback, event2 : callback, etc }
     *  @return	n/a
     */

    addEvents: function (events) {
      events = events || this.events || null;
      if (!events) return false;
      for (var key in events) {
        var match = key.match(delegateEventSplitter);
        this.on(match[1], match[2], events[key]);
      }
    },
    /**
     *  removeEvents
     *
     *  Removes multiple event handlers
     *
     *  @date	14/12/17
     *  @since	ACF 5.6.5
     *
     *  @param	object events {event1 : callback, event2 : callback, etc }
     *  @return	n/a
     */

    removeEvents: function (events) {
      events = events || this.events || null;
      if (!events) return false;
      for (var key in events) {
        var match = key.match(delegateEventSplitter);
        this.off(match[1], match[2], events[key]);
      }
    },
    /**
     *  getEventTarget
     *
     *  Returns a jQuery element to trigger an event on.
     *
     *  @date	5/6/18
     *  @since	ACF 5.6.9
     *
     *  @param	jQuery $el		The default jQuery element. Optional.
     *  @param	string event	The event name. Optional.
     *  @return	jQuery
     */

    getEventTarget: function ($el, event) {
      return $el || this.$el || $(document);
    },
    /**
     *  validateEvent
     *
     *  Returns true if the event target's closest $el is the same as this.$el
     *  Requires both this.el and this.$el to be defined
     *
     *  @date	5/6/18
     *  @since	ACF 5.6.9
     *
     *  @param	type $var Description. Default.
     *  @return	type Description.
     */

    validateEvent: function (e) {
      if (this.eventScope) {
        return $(e.target).closest(this.eventScope).is(this.$el);
      } else {
        return true;
      }
    },
    /**
     *  proxyEvent
     *
     *  Returns a new event callback function scoped to this model
     *
     *  @date	29/3/18
     *  @since	ACF 5.6.9
     *
     *  @param	function callback
     *  @return	function
     */

    proxyEvent: function (callback) {
      return this.proxy(function (e) {
        // validate
        if (!this.validateEvent(e)) {
          return;
        }

        // construct args
        var args = acf.arrayArgs(arguments);
        var extraArgs = args.slice(1);
        var eventArgs = [e, $(e.currentTarget)].concat(extraArgs);

        // callback
        callback.apply(this, eventArgs);
      });
    },
    /**
     *  on
     *
     *  Adds an event handler similar to jQuery
     *  Uses the instance 'cid' to namespace event
     *
     *  @date	14/12/17
     *  @since	ACF 5.6.5
     *
     *  @param	string name
     *  @param	string callback
     *  @return	n/a
     */

    on: function (a1, a2, a3, a4) {
      // vars
      var $el, event, selector, callback, args;

      // find args
      if (a1 instanceof jQuery) {
        // 1. args( $el, event, selector, callback )
        if (a4) {
          $el = a1;
          event = a2;
          selector = a3;
          callback = a4;

          // 2. args( $el, event, callback )
        } else {
          $el = a1;
          event = a2;
          callback = a3;
        }
      } else {
        // 3. args( event, selector, callback )
        if (a3) {
          event = a1;
          selector = a2;
          callback = a3;

          // 4. args( event, callback )
        } else {
          event = a1;
          callback = a2;
        }
      }

      // element
      $el = this.getEventTarget($el);

      // modify callback
      if (typeof callback === 'string') {
        callback = this.proxyEvent(this[callback]);
      }

      // modify event
      event = event + '.' + this.cid;

      // args
      if (selector) {
        args = [event, selector, callback];
      } else {
        args = [event, callback];
      }

      // on()
      $el.on.apply($el, args);
    },
    /**
     *  off
     *
     *  Removes an event handler similar to jQuery
     *
     *  @date	14/12/17
     *  @since	ACF 5.6.5
     *
     *  @param	string name
     *  @param	string callback
     *  @return	n/a
     */

    off: function (a1, a2, a3) {
      // vars
      var $el, event, selector, args;

      // find args
      if (a1 instanceof jQuery) {
        // 1. args( $el, event, selector )
        if (a3) {
          $el = a1;
          event = a2;
          selector = a3;

          // 2. args( $el, event )
        } else {
          $el = a1;
          event = a2;
        }
      } else {
        // 3. args( event, selector )
        if (a2) {
          event = a1;
          selector = a2;

          // 4. args( event )
        } else {
          event = a1;
        }
      }

      // element
      $el = this.getEventTarget($el);

      // modify event
      event = event + '.' + this.cid;

      // args
      if (selector) {
        args = [event, selector];
      } else {
        args = [event];
      }

      // off()
      $el.off.apply($el, args);
    },
    /**
     *  trigger
     *
     *  Triggers an event similar to jQuery
     *
     *  @date	14/12/17
     *  @since	ACF 5.6.5
     *
     *  @param	string name
     *  @param	string callback
     *  @return	n/a
     */

    trigger: function (name, args, bubbles) {
      var $el = this.getEventTarget();
      if (bubbles) {
        $el.trigger.apply($el, arguments);
      } else {
        $el.triggerHandler.apply($el, arguments);
      }
      return this;
    },
    /**
     *  addActions
     *
     *  Adds multiple action handlers
     *
     *  @date	14/12/17
     *  @since	ACF 5.6.5
     *
     *  @param	object actions {action1 : callback, action2 : callback, etc }
     *  @return	n/a
     */

    addActions: function (actions) {
      actions = actions || this.actions || null;
      if (!actions) return false;
      for (var i in actions) {
        this.addAction(i, actions[i]);
      }
    },
    /**
     *  removeActions
     *
     *  Removes multiple action handlers
     *
     *  @date	14/12/17
     *  @since	ACF 5.6.5
     *
     *  @param	object actions {action1 : callback, action2 : callback, etc }
     *  @return	n/a
     */

    removeActions: function (actions) {
      actions = actions || this.actions || null;
      if (!actions) return false;
      for (var i in actions) {
        this.removeAction(i, actions[i]);
      }
    },
    /**
     *  addAction
     *
     *  Adds an action using the wp.hooks library
     *
     *  @date	14/12/17
     *  @since	ACF 5.6.5
     *
     *  @param	string name
     *  @param	string callback
     *  @return	n/a
     */

    addAction: function (name, callback, priority) {
      //console.log('addAction', name, priority);
      // defaults
      priority = priority || this.priority;

      // modify callback
      if (typeof callback === 'string') {
        callback = this[callback];
      }

      // add
      acf.addAction(name, callback, priority, this);
    },
    /**
     *  removeAction
     *
     *  Remove an action using the wp.hooks library
     *
     *  @date	14/12/17
     *  @since	ACF 5.6.5
     *
     *  @param	string name
     *  @param	string callback
     *  @return	n/a
     */

    removeAction: function (name, callback) {
      acf.removeAction(name, this[callback]);
    },
    /**
     *  addFilters
     *
     *  Adds multiple filter handlers
     *
     *  @date	14/12/17
     *  @since	ACF 5.6.5
     *
     *  @param	object filters {filter1 : callback, filter2 : callback, etc }
     *  @return	n/a
     */

    addFilters: function (filters) {
      filters = filters || this.filters || null;
      if (!filters) return false;
      for (var i in filters) {
        this.addFilter(i, filters[i]);
      }
    },
    /**
     *  addFilter
     *
     *  Adds a filter using the wp.hooks library
     *
     *  @date	14/12/17
     *  @since	ACF 5.6.5
     *
     *  @param	string name
     *  @param	string callback
     *  @return	n/a
     */

    addFilter: function (name, callback, priority) {
      // defaults
      priority = priority || this.priority;

      // modify callback
      if (typeof callback === 'string') {
        callback = this[callback];
      }

      // add
      acf.addFilter(name, callback, priority, this);
    },
    /**
     *  removeFilters
     *
     *  Removes multiple filter handlers
     *
     *  @date	14/12/17
     *  @since	ACF 5.6.5
     *
     *  @param	object filters {filter1 : callback, filter2 : callback, etc }
     *  @return	n/a
     */

    removeFilters: function (filters) {
      filters = filters || this.filters || null;
      if (!filters) return false;
      for (var i in filters) {
        this.removeFilter(i, filters[i]);
      }
    },
    /**
     *  removeFilter
     *
     *  Remove a filter using the wp.hooks library
     *
     *  @date	14/12/17
     *  @since	ACF 5.6.5
     *
     *  @param	string name
     *  @param	string callback
     *  @return	n/a
     */

    removeFilter: function (name, callback) {
      acf.removeFilter(name, this[callback]);
    },
    /**
     *  $
     *
     *  description
     *
     *  @date	16/12/17
     *  @since	ACF 5.6.5
     *
     *  @param	type $var Description. Default.
     *  @return	type Description.
     */

    $: function (selector) {
      return this.$el.find(selector);
    },
    /**
     *  remove
     *
     *  Removes the element and listeners
     *
     *  @date	19/12/17
     *  @since	ACF 5.6.5
     *
     *  @param	type $var Description. Default.
     *  @return	type Description.
     */

    remove: function () {
      this.removeEvents();
      this.removeActions();
      this.removeFilters();
      this.$el.remove();
    },
    /**
     *  setTimeout
     *
     *  description
     *
     *  @date	16/1/18
     *  @since	ACF 5.6.5
     *
     *  @param	type $var Description. Default.
     *  @return	type Description.
     */

    setTimeout: function (callback, milliseconds) {
      return setTimeout(this.proxy(callback), milliseconds);
    },
    /**
     *  time
     *
     *  used for debugging
     *
     *  @date	7/3/18
     *  @since	ACF 5.6.9
     *
     *  @param	type $var Description. Default.
     *  @return	type Description.
     */

    time: function () {
      console.time(this.id || this.cid);
    },
    /**
     *  timeEnd
     *
     *  used for debugging
     *
     *  @date	7/3/18
     *  @since	ACF 5.6.9
     *
     *  @param	type $var Description. Default.
     *  @return	type Description.
     */

    timeEnd: function () {
      console.timeEnd(this.id || this.cid);
    },
    /**
     *  show
     *
     *  description
     *
     *  @date	15/3/18
     *  @since	ACF 5.6.9
     *
     *  @param	type $var Description. Default.
     *  @return	type Description.
     */

    show: function () {
      acf.show(this.$el);
    },
    /**
     *  hide
     *
     *  description
     *
     *  @date	15/3/18
     *  @since	ACF 5.6.9
     *
     *  @param	type $var Description. Default.
     *  @return	type Description.
     */

    hide: function () {
      acf.hide(this.$el);
    },
    /**
     *  proxy
     *
     *  Returns a new function scoped to this model
     *
     *  @date	29/3/18
     *  @since	ACF 5.6.9
     *
     *  @param	function callback
     *  @return	function
     */

    proxy: function (callback) {
      return $.proxy(callback, this);
    }
  });

  // Set up inheritance for the model
  Model.extend = extend;

  // Global model storage
  acf.models = {};

  /**
   *  acf.getInstance
   *
   *  This function will get an instance from an element
   *
   *  @date	5/3/18
   *  @since	ACF 5.6.9
   *
   *  @param	type $var Description. Default.
   *  @return	type Description.
   */

  acf.getInstance = function ($el) {
    return $el.data('acf');
  };

  /**
   *  acf.getInstances
   *
   *  This function will get an array of instances from multiple elements
   *
   *  @date	5/3/18
   *  @since	ACF 5.6.9
   *
   *  @param	type $var Description. Default.
   *  @return	type Description.
   */

  acf.getInstances = function ($el) {
    var instances = [];
    $el.each(function () {
      instances.push(acf.getInstance($(this)));
    });
    return instances;
  };
})(jQuery);

/***/ }),

/***/ "./assets/src/js/_acf-notice.js":
/*!**************************************!*\
  !*** ./assets/src/js/_acf-notice.js ***!
  \**************************************/
/***/ (() => {

(function ($, undefined) {
  var Notice = acf.Model.extend({
    data: {
      text: '',
      type: '',
      timeout: 0,
      dismiss: true,
      target: false,
      location: 'before',
      close: function () {}
    },
    events: {
      'click .acf-notice-dismiss': 'onClickClose'
    },
    tmpl: function () {
      return '<div class="acf-notice"></div>';
    },
    setup: function (props) {
      $.extend(this.data, props);
      this.$el = $(this.tmpl());
    },
    initialize: function () {
      // render
      this.render();

      // show
      this.show();
    },
    render: function () {
      // class
      this.type(this.get('type'));

      // text
      this.html('<p>' + acf.escHtml(this.get('text')) + '</p>');

      // close
      if (this.get('dismiss')) {
        this.$el.append('<a href="#" class="acf-notice-dismiss acf-icon -cancel small"></a>');
        this.$el.addClass('-dismiss');
      }

      // timeout
      var timeout = this.get('timeout');
      if (timeout) {
        this.away(timeout);
      }
    },
    update: function (props) {
      // update
      $.extend(this.data, props);

      // re-initialize
      this.initialize();

      // refresh events
      this.removeEvents();
      this.addEvents();
    },
    show: function () {
      var $target = this.get('target');
      var location = this.get('location');
      if ($target) {
        if (location === 'after') {
          $target.append(this.$el);
        } else {
          $target.prepend(this.$el);
        }
      }
    },
    hide: function () {
      this.$el.remove();
    },
    away: function (timeout) {
      this.setTimeout(function () {
        acf.remove(this.$el);
      }, timeout);
    },
    type: function (type) {
      // remove prev type
      var prevType = this.get('type');
      if (prevType) {
        this.$el.removeClass('-' + prevType);
      }

      // add new type
      this.$el.addClass('-' + type);

      // backwards compatibility
      if (type == 'error') {
        this.$el.addClass('acf-error-message');
      }
    },
    html: function (html) {
      this.$el.html(acf.escHtml(html));
    },
    text: function (text) {
      this.$('p').html(acf.escHtml(text));
    },
    onClickClose: function (e, $el) {
      e.preventDefault();
      this.get('close').apply(this, arguments);
      this.remove();
    }
  });
  acf.newNotice = function (props) {
    // ensure object
    if (typeof props !== 'object') {
      props = {
        text: props
      };
    }

    // instantiate
    return new Notice(props);
  };
  var noticeManager = new acf.Model({
    wait: 'prepare',
    priority: 1,
    initialize: function () {
      const $notices = $('.acf-admin-notice');
      if (!$notices.length) {
        return;
      }
      $notices.each(function () {
        if ($(this).data('persisted')) {
          let dismissed = acf.getPreference('dismissed-notices');
          if (dismissed && typeof dismissed == 'object' && dismissed.includes($(this).data('persist-id'))) {
            $(this).remove();
          } else {
            $(this).show();
            $(this).on('click', '.notice-dismiss', function (e) {
              dismissed = acf.getPreference('dismissed-notices');
              if (!dismissed || typeof dismissed != 'object') {
                dismissed = [];
              }
              dismissed.push($(this).closest('.acf-admin-notice').data('persist-id'));
              acf.setPreference('dismissed-notices', dismissed);
            });
          }
        }
      });
    }
  });
})(jQuery);

/***/ }),

/***/ "./assets/src/js/_acf-panel.js":
/*!*************************************!*\
  !*** ./assets/src/js/_acf-panel.js ***!
  \*************************************/
/***/ (() => {

(function ($, undefined) {
  var panel = new acf.Model({
    events: {
      'click .acf-panel-title': 'onClick'
    },
    onClick: function (e, $el) {
      e.preventDefault();
      this.toggle($el.parent());
    },
    isOpen: function ($el) {
      return $el.hasClass('-open');
    },
    toggle: function ($el) {
      this.isOpen($el) ? this.close($el) : this.open($el);
    },
    open: function ($el) {
      $el.addClass('-open');
      $el.find('.acf-panel-title i').attr('class', 'dashicons dashicons-arrow-down');
    },
    close: function ($el) {
      $el.removeClass('-open');
      $el.find('.acf-panel-title i').attr('class', 'dashicons dashicons-arrow-right');
    }
  });
})(jQuery);

/***/ }),

/***/ "./assets/src/js/_acf-popup.js":
/*!*************************************!*\
  !*** ./assets/src/js/_acf-popup.js ***!
  \*************************************/
/***/ (() => {

(function ($, undefined) {
  acf.models.Popup = acf.Model.extend({
    data: {
      title: '',
      content: '',
      width: 0,
      height: 0,
      loading: false,
      openedBy: null,
      confirmRemove: false
    },
    events: {
      'click [data-event="close"]': 'onClickClose',
      'click .acf-close-popup': 'onClickClose',
      keydown: 'onPressEscapeClose'
    },
    setup: function (props) {
      $.extend(this.data, props);
      this.$el = $(this.tmpl());
    },
    initialize: function () {
      this.render();
      this.open();
      this.focus();
      this.lockFocusToPopup(true);
    },
    tmpl: function () {
      return ['<div id="acf-popup" role="dialog" tabindex="-1">', '<div class="acf-popup-box acf-box">', '<div class="title"><h3></h3><a href="#" class="acf-icon -cancel grey" data-event="close" aria-label="' + acf.__('Close modal') + '"></a></div>', '<div class="inner"></div>', '<div class="loading"><i class="acf-loading"></i></div>', '</div>', '<div class="bg" data-event="close"></div>', '</div>'].join('');
    },
    render: function () {
      // Extract Vars.
      var title = this.get('title');
      var content = this.get('content');
      var loading = this.get('loading');
      var width = this.get('width');
      var height = this.get('height');

      // Update.
      this.title(title);
      this.content(content);
      if (width) {
        this.$('.acf-popup-box').css('width', width);
      }
      if (height) {
        this.$('.acf-popup-box').css('min-height', height);
      }
      this.loading(loading);

      // Trigger action.
      acf.doAction('append', this.$el);
    },
    /**
     * Places focus within the popup.
     */
    focus: function () {
      this.$el.find('.acf-icon').first().trigger('focus');
    },
    /**
     * Locks focus within the popup.
     *
     * @param {boolean} locked True to lock focus, false to unlock.
     */
    lockFocusToPopup: function (locked) {
      let inertElement = $('#wpwrap');
      if (!inertElement.length) {
        return;
      }
      inertElement[0].inert = locked;
      inertElement.attr('aria-hidden', locked);
    },
    update: function (props) {
      this.data = acf.parseArgs(props, this.data);
      this.render();
    },
    title: function (title) {
      this.$('.title:first h3').html(title);
    },
    content: function (content) {
      this.$('.inner:first').html(content);
    },
    loading: function (show) {
      var $loading = this.$('.loading:first');
      show ? $loading.show() : $loading.hide();
    },
    open: function () {
      $('body').append(this.$el);
    },
    close: function () {
      this.lockFocusToPopup(false);
      this.returnFocusToOrigin();
      this.remove();
    },
    onClickClose: function (e, $el) {
      e.preventDefault();
      this.close();
    },
    /**
     * Closes the popup when the escape key is pressed.
     *
     * @param {KeyboardEvent} e
     */
    onPressEscapeClose: function (e) {
      if (e.key === 'Escape') {
        this.close();
      }
    },
    /**
     * Returns focus to the element that opened the popup
     * if it still exists in the DOM.
     */
    returnFocusToOrigin: function () {
      if (this.data.openedBy instanceof $ && this.data.openedBy.closest('body').length > 0) {
        this.data.openedBy.trigger('focus');
      }
    }
  });

  /**
   *  PopupConfirm
   *
   *  Extends the Popup model to provide confirmation functionality
   *
   *  @date	17/12/17
   *  @since	ACF 5.6.5
   */

  acf.models.PopupConfirm = acf.models.Popup.extend({
    data: {
      text: '',
      textConfirm: '',
      textCancel: '',
      context: false,
      confirm: function () {},
      cancel: function () {}
    },
    events: {
      'click [data-event="close"]': 'onCancel',
      'click .acf-close-popup': 'onClickClose',
      keydown: 'onPressEscapeClose',
      'click [data-event="confirm"]': 'onConfirm'
    },
    tmpl: function () {
      return `
            <div id="acf-popup" role="dialog" tabindex="-1">
                <div class="acf-popup-box acf-box acf-confirm-popup">
                    <div class="title">
                        <h3>${this.get('title')}</h3>
                        <a href="#" data-event="close" aria-label="${acf.__('Close modal')}">
                            <i class="acf-icon -close"></i>
                        </a>
                    </div>
                    <div class="inner">
                        <p>${acf.escHtml(this.get('text'))}</p>
                        <div class="acf-actions">
                            <button tabindex="0" type="button" data-event="close" class="acf-btn acf-btn-secondary acf-close-popup">${acf.strEscape(this.get('textCancel'))}</button>
                            <button tabindex="0" type="submit" data-event="confirm" class="acf-btn acf-btn-primary acf-confirm">${acf.strEscape(this.get('textConfirm'))}</button>
                        </div>
                    </div>
                </div>
                <div class="bg" data-event="close"></div>
            </div>`;
    },
    render: function () {
      const loading = this.get('loading');
      const width = this.get('width');
      const height = this.get('height');
      const self = this;
      if (width) {
        this.$('.acf-popup-box').css('width', width);
      }
      if (height) {
        this.$('.acf-popup-box').css('min-height', height);
      }
      this.loading(loading);
      acf.doAction('append', this.$el);
      setTimeout(function () {
        self.$el.find('.acf-close-popup').trigger('focus');
      }, 1);
    },
    onConfirm: function (e, $el) {
      e.preventDefault();
      e.stopPropagation();
      this.close();
      const confirm = this.get('confirm');
      const context = this.get('context') || this;
      confirm.apply(context, arguments);
    },
    onCancel: function (e, $el) {
      e.preventDefault();
      e.stopPropagation();
      this.close();
      const cancel = this.get('cancel');
      const context = this.get('context') || this;
      cancel.apply(context, arguments);
    }
  });

  /**
   *  newPopup
   *
   *  Creates a new Popup with the supplied props
   *
   *  @date	17/12/17
   *  @since	ACF 5.6.5
   *
   *  @param	object props
   *  @return	object
   */

  acf.newPopup = function (props) {
    return props.confirmRemove ? new acf.models.PopupConfirm(props) : new acf.models.Popup(props);
  };
})(jQuery);

/***/ }),

/***/ "./assets/src/js/_acf-tooltip.js":
/*!***************************************!*\
  !*** ./assets/src/js/_acf-tooltip.js ***!
  \***************************************/
/***/ (() => {

(function ($, undefined) {
  acf.newTooltip = function (props) {
    // ensure object
    if (typeof props !== 'object') {
      props = {
        text: props
      };
    }

    // confirmRemove
    if (props.confirmRemove !== undefined) {
      props.textConfirm = acf.__('Remove');
      props.textCancel = acf.__('Cancel');
      return new TooltipConfirm(props);

      // confirm
    } else if (props.confirm !== undefined) {
      return new TooltipConfirm(props);

      // default
    } else {
      return new Tooltip(props);
    }
  };
  var Tooltip = acf.Model.extend({
    data: {
      text: '',
      timeout: 0,
      target: null
    },
    tmpl: function () {
      return '<div class="acf-tooltip"></div>';
    },
    setup: function (props) {
      $.extend(this.data, props);
      this.$el = $(this.tmpl());
    },
    initialize: function () {
      // render
      this.render();

      // append
      this.show();

      // position
      this.position();

      // timeout
      var timeout = this.get('timeout');
      if (timeout) {
        setTimeout($.proxy(this.fade, this), timeout);
      }
    },
    update: function (props) {
      $.extend(this.data, props);
      this.initialize();
    },
    render: function () {
      this.$el.text(this.get('text'));
    },
    show: function () {
      $('body').append(this.$el);
    },
    hide: function () {
      this.$el.remove();
    },
    fade: function () {
      // add class
      this.$el.addClass('acf-fade-up');

      // remove
      this.setTimeout(function () {
        this.remove();
      }, 250);
    },
    html: function (html) {
      this.$el.html(html);
    },
    position: function () {
      // vars
      var $tooltip = this.$el;
      var $target = this.get('target');
      if (!$target) return;

      // Reset position.
      $tooltip.removeClass('right left bottom top').css({
        top: 0,
        left: 0
      });

      // Declare tolerance to edge of screen.
      var tolerance = 10;

      // Find target position.
      var targetWidth = $target.outerWidth();
      var targetHeight = $target.outerHeight();
      var targetTop = $target.offset().top;
      var targetLeft = $target.offset().left;

      // Find tooltip position.
      var tooltipWidth = $tooltip.outerWidth();
      var tooltipHeight = $tooltip.outerHeight();
      var tooltipTop = $tooltip.offset().top; // Should be 0, but WP media grid causes this to be 32 (toolbar padding).

      // Assume default top alignment.
      var top = targetTop - tooltipHeight - tooltipTop;
      var left = targetLeft + targetWidth / 2 - tooltipWidth / 2;

      // Check if too far left.
      if (left < tolerance) {
        $tooltip.addClass('right');
        left = targetLeft + targetWidth;
        top = targetTop + targetHeight / 2 - tooltipHeight / 2 - tooltipTop;

        // Check if too far right.
      } else if (left + tooltipWidth + tolerance > $(window).width()) {
        $tooltip.addClass('left');
        left = targetLeft - tooltipWidth;
        top = targetTop + targetHeight / 2 - tooltipHeight / 2 - tooltipTop;

        // Check if too far up.
      } else if (top - $(window).scrollTop() < tolerance) {
        $tooltip.addClass('bottom');
        top = targetTop + targetHeight - tooltipTop;

        // No collision with edges.
      } else {
        $tooltip.addClass('top');
      }

      // update css
      $tooltip.css({
        top: top,
        left: left
      });
    }
  });
  var TooltipConfirm = Tooltip.extend({
    data: {
      text: '',
      textConfirm: '',
      textCancel: '',
      target: null,
      targetConfirm: true,
      confirm: function () {},
      cancel: function () {},
      context: false
    },
    events: {
      'click [data-event="cancel"]': 'onCancel',
      'click [data-event="confirm"]': 'onConfirm'
    },
    addEvents: function () {
      // add events
      acf.Model.prototype.addEvents.apply(this);

      // vars
      var $document = $(document);
      var $target = this.get('target');

      // add global 'cancel' click event
      // - use timeout to avoid the current 'click' event triggering the onCancel function
      this.setTimeout(function () {
        this.on($document, 'click', 'onCancel');
      });

      // add target 'confirm' click event
      // - allow setting to control this feature
      if (this.get('targetConfirm')) {
        this.on($target, 'click', 'onConfirm');
      }
    },
    removeEvents: function () {
      // remove events
      acf.Model.prototype.removeEvents.apply(this);

      // vars
      var $document = $(document);
      var $target = this.get('target');

      // remove custom events
      this.off($document, 'click');
      this.off($target, 'click');
    },
    render: function () {
      // defaults
      var text = this.get('text') || acf.__('Are you sure?');
      var textConfirm = this.get('textConfirm') || acf.__('Yes');
      var textCancel = this.get('textCancel') || acf.__('No');

      // html
      var html = [text, '<a href="#" data-event="confirm">' + textConfirm + '</a>', '<a href="#" data-event="cancel">' + textCancel + '</a>'].join(' ');

      // html
      this.html(html);

      // class
      this.$el.addClass('-confirm');
    },
    onCancel: function (e, $el) {
      // prevent default
      e.preventDefault();
      e.stopImmediatePropagation();

      // callback
      var callback = this.get('cancel');
      var context = this.get('context') || this;
      callback.apply(context, arguments);

      //remove
      this.remove();
    },
    onConfirm: function (e, $el) {
      // Prevent event from propagating completely to allow "targetConfirm" to be clicked.
      e.preventDefault();
      e.stopImmediatePropagation();

      // callback
      var callback = this.get('confirm');
      var context = this.get('context') || this;
      callback.apply(context, arguments);

      //remove
      this.remove();
    }
  });

  // storage
  acf.models.Tooltip = Tooltip;
  acf.models.TooltipConfirm = TooltipConfirm;

  /**
   *  tooltipManager
   *
   *  description
   *
   *  @date	17/4/18
   *  @since	ACF 5.6.9
   *
   *  @param	type $var Description. Default.
   *  @return	type Description.
   */

  var tooltipHoverHelper = new acf.Model({
    tooltip: false,
    events: {
      'mouseenter .acf-js-tooltip': 'showTitle',
      'mouseup .acf-js-tooltip': 'hideTitle',
      'mouseleave .acf-js-tooltip': 'hideTitle',
      'focus .acf-js-tooltip': 'showTitle',
      'blur .acf-js-tooltip': 'hideTitle',
      'keyup .acf-js-tooltip': 'onKeyUp'
    },
    showTitle: function (e, $el) {
      // vars
      let title = $el.attr('title');

      // bail early if no title
      if (!title) {
        return;
      }

      // clear title to avoid default browser tooltip
      $el.attr('title', '');
      $el.data('acf-js-tooltip-title', title);
      title = acf.strEscape(title);

      // create
      if (!this.tooltip) {
        this.tooltip = acf.newTooltip({
          text: title,
          target: $el
        });

        // update
      } else {
        this.tooltip.update({
          text: title,
          target: $el
        });
      }
    },
    hideTitle: function (e, $el) {
      // hide tooltip
      this.tooltip.hide();
      $el.attr('title', $el.data('acf-js-tooltip-title'));

      // restore title
      $el.removeData('acf-js-tooltip-title');
    },
    onKeyUp: function (e, $el) {
      if ('Escape' === e.key) {
        this.hideTitle(e, $el);
      }
    }
  });
})(jQuery);

/***/ }),

/***/ "./assets/src/js/_acf.js":
/*!*******************************!*\
  !*** ./assets/src/js/_acf.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

(function ($, undefined) {
  /**
   *  acf
   *
   *  description
   *
   *  @date	14/12/17
   *  @since	ACF 5.6.5
   *
   *  @param	type $var Description. Default.
   *  @return	type Description.
   */

  // The global acf object
  var acf = {};

  // Set as a browser global
  window.acf = acf;

  /** @var object Data sent from PHP */
  acf.data = {};

  /**
   *  get
   *
   *  Gets a specific data value
   *
   *  @date	14/12/17
   *  @since	ACF 5.6.5
   *
   *  @param	string name
   *  @return	mixed
   */

  acf.get = function (name) {
    return this.data[name] || null;
  };

  /**
   *  has
   *
   *  Returns `true` if the data exists and is not null
   *
   *  @date	14/12/17
   *  @since	ACF 5.6.5
   *
   *  @param	string name
   *  @return	boolean
   */

  acf.has = function (name) {
    return this.get(name) !== null;
  };

  /**
   *  set
   *
   *  Sets a specific data value
   *
   *  @date	14/12/17
   *  @since	ACF 5.6.5
   *
   *  @param	string name
   *  @param	mixed value
   *  @return	this
   */

  acf.set = function (name, value) {
    this.data[name] = value;
    return this;
  };

  /**
   *  uniqueId
   *
   *  Returns a unique ID
   *
   *  @date	9/11/17
   *  @since	ACF 5.6.3
   *
   *  @param	string prefix Optional prefix.
   *  @return	string
   */

  var idCounter = 0;
  acf.uniqueId = function (prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  /**
   *  acf.uniqueArray
   *
   *  Returns a new array with only unique values
   *  Credit: https://stackoverflow.com/questions/1960473/get-all-unique-values-in-an-array-remove-duplicates
   *
   *  @date	23/3/18
   *  @since	ACF 5.6.9
   *
   *  @param	type $var Description. Default.
   *  @return	type Description.
   */

  acf.uniqueArray = function (array) {
    function onlyUnique(value, index, self) {
      return self.indexOf(value) === index;
    }
    return array.filter(onlyUnique);
  };

  /**
   *  uniqid
   *
   *  Returns a unique ID (PHP version)
   *
   *  @date	9/11/17
   *  @since	ACF 5.6.3
   *  @source	http://locutus.io/php/misc/uniqid/
   *
   *  @param	string prefix Optional prefix.
   *  @return	string
   */

  var uniqidSeed = '';
  acf.uniqid = function (prefix, moreEntropy) {
    //  discuss at: http://locutus.io/php/uniqid/
    // original by: Kevin van Zonneveld (http://kvz.io)
    //  revised by: Kankrelune (http://www.webfaktory.info/)
    //      note 1: Uses an internal counter (in locutus global) to avoid collision
    //   example 1: var $id = uniqid()
    //   example 1: var $result = $id.length === 13
    //   returns 1: true
    //   example 2: var $id = uniqid('foo')
    //   example 2: var $result = $id.length === (13 + 'foo'.length)
    //   returns 2: true
    //   example 3: var $id = uniqid('bar', true)
    //   example 3: var $result = $id.length === (23 + 'bar'.length)
    //   returns 3: true
    if (typeof prefix === 'undefined') {
      prefix = '';
    }
    var retId;
    var formatSeed = function (seed, reqWidth) {
      seed = parseInt(seed, 10).toString(16); // to hex str
      if (reqWidth < seed.length) {
        // so long we split
        return seed.slice(seed.length - reqWidth);
      }
      if (reqWidth > seed.length) {
        // so short we pad
        return Array(1 + (reqWidth - seed.length)).join('0') + seed;
      }
      return seed;
    };
    if (!uniqidSeed) {
      // init seed with big random int
      uniqidSeed = Math.floor(Math.random() * 0x75bcd15);
    }
    uniqidSeed++;
    retId = prefix; // start with prefix, add current milliseconds hex string
    retId += formatSeed(parseInt(new Date().getTime() / 1000, 10), 8);
    retId += formatSeed(uniqidSeed, 5); // add seed hex string
    if (moreEntropy) {
      // for more entropy we add a float lower to 10
      retId += (Math.random() * 10).toFixed(8).toString();
    }
    return retId;
  };

  /**
   *  strReplace
   *
   *  Performs a string replace
   *
   *  @date	14/12/17
   *  @since	ACF 5.6.5
   *
   *  @param	string search
   *  @param	string replace
   *  @param	string subject
   *  @return	string
   */

  acf.strReplace = function (search, replace, subject) {
    return subject.split(search).join(replace);
  };

  /**
   *  strCamelCase
   *
   *  Converts a string into camelCase
   *  Thanks to https://stackoverflow.com/questions/2970525/converting-any-string-into-camel-case
   *
   *  @date	14/12/17
   *  @since	ACF 5.6.5
   *
   *  @param	string str
   *  @return	string
   */

  acf.strCamelCase = function (str) {
    var matches = str.match(/([a-zA-Z0-9]+)/g);
    return matches ? matches.map(function (s, i) {
      var c = s.charAt(0);
      return (i === 0 ? c.toLowerCase() : c.toUpperCase()) + s.slice(1);
    }).join('') : '';
  };

  /**
   *  strPascalCase
   *
   *  Converts a string into PascalCase
   *  Thanks to https://stackoverflow.com/questions/1026069/how-do-i-make-the-first-letter-of-a-string-uppercase-in-javascript
   *
   *  @date	14/12/17
   *  @since	ACF 5.6.5
   *
   *  @param	string str
   *  @return	string
   */

  acf.strPascalCase = function (str) {
    var camel = acf.strCamelCase(str);
    return camel.charAt(0).toUpperCase() + camel.slice(1);
  };

  /**
   *  acf.strSlugify
   *
   *  Converts a string into a HTML class friendly slug
   *
   *  @date	21/3/18
   *  @since	ACF 5.6.9
   *
   *  @param	string str
   *  @return	string
   */

  acf.strSlugify = function (str) {
    return acf.strReplace('_', '-', str.toLowerCase());
  };
  acf.strSanitize = function (str, toLowerCase = true) {
    // chars (https://jsperf.com/replace-foreign-characters)
    var map = {
      À: 'A',
      Á: 'A',
      Â: 'A',
      Ã: 'A',
      Ä: 'A',
      Å: 'A',
      Æ: 'AE',
      Ç: 'C',
      È: 'E',
      É: 'E',
      Ê: 'E',
      Ë: 'E',
      Ì: 'I',
      Í: 'I',
      Î: 'I',
      Ï: 'I',
      Ð: 'D',
      Ñ: 'N',
      Ò: 'O',
      Ó: 'O',
      Ô: 'O',
      Õ: 'O',
      Ö: 'O',
      Ø: 'O',
      Ù: 'U',
      Ú: 'U',
      Û: 'U',
      Ü: 'U',
      Ý: 'Y',
      ß: 's',
      à: 'a',
      á: 'a',
      â: 'a',
      ã: 'a',
      ä: 'a',
      å: 'a',
      æ: 'ae',
      ç: 'c',
      è: 'e',
      é: 'e',
      ê: 'e',
      ë: 'e',
      ì: 'i',
      í: 'i',
      î: 'i',
      ï: 'i',
      ñ: 'n',
      ò: 'o',
      ó: 'o',
      ô: 'o',
      õ: 'o',
      ö: 'o',
      ø: 'o',
      ù: 'u',
      ú: 'u',
      û: 'u',
      ü: 'u',
      ý: 'y',
      ÿ: 'y',
      Ā: 'A',
      ā: 'a',
      Ă: 'A',
      ă: 'a',
      Ą: 'A',
      ą: 'a',
      Ć: 'C',
      ć: 'c',
      Ĉ: 'C',
      ĉ: 'c',
      Ċ: 'C',
      ċ: 'c',
      Č: 'C',
      č: 'c',
      Ď: 'D',
      ď: 'd',
      Đ: 'D',
      đ: 'd',
      Ē: 'E',
      ē: 'e',
      Ĕ: 'E',
      ĕ: 'e',
      Ė: 'E',
      ė: 'e',
      Ę: 'E',
      ę: 'e',
      Ě: 'E',
      ě: 'e',
      Ĝ: 'G',
      ĝ: 'g',
      Ğ: 'G',
      ğ: 'g',
      Ġ: 'G',
      ġ: 'g',
      Ģ: 'G',
      ģ: 'g',
      Ĥ: 'H',
      ĥ: 'h',
      Ħ: 'H',
      ħ: 'h',
      Ĩ: 'I',
      ĩ: 'i',
      Ī: 'I',
      ī: 'i',
      Ĭ: 'I',
      ĭ: 'i',
      Į: 'I',
      į: 'i',
      İ: 'I',
      ı: 'i',
      Ĳ: 'IJ',
      ĳ: 'ij',
      Ĵ: 'J',
      ĵ: 'j',
      Ķ: 'K',
      ķ: 'k',
      Ĺ: 'L',
      ĺ: 'l',
      Ļ: 'L',
      ļ: 'l',
      Ľ: 'L',
      ľ: 'l',
      Ŀ: 'L',
      ŀ: 'l',
      Ł: 'l',
      ł: 'l',
      Ń: 'N',
      ń: 'n',
      Ņ: 'N',
      ņ: 'n',
      Ň: 'N',
      ň: 'n',
      ŉ: 'n',
      Ō: 'O',
      ō: 'o',
      Ŏ: 'O',
      ŏ: 'o',
      Ő: 'O',
      ő: 'o',
      Œ: 'OE',
      œ: 'oe',
      Ŕ: 'R',
      ŕ: 'r',
      Ŗ: 'R',
      ŗ: 'r',
      Ř: 'R',
      ř: 'r',
      Ś: 'S',
      ś: 's',
      Ŝ: 'S',
      ŝ: 's',
      Ş: 'S',
      ş: 's',
      Š: 'S',
      š: 's',
      Ţ: 'T',
      ţ: 't',
      Ť: 'T',
      ť: 't',
      Ŧ: 'T',
      ŧ: 't',
      Ũ: 'U',
      ũ: 'u',
      Ū: 'U',
      ū: 'u',
      Ŭ: 'U',
      ŭ: 'u',
      Ů: 'U',
      ů: 'u',
      Ű: 'U',
      ű: 'u',
      Ų: 'U',
      ų: 'u',
      Ŵ: 'W',
      ŵ: 'w',
      Ŷ: 'Y',
      ŷ: 'y',
      Ÿ: 'Y',
      Ź: 'Z',
      ź: 'z',
      Ż: 'Z',
      ż: 'z',
      Ž: 'Z',
      ž: 'z',
      ſ: 's',
      ƒ: 'f',
      Ơ: 'O',
      ơ: 'o',
      Ư: 'U',
      ư: 'u',
      Ǎ: 'A',
      ǎ: 'a',
      Ǐ: 'I',
      ǐ: 'i',
      Ǒ: 'O',
      ǒ: 'o',
      Ǔ: 'U',
      ǔ: 'u',
      Ǖ: 'U',
      ǖ: 'u',
      Ǘ: 'U',
      ǘ: 'u',
      Ǚ: 'U',
      ǚ: 'u',
      Ǜ: 'U',
      ǜ: 'u',
      Ǻ: 'A',
      ǻ: 'a',
      Ǽ: 'AE',
      ǽ: 'ae',
      Ǿ: 'O',
      ǿ: 'o',
      // extra
      ' ': '_',
      "'": '',
      '?': '',
      '/': '',
      '\\': '',
      '.': '',
      ',': '',
      '`': '',
      '>': '',
      '<': '',
      '"': '',
      '[': '',
      ']': '',
      '|': '',
      '{': '',
      '}': '',
      '(': '',
      ')': ''
    };

    // vars
    var nonWord = /\W/g;
    var mapping = function (c) {
      return map[c] !== undefined ? map[c] : c;
    };

    // replace
    str = str.replace(nonWord, mapping);

    // lowercase
    if (toLowerCase) {
      str = str.toLowerCase();
    }

    // return
    return str;
  };

  /**
   *  acf.strMatch
   *
   *  Returns the number of characters that match between two strings
   *
   *  @date	1/2/18
   *  @since	ACF 5.6.5
   *
   *  @param	type $var Description. Default.
   *  @return	type Description.
   */

  acf.strMatch = function (s1, s2) {
    // vars
    var val = 0;
    var min = Math.min(s1.length, s2.length);

    // loop
    for (var i = 0; i < min; i++) {
      if (s1[i] !== s2[i]) {
        break;
      }
      val++;
    }

    // return
    return val;
  };

  /**
   * Escapes HTML entities from a string.
   *
   * @date	08/06/2020
   * @since	ACF 5.9.0
   *
   * @param	string string The input string.
   * @return	string
   */
  acf.strEscape = function (string) {
    var htmlEscapes = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return ('' + string).replace(/[&<>"']/g, function (chr) {
      return htmlEscapes[chr];
    });
  };

  // Tests.
  //console.log( acf.strEscape('Test 1') );
  //console.log( acf.strEscape('Test & 1') );
  //console.log( acf.strEscape('Test\'s &amp; 1') );
  //console.log( acf.strEscape('<script>js</script>') );

  /**
   * Unescapes HTML entities from a string.
   *
   * @date	08/06/2020
   * @since	ACF 5.9.0
   *
   * @param	string string The input string.
   * @return	string
   */
  acf.strUnescape = function (string) {
    var htmlUnescapes = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#39;': "'"
    };
    return ('' + string).replace(/&amp;|&lt;|&gt;|&quot;|&#39;/g, function (entity) {
      return htmlUnescapes[entity];
    });
  };

  // Tests.
  //console.log( acf.strUnescape( acf.strEscape('Test 1') ) );
  //console.log( acf.strUnescape( acf.strEscape('Test & 1') ) );
  //console.log( acf.strUnescape( acf.strEscape('Test\'s &amp; 1') ) );
  //console.log( acf.strUnescape( acf.strEscape('<script>js</script>') ) );

  /**
   * Escapes HTML entities from a string.
   *
   * @date	08/06/2020
   * @since	ACF 5.9.0
   *
   * @param	string string The input string.
   * @return	string
   */
  acf.escAttr = acf.strEscape;

  /**
   * Encodes <script> tags for safe HTML output.
   *
   * @date	08/06/2020
   * @since	ACF 5.9.0
   * @since	ACF 6.4.3 - Use DOMPurify for better security.
   *
   * @param	string string The input string.
   * @return	string
   */

  acf.escHtml = function (string) {
    string = '' + string; // Convert to string if not already.
    const DOMPurify = __webpack_require__(/*! dompurify */ "./node_modules/dompurify/dist/purify.cjs.js");
    if (DOMPurify === undefined || !DOMPurify.isSupported) {
      console.warn('ACF: DOMPurify not loaded or not supported. Falling back to basic HTML escaping for security.');
      return acf.strEscape(string); // Fallback to basic escaping.
    }
    const options = acf.applyFilters('esc_html_dompurify_config', {
      USE_PROFILES: {
        html: true
      },
      ADD_TAGS: ['audio', 'video'],
      ADD_ATTR: ['controls', 'loop', 'muted', 'preload'],
      FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'base', 'meta', 'form'],
      FORBID_ATTR: ['style', 'srcset', 'action', 'background', 'dynsrc', 'lowsrc', 'on*'],
      ALLOW_DATA_ATTR: false,
      ALLOW_ARIA_ATTR: false
    });
    return DOMPurify.sanitize(string, options);
  };

  // Tests.
  //console.log( acf.escHtml('<script>js</script>') );
  //console.log( acf.escHtml( acf.strEscape('<script>js</script>') ) );
  //console.log( acf.escHtml( '<script>js1</script><script>js2</script>' ) );

  /**
   * Encode a string potentially containing HTML into it's HTML entities equivalent.
   *
   * @since ACF 6.3.6
   *
   * @param {string} string String to encode.
   * @return {string} The encoded string
   */
  acf.encode = function (string) {
    return $('<textarea/>').text(string).html();
  };

  /**
   * Decode a HTML encoded string into it's original form.
   *
   * @since ACF 5.6.5
   *
   * @param {string} string String to encode.
   * @return {string} The encoded string
   */
  acf.decode = function (string) {
    return $('<textarea/>').html(string).text();
  };

  /**
   *  parseArgs
   *
   *  Merges together defaults and args much like the WP wp_parse_args function
   *
   *  @date	14/12/17
   *  @since	ACF 5.6.5
   *
   *  @param	object args
   *  @param	object defaults
   *  @return	object
   */

  acf.parseArgs = function (args, defaults) {
    if (typeof args !== 'object') args = {};
    if (typeof defaults !== 'object') defaults = {};
    return $.extend({}, defaults, args);
  };

  /**
   *  __
   *
   *  Retrieve the translation of $text.
   *
   *  @date	16/4/18
   *  @since	ACF 5.6.9
   *
   *  @param	string text Text to translate.
   *  @return	string Translated text.
   */

  // Make sure a global acfL10n object exists to prevent errors in other scopes
  window.acfL10n = window.acfL10n || {};
  acf.__ = function (text) {
    return acfL10n[text] || text;
  };

  /**
   *  _x
   *
   *  Retrieve translated string with gettext context.
   *
   *  @date	16/4/18
   *  @since	ACF 5.6.9
   *
   *  @param	string text Text to translate.
   *  @param	string context Context information for the translators.
   *  @return	string Translated text.
   */

  acf._x = function (text, context) {
    return acfL10n[text + '.' + context] || acfL10n[text] || text;
  };

  /**
   *  _n
   *
   *  Retrieve the plural or single form based on the amount.
   *
   *  @date	16/4/18
   *  @since	ACF 5.6.9
   *
   *  @param	string single Single text to translate.
   *  @param	string plural Plural text to translate.
   *  @param	int number The number to compare against.
   *  @return	string Translated text.
   */

  acf._n = function (single, plural, number) {
    if (number == 1) {
      return acf.__(single);
    } else {
      return acf.__(plural);
    }
  };
  acf.isArray = function (a) {
    return Array.isArray(a);
  };
  acf.isObject = function (a) {
    return typeof a === 'object';
  };

  /**
   *  serialize
   *
   *  description
   *
   *  @date	24/12/17
   *  @since	ACF 5.6.5
   *
   *  @param	type $var Description. Default.
   *  @return	type Description.
   */

  var buildObject = function (obj, name, value) {
    // replace [] with placeholder
    name = name.replace('[]', '[%%index%%]');

    // vars
    var keys = name.match(/([^\[\]])+/g);
    if (!keys) return;
    var length = keys.length;
    var ref = obj;

    // loop
    for (var i = 0; i < length; i++) {
      // vars
      var key = String(keys[i]);

      // value
      if (i == length - 1) {
        // %%index%%
        if (key === '%%index%%') {
          ref.push(value);

          // default
        } else {
          ref[key] = value;
        }

        // path
      } else {
        // array
        if (keys[i + 1] === '%%index%%') {
          if (!acf.isArray(ref[key])) {
            ref[key] = [];
          }

          // object
        } else {
          if (!acf.isObject(ref[key])) {
            ref[key] = {};
          }
        }

        // crawl
        ref = ref[key];
      }
    }
  };
  acf.serialize = function ($el, prefix) {
    // vars
    var obj = {};
    var inputs = acf.serializeArray($el);

    // prefix
    if (prefix !== undefined) {
      // filter and modify
      inputs = inputs.filter(function (item) {
        return item.name.indexOf(prefix) === 0;
      }).map(function (item) {
        item.name = item.name.slice(prefix.length);
        return item;
      });
    }

    // loop
    for (var i = 0; i < inputs.length; i++) {
      buildObject(obj, inputs[i].name, inputs[i].value);
    }

    // return
    return obj;
  };

  /**
   * Check if an object has only numeric string keys.
   * Used to detect objects that should be converted to arrays (e.g., checkbox values).
   *
   * Semantics:
   * - Accepts base-10, non-negative integer strings composed of digits only (e.g. "0", "12").
   * - Leading zeros are allowed (e.g. "0012") and treated as numeric by downstream logic.
   * - Negative ("-1"), decimal ("1.0"), and non-numeric keys are rejected.
   *
   * @since   SCF 6.6.0
   * @private
   *
   * @param   object obj The object to check
   * @return  boolean True if all keys are numeric strings
   */
  const hasOnlyNumericKeys = function (obj) {
    const keys = Object.keys(obj);
    if (keys.length === 0) {
      return false;
    }
    for (let i = 0; i < keys.length; i++) {
      if (!/^\d+$/.test(keys[i])) {
        return false;
      }
    }
    return true;
  };

  /**
   * Convert an object with numeric string keys to a numerically sorted array.
   * Example: {"0": "one", "2": "three", "1": "two"} becomes ["one", "two", "three"].
   *
   * Notes on edge-cases:
   * - Leading zeros (e.g. "00123") are supported; order is based on the numeric value
   *   but the original string key is used to read the value to avoid lookup mismatches.
   * - Assumes {@link hasOnlyNumericKeys} has already gated out negatives/decimals.
   *
   * @since   SCF 6.6.0
   * @private
   *
   * @param   object obj The object to convert
   * @return  array The numerically sorted array of values
   */
  const numericObjectToArray = function (obj) {
    const arr = [];
    // Pair each original key with its numeric value for stable lookup and sorting.
    const entries = Object.keys(obj).map(function (k) {
      return {
        k: k,
        n: parseInt(k, 10)
      };
    }).sort(function (a, b) {
      return a.n - b.n;
    });
    for (let i = 0; i < entries.length; i++) {
      arr.push(obj[entries[i].k]);
    }
    return arr;
  };

  /**
   * Check if a value looks like flexible content data.
   * Flexible content objects contain rows where each row object has an 'acf_fc_layout' property.
   * Keys for flexible rows are not guaranteed to be numeric: they are typically unique IDs
   * (e.g. '69171156640b5') or strings like 'row-0'. Therefore, flexible content detection does
   * not rely on numeric keys and is handled separately from numeric-keyed object normalization.
   *
   * @since   SCF 6.6.0
   *
   * @param   object value The value to check
   * @return  boolean True if this looks like flexible content data
   */
  acf.isFlexibleContentData = function (value) {
    if (!acf.isObject(value)) {
      return false;
    }
    var keys = Object.keys(value);
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      if (key === 'acfcloneindex') {
        continue;
      }
      var subvalue = value[key];
      if (acf.isObject(subvalue) && subvalue.acf_fc_layout) {
        return true;
      }
    }
    return false;
  };

  /**
   * Normalizes flexible content data structure by converting objects to arrays.
   * Private helper function.
   *
   * @since 6.6.0
   *
   * @param {Object} obj The object to normalize.
   * @return {Object|Array} The normalized data.
   */
  const normalizeFlexibleContentData = function (obj) {
    if (!acf.isObject(obj)) {
      return obj;
    }
    let result = {};
    for (let key in obj) {
      if (!obj.hasOwnProperty(key)) {
        continue;
      }
      var value = obj[key];

      // Primitives pass through unchanged
      if (!acf.isObject(value)) {
        result[key] = value;
        continue;
      }

      // Convert numeric-keyed objects to arrays (e.g., checkbox values)
      if (hasOnlyNumericKeys(value)) {
        result[key] = numericObjectToArray(value);
        continue;
      } // Convert flexible content to arrays
      if (acf.isFlexibleContentData(value)) {
        var arr = [];
        var keys = Object.keys(value);
        for (var i = 0; i < keys.length; i++) {
          var subkey = keys[i];
          if (subkey === 'acfcloneindex') {
            continue;
          }
          var subvalue = value[subkey];
          if (acf.isObject(subvalue) && subvalue.acf_fc_layout) {
            arr.push(normalizeFlexibleContentData(subvalue));
          }
        }
        result[key] = arr;
      } else {
        // Recursively process nested objects
        result[key] = normalizeFlexibleContentData(value);
      }
    }
    return result;
  };

  /**
   * Public API wrapper for normalizeFlexibleContentData.
   * Normalizes flexible content data structure by converting objects to arrays.
   *
   * @since 6.6.0
   *
   * @param {Object} obj The object to normalize.
   * @return {Object|Array} The normalized data.
   */
  acf.normalizeFlexibleContentData = function (obj) {
    return normalizeFlexibleContentData(obj);
  };

  /**
   *  acf.serializeArray
   *
   *  Similar to $.serializeArray() but works with a parent wrapping element.
   *
   *  @date	19/8/18
   *  @since	ACF 5.7.3
   *
   *  @param	jQuery $el The element or form to serialize.
   *  @return	array
   */

  acf.serializeArray = function ($el) {
    return $el.find('select, textarea, input').serializeArray();
  };

  /**
   *  acf.serializeForAjax
   *
   *  Returns an object containing name => value data ready to be encoded for Ajax.
   *
   *  @date	17/12/18
   *  @since	ACF 5.8.0
   *
   *  @param	jQuery $el The element or form to serialize.
   *  @return	object
   */
  acf.serializeForAjax = function ($el) {
    // vars
    var data = {};
    var index = {};

    // Serialize inputs.
    var inputs = acf.serializeArray($el);

    // Loop over inputs and build data.
    inputs.map(function (item) {
      // Append to array.
      if (item.name.slice(-2) === '[]') {
        data[item.name] = data[item.name] || [];
        data[item.name].push(item.value);
        // Append
      } else {
        data[item.name] = item.value;
      }
    });

    // return
    return data;
  };

  /**
   *  addAction
   *
   *  Wrapper for acf.hooks.addAction
   *
   *  @date	14/12/17
   *  @since	ACF 5.6.5
   *
   *  @param	n/a
   *  @return	this
   */

  /*
  var prefixAction = function( action ){
  	return 'acf_' + action;
  }
  */

  acf.addAction = function () {
    //action = prefixAction(action);
    acf.hooks.addAction.apply(this, arguments);
    return this;
  };

  /**
   *  removeAction
   *
   *  Wrapper for acf.hooks.removeAction
   *
   *  @date	14/12/17
   *  @since	ACF 5.6.5
   *
   *  @param	n/a
   *  @return	this
   */

  acf.removeAction = function () {
    //action = prefixAction(action);
    acf.hooks.removeAction.apply(this, arguments);
    return this;
  };

  /**
   *  doAction
   *
   *  Wrapper for acf.hooks.doAction
   *
   *  @date	14/12/17
   *  @since	ACF 5.6.5
   *
   *  @param	n/a
   *  @return	this
   */

  var actionHistory = {};
  //var currentAction = false;
  acf.doAction = function (action) {
    //action = prefixAction(action);
    //currentAction = action;
    actionHistory[action] = 1;
    acf.hooks.doAction.apply(this, arguments);
    actionHistory[action] = 0;
    return this;
  };

  /**
   *  doingAction
   *
   *  Return true if doing action
   *
   *  @date	14/12/17
   *  @since	ACF 5.6.5
   *
   *  @param	n/a
   *  @return	this
   */

  acf.doingAction = function (action) {
    //action = prefixAction(action);
    return actionHistory[action] === 1;
  };

  /**
   *  didAction
   *
   *  Wrapper for acf.hooks.doAction
   *
   *  @date	14/12/17
   *  @since	ACF 5.6.5
   *
   *  @param	n/a
   *  @return	this
   */

  acf.didAction = function (action) {
    //action = prefixAction(action);
    return actionHistory[action] !== undefined;
  };

  /**
   *  currentAction
   *
   *  Wrapper for acf.hooks.doAction
   *
   *  @date	14/12/17
   *  @since	ACF 5.6.5
   *
   *  @param	n/a
   *  @return	this
   */

  acf.currentAction = function () {
    for (var k in actionHistory) {
      if (actionHistory[k]) {
        return k;
      }
    }
    return false;
  };

  /**
   *  addFilter
   *
   *  Wrapper for acf.hooks.addFilter
   *
   *  @date	14/12/17
   *  @since	ACF 5.6.5
   *
   *  @param	n/a
   *  @return	this
   */

  acf.addFilter = function () {
    //action = prefixAction(action);
    acf.hooks.addFilter.apply(this, arguments);
    return this;
  };

  /**
   *  removeFilter
   *
   *  Wrapper for acf.hooks.removeFilter
   *
   *  @date	14/12/17
   *  @since	ACF 5.6.5
   *
   *  @param	n/a
   *  @return	this
   */

  acf.removeFilter = function () {
    //action = prefixAction(action);
    acf.hooks.removeFilter.apply(this, arguments);
    return this;
  };

  /**
   *  applyFilters
   *
   *  Wrapper for acf.hooks.applyFilters
   *
   *  @date	14/12/17
   *  @since	ACF 5.6.5
   *
   *  @param	n/a
   *  @return	this
   */

  acf.applyFilters = function () {
    //action = prefixAction(action);
    return acf.hooks.applyFilters.apply(this, arguments);
  };

  /**
   *  getArgs
   *
   *  description
   *
   *  @date	15/12/17
   *  @since	ACF 5.6.5
   *
   *  @param	type $var Description. Default.
   *  @return	type Description.
   */

  acf.arrayArgs = function (args) {
    return Array.prototype.slice.call(args);
  };

  /**
   *  extendArgs
   *
   *  description
   *
   *  @date	15/12/17
   *  @since	ACF 5.6.5
   *
   *  @param	type $var Description. Default.
   *  @return	type Description.
   */

  /*
  acf.extendArgs = function( ){
  	var args = Array.prototype.slice.call( arguments );
  	var realArgs = args.shift();
  		
  	Array.prototype.push.call(arguments, 'bar')
  	return Array.prototype.push.apply( args, arguments );
  };
  */

  // Preferences
  // - use try/catch to avoid JS error if cookies are disabled on front-end form
  try {
    var preferences = JSON.parse(localStorage.getItem('acf')) || {};
  } catch (e) {
    var preferences = {};
  }

  /**
   *  getPreferenceName
   *
   *  Gets the true preference name.
   *  Converts "this.thing" to "thing-123" if editing post 123.
   *
   *  @date	11/11/17
   *  @since	ACF 5.6.5
   *
   *  @param	string name
   *  @return	string
   */

  var getPreferenceName = function (name) {
    if (name.substr(0, 5) === 'this.') {
      name = name.substr(5) + '-' + acf.get('post_id');
    }
    return name;
  };

  /**
   *  acf.getPreference
   *
   *  Gets a preference setting or null if not set.
   *
   *  @date	11/11/17
   *  @since	ACF 5.6.5
   *
   *  @param	string name
   *  @return	mixed
   */

  acf.getPreference = function (name) {
    name = getPreferenceName(name);
    return preferences[name] || null;
  };

  /**
   *  acf.setPreference
   *
   *  Sets a preference setting.
   *
   *  @date	11/11/17
   *  @since	ACF 5.6.5
   *
   *  @param	string name
   *  @param	mixed value
   *  @return	n/a
   */

  acf.setPreference = function (name, value) {
    name = getPreferenceName(name);
    if (value === null) {
      delete preferences[name];
    } else {
      preferences[name] = value;
    }
    localStorage.setItem('acf', JSON.stringify(preferences));
  };

  /**
   *  acf.removePreference
   *
   *  Removes a preference setting.
   *
   *  @date	11/11/17
   *  @since	ACF 5.6.5
   *
   *  @param	string name
   *  @return	n/a
   */

  acf.removePreference = function (name) {
    acf.setPreference(name, null);
  };

  /**
   *  remove
   *
   *  Removes an element with fade effect
   *
   *  @date	1/1/18
   *  @since	ACF 5.6.5
   *
   *  @param	type $var Description. Default.
   *  @return	type Description.
   */

  acf.remove = function (props) {
    // allow jQuery
    if (props instanceof jQuery) {
      props = {
        target: props
      };
    }

    // defaults
    props = acf.parseArgs(props, {
      target: false,
      endHeight: 0,
      complete: function () {}
    });

    // action
    acf.doAction('remove', props.target);

    // tr
    if (props.target.is('tr')) {
      removeTr(props);

      // div
    } else {
      removeDiv(props);
    }
  };

  /**
   *  removeDiv
   *
   *  description
   *
   *  @date	16/2/18
   *  @since	ACF 5.6.9
   *
   *  @param	type $var Description. Default.
   *  @return	type Description.
   */

  var removeDiv = function (props) {
    // vars
    var $el = props.target;
    var height = $el.height();
    var width = $el.width();
    var margin = $el.css('margin');
    var outerHeight = $el.outerHeight(true);
    var style = $el.attr('style') + ''; // needed to copy

    // wrap
    $el.wrap('<div class="acf-temp-remove" style="height:' + outerHeight + 'px"></div>');
    var $wrap = $el.parent();

    // set pos
    $el.css({
      height: height,
      width: width,
      margin: margin,
      position: 'absolute'
    });

    // fade wrap
    setTimeout(function () {
      $wrap.css({
        opacity: 0,
        height: props.endHeight
      });
    }, 50);

    // remove
    setTimeout(function () {
      $el.attr('style', style);
      $wrap.remove();
      props.complete();
    }, 301);
  };

  /**
   *  removeTr
   *
   *  description
   *
   *  @date	16/2/18
   *  @since	ACF 5.6.9
   *
   *  @param	type $var Description. Default.
   *  @return	type Description.
   */

  var removeTr = function (props) {
    // vars
    var $tr = props.target;
    var height = $tr.height();
    var children = $tr.children().length;

    // create dummy td
    var $td = $('<td class="acf-temp-remove" style="padding:0; height:' + height + 'px" colspan="' + children + '"></td>');

    // fade away tr
    $tr.addClass('acf-remove-element');

    // update HTML after fade animation
    setTimeout(function () {
      $tr.html($td);
    }, 251);

    // allow .acf-temp-remove to exist before changing CSS
    setTimeout(function () {
      // remove class
      $tr.removeClass('acf-remove-element');

      // collapse
      $td.css({
        height: props.endHeight
      });
    }, 300);

    // remove
    setTimeout(function () {
      $tr.remove();
      props.complete();
    }, 451);
  };

  /**
   *  duplicate
   *
   *  description
   *
   *  @date	3/1/18
   *  @since	ACF 5.6.5
   *
   *  @param	type $var Description. Default.
   *  @return	type Description.
   */

  acf.duplicate = function (args) {
    // allow jQuery
    if (args instanceof jQuery) {
      args = {
        target: args
      };
    }

    // defaults
    args = acf.parseArgs(args, {
      target: false,
      search: '',
      replace: '',
      rename: true,
      before: function ($el) {},
      after: function ($el, $el2) {},
      append: function ($el, $el2) {
        $el.after($el2);
      }
    });

    // compatibility
    args.target = args.target || args.$el;

    // vars
    var $el = args.target;

    // search
    args.search = args.search || $el.attr('data-id');
    args.replace = args.replace || acf.uniqid();

    // before
    // - allow acf to modify DOM
    // - fixes bug where select field option is not selected
    args.before($el);
    acf.doAction('before_duplicate', $el);

    // clone
    var $el2 = $el.clone();

    // rename
    if (args.rename) {
      acf.rename({
        target: $el2,
        search: args.search,
        replace: args.replace,
        replacer: typeof args.rename === 'function' ? args.rename : null
      });
    }

    // remove classes
    $el2.removeClass('acf-clone');
    $el2.find('.ui-sortable').removeClass('ui-sortable');

    // remove any initialised select2s prevent the duplicated object stealing the previous select2.
    $el2.find('[data-select2-id]').removeAttr('data-select2-id');
    $el2.find('.select2').remove();

    // subfield select2 renames happen after init and contain a duplicated ID. force change those IDs to prevent this.
    $el2.find('.acf-is-subfields select[data-ui="1"]').each(function () {
      $(this).prop('id', $(this).prop('id').replace('acf_fields', acf.uniqid('duplicated_') + '_acf_fields'));
    });

    // remove tab wrapper to ensure proper init
    $el2.find('.acf-field-settings > .acf-tab-wrap').remove();

    // after
    // - allow acf to modify DOM
    args.after($el, $el2);
    acf.doAction('after_duplicate', $el, $el2);

    // append
    args.append($el, $el2);

    /**
     * Fires after an element has been duplicated and appended to the DOM.
     *
     * @date	30/10/19
     * @since	ACF 5.8.7
     *
     * @param	jQuery $el The original element.
     * @param	jQuery $el2 The duplicated element.
     */
    acf.doAction('duplicate', $el, $el2);

    // append
    acf.doAction('append', $el2);

    // return
    return $el2;
  };

  /**
   *  rename
   *
   *  description
   *
   *  @date	7/1/18
   *  @since	ACF 5.6.5
   *
   *  @param	type $var Description. Default.
   *  @return	type Description.
   */

  acf.rename = function (args) {
    // Allow jQuery param.
    if (args instanceof jQuery) {
      args = {
        target: args
      };
    }

    // Apply default args.
    args = acf.parseArgs(args, {
      target: false,
      destructive: false,
      search: '',
      replace: '',
      replacer: null
    });

    // Extract args.
    var $el = args.target;

    // Provide backup for empty args.
    if (!args.search) {
      args.search = $el.attr('data-id');
    }
    if (!args.replace) {
      args.replace = acf.uniqid('acf');
    }
    if (!args.replacer) {
      args.replacer = function (name, value, search, replace) {
        return value.replace(search, replace);
      };
    }

    // Callback function for jQuery replacing.
    var withReplacer = function (name) {
      return function (i, value) {
        return args.replacer(name, value, args.search, args.replace);
      };
    };

    // Destructive Replace.
    if (args.destructive) {
      var html = acf.strReplace(args.search, args.replace, $el.outerHTML());
      $el.replaceWith(html);

      // Standard Replace.
    } else {
      $el.attr('data-id', args.replace);
      $el.find('[id*="' + args.search + '"]').attr('id', withReplacer('id'));
      $el.find('[for*="' + args.search + '"]').attr('for', withReplacer('for'));
      $el.find('[name*="' + args.search + '"]').attr('name', withReplacer('name'));
    }

    // return
    return $el;
  };

  /**
   * Prepares AJAX data prior to being sent.
   *
   * @since ACF 5.6.5
   *
   * @param Object  data             The data to prepare
   * @param boolean use_global_nonce Should we ignore any nonce provided in the data object and force ACF's global nonce for this request
   * @return Object The prepared data.
   */
  acf.prepareForAjax = function (data, use_global_nonce = false) {
    // Set a default nonce if we don't have one already.
    if (use_global_nonce || 'undefined' === typeof data.nonce) {
      data.nonce = acf.get('nonce');
    }
    data.post_id = acf.get('post_id');
    if (acf.has('language')) {
      data.lang = acf.get('language');
    }

    // Filter for 3rd party customization.
    data = acf.applyFilters('prepare_for_ajax', data);
    return data;
  };

  /**
   *  acf.startButtonLoading
   *
   *  description
   *
   *  @date	5/1/18
   *  @since	ACF 5.6.5
   *
   *  @param	type $var Description. Default.
   *  @return	type Description.
   */

  acf.startButtonLoading = function ($el) {
    $el.prop('disabled', true);
    $el.after(' <i class="acf-loading"></i>');
  };
  acf.stopButtonLoading = function ($el) {
    $el.prop('disabled', false);
    $el.next('.acf-loading').remove();
  };

  /**
   *  acf.showLoading
   *
   *  description
   *
   *  @date	12/1/18
   *  @since	ACF 5.6.5
   *
   *  @param	type $var Description. Default.
   *  @return	type Description.
   */

  acf.showLoading = function ($el) {
    $el.append('<div class="acf-loading-overlay"><i class="acf-loading"></i></div>');
  };
  acf.hideLoading = function ($el) {
    $el.children('.acf-loading-overlay').remove();
  };

  /**
   *  acf.updateUserSetting
   *
   *  description
   *
   *  @date	5/1/18
   *  @since	ACF 5.6.5
   *
   *  @param	type $var Description. Default.
   *  @return	type Description.
   */

  acf.updateUserSetting = function (name, value) {
    var ajaxData = {
      action: 'acf/ajax/user_setting',
      name: name,
      value: value
    };
    $.ajax({
      url: acf.get('ajaxurl'),
      data: acf.prepareForAjax(ajaxData),
      type: 'post',
      dataType: 'html'
    });
  };

  /**
   *  acf.val
   *
   *  description
   *
   *  @date	8/1/18
   *  @since	ACF 5.6.5
   *
   *  @param	type $var Description. Default.
   *  @return	type Description.
   */

  acf.val = function ($input, value, silent) {
    // vars
    var prevValue = $input.val();

    // bail if no change
    if (value === prevValue) {
      return false;
    }

    // update value
    $input.val(value);

    // prevent select elements displaying blank value if option doesn't exist
    if ($input.is('select') && $input.val() === null) {
      $input.val(prevValue);
      return false;
    }

    // update with trigger
    if (silent !== true) {
      $input.trigger('change');
    }

    // return
    return true;
  };

  /**
   *  acf.show
   *
   *  description
   *
   *  @date	9/2/18
   *  @since	ACF 5.6.5
   *
   *  @param	type $var Description. Default.
   *  @return	type Description.
   */

  acf.show = function ($el, lockKey) {
    // unlock
    if (lockKey) {
      acf.unlock($el, 'hidden', lockKey);
    }

    // bail early if $el is still locked
    if (acf.isLocked($el, 'hidden')) {
      //console.log( 'still locked', getLocks( $el, 'hidden' ));
      return false;
    }

    // $el is hidden, remove class and return true due to change in visibility
    if ($el.hasClass('acf-hidden')) {
      $el.removeClass('acf-hidden');
      return true;

      // $el is visible, return false due to no change in visibility
    } else {
      return false;
    }
  };

  /**
   *  acf.hide
   *
   *  description
   *
   *  @date	9/2/18
   *  @since	ACF 5.6.5
   *
   *  @param	type $var Description. Default.
   *  @return	type Description.
   */

  acf.hide = function ($el, lockKey) {
    // lock
    if (lockKey) {
      acf.lock($el, 'hidden', lockKey);
    }

    // $el is hidden, return false due to no change in visibility
    if ($el.hasClass('acf-hidden')) {
      return false;

      // $el is visible, add class and return true due to change in visibility
    } else {
      $el.addClass('acf-hidden');
      return true;
    }
  };

  /**
   *  acf.isHidden
   *
   *  description
   *
   *  @date	9/2/18
   *  @since	ACF 5.6.5
   *
   *  @param	type $var Description. Default.
   *  @return	type Description.
   */

  acf.isHidden = function ($el) {
    return $el.hasClass('acf-hidden');
  };

  /**
   *  acf.isVisible
   *
   *  description
   *
   *  @date	9/2/18
   *  @since	ACF 5.6.5
   *
   *  @param	type $var Description. Default.
   *  @return	type Description.
   */

  acf.isVisible = function ($el) {
    return !acf.isHidden($el);
  };

  /**
   *  enable
   *
   *  description
   *
   *  @date	12/3/18
   *  @since	ACF 5.6.9
   *
   *  @param	type $var Description. Default.
   *  @return	type Description.
   */

  var enable = function ($el, lockKey) {
    // check class. Allow .acf-disabled to overrule all JS
    if ($el.hasClass('acf-disabled')) {
      return false;
    }

    // unlock
    if (lockKey) {
      acf.unlock($el, 'disabled', lockKey);
    }

    // bail early if $el is still locked
    if (acf.isLocked($el, 'disabled')) {
      return false;
    }

    // $el is disabled, remove prop and return true due to change
    if ($el.prop('disabled')) {
      $el.prop('disabled', false);
      return true;

      // $el is enabled, return false due to no change
    } else {
      return false;
    }
  };

  /**
   *  acf.enable
   *
   *  description
   *
   *  @date	9/2/18
   *  @since	ACF 5.6.5
   *
   *  @param	type $var Description. Default.
   *  @return	type Description.
   */

  acf.enable = function ($el, lockKey) {
    // enable single input
    if ($el.attr('name')) {
      return enable($el, lockKey);
    }

    // find and enable child inputs
    // return true if any inputs have changed
    var results = false;
    $el.find('[name]').each(function () {
      var result = enable($(this), lockKey);
      if (result) {
        results = true;
      }
    });
    return results;
  };

  /**
   *  disable
   *
   *  description
   *
   *  @date	12/3/18
   *  @since	ACF 5.6.9
   *
   *  @param	type $var Description. Default.
   *  @return	type Description.
   */

  var disable = function ($el, lockKey) {
    // lock
    if (lockKey) {
      acf.lock($el, 'disabled', lockKey);
    }

    // $el is disabled, return false due to no change
    if ($el.prop('disabled')) {
      return false;

      // $el is enabled, add prop and return true due to change
    } else {
      $el.prop('disabled', true);
      return true;
    }
  };

  /**
   *  acf.disable
   *
   *  description
   *
   *  @date	9/2/18
   *  @since	ACF 5.6.5
   *
   *  @param	type $var Description. Default.
   *  @return	type Description.
   */

  acf.disable = function ($el, lockKey) {
    // disable single input
    if ($el.attr('name')) {
      return disable($el, lockKey);
    }

    // find and enable child inputs
    // return true if any inputs have changed
    var results = false;
    $el.find('[name]').each(function () {
      var result = disable($(this), lockKey);
      if (result) {
        results = true;
      }
    });
    return results;
  };

  /**
   *  acf.isset
   *
   *  description
   *
   *  @date	10/1/18
   *  @since	ACF 5.6.5
   *
   *  @param	type $var Description. Default.
   *  @return	type Description.
   */

  acf.isset = function (obj /*, level1, level2, ... */) {
    for (var i = 1; i < arguments.length; i++) {
      if (!obj || !obj.hasOwnProperty(arguments[i])) {
        return false;
      }
      obj = obj[arguments[i]];
    }
    return true;
  };

  /**
   *  acf.isget
   *
   *  description
   *
   *  @date	10/1/18
   *  @since	ACF 5.6.5
   *
   *  @param	type $var Description. Default.
   *  @return	type Description.
   */

  acf.isget = function (obj /*, level1, level2, ... */) {
    for (var i = 1; i < arguments.length; i++) {
      if (!obj || !obj.hasOwnProperty(arguments[i])) {
        return null;
      }
      obj = obj[arguments[i]];
    }
    return obj;
  };

  /**
   *  acf.getFileInputData
   *
   *  description
   *
   *  @date	10/1/18
   *  @since	ACF 5.6.5
   *
   *  @param	type $var Description. Default.
   *  @return	type Description.
   */

  acf.getFileInputData = function ($input, callback) {
    // vars
    var value = $input.val();

    // bail early if no value
    if (!value) {
      return false;
    }

    // data
    var data = {
      url: value
    };

    // modern browsers
    var file = $input[0].files.length ? acf.isget($input[0].files, 0) : false;
    if (file) {
      // update data
      data.size = file.size;
      data.type = file.type;

      // image
      if (file.type.indexOf('image') > -1) {
        // vars
        var windowURL = window.URL || window.webkitURL;
        var img = new Image();
        img.onload = function () {
          // update
          data.width = this.width;
          data.height = this.height;
          callback(data);
        };
        img.src = windowURL.createObjectURL(file);
      } else {
        callback(data);
      }
    } else {
      callback(data);
    }
  };

  /**
   *  acf.isAjaxSuccess
   *
   *  description
   *
   *  @date	18/1/18
   *  @since	ACF 5.6.5
   *
   *  @param	type $var Description. Default.
   *  @return	type Description.
   */

  acf.isAjaxSuccess = function (json) {
    return json && json.success;
  };

  /**
   *  acf.getAjaxMessage
   *
   *  description
   *
   *  @date	18/1/18
   *  @since	ACF 5.6.5
   *
   *  @param	type $var Description. Default.
   *  @return	type Description.
   */

  acf.getAjaxMessage = function (json) {
    return acf.isget(json, 'data', 'message');
  };

  /**
   *  acf.getAjaxError
   *
   *  description
   *
   *  @date	18/1/18
   *  @since	ACF 5.6.5
   *
   *  @param	type $var Description. Default.
   *  @return	type Description.
   */

  acf.getAjaxError = function (json) {
    return acf.isget(json, 'data', 'error');
  };

  /**
   * Returns the error message from an XHR object.
   *
   * @date	17/3/20
   * @since	ACF 5.8.9
   *
   * @param	object xhr The XHR object.
   * @return	(string)
   */
  acf.getXhrError = function (xhr) {
    if (xhr.responseJSON) {
      // Responses via `return new WP_Error();`
      if (xhr.responseJSON.message) {
        return xhr.responseJSON.message;
      }

      // Responses via `wp_send_json_error();`.
      if (xhr.responseJSON.data && xhr.responseJSON.data.error) {
        return xhr.responseJSON.data.error;
      }
    } else if (xhr.statusText) {
      return xhr.statusText;
    }
    return '';
  };

  /**
   *  acf.renderSelect
   *
   *  Renders the inner html for a select field.
   *
   *  @date	19/2/18
   *  @since	ACF 5.6.9
   *
   *  @param	jQuery $select The select element.
   *  @param	array choices An array of choices.
   *  @return	void
   */

  acf.renderSelect = function ($select, choices) {
    // vars
    var value = $select.val();
    var values = [];

    // callback
    var crawl = function (items) {
      // vars
      var itemsHtml = '';

      // loop
      items.map(function (item) {
        // vars
        var text = item.text || item.label || '';
        var id = item.id || item.value || '';

        // append
        values.push(id);

        //  optgroup
        if (item.children) {
          itemsHtml += '<optgroup label="' + acf.escAttr(text) + '">' + crawl(item.children) + '</optgroup>';

          // option
        } else {
          itemsHtml += '<option value="' + acf.escAttr(id) + '"' + (item.disabled ? ' disabled="disabled"' : '') + '>' + acf.strEscape(text) + '</option>';
        }
      });
      // return
      return itemsHtml;
    };

    // update HTML
    $select.html(crawl(choices));

    // update value
    if (values.indexOf(value) > -1) {
      $select.val(value);
    }

    // return selected value
    return $select.val();
  };

  /**
   *  acf.lock
   *
   *  Creates a "lock" on an element for a given type and key
   *
   *  @date	22/2/18
   *  @since	ACF 5.6.9
   *
   *  @param	jQuery $el The element to lock.
   *  @param	string type The type of lock such as "condition" or "visibility".
   *  @param	string key The key that will be used to unlock.
   *  @return	void
   */

  var getLocks = function ($el, type) {
    return $el.data('acf-lock-' + type) || [];
  };
  var setLocks = function ($el, type, locks) {
    $el.data('acf-lock-' + type, locks);
  };
  acf.lock = function ($el, type, key) {
    var locks = getLocks($el, type);
    var i = locks.indexOf(key);
    if (i < 0) {
      locks.push(key);
      setLocks($el, type, locks);
    }
  };

  /**
   *  acf.unlock
   *
   *  Unlocks a "lock" on an element for a given type and key
   *
   *  @date	22/2/18
   *  @since	ACF 5.6.9
   *
   *  @param	jQuery $el The element to lock.
   *  @param	string type The type of lock such as "condition" or "visibility".
   *  @param	string key The key that will be used to unlock.
   *  @return	void
   */

  acf.unlock = function ($el, type, key) {
    var locks = getLocks($el, type);
    var i = locks.indexOf(key);
    if (i > -1) {
      locks.splice(i, 1);
      setLocks($el, type, locks);
    }

    // return true if is unlocked (no locks)
    return locks.length === 0;
  };

  /**
   *  acf.isLocked
   *
   *  Returns true if a lock exists for a given type
   *
   *  @date	22/2/18
   *  @since	ACF 5.6.9
   *
   *  @param	jQuery $el The element to lock.
   *  @param	string type The type of lock such as "condition" or "visibility".
   *  @return	void
   */

  acf.isLocked = function ($el, type) {
    return getLocks($el, type).length > 0;
  };

  /**
   *  acf.isGutenberg
   *
   *  Returns true if the Gutenberg editor is being used.
   *
   *  @since	ACF 5.8.0
   *
   *  @return	bool
   */
  acf.isGutenberg = function () {
    return !!(window.wp && wp.data && wp.data.select && wp.data.select('core/editor'));
  };

  /**
   *  acf.isGutenbergPostEditor
   *
   *  Returns true if the Gutenberg post editor is being used.
   *
   *  @since	ACF 6.2.2
   *
   *  @return	bool
   */
  acf.isGutenbergPostEditor = function () {
    return !!(window.wp && wp.data && wp.data.select && wp.data.select('core/edit-post'));
  };

  /**
   *  acf.objectToArray
   *
   *  Returns an array of items from the given object.
   *
   *  @date	20/11/18
   *  @since	ACF 5.8.0
   *
   *  @param	object obj The object of items.
   *  @return	array
   */
  acf.objectToArray = function (obj) {
    return Object.keys(obj).map(function (key) {
      return obj[key];
    });
  };

  /**
   * acf.debounce
   *
   * Returns a debounced version of the passed function which will postpone its execution until after `wait` milliseconds have elapsed since the last time it was invoked.
   *
   * @date	28/8/19
   * @since	ACF 5.8.1
   *
   * @param	function callback The callback function.
   * @return	int wait The number of milliseconds to wait.
   */
  acf.debounce = function (callback, wait) {
    var timeout;
    return function () {
      var context = this;
      var args = arguments;
      var later = function () {
        callback.apply(context, args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  /**
   * acf.throttle
   *
   * Returns a throttled version of the passed function which will allow only one execution per `limit` time period.
   *
   * @date	28/8/19
   * @since	ACF 5.8.1
   *
   * @param	function callback The callback function.
   * @return	int wait The number of milliseconds to wait.
   */
  acf.throttle = function (callback, limit) {
    var busy = false;
    return function () {
      if (busy) return;
      busy = true;
      setTimeout(function () {
        busy = false;
      }, limit);
      callback.apply(this, arguments);
    };
  };

  /**
   * acf.isInView
   *
   * Returns true if the given element is in view.
   *
   * @date	29/8/19
   * @since	ACF 5.8.1
   *
   * @param	elem el The dom element to inspect.
   * @return	bool
   */
  acf.isInView = function (el) {
    if (el instanceof jQuery) {
      el = el[0];
    }
    var rect = el.getBoundingClientRect();
    return rect.top !== rect.bottom && rect.top >= 0 && rect.left >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && rect.right <= (window.innerWidth || document.documentElement.clientWidth);
  };

  /**
   * acf.onceInView
   *
   * Watches for a dom element to become visible in the browser and then executes the passed callback.
   *
   * @date	28/8/19
   * @since	ACF 5.8.1
   *
   * @param	dom el The dom element to inspect.
   * @param	function callback The callback function.
   */
  acf.onceInView = function () {
    // Define list.
    var items = [];
    var id = 0;

    // Define check function.
    var check = function () {
      items.forEach(function (item) {
        if (acf.isInView(item.el)) {
          item.callback.apply(this);
          pop(item.id);
        }
      });
    };

    // And create a debounced version.
    var debounced = acf.debounce(check, 300);

    // Define add function.
    var push = function (el, callback) {
      // Add event listener.
      if (!items.length) {
        $(window).on('scroll resize', debounced).on('acfrefresh orientationchange', check);
      }

      // Append to list.
      items.push({
        id: id++,
        el: el,
        callback: callback
      });
    };

    // Define remove function.
    var pop = function (id) {
      // Remove from list.
      items = items.filter(function (item) {
        return item.id !== id;
      });

      // Clean up listener.
      if (!items.length) {
        $(window).off('scroll resize', debounced).off('acfrefresh orientationchange', check);
      }
    };

    // Define returned function.
    return function (el, callback) {
      // Allow jQuery object.
      if (el instanceof jQuery) el = el[0];

      // Execute callback if already in view or add to watch list.
      if (acf.isInView(el)) {
        callback.apply(this);
      } else {
        push(el, callback);
      }
    };
  }();

  /**
   * acf.once
   *
   * Creates a function that is restricted to invoking `func` once.
   *
   * @date	2/9/19
   * @since	ACF 5.8.1
   *
   * @param	function func The function to restrict.
   * @return	function
   */
  acf.once = function (func) {
    var i = 0;
    return function () {
      if (i++ > 0) {
        return func = undefined;
      }
      return func.apply(this, arguments);
    };
  };

  /**
   * Focuses attention to a specific element.
   *
   * @date	05/05/2020
   * @since	ACF 5.9.0
   *
   * @param	jQuery $el The jQuery element to focus.
   * @return	void
   */
  acf.focusAttention = function ($el) {
    var wait = 1000;

    // Apply class to focus attention.
    $el.addClass('acf-attention -focused');

    // Scroll to element if needed.
    var scrollTime = 500;
    if (!acf.isInView($el)) {
      $('body, html').animate({
        scrollTop: $el.offset().top - $(window).height() / 2
      }, scrollTime);
      wait += scrollTime;
    }

    // Remove class after $wait amount of time.
    var fadeTime = 250;
    setTimeout(function () {
      $el.removeClass('-focused');
      setTimeout(function () {
        $el.removeClass('acf-attention');
      }, fadeTime);
    }, wait);
  };

  /**
   * Description
   *
   * @date	05/05/2020
   * @since	ACF 5.9.0
   *
   * @param	type Var Description.
   * @return	type Description.
   */
  acf.onFocus = function ($el, callback) {
    // Only run once per element.
    // if( $el.data('acf.onFocus') ) {
    // 	return false;
    // }

    // Vars.
    var ignoreBlur = false;
    var focus = false;

    // Functions.
    var onFocus = function () {
      ignoreBlur = true;
      setTimeout(function () {
        ignoreBlur = false;
      }, 1);
      setFocus(true);
    };
    var onBlur = function () {
      if (!ignoreBlur) {
        setFocus(false);
      }
    };
    var addEvents = function () {
      $(document).on('click', onBlur);
      //$el.on('acfBlur', onBlur);
      $el.on('blur', 'input, select, textarea', onBlur);
    };
    var removeEvents = function () {
      $(document).off('click', onBlur);
      //$el.off('acfBlur', onBlur);
      $el.off('blur', 'input, select, textarea', onBlur);
    };
    var setFocus = function (value) {
      if (focus === value) {
        return;
      }
      if (value) {
        addEvents();
      } else {
        removeEvents();
      }
      focus = value;
      callback(value);
    };

    // Add events and set data.
    $el.on('click', onFocus);
    //$el.on('acfFocus', onFocus);
    $el.on('focus', 'input, select, textarea', onFocus);
    //$el.data('acf.onFocus', true);
  };

  /**
   * Disable form submit buttons
   *
   * @since ACF 6.2.3
   *
   * @param event e
   * @returns void
   */
  acf.disableForm = function (e) {
    // Disable submit button.
    if (e.submitter) e.submitter.classList.add('disabled');
  };

  /*
   *  exists
   *
   *  This function will return true if a jQuery selection exists
   *
   *  @type	function
   *  @date	8/09/2014
   *  @since	ACF 5.0.0
   *
   *  @param	n/a
   *  @return	(boolean)
   */

  $.fn.exists = function () {
    return $(this).length > 0;
  };

  /*
   *  outerHTML
   *
   *  This function will return a string containing the HTML of the selected element
   *
   *  @type	function
   *  @date	19/11/2013
   *  @since	ACF 5.0.0
   *
   *  @param	$.fn
   *  @return	(string)
   */

  $.fn.outerHTML = function () {
    return $(this).get(0).outerHTML;
  };

  /*
   *  indexOf
   *
   *  This function will provide compatibility for ie8
   *
   *  @type	function
   *  @date	5/3/17
   *  @since	ACF 5.5.10
   *
   *  @param	n/a
   *  @return	n/a
   */

  if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (val) {
      return $.inArray(val, this);
    };
  }

  /**
   * Returns true if value is a number or a numeric string.
   *
   * @date	30/11/20
   * @since	ACF 5.9.4
   * @link	https://stackoverflow.com/questions/9716468/pure-javascript-a-function-like-jquerys-isnumeric/9716488#9716488
   *
   * @param	mixed n The variable being evaluated.
   * @return	bool.
   */
  acf.isNumeric = function (n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  };

  /**
   * Triggers a "refresh" action used by various Components to redraw the DOM.
   *
   * @date	26/05/2020
   * @since	ACF 5.9.0
   *
   * @param	void
   * @return	void
   */
  acf.refresh = acf.debounce(function () {
    $(window).trigger('acfrefresh');
    acf.doAction('refresh');
  }, 0);

  /**
   * Log something to console if we're in debug mode.
   *
   * @since ACF 6.3
   */
  acf.debug = function () {
    if (acf.get('debug')) console.log.apply(null, arguments);
  };

  // Set up actions from events
  $(document).ready(function () {
    acf.doAction('ready');
  });
  $(window).on('load', function () {
    // Use timeout to ensure action runs after Gutenberg has modified DOM elements during "DOMContentLoaded".
    setTimeout(function () {
      acf.doAction('load');
    });
  });
  $(window).on('beforeunload', function () {
    acf.doAction('unload');
  });
  $(window).on('resize', function () {
    acf.doAction('resize');
  });
  $(document).on('sortstart', function (event, ui) {
    acf.doAction('sortstart', ui.item, ui.placeholder);
  });
  $(document).on('sortstop', function (event, ui) {
    acf.doAction('sortstop', ui.item, ui.placeholder);
  });
})(jQuery);

/***/ }),

/***/ "./node_modules/dompurify/dist/purify.cjs.js":
/*!***************************************************!*\
  !*** ./node_modules/dompurify/dist/purify.cjs.js ***!
  \***************************************************/
/***/ ((module) => {

"use strict";
/*! @license DOMPurify 3.3.0 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/3.3.0/LICENSE */



const {
  entries,
  setPrototypeOf,
  isFrozen,
  getPrototypeOf,
  getOwnPropertyDescriptor
} = Object;
let {
  freeze,
  seal,
  create
} = Object; // eslint-disable-line import/no-mutable-exports
let {
  apply,
  construct
} = typeof Reflect !== 'undefined' && Reflect;
if (!freeze) {
  freeze = function freeze(x) {
    return x;
  };
}
if (!seal) {
  seal = function seal(x) {
    return x;
  };
}
if (!apply) {
  apply = function apply(func, thisArg) {
    for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      args[_key - 2] = arguments[_key];
    }
    return func.apply(thisArg, args);
  };
}
if (!construct) {
  construct = function construct(Func) {
    for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      args[_key2 - 1] = arguments[_key2];
    }
    return new Func(...args);
  };
}
const arrayForEach = unapply(Array.prototype.forEach);
const arrayLastIndexOf = unapply(Array.prototype.lastIndexOf);
const arrayPop = unapply(Array.prototype.pop);
const arrayPush = unapply(Array.prototype.push);
const arraySplice = unapply(Array.prototype.splice);
const stringToLowerCase = unapply(String.prototype.toLowerCase);
const stringToString = unapply(String.prototype.toString);
const stringMatch = unapply(String.prototype.match);
const stringReplace = unapply(String.prototype.replace);
const stringIndexOf = unapply(String.prototype.indexOf);
const stringTrim = unapply(String.prototype.trim);
const objectHasOwnProperty = unapply(Object.prototype.hasOwnProperty);
const regExpTest = unapply(RegExp.prototype.test);
const typeErrorCreate = unconstruct(TypeError);
/**
 * Creates a new function that calls the given function with a specified thisArg and arguments.
 *
 * @param func - The function to be wrapped and called.
 * @returns A new function that calls the given function with a specified thisArg and arguments.
 */
function unapply(func) {
  return function (thisArg) {
    if (thisArg instanceof RegExp) {
      thisArg.lastIndex = 0;
    }
    for (var _len3 = arguments.length, args = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
      args[_key3 - 1] = arguments[_key3];
    }
    return apply(func, thisArg, args);
  };
}
/**
 * Creates a new function that constructs an instance of the given constructor function with the provided arguments.
 *
 * @param func - The constructor function to be wrapped and called.
 * @returns A new function that constructs an instance of the given constructor function with the provided arguments.
 */
function unconstruct(Func) {
  return function () {
    for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
      args[_key4] = arguments[_key4];
    }
    return construct(Func, args);
  };
}
/**
 * Add properties to a lookup table
 *
 * @param set - The set to which elements will be added.
 * @param array - The array containing elements to be added to the set.
 * @param transformCaseFunc - An optional function to transform the case of each element before adding to the set.
 * @returns The modified set with added elements.
 */
function addToSet(set, array) {
  let transformCaseFunc = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : stringToLowerCase;
  if (setPrototypeOf) {
    // Make 'in' and truthy checks like Boolean(set.constructor)
    // independent of any properties defined on Object.prototype.
    // Prevent prototype setters from intercepting set as a this value.
    setPrototypeOf(set, null);
  }
  let l = array.length;
  while (l--) {
    let element = array[l];
    if (typeof element === 'string') {
      const lcElement = transformCaseFunc(element);
      if (lcElement !== element) {
        // Config presets (e.g. tags.js, attrs.js) are immutable.
        if (!isFrozen(array)) {
          array[l] = lcElement;
        }
        element = lcElement;
      }
    }
    set[element] = true;
  }
  return set;
}
/**
 * Clean up an array to harden against CSPP
 *
 * @param array - The array to be cleaned.
 * @returns The cleaned version of the array
 */
function cleanArray(array) {
  for (let index = 0; index < array.length; index++) {
    const isPropertyExist = objectHasOwnProperty(array, index);
    if (!isPropertyExist) {
      array[index] = null;
    }
  }
  return array;
}
/**
 * Shallow clone an object
 *
 * @param object - The object to be cloned.
 * @returns A new object that copies the original.
 */
function clone(object) {
  const newObject = create(null);
  for (const [property, value] of entries(object)) {
    const isPropertyExist = objectHasOwnProperty(object, property);
    if (isPropertyExist) {
      if (Array.isArray(value)) {
        newObject[property] = cleanArray(value);
      } else if (value && typeof value === 'object' && value.constructor === Object) {
        newObject[property] = clone(value);
      } else {
        newObject[property] = value;
      }
    }
  }
  return newObject;
}
/**
 * This method automatically checks if the prop is function or getter and behaves accordingly.
 *
 * @param object - The object to look up the getter function in its prototype chain.
 * @param prop - The property name for which to find the getter function.
 * @returns The getter function found in the prototype chain or a fallback function.
 */
function lookupGetter(object, prop) {
  while (object !== null) {
    const desc = getOwnPropertyDescriptor(object, prop);
    if (desc) {
      if (desc.get) {
        return unapply(desc.get);
      }
      if (typeof desc.value === 'function') {
        return unapply(desc.value);
      }
    }
    object = getPrototypeOf(object);
  }
  function fallbackValue() {
    return null;
  }
  return fallbackValue;
}

const html$1 = freeze(['a', 'abbr', 'acronym', 'address', 'area', 'article', 'aside', 'audio', 'b', 'bdi', 'bdo', 'big', 'blink', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption', 'center', 'cite', 'code', 'col', 'colgroup', 'content', 'data', 'datalist', 'dd', 'decorator', 'del', 'details', 'dfn', 'dialog', 'dir', 'div', 'dl', 'dt', 'element', 'em', 'fieldset', 'figcaption', 'figure', 'font', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'html', 'i', 'img', 'input', 'ins', 'kbd', 'label', 'legend', 'li', 'main', 'map', 'mark', 'marquee', 'menu', 'menuitem', 'meter', 'nav', 'nobr', 'ol', 'optgroup', 'option', 'output', 'p', 'picture', 'pre', 'progress', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'search', 'section', 'select', 'shadow', 'slot', 'small', 'source', 'spacer', 'span', 'strike', 'strong', 'style', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'template', 'textarea', 'tfoot', 'th', 'thead', 'time', 'tr', 'track', 'tt', 'u', 'ul', 'var', 'video', 'wbr']);
const svg$1 = freeze(['svg', 'a', 'altglyph', 'altglyphdef', 'altglyphitem', 'animatecolor', 'animatemotion', 'animatetransform', 'circle', 'clippath', 'defs', 'desc', 'ellipse', 'enterkeyhint', 'exportparts', 'filter', 'font', 'g', 'glyph', 'glyphref', 'hkern', 'image', 'inputmode', 'line', 'lineargradient', 'marker', 'mask', 'metadata', 'mpath', 'part', 'path', 'pattern', 'polygon', 'polyline', 'radialgradient', 'rect', 'stop', 'style', 'switch', 'symbol', 'text', 'textpath', 'title', 'tref', 'tspan', 'view', 'vkern']);
const svgFilters = freeze(['feBlend', 'feColorMatrix', 'feComponentTransfer', 'feComposite', 'feConvolveMatrix', 'feDiffuseLighting', 'feDisplacementMap', 'feDistantLight', 'feDropShadow', 'feFlood', 'feFuncA', 'feFuncB', 'feFuncG', 'feFuncR', 'feGaussianBlur', 'feImage', 'feMerge', 'feMergeNode', 'feMorphology', 'feOffset', 'fePointLight', 'feSpecularLighting', 'feSpotLight', 'feTile', 'feTurbulence']);
// List of SVG elements that are disallowed by default.
// We still need to know them so that we can do namespace
// checks properly in case one wants to add them to
// allow-list.
const svgDisallowed = freeze(['animate', 'color-profile', 'cursor', 'discard', 'font-face', 'font-face-format', 'font-face-name', 'font-face-src', 'font-face-uri', 'foreignobject', 'hatch', 'hatchpath', 'mesh', 'meshgradient', 'meshpatch', 'meshrow', 'missing-glyph', 'script', 'set', 'solidcolor', 'unknown', 'use']);
const mathMl$1 = freeze(['math', 'menclose', 'merror', 'mfenced', 'mfrac', 'mglyph', 'mi', 'mlabeledtr', 'mmultiscripts', 'mn', 'mo', 'mover', 'mpadded', 'mphantom', 'mroot', 'mrow', 'ms', 'mspace', 'msqrt', 'mstyle', 'msub', 'msup', 'msubsup', 'mtable', 'mtd', 'mtext', 'mtr', 'munder', 'munderover', 'mprescripts']);
// Similarly to SVG, we want to know all MathML elements,
// even those that we disallow by default.
const mathMlDisallowed = freeze(['maction', 'maligngroup', 'malignmark', 'mlongdiv', 'mscarries', 'mscarry', 'msgroup', 'mstack', 'msline', 'msrow', 'semantics', 'annotation', 'annotation-xml', 'mprescripts', 'none']);
const text = freeze(['#text']);

const html = freeze(['accept', 'action', 'align', 'alt', 'autocapitalize', 'autocomplete', 'autopictureinpicture', 'autoplay', 'background', 'bgcolor', 'border', 'capture', 'cellpadding', 'cellspacing', 'checked', 'cite', 'class', 'clear', 'color', 'cols', 'colspan', 'controls', 'controlslist', 'coords', 'crossorigin', 'datetime', 'decoding', 'default', 'dir', 'disabled', 'disablepictureinpicture', 'disableremoteplayback', 'download', 'draggable', 'enctype', 'enterkeyhint', 'exportparts', 'face', 'for', 'headers', 'height', 'hidden', 'high', 'href', 'hreflang', 'id', 'inert', 'inputmode', 'integrity', 'ismap', 'kind', 'label', 'lang', 'list', 'loading', 'loop', 'low', 'max', 'maxlength', 'media', 'method', 'min', 'minlength', 'multiple', 'muted', 'name', 'nonce', 'noshade', 'novalidate', 'nowrap', 'open', 'optimum', 'part', 'pattern', 'placeholder', 'playsinline', 'popover', 'popovertarget', 'popovertargetaction', 'poster', 'preload', 'pubdate', 'radiogroup', 'readonly', 'rel', 'required', 'rev', 'reversed', 'role', 'rows', 'rowspan', 'spellcheck', 'scope', 'selected', 'shape', 'size', 'sizes', 'slot', 'span', 'srclang', 'start', 'src', 'srcset', 'step', 'style', 'summary', 'tabindex', 'title', 'translate', 'type', 'usemap', 'valign', 'value', 'width', 'wrap', 'xmlns', 'slot']);
const svg = freeze(['accent-height', 'accumulate', 'additive', 'alignment-baseline', 'amplitude', 'ascent', 'attributename', 'attributetype', 'azimuth', 'basefrequency', 'baseline-shift', 'begin', 'bias', 'by', 'class', 'clip', 'clippathunits', 'clip-path', 'clip-rule', 'color', 'color-interpolation', 'color-interpolation-filters', 'color-profile', 'color-rendering', 'cx', 'cy', 'd', 'dx', 'dy', 'diffuseconstant', 'direction', 'display', 'divisor', 'dur', 'edgemode', 'elevation', 'end', 'exponent', 'fill', 'fill-opacity', 'fill-rule', 'filter', 'filterunits', 'flood-color', 'flood-opacity', 'font-family', 'font-size', 'font-size-adjust', 'font-stretch', 'font-style', 'font-variant', 'font-weight', 'fx', 'fy', 'g1', 'g2', 'glyph-name', 'glyphref', 'gradientunits', 'gradienttransform', 'height', 'href', 'id', 'image-rendering', 'in', 'in2', 'intercept', 'k', 'k1', 'k2', 'k3', 'k4', 'kerning', 'keypoints', 'keysplines', 'keytimes', 'lang', 'lengthadjust', 'letter-spacing', 'kernelmatrix', 'kernelunitlength', 'lighting-color', 'local', 'marker-end', 'marker-mid', 'marker-start', 'markerheight', 'markerunits', 'markerwidth', 'maskcontentunits', 'maskunits', 'max', 'mask', 'mask-type', 'media', 'method', 'mode', 'min', 'name', 'numoctaves', 'offset', 'operator', 'opacity', 'order', 'orient', 'orientation', 'origin', 'overflow', 'paint-order', 'path', 'pathlength', 'patterncontentunits', 'patterntransform', 'patternunits', 'points', 'preservealpha', 'preserveaspectratio', 'primitiveunits', 'r', 'rx', 'ry', 'radius', 'refx', 'refy', 'repeatcount', 'repeatdur', 'restart', 'result', 'rotate', 'scale', 'seed', 'shape-rendering', 'slope', 'specularconstant', 'specularexponent', 'spreadmethod', 'startoffset', 'stddeviation', 'stitchtiles', 'stop-color', 'stop-opacity', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-opacity', 'stroke', 'stroke-width', 'style', 'surfacescale', 'systemlanguage', 'tabindex', 'tablevalues', 'targetx', 'targety', 'transform', 'transform-origin', 'text-anchor', 'text-decoration', 'text-rendering', 'textlength', 'type', 'u1', 'u2', 'unicode', 'values', 'viewbox', 'visibility', 'version', 'vert-adv-y', 'vert-origin-x', 'vert-origin-y', 'width', 'word-spacing', 'wrap', 'writing-mode', 'xchannelselector', 'ychannelselector', 'x', 'x1', 'x2', 'xmlns', 'y', 'y1', 'y2', 'z', 'zoomandpan']);
const mathMl = freeze(['accent', 'accentunder', 'align', 'bevelled', 'close', 'columnsalign', 'columnlines', 'columnspan', 'denomalign', 'depth', 'dir', 'display', 'displaystyle', 'encoding', 'fence', 'frame', 'height', 'href', 'id', 'largeop', 'length', 'linethickness', 'lspace', 'lquote', 'mathbackground', 'mathcolor', 'mathsize', 'mathvariant', 'maxsize', 'minsize', 'movablelimits', 'notation', 'numalign', 'open', 'rowalign', 'rowlines', 'rowspacing', 'rowspan', 'rspace', 'rquote', 'scriptlevel', 'scriptminsize', 'scriptsizemultiplier', 'selection', 'separator', 'separators', 'stretchy', 'subscriptshift', 'supscriptshift', 'symmetric', 'voffset', 'width', 'xmlns']);
const xml = freeze(['xlink:href', 'xml:id', 'xlink:title', 'xml:space', 'xmlns:xlink']);

// eslint-disable-next-line unicorn/better-regex
const MUSTACHE_EXPR = seal(/\{\{[\w\W]*|[\w\W]*\}\}/gm); // Specify template detection regex for SAFE_FOR_TEMPLATES mode
const ERB_EXPR = seal(/<%[\w\W]*|[\w\W]*%>/gm);
const TMPLIT_EXPR = seal(/\$\{[\w\W]*/gm); // eslint-disable-line unicorn/better-regex
const DATA_ATTR = seal(/^data-[\-\w.\u00B7-\uFFFF]+$/); // eslint-disable-line no-useless-escape
const ARIA_ATTR = seal(/^aria-[\-\w]+$/); // eslint-disable-line no-useless-escape
const IS_ALLOWED_URI = seal(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i // eslint-disable-line no-useless-escape
);
const IS_SCRIPT_OR_DATA = seal(/^(?:\w+script|data):/i);
const ATTR_WHITESPACE = seal(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g // eslint-disable-line no-control-regex
);
const DOCTYPE_NAME = seal(/^html$/i);
const CUSTOM_ELEMENT = seal(/^[a-z][.\w]*(-[.\w]+)+$/i);

var EXPRESSIONS = /*#__PURE__*/Object.freeze({
  __proto__: null,
  ARIA_ATTR: ARIA_ATTR,
  ATTR_WHITESPACE: ATTR_WHITESPACE,
  CUSTOM_ELEMENT: CUSTOM_ELEMENT,
  DATA_ATTR: DATA_ATTR,
  DOCTYPE_NAME: DOCTYPE_NAME,
  ERB_EXPR: ERB_EXPR,
  IS_ALLOWED_URI: IS_ALLOWED_URI,
  IS_SCRIPT_OR_DATA: IS_SCRIPT_OR_DATA,
  MUSTACHE_EXPR: MUSTACHE_EXPR,
  TMPLIT_EXPR: TMPLIT_EXPR
});

/* eslint-disable @typescript-eslint/indent */
// https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
const NODE_TYPE = {
  element: 1,
  attribute: 2,
  text: 3,
  cdataSection: 4,
  entityReference: 5,
  // Deprecated
  entityNode: 6,
  // Deprecated
  progressingInstruction: 7,
  comment: 8,
  document: 9,
  documentType: 10,
  documentFragment: 11,
  notation: 12 // Deprecated
};
const getGlobal = function getGlobal() {
  return typeof window === 'undefined' ? null : window;
};
/**
 * Creates a no-op policy for internal use only.
 * Don't export this function outside this module!
 * @param trustedTypes The policy factory.
 * @param purifyHostElement The Script element used to load DOMPurify (to determine policy name suffix).
 * @return The policy created (or null, if Trusted Types
 * are not supported or creating the policy failed).
 */
const _createTrustedTypesPolicy = function _createTrustedTypesPolicy(trustedTypes, purifyHostElement) {
  if (typeof trustedTypes !== 'object' || typeof trustedTypes.createPolicy !== 'function') {
    return null;
  }
  // Allow the callers to control the unique policy name
  // by adding a data-tt-policy-suffix to the script element with the DOMPurify.
  // Policy creation with duplicate names throws in Trusted Types.
  let suffix = null;
  const ATTR_NAME = 'data-tt-policy-suffix';
  if (purifyHostElement && purifyHostElement.hasAttribute(ATTR_NAME)) {
    suffix = purifyHostElement.getAttribute(ATTR_NAME);
  }
  const policyName = 'dompurify' + (suffix ? '#' + suffix : '');
  try {
    return trustedTypes.createPolicy(policyName, {
      createHTML(html) {
        return html;
      },
      createScriptURL(scriptUrl) {
        return scriptUrl;
      }
    });
  } catch (_) {
    // Policy creation failed (most likely another DOMPurify script has
    // already run). Skip creating the policy, as this will only cause errors
    // if TT are enforced.
    console.warn('TrustedTypes policy ' + policyName + ' could not be created.');
    return null;
  }
};
const _createHooksMap = function _createHooksMap() {
  return {
    afterSanitizeAttributes: [],
    afterSanitizeElements: [],
    afterSanitizeShadowDOM: [],
    beforeSanitizeAttributes: [],
    beforeSanitizeElements: [],
    beforeSanitizeShadowDOM: [],
    uponSanitizeAttribute: [],
    uponSanitizeElement: [],
    uponSanitizeShadowNode: []
  };
};
function createDOMPurify() {
  let window = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : getGlobal();
  const DOMPurify = root => createDOMPurify(root);
  DOMPurify.version = '3.3.0';
  DOMPurify.removed = [];
  if (!window || !window.document || window.document.nodeType !== NODE_TYPE.document || !window.Element) {
    // Not running in a browser, provide a factory function
    // so that you can pass your own Window
    DOMPurify.isSupported = false;
    return DOMPurify;
  }
  let {
    document
  } = window;
  const originalDocument = document;
  const currentScript = originalDocument.currentScript;
  const {
    DocumentFragment,
    HTMLTemplateElement,
    Node,
    Element,
    NodeFilter,
    NamedNodeMap = window.NamedNodeMap || window.MozNamedAttrMap,
    HTMLFormElement,
    DOMParser,
    trustedTypes
  } = window;
  const ElementPrototype = Element.prototype;
  const cloneNode = lookupGetter(ElementPrototype, 'cloneNode');
  const remove = lookupGetter(ElementPrototype, 'remove');
  const getNextSibling = lookupGetter(ElementPrototype, 'nextSibling');
  const getChildNodes = lookupGetter(ElementPrototype, 'childNodes');
  const getParentNode = lookupGetter(ElementPrototype, 'parentNode');
  // As per issue #47, the web-components registry is inherited by a
  // new document created via createHTMLDocument. As per the spec
  // (http://w3c.github.io/webcomponents/spec/custom/#creating-and-passing-registries)
  // a new empty registry is used when creating a template contents owner
  // document, so we use that as our parent document to ensure nothing
  // is inherited.
  if (typeof HTMLTemplateElement === 'function') {
    const template = document.createElement('template');
    if (template.content && template.content.ownerDocument) {
      document = template.content.ownerDocument;
    }
  }
  let trustedTypesPolicy;
  let emptyHTML = '';
  const {
    implementation,
    createNodeIterator,
    createDocumentFragment,
    getElementsByTagName
  } = document;
  const {
    importNode
  } = originalDocument;
  let hooks = _createHooksMap();
  /**
   * Expose whether this browser supports running the full DOMPurify.
   */
  DOMPurify.isSupported = typeof entries === 'function' && typeof getParentNode === 'function' && implementation && implementation.createHTMLDocument !== undefined;
  const {
    MUSTACHE_EXPR,
    ERB_EXPR,
    TMPLIT_EXPR,
    DATA_ATTR,
    ARIA_ATTR,
    IS_SCRIPT_OR_DATA,
    ATTR_WHITESPACE,
    CUSTOM_ELEMENT
  } = EXPRESSIONS;
  let {
    IS_ALLOWED_URI: IS_ALLOWED_URI$1
  } = EXPRESSIONS;
  /**
   * We consider the elements and attributes below to be safe. Ideally
   * don't add any new ones but feel free to remove unwanted ones.
   */
  /* allowed element names */
  let ALLOWED_TAGS = null;
  const DEFAULT_ALLOWED_TAGS = addToSet({}, [...html$1, ...svg$1, ...svgFilters, ...mathMl$1, ...text]);
  /* Allowed attribute names */
  let ALLOWED_ATTR = null;
  const DEFAULT_ALLOWED_ATTR = addToSet({}, [...html, ...svg, ...mathMl, ...xml]);
  /*
   * Configure how DOMPurify should handle custom elements and their attributes as well as customized built-in elements.
   * @property {RegExp|Function|null} tagNameCheck one of [null, regexPattern, predicate]. Default: `null` (disallow any custom elements)
   * @property {RegExp|Function|null} attributeNameCheck one of [null, regexPattern, predicate]. Default: `null` (disallow any attributes not on the allow list)
   * @property {boolean} allowCustomizedBuiltInElements allow custom elements derived from built-ins if they pass CUSTOM_ELEMENT_HANDLING.tagNameCheck. Default: `false`.
   */
  let CUSTOM_ELEMENT_HANDLING = Object.seal(create(null, {
    tagNameCheck: {
      writable: true,
      configurable: false,
      enumerable: true,
      value: null
    },
    attributeNameCheck: {
      writable: true,
      configurable: false,
      enumerable: true,
      value: null
    },
    allowCustomizedBuiltInElements: {
      writable: true,
      configurable: false,
      enumerable: true,
      value: false
    }
  }));
  /* Explicitly forbidden tags (overrides ALLOWED_TAGS/ADD_TAGS) */
  let FORBID_TAGS = null;
  /* Explicitly forbidden attributes (overrides ALLOWED_ATTR/ADD_ATTR) */
  let FORBID_ATTR = null;
  /* Config object to store ADD_TAGS/ADD_ATTR functions (when used as functions) */
  const EXTRA_ELEMENT_HANDLING = Object.seal(create(null, {
    tagCheck: {
      writable: true,
      configurable: false,
      enumerable: true,
      value: null
    },
    attributeCheck: {
      writable: true,
      configurable: false,
      enumerable: true,
      value: null
    }
  }));
  /* Decide if ARIA attributes are okay */
  let ALLOW_ARIA_ATTR = true;
  /* Decide if custom data attributes are okay */
  let ALLOW_DATA_ATTR = true;
  /* Decide if unknown protocols are okay */
  let ALLOW_UNKNOWN_PROTOCOLS = false;
  /* Decide if self-closing tags in attributes are allowed.
   * Usually removed due to a mXSS issue in jQuery 3.0 */
  let ALLOW_SELF_CLOSE_IN_ATTR = true;
  /* Output should be safe for common template engines.
   * This means, DOMPurify removes data attributes, mustaches and ERB
   */
  let SAFE_FOR_TEMPLATES = false;
  /* Output should be safe even for XML used within HTML and alike.
   * This means, DOMPurify removes comments when containing risky content.
   */
  let SAFE_FOR_XML = true;
  /* Decide if document with <html>... should be returned */
  let WHOLE_DOCUMENT = false;
  /* Track whether config is already set on this instance of DOMPurify. */
  let SET_CONFIG = false;
  /* Decide if all elements (e.g. style, script) must be children of
   * document.body. By default, browsers might move them to document.head */
  let FORCE_BODY = false;
  /* Decide if a DOM `HTMLBodyElement` should be returned, instead of a html
   * string (or a TrustedHTML object if Trusted Types are supported).
   * If `WHOLE_DOCUMENT` is enabled a `HTMLHtmlElement` will be returned instead
   */
  let RETURN_DOM = false;
  /* Decide if a DOM `DocumentFragment` should be returned, instead of a html
   * string  (or a TrustedHTML object if Trusted Types are supported) */
  let RETURN_DOM_FRAGMENT = false;
  /* Try to return a Trusted Type object instead of a string, return a string in
   * case Trusted Types are not supported  */
  let RETURN_TRUSTED_TYPE = false;
  /* Output should be free from DOM clobbering attacks?
   * This sanitizes markups named with colliding, clobberable built-in DOM APIs.
   */
  let SANITIZE_DOM = true;
  /* Achieve full DOM Clobbering protection by isolating the namespace of named
   * properties and JS variables, mitigating attacks that abuse the HTML/DOM spec rules.
   *
   * HTML/DOM spec rules that enable DOM Clobbering:
   *   - Named Access on Window (§7.3.3)
   *   - DOM Tree Accessors (§3.1.5)
   *   - Form Element Parent-Child Relations (§4.10.3)
   *   - Iframe srcdoc / Nested WindowProxies (§4.8.5)
   *   - HTMLCollection (§4.2.10.2)
   *
   * Namespace isolation is implemented by prefixing `id` and `name` attributes
   * with a constant string, i.e., `user-content-`
   */
  let SANITIZE_NAMED_PROPS = false;
  const SANITIZE_NAMED_PROPS_PREFIX = 'user-content-';
  /* Keep element content when removing element? */
  let KEEP_CONTENT = true;
  /* If a `Node` is passed to sanitize(), then performs sanitization in-place instead
   * of importing it into a new Document and returning a sanitized copy */
  let IN_PLACE = false;
  /* Allow usage of profiles like html, svg and mathMl */
  let USE_PROFILES = {};
  /* Tags to ignore content of when KEEP_CONTENT is true */
  let FORBID_CONTENTS = null;
  const DEFAULT_FORBID_CONTENTS = addToSet({}, ['annotation-xml', 'audio', 'colgroup', 'desc', 'foreignobject', 'head', 'iframe', 'math', 'mi', 'mn', 'mo', 'ms', 'mtext', 'noembed', 'noframes', 'noscript', 'plaintext', 'script', 'style', 'svg', 'template', 'thead', 'title', 'video', 'xmp']);
  /* Tags that are safe for data: URIs */
  let DATA_URI_TAGS = null;
  const DEFAULT_DATA_URI_TAGS = addToSet({}, ['audio', 'video', 'img', 'source', 'image', 'track']);
  /* Attributes safe for values like "javascript:" */
  let URI_SAFE_ATTRIBUTES = null;
  const DEFAULT_URI_SAFE_ATTRIBUTES = addToSet({}, ['alt', 'class', 'for', 'id', 'label', 'name', 'pattern', 'placeholder', 'role', 'summary', 'title', 'value', 'style', 'xmlns']);
  const MATHML_NAMESPACE = 'http://www.w3.org/1998/Math/MathML';
  const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
  const HTML_NAMESPACE = 'http://www.w3.org/1999/xhtml';
  /* Document namespace */
  let NAMESPACE = HTML_NAMESPACE;
  let IS_EMPTY_INPUT = false;
  /* Allowed XHTML+XML namespaces */
  let ALLOWED_NAMESPACES = null;
  const DEFAULT_ALLOWED_NAMESPACES = addToSet({}, [MATHML_NAMESPACE, SVG_NAMESPACE, HTML_NAMESPACE], stringToString);
  let MATHML_TEXT_INTEGRATION_POINTS = addToSet({}, ['mi', 'mo', 'mn', 'ms', 'mtext']);
  let HTML_INTEGRATION_POINTS = addToSet({}, ['annotation-xml']);
  // Certain elements are allowed in both SVG and HTML
  // namespace. We need to specify them explicitly
  // so that they don't get erroneously deleted from
  // HTML namespace.
  const COMMON_SVG_AND_HTML_ELEMENTS = addToSet({}, ['title', 'style', 'font', 'a', 'script']);
  /* Parsing of strict XHTML documents */
  let PARSER_MEDIA_TYPE = null;
  const SUPPORTED_PARSER_MEDIA_TYPES = ['application/xhtml+xml', 'text/html'];
  const DEFAULT_PARSER_MEDIA_TYPE = 'text/html';
  let transformCaseFunc = null;
  /* Keep a reference to config to pass to hooks */
  let CONFIG = null;
  /* Ideally, do not touch anything below this line */
  /* ______________________________________________ */
  const formElement = document.createElement('form');
  const isRegexOrFunction = function isRegexOrFunction(testValue) {
    return testValue instanceof RegExp || testValue instanceof Function;
  };
  /**
   * _parseConfig
   *
   * @param cfg optional config literal
   */
  // eslint-disable-next-line complexity
  const _parseConfig = function _parseConfig() {
    let cfg = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    if (CONFIG && CONFIG === cfg) {
      return;
    }
    /* Shield configuration object from tampering */
    if (!cfg || typeof cfg !== 'object') {
      cfg = {};
    }
    /* Shield configuration object from prototype pollution */
    cfg = clone(cfg);
    PARSER_MEDIA_TYPE =
    // eslint-disable-next-line unicorn/prefer-includes
    SUPPORTED_PARSER_MEDIA_TYPES.indexOf(cfg.PARSER_MEDIA_TYPE) === -1 ? DEFAULT_PARSER_MEDIA_TYPE : cfg.PARSER_MEDIA_TYPE;
    // HTML tags and attributes are not case-sensitive, converting to lowercase. Keeping XHTML as is.
    transformCaseFunc = PARSER_MEDIA_TYPE === 'application/xhtml+xml' ? stringToString : stringToLowerCase;
    /* Set configuration parameters */
    ALLOWED_TAGS = objectHasOwnProperty(cfg, 'ALLOWED_TAGS') ? addToSet({}, cfg.ALLOWED_TAGS, transformCaseFunc) : DEFAULT_ALLOWED_TAGS;
    ALLOWED_ATTR = objectHasOwnProperty(cfg, 'ALLOWED_ATTR') ? addToSet({}, cfg.ALLOWED_ATTR, transformCaseFunc) : DEFAULT_ALLOWED_ATTR;
    ALLOWED_NAMESPACES = objectHasOwnProperty(cfg, 'ALLOWED_NAMESPACES') ? addToSet({}, cfg.ALLOWED_NAMESPACES, stringToString) : DEFAULT_ALLOWED_NAMESPACES;
    URI_SAFE_ATTRIBUTES = objectHasOwnProperty(cfg, 'ADD_URI_SAFE_ATTR') ? addToSet(clone(DEFAULT_URI_SAFE_ATTRIBUTES), cfg.ADD_URI_SAFE_ATTR, transformCaseFunc) : DEFAULT_URI_SAFE_ATTRIBUTES;
    DATA_URI_TAGS = objectHasOwnProperty(cfg, 'ADD_DATA_URI_TAGS') ? addToSet(clone(DEFAULT_DATA_URI_TAGS), cfg.ADD_DATA_URI_TAGS, transformCaseFunc) : DEFAULT_DATA_URI_TAGS;
    FORBID_CONTENTS = objectHasOwnProperty(cfg, 'FORBID_CONTENTS') ? addToSet({}, cfg.FORBID_CONTENTS, transformCaseFunc) : DEFAULT_FORBID_CONTENTS;
    FORBID_TAGS = objectHasOwnProperty(cfg, 'FORBID_TAGS') ? addToSet({}, cfg.FORBID_TAGS, transformCaseFunc) : clone({});
    FORBID_ATTR = objectHasOwnProperty(cfg, 'FORBID_ATTR') ? addToSet({}, cfg.FORBID_ATTR, transformCaseFunc) : clone({});
    USE_PROFILES = objectHasOwnProperty(cfg, 'USE_PROFILES') ? cfg.USE_PROFILES : false;
    ALLOW_ARIA_ATTR = cfg.ALLOW_ARIA_ATTR !== false; // Default true
    ALLOW_DATA_ATTR = cfg.ALLOW_DATA_ATTR !== false; // Default true
    ALLOW_UNKNOWN_PROTOCOLS = cfg.ALLOW_UNKNOWN_PROTOCOLS || false; // Default false
    ALLOW_SELF_CLOSE_IN_ATTR = cfg.ALLOW_SELF_CLOSE_IN_ATTR !== false; // Default true
    SAFE_FOR_TEMPLATES = cfg.SAFE_FOR_TEMPLATES || false; // Default false
    SAFE_FOR_XML = cfg.SAFE_FOR_XML !== false; // Default true
    WHOLE_DOCUMENT = cfg.WHOLE_DOCUMENT || false; // Default false
    RETURN_DOM = cfg.RETURN_DOM || false; // Default false
    RETURN_DOM_FRAGMENT = cfg.RETURN_DOM_FRAGMENT || false; // Default false
    RETURN_TRUSTED_TYPE = cfg.RETURN_TRUSTED_TYPE || false; // Default false
    FORCE_BODY = cfg.FORCE_BODY || false; // Default false
    SANITIZE_DOM = cfg.SANITIZE_DOM !== false; // Default true
    SANITIZE_NAMED_PROPS = cfg.SANITIZE_NAMED_PROPS || false; // Default false
    KEEP_CONTENT = cfg.KEEP_CONTENT !== false; // Default true
    IN_PLACE = cfg.IN_PLACE || false; // Default false
    IS_ALLOWED_URI$1 = cfg.ALLOWED_URI_REGEXP || IS_ALLOWED_URI;
    NAMESPACE = cfg.NAMESPACE || HTML_NAMESPACE;
    MATHML_TEXT_INTEGRATION_POINTS = cfg.MATHML_TEXT_INTEGRATION_POINTS || MATHML_TEXT_INTEGRATION_POINTS;
    HTML_INTEGRATION_POINTS = cfg.HTML_INTEGRATION_POINTS || HTML_INTEGRATION_POINTS;
    CUSTOM_ELEMENT_HANDLING = cfg.CUSTOM_ELEMENT_HANDLING || {};
    if (cfg.CUSTOM_ELEMENT_HANDLING && isRegexOrFunction(cfg.CUSTOM_ELEMENT_HANDLING.tagNameCheck)) {
      CUSTOM_ELEMENT_HANDLING.tagNameCheck = cfg.CUSTOM_ELEMENT_HANDLING.tagNameCheck;
    }
    if (cfg.CUSTOM_ELEMENT_HANDLING && isRegexOrFunction(cfg.CUSTOM_ELEMENT_HANDLING.attributeNameCheck)) {
      CUSTOM_ELEMENT_HANDLING.attributeNameCheck = cfg.CUSTOM_ELEMENT_HANDLING.attributeNameCheck;
    }
    if (cfg.CUSTOM_ELEMENT_HANDLING && typeof cfg.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements === 'boolean') {
      CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements = cfg.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements;
    }
    if (SAFE_FOR_TEMPLATES) {
      ALLOW_DATA_ATTR = false;
    }
    if (RETURN_DOM_FRAGMENT) {
      RETURN_DOM = true;
    }
    /* Parse profile info */
    if (USE_PROFILES) {
      ALLOWED_TAGS = addToSet({}, text);
      ALLOWED_ATTR = [];
      if (USE_PROFILES.html === true) {
        addToSet(ALLOWED_TAGS, html$1);
        addToSet(ALLOWED_ATTR, html);
      }
      if (USE_PROFILES.svg === true) {
        addToSet(ALLOWED_TAGS, svg$1);
        addToSet(ALLOWED_ATTR, svg);
        addToSet(ALLOWED_ATTR, xml);
      }
      if (USE_PROFILES.svgFilters === true) {
        addToSet(ALLOWED_TAGS, svgFilters);
        addToSet(ALLOWED_ATTR, svg);
        addToSet(ALLOWED_ATTR, xml);
      }
      if (USE_PROFILES.mathMl === true) {
        addToSet(ALLOWED_TAGS, mathMl$1);
        addToSet(ALLOWED_ATTR, mathMl);
        addToSet(ALLOWED_ATTR, xml);
      }
    }
    /* Merge configuration parameters */
    if (cfg.ADD_TAGS) {
      if (typeof cfg.ADD_TAGS === 'function') {
        EXTRA_ELEMENT_HANDLING.tagCheck = cfg.ADD_TAGS;
      } else {
        if (ALLOWED_TAGS === DEFAULT_ALLOWED_TAGS) {
          ALLOWED_TAGS = clone(ALLOWED_TAGS);
        }
        addToSet(ALLOWED_TAGS, cfg.ADD_TAGS, transformCaseFunc);
      }
    }
    if (cfg.ADD_ATTR) {
      if (typeof cfg.ADD_ATTR === 'function') {
        EXTRA_ELEMENT_HANDLING.attributeCheck = cfg.ADD_ATTR;
      } else {
        if (ALLOWED_ATTR === DEFAULT_ALLOWED_ATTR) {
          ALLOWED_ATTR = clone(ALLOWED_ATTR);
        }
        addToSet(ALLOWED_ATTR, cfg.ADD_ATTR, transformCaseFunc);
      }
    }
    if (cfg.ADD_URI_SAFE_ATTR) {
      addToSet(URI_SAFE_ATTRIBUTES, cfg.ADD_URI_SAFE_ATTR, transformCaseFunc);
    }
    if (cfg.FORBID_CONTENTS) {
      if (FORBID_CONTENTS === DEFAULT_FORBID_CONTENTS) {
        FORBID_CONTENTS = clone(FORBID_CONTENTS);
      }
      addToSet(FORBID_CONTENTS, cfg.FORBID_CONTENTS, transformCaseFunc);
    }
    /* Add #text in case KEEP_CONTENT is set to true */
    if (KEEP_CONTENT) {
      ALLOWED_TAGS['#text'] = true;
    }
    /* Add html, head and body to ALLOWED_TAGS in case WHOLE_DOCUMENT is true */
    if (WHOLE_DOCUMENT) {
      addToSet(ALLOWED_TAGS, ['html', 'head', 'body']);
    }
    /* Add tbody to ALLOWED_TAGS in case tables are permitted, see #286, #365 */
    if (ALLOWED_TAGS.table) {
      addToSet(ALLOWED_TAGS, ['tbody']);
      delete FORBID_TAGS.tbody;
    }
    if (cfg.TRUSTED_TYPES_POLICY) {
      if (typeof cfg.TRUSTED_TYPES_POLICY.createHTML !== 'function') {
        throw typeErrorCreate('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');
      }
      if (typeof cfg.TRUSTED_TYPES_POLICY.createScriptURL !== 'function') {
        throw typeErrorCreate('TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.');
      }
      // Overwrite existing TrustedTypes policy.
      trustedTypesPolicy = cfg.TRUSTED_TYPES_POLICY;
      // Sign local variables required by `sanitize`.
      emptyHTML = trustedTypesPolicy.createHTML('');
    } else {
      // Uninitialized policy, attempt to initialize the internal dompurify policy.
      if (trustedTypesPolicy === undefined) {
        trustedTypesPolicy = _createTrustedTypesPolicy(trustedTypes, currentScript);
      }
      // If creating the internal policy succeeded sign internal variables.
      if (trustedTypesPolicy !== null && typeof emptyHTML === 'string') {
        emptyHTML = trustedTypesPolicy.createHTML('');
      }
    }
    // Prevent further manipulation of configuration.
    // Not available in IE8, Safari 5, etc.
    if (freeze) {
      freeze(cfg);
    }
    CONFIG = cfg;
  };
  /* Keep track of all possible SVG and MathML tags
   * so that we can perform the namespace checks
   * correctly. */
  const ALL_SVG_TAGS = addToSet({}, [...svg$1, ...svgFilters, ...svgDisallowed]);
  const ALL_MATHML_TAGS = addToSet({}, [...mathMl$1, ...mathMlDisallowed]);
  /**
   * @param element a DOM element whose namespace is being checked
   * @returns Return false if the element has a
   *  namespace that a spec-compliant parser would never
   *  return. Return true otherwise.
   */
  const _checkValidNamespace = function _checkValidNamespace(element) {
    let parent = getParentNode(element);
    // In JSDOM, if we're inside shadow DOM, then parentNode
    // can be null. We just simulate parent in this case.
    if (!parent || !parent.tagName) {
      parent = {
        namespaceURI: NAMESPACE,
        tagName: 'template'
      };
    }
    const tagName = stringToLowerCase(element.tagName);
    const parentTagName = stringToLowerCase(parent.tagName);
    if (!ALLOWED_NAMESPACES[element.namespaceURI]) {
      return false;
    }
    if (element.namespaceURI === SVG_NAMESPACE) {
      // The only way to switch from HTML namespace to SVG
      // is via <svg>. If it happens via any other tag, then
      // it should be killed.
      if (parent.namespaceURI === HTML_NAMESPACE) {
        return tagName === 'svg';
      }
      // The only way to switch from MathML to SVG is via`
      // svg if parent is either <annotation-xml> or MathML
      // text integration points.
      if (parent.namespaceURI === MATHML_NAMESPACE) {
        return tagName === 'svg' && (parentTagName === 'annotation-xml' || MATHML_TEXT_INTEGRATION_POINTS[parentTagName]);
      }
      // We only allow elements that are defined in SVG
      // spec. All others are disallowed in SVG namespace.
      return Boolean(ALL_SVG_TAGS[tagName]);
    }
    if (element.namespaceURI === MATHML_NAMESPACE) {
      // The only way to switch from HTML namespace to MathML
      // is via <math>. If it happens via any other tag, then
      // it should be killed.
      if (parent.namespaceURI === HTML_NAMESPACE) {
        return tagName === 'math';
      }
      // The only way to switch from SVG to MathML is via
      // <math> and HTML integration points
      if (parent.namespaceURI === SVG_NAMESPACE) {
        return tagName === 'math' && HTML_INTEGRATION_POINTS[parentTagName];
      }
      // We only allow elements that are defined in MathML
      // spec. All others are disallowed in MathML namespace.
      return Boolean(ALL_MATHML_TAGS[tagName]);
    }
    if (element.namespaceURI === HTML_NAMESPACE) {
      // The only way to switch from SVG to HTML is via
      // HTML integration points, and from MathML to HTML
      // is via MathML text integration points
      if (parent.namespaceURI === SVG_NAMESPACE && !HTML_INTEGRATION_POINTS[parentTagName]) {
        return false;
      }
      if (parent.namespaceURI === MATHML_NAMESPACE && !MATHML_TEXT_INTEGRATION_POINTS[parentTagName]) {
        return false;
      }
      // We disallow tags that are specific for MathML
      // or SVG and should never appear in HTML namespace
      return !ALL_MATHML_TAGS[tagName] && (COMMON_SVG_AND_HTML_ELEMENTS[tagName] || !ALL_SVG_TAGS[tagName]);
    }
    // For XHTML and XML documents that support custom namespaces
    if (PARSER_MEDIA_TYPE === 'application/xhtml+xml' && ALLOWED_NAMESPACES[element.namespaceURI]) {
      return true;
    }
    // The code should never reach this place (this means
    // that the element somehow got namespace that is not
    // HTML, SVG, MathML or allowed via ALLOWED_NAMESPACES).
    // Return false just in case.
    return false;
  };
  /**
   * _forceRemove
   *
   * @param node a DOM node
   */
  const _forceRemove = function _forceRemove(node) {
    arrayPush(DOMPurify.removed, {
      element: node
    });
    try {
      // eslint-disable-next-line unicorn/prefer-dom-node-remove
      getParentNode(node).removeChild(node);
    } catch (_) {
      remove(node);
    }
  };
  /**
   * _removeAttribute
   *
   * @param name an Attribute name
   * @param element a DOM node
   */
  const _removeAttribute = function _removeAttribute(name, element) {
    try {
      arrayPush(DOMPurify.removed, {
        attribute: element.getAttributeNode(name),
        from: element
      });
    } catch (_) {
      arrayPush(DOMPurify.removed, {
        attribute: null,
        from: element
      });
    }
    element.removeAttribute(name);
    // We void attribute values for unremovable "is" attributes
    if (name === 'is') {
      if (RETURN_DOM || RETURN_DOM_FRAGMENT) {
        try {
          _forceRemove(element);
        } catch (_) {}
      } else {
        try {
          element.setAttribute(name, '');
        } catch (_) {}
      }
    }
  };
  /**
   * _initDocument
   *
   * @param dirty - a string of dirty markup
   * @return a DOM, filled with the dirty markup
   */
  const _initDocument = function _initDocument(dirty) {
    /* Create a HTML document */
    let doc = null;
    let leadingWhitespace = null;
    if (FORCE_BODY) {
      dirty = '<remove></remove>' + dirty;
    } else {
      /* If FORCE_BODY isn't used, leading whitespace needs to be preserved manually */
      const matches = stringMatch(dirty, /^[\r\n\t ]+/);
      leadingWhitespace = matches && matches[0];
    }
    if (PARSER_MEDIA_TYPE === 'application/xhtml+xml' && NAMESPACE === HTML_NAMESPACE) {
      // Root of XHTML doc must contain xmlns declaration (see https://www.w3.org/TR/xhtml1/normative.html#strict)
      dirty = '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>' + dirty + '</body></html>';
    }
    const dirtyPayload = trustedTypesPolicy ? trustedTypesPolicy.createHTML(dirty) : dirty;
    /*
     * Use the DOMParser API by default, fallback later if needs be
     * DOMParser not work for svg when has multiple root element.
     */
    if (NAMESPACE === HTML_NAMESPACE) {
      try {
        doc = new DOMParser().parseFromString(dirtyPayload, PARSER_MEDIA_TYPE);
      } catch (_) {}
    }
    /* Use createHTMLDocument in case DOMParser is not available */
    if (!doc || !doc.documentElement) {
      doc = implementation.createDocument(NAMESPACE, 'template', null);
      try {
        doc.documentElement.innerHTML = IS_EMPTY_INPUT ? emptyHTML : dirtyPayload;
      } catch (_) {
        // Syntax error if dirtyPayload is invalid xml
      }
    }
    const body = doc.body || doc.documentElement;
    if (dirty && leadingWhitespace) {
      body.insertBefore(document.createTextNode(leadingWhitespace), body.childNodes[0] || null);
    }
    /* Work on whole document or just its body */
    if (NAMESPACE === HTML_NAMESPACE) {
      return getElementsByTagName.call(doc, WHOLE_DOCUMENT ? 'html' : 'body')[0];
    }
    return WHOLE_DOCUMENT ? doc.documentElement : body;
  };
  /**
   * Creates a NodeIterator object that you can use to traverse filtered lists of nodes or elements in a document.
   *
   * @param root The root element or node to start traversing on.
   * @return The created NodeIterator
   */
  const _createNodeIterator = function _createNodeIterator(root) {
    return createNodeIterator.call(root.ownerDocument || root, root,
    // eslint-disable-next-line no-bitwise
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT | NodeFilter.SHOW_TEXT | NodeFilter.SHOW_PROCESSING_INSTRUCTION | NodeFilter.SHOW_CDATA_SECTION, null);
  };
  /**
   * _isClobbered
   *
   * @param element element to check for clobbering attacks
   * @return true if clobbered, false if safe
   */
  const _isClobbered = function _isClobbered(element) {
    return element instanceof HTMLFormElement && (typeof element.nodeName !== 'string' || typeof element.textContent !== 'string' || typeof element.removeChild !== 'function' || !(element.attributes instanceof NamedNodeMap) || typeof element.removeAttribute !== 'function' || typeof element.setAttribute !== 'function' || typeof element.namespaceURI !== 'string' || typeof element.insertBefore !== 'function' || typeof element.hasChildNodes !== 'function');
  };
  /**
   * Checks whether the given object is a DOM node.
   *
   * @param value object to check whether it's a DOM node
   * @return true is object is a DOM node
   */
  const _isNode = function _isNode(value) {
    return typeof Node === 'function' && value instanceof Node;
  };
  function _executeHooks(hooks, currentNode, data) {
    arrayForEach(hooks, hook => {
      hook.call(DOMPurify, currentNode, data, CONFIG);
    });
  }
  /**
   * _sanitizeElements
   *
   * @protect nodeName
   * @protect textContent
   * @protect removeChild
   * @param currentNode to check for permission to exist
   * @return true if node was killed, false if left alive
   */
  const _sanitizeElements = function _sanitizeElements(currentNode) {
    let content = null;
    /* Execute a hook if present */
    _executeHooks(hooks.beforeSanitizeElements, currentNode, null);
    /* Check if element is clobbered or can clobber */
    if (_isClobbered(currentNode)) {
      _forceRemove(currentNode);
      return true;
    }
    /* Now let's check the element's type and name */
    const tagName = transformCaseFunc(currentNode.nodeName);
    /* Execute a hook if present */
    _executeHooks(hooks.uponSanitizeElement, currentNode, {
      tagName,
      allowedTags: ALLOWED_TAGS
    });
    /* Detect mXSS attempts abusing namespace confusion */
    if (SAFE_FOR_XML && currentNode.hasChildNodes() && !_isNode(currentNode.firstElementChild) && regExpTest(/<[/\w!]/g, currentNode.innerHTML) && regExpTest(/<[/\w!]/g, currentNode.textContent)) {
      _forceRemove(currentNode);
      return true;
    }
    /* Remove any occurrence of processing instructions */
    if (currentNode.nodeType === NODE_TYPE.progressingInstruction) {
      _forceRemove(currentNode);
      return true;
    }
    /* Remove any kind of possibly harmful comments */
    if (SAFE_FOR_XML && currentNode.nodeType === NODE_TYPE.comment && regExpTest(/<[/\w]/g, currentNode.data)) {
      _forceRemove(currentNode);
      return true;
    }
    /* Remove element if anything forbids its presence */
    if (!(EXTRA_ELEMENT_HANDLING.tagCheck instanceof Function && EXTRA_ELEMENT_HANDLING.tagCheck(tagName)) && (!ALLOWED_TAGS[tagName] || FORBID_TAGS[tagName])) {
      /* Check if we have a custom element to handle */
      if (!FORBID_TAGS[tagName] && _isBasicCustomElement(tagName)) {
        if (CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof RegExp && regExpTest(CUSTOM_ELEMENT_HANDLING.tagNameCheck, tagName)) {
          return false;
        }
        if (CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof Function && CUSTOM_ELEMENT_HANDLING.tagNameCheck(tagName)) {
          return false;
        }
      }
      /* Keep content except for bad-listed elements */
      if (KEEP_CONTENT && !FORBID_CONTENTS[tagName]) {
        const parentNode = getParentNode(currentNode) || currentNode.parentNode;
        const childNodes = getChildNodes(currentNode) || currentNode.childNodes;
        if (childNodes && parentNode) {
          const childCount = childNodes.length;
          for (let i = childCount - 1; i >= 0; --i) {
            const childClone = cloneNode(childNodes[i], true);
            childClone.__removalCount = (currentNode.__removalCount || 0) + 1;
            parentNode.insertBefore(childClone, getNextSibling(currentNode));
          }
        }
      }
      _forceRemove(currentNode);
      return true;
    }
    /* Check whether element has a valid namespace */
    if (currentNode instanceof Element && !_checkValidNamespace(currentNode)) {
      _forceRemove(currentNode);
      return true;
    }
    /* Make sure that older browsers don't get fallback-tag mXSS */
    if ((tagName === 'noscript' || tagName === 'noembed' || tagName === 'noframes') && regExpTest(/<\/no(script|embed|frames)/i, currentNode.innerHTML)) {
      _forceRemove(currentNode);
      return true;
    }
    /* Sanitize element content to be template-safe */
    if (SAFE_FOR_TEMPLATES && currentNode.nodeType === NODE_TYPE.text) {
      /* Get the element's text content */
      content = currentNode.textContent;
      arrayForEach([MUSTACHE_EXPR, ERB_EXPR, TMPLIT_EXPR], expr => {
        content = stringReplace(content, expr, ' ');
      });
      if (currentNode.textContent !== content) {
        arrayPush(DOMPurify.removed, {
          element: currentNode.cloneNode()
        });
        currentNode.textContent = content;
      }
    }
    /* Execute a hook if present */
    _executeHooks(hooks.afterSanitizeElements, currentNode, null);
    return false;
  };
  /**
   * _isValidAttribute
   *
   * @param lcTag Lowercase tag name of containing element.
   * @param lcName Lowercase attribute name.
   * @param value Attribute value.
   * @return Returns true if `value` is valid, otherwise false.
   */
  // eslint-disable-next-line complexity
  const _isValidAttribute = function _isValidAttribute(lcTag, lcName, value) {
    /* Make sure attribute cannot clobber */
    if (SANITIZE_DOM && (lcName === 'id' || lcName === 'name') && (value in document || value in formElement)) {
      return false;
    }
    /* Allow valid data-* attributes: At least one character after "-"
        (https://html.spec.whatwg.org/multipage/dom.html#embedding-custom-non-visible-data-with-the-data-*-attributes)
        XML-compatible (https://html.spec.whatwg.org/multipage/infrastructure.html#xml-compatible and http://www.w3.org/TR/xml/#d0e804)
        We don't need to check the value; it's always URI safe. */
    if (ALLOW_DATA_ATTR && !FORBID_ATTR[lcName] && regExpTest(DATA_ATTR, lcName)) ; else if (ALLOW_ARIA_ATTR && regExpTest(ARIA_ATTR, lcName)) ; else if (EXTRA_ELEMENT_HANDLING.attributeCheck instanceof Function && EXTRA_ELEMENT_HANDLING.attributeCheck(lcName, lcTag)) ; else if (!ALLOWED_ATTR[lcName] || FORBID_ATTR[lcName]) {
      if (
      // First condition does a very basic check if a) it's basically a valid custom element tagname AND
      // b) if the tagName passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.tagNameCheck
      // and c) if the attribute name passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.attributeNameCheck
      _isBasicCustomElement(lcTag) && (CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof RegExp && regExpTest(CUSTOM_ELEMENT_HANDLING.tagNameCheck, lcTag) || CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof Function && CUSTOM_ELEMENT_HANDLING.tagNameCheck(lcTag)) && (CUSTOM_ELEMENT_HANDLING.attributeNameCheck instanceof RegExp && regExpTest(CUSTOM_ELEMENT_HANDLING.attributeNameCheck, lcName) || CUSTOM_ELEMENT_HANDLING.attributeNameCheck instanceof Function && CUSTOM_ELEMENT_HANDLING.attributeNameCheck(lcName, lcTag)) ||
      // Alternative, second condition checks if it's an `is`-attribute, AND
      // the value passes whatever the user has configured for CUSTOM_ELEMENT_HANDLING.tagNameCheck
      lcName === 'is' && CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements && (CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof RegExp && regExpTest(CUSTOM_ELEMENT_HANDLING.tagNameCheck, value) || CUSTOM_ELEMENT_HANDLING.tagNameCheck instanceof Function && CUSTOM_ELEMENT_HANDLING.tagNameCheck(value))) ; else {
        return false;
      }
      /* Check value is safe. First, is attr inert? If so, is safe */
    } else if (URI_SAFE_ATTRIBUTES[lcName]) ; else if (regExpTest(IS_ALLOWED_URI$1, stringReplace(value, ATTR_WHITESPACE, ''))) ; else if ((lcName === 'src' || lcName === 'xlink:href' || lcName === 'href') && lcTag !== 'script' && stringIndexOf(value, 'data:') === 0 && DATA_URI_TAGS[lcTag]) ; else if (ALLOW_UNKNOWN_PROTOCOLS && !regExpTest(IS_SCRIPT_OR_DATA, stringReplace(value, ATTR_WHITESPACE, ''))) ; else if (value) {
      return false;
    } else ;
    return true;
  };
  /**
   * _isBasicCustomElement
   * checks if at least one dash is included in tagName, and it's not the first char
   * for more sophisticated checking see https://github.com/sindresorhus/validate-element-name
   *
   * @param tagName name of the tag of the node to sanitize
   * @returns Returns true if the tag name meets the basic criteria for a custom element, otherwise false.
   */
  const _isBasicCustomElement = function _isBasicCustomElement(tagName) {
    return tagName !== 'annotation-xml' && stringMatch(tagName, CUSTOM_ELEMENT);
  };
  /**
   * _sanitizeAttributes
   *
   * @protect attributes
   * @protect nodeName
   * @protect removeAttribute
   * @protect setAttribute
   *
   * @param currentNode to sanitize
   */
  const _sanitizeAttributes = function _sanitizeAttributes(currentNode) {
    /* Execute a hook if present */
    _executeHooks(hooks.beforeSanitizeAttributes, currentNode, null);
    const {
      attributes
    } = currentNode;
    /* Check if we have attributes; if not we might have a text node */
    if (!attributes || _isClobbered(currentNode)) {
      return;
    }
    const hookEvent = {
      attrName: '',
      attrValue: '',
      keepAttr: true,
      allowedAttributes: ALLOWED_ATTR,
      forceKeepAttr: undefined
    };
    let l = attributes.length;
    /* Go backwards over all attributes; safely remove bad ones */
    while (l--) {
      const attr = attributes[l];
      const {
        name,
        namespaceURI,
        value: attrValue
      } = attr;
      const lcName = transformCaseFunc(name);
      const initValue = attrValue;
      let value = name === 'value' ? initValue : stringTrim(initValue);
      /* Execute a hook if present */
      hookEvent.attrName = lcName;
      hookEvent.attrValue = value;
      hookEvent.keepAttr = true;
      hookEvent.forceKeepAttr = undefined; // Allows developers to see this is a property they can set
      _executeHooks(hooks.uponSanitizeAttribute, currentNode, hookEvent);
      value = hookEvent.attrValue;
      /* Full DOM Clobbering protection via namespace isolation,
       * Prefix id and name attributes with `user-content-`
       */
      if (SANITIZE_NAMED_PROPS && (lcName === 'id' || lcName === 'name')) {
        // Remove the attribute with this value
        _removeAttribute(name, currentNode);
        // Prefix the value and later re-create the attribute with the sanitized value
        value = SANITIZE_NAMED_PROPS_PREFIX + value;
      }
      /* Work around a security issue with comments inside attributes */
      if (SAFE_FOR_XML && regExpTest(/((--!?|])>)|<\/(style|title|textarea)/i, value)) {
        _removeAttribute(name, currentNode);
        continue;
      }
      /* Make sure we cannot easily use animated hrefs, even if animations are allowed */
      if (lcName === 'attributename' && stringMatch(value, 'href')) {
        _removeAttribute(name, currentNode);
        continue;
      }
      /* Did the hooks approve of the attribute? */
      if (hookEvent.forceKeepAttr) {
        continue;
      }
      /* Did the hooks approve of the attribute? */
      if (!hookEvent.keepAttr) {
        _removeAttribute(name, currentNode);
        continue;
      }
      /* Work around a security issue in jQuery 3.0 */
      if (!ALLOW_SELF_CLOSE_IN_ATTR && regExpTest(/\/>/i, value)) {
        _removeAttribute(name, currentNode);
        continue;
      }
      /* Sanitize attribute content to be template-safe */
      if (SAFE_FOR_TEMPLATES) {
        arrayForEach([MUSTACHE_EXPR, ERB_EXPR, TMPLIT_EXPR], expr => {
          value = stringReplace(value, expr, ' ');
        });
      }
      /* Is `value` valid for this attribute? */
      const lcTag = transformCaseFunc(currentNode.nodeName);
      if (!_isValidAttribute(lcTag, lcName, value)) {
        _removeAttribute(name, currentNode);
        continue;
      }
      /* Handle attributes that require Trusted Types */
      if (trustedTypesPolicy && typeof trustedTypes === 'object' && typeof trustedTypes.getAttributeType === 'function') {
        if (namespaceURI) ; else {
          switch (trustedTypes.getAttributeType(lcTag, lcName)) {
            case 'TrustedHTML':
              {
                value = trustedTypesPolicy.createHTML(value);
                break;
              }
            case 'TrustedScriptURL':
              {
                value = trustedTypesPolicy.createScriptURL(value);
                break;
              }
          }
        }
      }
      /* Handle invalid data-* attribute set by try-catching it */
      if (value !== initValue) {
        try {
          if (namespaceURI) {
            currentNode.setAttributeNS(namespaceURI, name, value);
          } else {
            /* Fallback to setAttribute() for browser-unrecognized namespaces e.g. "x-schema". */
            currentNode.setAttribute(name, value);
          }
          if (_isClobbered(currentNode)) {
            _forceRemove(currentNode);
          } else {
            arrayPop(DOMPurify.removed);
          }
        } catch (_) {
          _removeAttribute(name, currentNode);
        }
      }
    }
    /* Execute a hook if present */
    _executeHooks(hooks.afterSanitizeAttributes, currentNode, null);
  };
  /**
   * _sanitizeShadowDOM
   *
   * @param fragment to iterate over recursively
   */
  const _sanitizeShadowDOM = function _sanitizeShadowDOM(fragment) {
    let shadowNode = null;
    const shadowIterator = _createNodeIterator(fragment);
    /* Execute a hook if present */
    _executeHooks(hooks.beforeSanitizeShadowDOM, fragment, null);
    while (shadowNode = shadowIterator.nextNode()) {
      /* Execute a hook if present */
      _executeHooks(hooks.uponSanitizeShadowNode, shadowNode, null);
      /* Sanitize tags and elements */
      _sanitizeElements(shadowNode);
      /* Check attributes next */
      _sanitizeAttributes(shadowNode);
      /* Deep shadow DOM detected */
      if (shadowNode.content instanceof DocumentFragment) {
        _sanitizeShadowDOM(shadowNode.content);
      }
    }
    /* Execute a hook if present */
    _executeHooks(hooks.afterSanitizeShadowDOM, fragment, null);
  };
  // eslint-disable-next-line complexity
  DOMPurify.sanitize = function (dirty) {
    let cfg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    let body = null;
    let importedNode = null;
    let currentNode = null;
    let returnNode = null;
    /* Make sure we have a string to sanitize.
      DO NOT return early, as this will return the wrong type if
      the user has requested a DOM object rather than a string */
    IS_EMPTY_INPUT = !dirty;
    if (IS_EMPTY_INPUT) {
      dirty = '<!-->';
    }
    /* Stringify, in case dirty is an object */
    if (typeof dirty !== 'string' && !_isNode(dirty)) {
      if (typeof dirty.toString === 'function') {
        dirty = dirty.toString();
        if (typeof dirty !== 'string') {
          throw typeErrorCreate('dirty is not a string, aborting');
        }
      } else {
        throw typeErrorCreate('toString is not a function');
      }
    }
    /* Return dirty HTML if DOMPurify cannot run */
    if (!DOMPurify.isSupported) {
      return dirty;
    }
    /* Assign config vars */
    if (!SET_CONFIG) {
      _parseConfig(cfg);
    }
    /* Clean up removed elements */
    DOMPurify.removed = [];
    /* Check if dirty is correctly typed for IN_PLACE */
    if (typeof dirty === 'string') {
      IN_PLACE = false;
    }
    if (IN_PLACE) {
      /* Do some early pre-sanitization to avoid unsafe root nodes */
      if (dirty.nodeName) {
        const tagName = transformCaseFunc(dirty.nodeName);
        if (!ALLOWED_TAGS[tagName] || FORBID_TAGS[tagName]) {
          throw typeErrorCreate('root node is forbidden and cannot be sanitized in-place');
        }
      }
    } else if (dirty instanceof Node) {
      /* If dirty is a DOM element, append to an empty document to avoid
         elements being stripped by the parser */
      body = _initDocument('<!---->');
      importedNode = body.ownerDocument.importNode(dirty, true);
      if (importedNode.nodeType === NODE_TYPE.element && importedNode.nodeName === 'BODY') {
        /* Node is already a body, use as is */
        body = importedNode;
      } else if (importedNode.nodeName === 'HTML') {
        body = importedNode;
      } else {
        // eslint-disable-next-line unicorn/prefer-dom-node-append
        body.appendChild(importedNode);
      }
    } else {
      /* Exit directly if we have nothing to do */
      if (!RETURN_DOM && !SAFE_FOR_TEMPLATES && !WHOLE_DOCUMENT &&
      // eslint-disable-next-line unicorn/prefer-includes
      dirty.indexOf('<') === -1) {
        return trustedTypesPolicy && RETURN_TRUSTED_TYPE ? trustedTypesPolicy.createHTML(dirty) : dirty;
      }
      /* Initialize the document to work on */
      body = _initDocument(dirty);
      /* Check we have a DOM node from the data */
      if (!body) {
        return RETURN_DOM ? null : RETURN_TRUSTED_TYPE ? emptyHTML : '';
      }
    }
    /* Remove first element node (ours) if FORCE_BODY is set */
    if (body && FORCE_BODY) {
      _forceRemove(body.firstChild);
    }
    /* Get node iterator */
    const nodeIterator = _createNodeIterator(IN_PLACE ? dirty : body);
    /* Now start iterating over the created document */
    while (currentNode = nodeIterator.nextNode()) {
      /* Sanitize tags and elements */
      _sanitizeElements(currentNode);
      /* Check attributes next */
      _sanitizeAttributes(currentNode);
      /* Shadow DOM detected, sanitize it */
      if (currentNode.content instanceof DocumentFragment) {
        _sanitizeShadowDOM(currentNode.content);
      }
    }
    /* If we sanitized `dirty` in-place, return it. */
    if (IN_PLACE) {
      return dirty;
    }
    /* Return sanitized string or DOM */
    if (RETURN_DOM) {
      if (RETURN_DOM_FRAGMENT) {
        returnNode = createDocumentFragment.call(body.ownerDocument);
        while (body.firstChild) {
          // eslint-disable-next-line unicorn/prefer-dom-node-append
          returnNode.appendChild(body.firstChild);
        }
      } else {
        returnNode = body;
      }
      if (ALLOWED_ATTR.shadowroot || ALLOWED_ATTR.shadowrootmode) {
        /*
          AdoptNode() is not used because internal state is not reset
          (e.g. the past names map of a HTMLFormElement), this is safe
          in theory but we would rather not risk another attack vector.
          The state that is cloned by importNode() is explicitly defined
          by the specs.
        */
        returnNode = importNode.call(originalDocument, returnNode, true);
      }
      return returnNode;
    }
    let serializedHTML = WHOLE_DOCUMENT ? body.outerHTML : body.innerHTML;
    /* Serialize doctype if allowed */
    if (WHOLE_DOCUMENT && ALLOWED_TAGS['!doctype'] && body.ownerDocument && body.ownerDocument.doctype && body.ownerDocument.doctype.name && regExpTest(DOCTYPE_NAME, body.ownerDocument.doctype.name)) {
      serializedHTML = '<!DOCTYPE ' + body.ownerDocument.doctype.name + '>\n' + serializedHTML;
    }
    /* Sanitize final string template-safe */
    if (SAFE_FOR_TEMPLATES) {
      arrayForEach([MUSTACHE_EXPR, ERB_EXPR, TMPLIT_EXPR], expr => {
        serializedHTML = stringReplace(serializedHTML, expr, ' ');
      });
    }
    return trustedTypesPolicy && RETURN_TRUSTED_TYPE ? trustedTypesPolicy.createHTML(serializedHTML) : serializedHTML;
  };
  DOMPurify.setConfig = function () {
    let cfg = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    _parseConfig(cfg);
    SET_CONFIG = true;
  };
  DOMPurify.clearConfig = function () {
    CONFIG = null;
    SET_CONFIG = false;
  };
  DOMPurify.isValidAttribute = function (tag, attr, value) {
    /* Initialize shared config vars if necessary. */
    if (!CONFIG) {
      _parseConfig({});
    }
    const lcTag = transformCaseFunc(tag);
    const lcName = transformCaseFunc(attr);
    return _isValidAttribute(lcTag, lcName, value);
  };
  DOMPurify.addHook = function (entryPoint, hookFunction) {
    if (typeof hookFunction !== 'function') {
      return;
    }
    arrayPush(hooks[entryPoint], hookFunction);
  };
  DOMPurify.removeHook = function (entryPoint, hookFunction) {
    if (hookFunction !== undefined) {
      const index = arrayLastIndexOf(hooks[entryPoint], hookFunction);
      return index === -1 ? undefined : arraySplice(hooks[entryPoint], index, 1)[0];
    }
    return arrayPop(hooks[entryPoint]);
  };
  DOMPurify.removeHooks = function (entryPoint) {
    hooks[entryPoint] = [];
  };
  DOMPurify.removeAllHooks = function () {
    hooks = _createHooksMap();
  };
  return DOMPurify;
}
var purify = createDOMPurify();

module.exports = purify;
//# sourceMappingURL=purify.cjs.js.map


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
/*!******************************!*\
  !*** ./assets/src/js/acf.js ***!
  \******************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _acf_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_acf.js */ "./assets/src/js/_acf.js");
/* harmony import */ var _acf_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_acf_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _acf_hooks_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./_acf-hooks.js */ "./assets/src/js/_acf-hooks.js");
/* harmony import */ var _acf_hooks_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_acf_hooks_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _acf_model_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./_acf-model.js */ "./assets/src/js/_acf-model.js");
/* harmony import */ var _acf_model_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_acf_model_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _acf_popup_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./_acf-popup.js */ "./assets/src/js/_acf-popup.js");
/* harmony import */ var _acf_popup_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_acf_popup_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _acf_modal_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./_acf-modal.js */ "./assets/src/js/_acf-modal.js");
/* harmony import */ var _acf_modal_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_acf_modal_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _acf_panel_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./_acf-panel.js */ "./assets/src/js/_acf-panel.js");
/* harmony import */ var _acf_panel_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_acf_panel_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _acf_notice_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./_acf-notice.js */ "./assets/src/js/_acf-notice.js");
/* harmony import */ var _acf_notice_js__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_acf_notice_js__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var _acf_tooltip_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./_acf-tooltip.js */ "./assets/src/js/_acf-tooltip.js");
/* harmony import */ var _acf_tooltip_js__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(_acf_tooltip_js__WEBPACK_IMPORTED_MODULE_7__);








})();

/******/ })()
;
//# sourceMappingURL=acf.js.map