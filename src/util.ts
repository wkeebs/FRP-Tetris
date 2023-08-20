import { Observable, fromEvent } from "rxjs";
import { map, filter } from "rxjs/operators";

import { Key, Event, Cube } from "./types.ts";

export { observeKey, RNG, isNotNullOrUndefined, attr, difference };

/**
 * Creates an Observable object for a given event.
 * @param eventName The Event.
 * @param k The Key.
 * @param result The resulting function.
 * @returns The Observable object.
 */
function observeKey<T>(
  eventName: Event,
  k: Key,
  result: () => T
): Observable<T> {
  return fromEvent<KeyboardEvent>(document, eventName).pipe(
    filter(({ code }) => code === k),
    // filter(({ repeat }) => !repeat),
    map(result)
  );
}

/**
 * A random number generator which provides two pure functions
 * `hash` and `scaleToRange`.  Call `hash` repeatedly to generate the
 * sequence of hashes.
 */
abstract class RNG {
  // LCG using GCC's constants
  private static m = 0x80000000; // 2**31
  private static a = 1103515245;
  private static c = 12345;

  /**
   * Call `hash` repeatedly to generate the sequence of hashes.
   * @param seed
   * @returns a hash of the seed
   */
  public static hash = (seed: number) => (RNG.a * seed + RNG.c) % RNG.m;

  /**
h    * Takes hash value and scales it to the range [-1, 1]
   */
  public static scale = (hash: number) => (2 * hash) / (RNG.m - 1) - 1;
}

  /**
   * set a number of attributes on an Element at once
   * @param e the Element
   * @param o a property bag
   */
const attr = (e: Element, o: { [p: string]: unknown }) => { for (const k in o) e.setAttribute(k, String(o[k])) }
const difference = (a: ReadonlyArray<Cube>) => (b: ReadonlyArray<Cube>) => a.filter(x => !b.includes(x));
/**
 * Type guard for use in filters
 * @param input something that might be null or undefined
 */
function isNotNullOrUndefined<T extends object>(
  input: null | undefined | T
): input is T {
  return input != null;
}
