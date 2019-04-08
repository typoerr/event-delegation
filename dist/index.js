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
var listener = function (root, sel, handler) { return function (e) {
  var target = e.target;
  var matched = closest(root, target, sel);

  if (matched != null) {
    handler.call(matched, proxy(e, matched));
  }
}; };
var EventDelegator = function EventDelegator(target, options) {
  if ( options === void 0 ) options = {};

  this.options = {}; // [origin handler, wrapped handler]

  this._listenerMap = new WeakMap();
  this.target = target;
  this.options = options;
};

EventDelegator.prototype.on = function on (type, sel, handler, options) {
    var this$1 = this;

  options = Object.assign({}, this.options,
    options);

  var _listener = listener(this.target, sel, handler);

  this._listenerMap.set(handler, _listener);

  this.target.addEventListener(type, _listener, options);
  return function () { return this$1.target.removeEventListener(type, _listener, options); };
};

EventDelegator.prototype.off = function off (type, handler, options) {
  options = Object.assign({}, this.options,
    options);

  var _listener = this._listenerMap.get(handler);

  if (_listener != null) {
    this.target.removeEventListener(type, _listener, options);
  }
};
var delegate = function (el, defaultOptions) {
  return new EventDelegator(el, defaultOptions);
};
/**
 * Shorthand of CustomEvent
 */

var fire = function (el, type, detail) {
  var event = new CustomEvent(type, {
    bubbles: true,
    composed: true,
    cancelable: true,
    detail: detail
  });
  return el.dispatchEvent(event);
};

exports.delegate = delegate;
exports.fire = fire;
exports.EventDelegator = EventDelegator;
//# sourceMappingURL=index.js.map
