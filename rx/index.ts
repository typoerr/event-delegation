import { fromEventPattern, Observable } from 'rxjs'
import { delegate as _delegate, EventDelegatorOptions as Opts, EventHandler } from '@typoerr/event-delegation'

type Type = keyof HTMLElementEventMap

export interface EventSelector {
  <T extends Event>(type: Type, opts?: Opts): Observable<T>
  <T extends Event>(type: string, opts?: Opts): Observable<T>
  <T extends Event>(type: Type, sel: string, opts?: Opts): Observable<T>
  <T extends Event>(type: string, sel: string, opts?: Opts): Observable<T>
}

export function delegate(target: EventTarget, options?: Opts): EventSelector {
  const del = _delegate(target, options)
  return function select<T extends Event>(type: string, a: any, b?: any) {
    const [sel, opts] = typeof a === 'string' ? [a, b] : [undefined, b]
    const add = (next: EventHandler) => del.on(type, sel, next, opts)
    const remove = (next: EventHandler) => del.off(type, next, opts)
    return fromEventPattern<T>(add, remove)
  }
}
