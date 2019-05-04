import { fromEventPattern, queueScheduler } from 'rxjs';
import { share, observeOn } from 'rxjs/operators';
import { delegate } from 'event-delegation';

function delegate$1(target, options) {
  var del = delegate(target, options);

  return function select(type, a, b) {
    var ref = typeof a === 'string' ? [a, b] : [undefined, b];
    var sel = ref[0];
    var opts = ref[1];

    var add = function (next) { return del.on(type, sel, next, opts); };

    var remove = function (next) { return del.off(type, next, opts); };

    return fromEventPattern(add, remove).pipe(observeOn(queueScheduler), share());
  };
}

export { delegate$1 as delegate };
//# sourceMappingURL=index.mjs.map
