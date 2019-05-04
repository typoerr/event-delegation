import { Observable } from 'rxjs';
import { EventDelegatorOptions as Opts } from 'event-delegation';
declare type Type = keyof HTMLElementEventMap;
export interface EventSelector {
    <T extends Event>(type: Type, opts?: Opts): Observable<T>;
    <T extends Event>(type: string, opts?: Opts): Observable<T>;
    <T extends Event>(type: Type, sel: string, opts?: Opts): Observable<T>;
    <T extends Event>(type: string, sel: string, opts?: Opts): Observable<T>;
}
export declare function delegate(target: EventTarget, options?: Opts): EventSelector;
export {};
