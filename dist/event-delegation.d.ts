export declare const closest: (root: Element, el: Element, sel: string) => Element | null;
export declare const proxy: (ev: Event, target: any) => Event;
export declare const listener: (root: Element, sel: string, handler: Function) => (e: Event) => void;
declare type EventType = keyof HTMLElementEventMap;
export interface EventDelegatorOptions extends AddEventListenerOptions {
}
declare type Opts = EventDelegatorOptions;
export declare class EventDelegator {
    target: EventTarget;
    options?: Opts;
    constructor(target: EventTarget, options?: Opts);
    on<T extends Event>(type: EventType, sel: string, handler: (ev: T) => void, options?: Opts): () => void;
    on<T extends Event>(type: string, sel: string, handler: (ev: T) => void, options?: Opts): () => void;
}
export declare const delegate: (el: EventTarget, defaultOptions?: EventDelegatorOptions | undefined) => EventDelegator;
/**
 * Shorthand of CustomEvent
 */
export declare const fire: (el: EventTarget, type: string, detail?: any) => boolean;
export {};
