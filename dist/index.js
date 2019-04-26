var closest = function (root, el, sel) {
  // include root node
  var parent = root.parentElement;

  do {
    if (el.matches(sel)) { return el; }
    el = el.parentElement;
  } while (el != null && el !== parent);

  return null;
}; // Disguise event.target as matched element

var proxy = function (ev, target) {
  var get = function (event, prop) { return prop === 'target' ? target : Reflect.get(event, prop); };

  return new Proxy(ev, {
    get: get
  });
};
var listener = function (root, sel, handler) {
  if (sel === undefined) {
    return function (e) { return handler.call(root, proxy(e, root)); };
  }

  return function (e) {
    var target = e.target;
    var matched = closest(root, target, sel);

    if (matched != null) {
      handler.call(matched, proxy(e, matched));
    }
  };
};
var EventDelegator = function EventDelegator(target, options) {
  if ( options === void 0 ) options = {};

  this.options = {}; // [origin handler, wrapped handler]

  this._listenerMap = new WeakMap();
  this.target = target;
  this.options = options;
};

EventDelegator.prototype.on = function on (type, a, b, c) {
    var this$1 = this;

  var ref = typeof a === 'string' ? [a, b, c] : [undefined, a, b];
    var sel = ref[0];
    var handler = ref[1];
    var options = ref[2];
  var opts = Object.assign({}, this.options,
    options);

  var _listener = listener(this.target, sel, handler);

  this._listenerMap.set(handler, _listener);

  this.target.addEventListener(type, _listener, opts);
  return function () { return this$1.target.removeEventListener(type, _listener, opts); };
};

EventDelegator.prototype.off = function off (type, handler, options) {
  options = Object.assign({}, this.options,
    options);

  var _listener = this._listenerMap.get(handler);

  if (_listener != null) {
    this.target.removeEventListener(type, _listener, options);
  }
};
EventDelegator.assignEventTarget = proxy;
var delegate = function (target, defaultOptions) {
  return new EventDelegator(target, defaultOptions);
};
/**
 * Shorthand of CustomEvent
 */

var fire = function (target, type, detail) {
  var event = new CustomEvent(type, {
    bubbles: true,
    composed: true,
    cancelable: true,
    detail: detail
  });
  return target.dispatchEvent(event);
};

exports.delegate = delegate;
exports.fire = fire;
exports.EventDelegator = EventDelegator;
//# sourceMappingURL=index.js.map
