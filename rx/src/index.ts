import { fromEventPattern, Observable, queueScheduler } from 'rxjs'
import { share, observeOn } from 'rxjs/operators'
import { delegate as _delegate, EventDelegatorOptions as Opts, EventHandler } from 'event-delegation'

type Type = keyof HTMLElementEventMap

export function delegate(target: EventTarget, options?: Opts) {
  const del = _delegate(target, options)
  return on

  function on<T extends Event>(type: Type, opts?: Opts): Observable<T>
  function on<T extends Event>(type: string, opts?: Opts): Observable<T>
  function on<T extends Event>(type: Type, sel: string, opts?: Opts): Observable<T>
  function on<T extends Event>(type: string, sel: string, opts?: Opts): Observable<T>
  function on<T extends Event>(type: string, a: any, b?: any) {
    const [sel, opts] = typeof a === 'string' ? [a, b] : [undefined, b]
    const add = (next: EventHandler) => del.on(type, sel, next, opts)
    const remove = (next: EventHandler) => del.off(type, next, opts)
    return fromEventPattern<T>(add, remove).pipe(
      observeOn(queueScheduler),
      share(),
    )
  }
}
