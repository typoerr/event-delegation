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

type Opts = EventDelegatorOptions

type EventHandler<T extends Event = Event> = (ev: T) => void

export class EventDelegator {
  target: EventTarget
  options?: Opts = {}
  // [origin handler, wrapped handler]
  _listenerMap = new WeakMap<EventHandler<any>, EventHandler<any>>()

  constructor(target: EventTarget, options: Opts = {}) {
    this.target = target
    this.options = options
  }
  /* eslint-disable no-dupe-class-members */
  on<T extends Event>(type: EventType, sel: string, handler: EventHandler<T>, options?: Opts): () => void
  on<T extends Event>(type: string, sel: string, handler: EventHandler<T>, options?: Opts): () => void
  on<T extends Event>(type: EventType, handler: EventHandler<T>, options?: Opts): () => void
  on<T extends Event>(type: string, handler: EventHandler<T>, options?: Opts): () => void
  on(type: string, a: any, b: any, c?: Opts) {
    const [sel, handler, options] = typeof a === 'string' ? [a, b, c] : [undefined, a, b]
    const opts: Opts = { ...this.options, ...options }
    const _listener = listener(this.target as Element, sel, handler)
    this._listenerMap.set(handler, _listener)
    this.target.addEventListener(type, _listener, opts)
    return () => this.target.removeEventListener(type, _listener, opts)
  }
  off<T extends Event>(type: EventType, handler: EventHandler<T>, options?: Opts): void
  off<T extends Event>(type: string, handler: EventHandler<T>, options?: Opts): void
  off<T extends Event>(type: EventType, handler: EventHandler<T>, options?: Opts) {
    options = { ...this.options, ...options }
    const _listener = this._listenerMap.get(handler)
    if (_listener != null) {
      this.target.removeEventListener(type, _listener, options)
    }
  }

  static assignEventTarget = proxy
}

export const delegate = (el: EventTarget, defaultOptions?: Opts) => {
  return new EventDelegator(el, defaultOptions)
}

/**
 * Shorthand of CustomEvent
 */
export const fire = (el: EventTarget, type: string, detail?: any) => {
  const event = new CustomEvent(type, { bubbles: true, composed: true, cancelable: true, detail })
  return el.dispatchEvent(event)
}
