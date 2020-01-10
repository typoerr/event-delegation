export const closest = (root: Element, el: Element, sel: string) => {
  // include root node
  const parent = root.parentElement
  do {
    if (el.matches(sel)) return el
    el = el.parentElement!
  } while (el != null && el !== parent)
  return null
}

// Disguise event.target as matched element
export const proxy = (ev: Event, target: any): Event => {
  const get = (event: any, prop: string) => (prop === 'target' ? target : Reflect.get(event, prop))
  return new Proxy(ev, { get })
}

export const listener = (root: Element, sel: string | undefined, handler: Function) => {
  if (sel === undefined) {
    return (e: Event) => handler.call(root, proxy(e, root))
  }
  return (e: Event) => {
    const target = e.target as Element
    const matched = closest(root, target, sel)
    if (matched != null) {
      handler.call(matched, proxy(e, matched))
    }
  }
}

type EventType = keyof HTMLElementEventMap

export interface EventDelegatorOptions extends AddEventListenerOptions {}

export type EventHandler<T extends Event = Event> = (ev: T) => void

export class EventDelegator {
  target: EventTarget
  options?: EventDelegatorOptions = {}
  // [origin handler, wrapped handler]
  _listenerMap = new WeakMap<EventHandler<any>, EventHandler<any>>()

  constructor(target: EventTarget, options: EventDelegatorOptions = {}) {
    this.target = target
    this.options = options
  }
  /* eslint-disable no-dupe-class-members */
  on<T extends Event>(type: EventType, handler: EventHandler<T>, options?: EventDelegatorOptions): () => void
  on<T extends Event>(type: string, handler: EventHandler<T>, options?: EventDelegatorOptions): () => void
  on<T extends Event>(
    type: EventType,
    sel: string | undefined,
    handler: EventHandler<T>,
    options?: EventDelegatorOptions,
  ): () => void
  on<T extends Event>(
    type: string,
    sel: string | undefined,
    handler: EventHandler<T>,
    options?: EventDelegatorOptions,
  ): () => void
  on(type: string, a: any, b: any, c?: EventDelegatorOptions) {
    const [sel, handler, options] =
      typeof a === 'string' ? [a, b, c] : typeof a === 'undefined' ? [undefined, b, c] : [undefined, a, b]
    const opts: EventDelegatorOptions = { ...this.options, ...options }
    const _listener = listener(this.target as Element, sel, handler)
    this._listenerMap.set(handler, _listener)
    this.target.addEventListener(type, _listener, opts)
    return () => this.target.removeEventListener(type, _listener, opts)
  }

  off<T extends Event>(type: EventType, handler: EventHandler<T>, options?: EventDelegatorOptions): void
  off<T extends Event>(type: string, handler: EventHandler<T>, options?: EventDelegatorOptions): void
  off<T extends Event>(type: EventType, handler: EventHandler<T>, options?: EventDelegatorOptions) {
    options = { ...this.options, ...options }
    const _listener = this._listenerMap.get(handler)
    if (_listener != null) {
      this.target.removeEventListener(type, _listener, options)
    }
  }

  static assignEventTarget = proxy
}

/**
 * Shorthand of CustomEvent
 */
export const fire = (target: EventTarget, type: string, detail?: any) => {
  const event = new CustomEvent(type, { bubbles: true, composed: true, cancelable: true, detail })
  return target.dispatchEvent(event)
}
