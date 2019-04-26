var rxjs = require('rxjs');
var eventDelegation = require('event-delegation');

function delegate(target, options) {
  var del = eventDelegation.delegate(target, options);

  return on;

  function on(type, a, b) {
    var ref = typeof a === 'string' ? [a, b] : [undefined, b];
    var sel = ref[0];
    var opts = ref[1];

    var add = function (next) { return del.on(type, sel, next, opts); };

    var remove = function (next) { return del.off(type, next, opts); };

    return rxjs.fromEventPattern(add, remove);
  }
}

exports.delegate = delegate;
//# sourceMappingURL=index.js.map
