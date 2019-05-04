var rxjs = require('rxjs');
var operators = require('rxjs/operators');
var eventDelegation = require('event-delegation');

function delegate(target, options) {
  var del = eventDelegation.delegate(target, options);

  return function select(type, a, b) {
    var ref = typeof a === 'string' ? [a, b] : [undefined, b];
    var sel = ref[0];
    var opts = ref[1];

    var add = function (next) { return del.on(type, sel, next, opts); };

    var remove = function (next) { return del.off(type, next, opts); };

    return rxjs.fromEventPattern(add, remove).pipe(operators.observeOn(rxjs.queueScheduler), operators.share());
  };
}

exports.delegate = delegate;
//# sourceMappingURL=index.js.map
