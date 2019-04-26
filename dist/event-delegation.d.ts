export declare const closest: (root: Element, el: Element, sel: string) => Element | null;
export declare const proxy: (ev: Event, target: any) => Event;
export declare const listener: (root: Element, sel: string | undefined, handler: Function) => (e: Event) => any;
declare type EventType = keyof HTMLElementEventMap;
export interface EventDelegatorOptions extends AddEventListenerOptions {
}
declare type Opts = EventDelegatorOptions;
export declare type EventHandler<T extends Event = Event> = (ev: T) => void;
export declare class EventDelegator {
    target: EventTarget;
    options?: Opts;
    _listenerMap: WeakMap<EventHandler<any>, EventHandler<any>>;
    constructor(target: EventTarget, options?: Opts);
    on<T extends Event>(type: EventType, handler: EventHandler<T>, options?: Opts): () => void;
    on<T extends Event>(type: string, handler: EventHandler<T>, options?: Opts): () => void;
    on<T extends Event>(type: EventType, sel: string | undefined, handler: EventHandler<T>, options?: Opts): () => void;
    on<T extends Event>(type: string, sel: string | undefined, handler: EventHandler<T>, options?: Opts): () => void;
    off<T extends Event>(type: EventType, handler: EventHandler<T>, options?: Opts): void;
    off<T extends Event>(type: string, handler: EventHandler<T>, options?: Opts): void;
    static assignEventTarget: (ev: Event, target: any) => Event;
}
export declare const delegate: (target: EventTarget, defaultOptions?: EventDelegatorOptions | undefined) => EventDelegator;
/**
 * Shorthand of CustomEvent
 */
export declare const fire: (target: EventTarget, type: string, detail?: any) => boolean;
export {};
