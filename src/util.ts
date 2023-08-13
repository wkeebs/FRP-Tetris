import { Observable, fromEvent, interval, merge } from "rxjs";
import { map, filter, scan } from "rxjs/operators";

import { Coordinate, Key, Event } from "./types.ts";

/**
 * Creates an Observable object for a given event.
 * @param eventName The Event.
 * @param k The Key.
 * @param result The resulting function.
 * @returns The Observable object.
 */
export function observeKey<T>(
  eventName: Event,
  k: Key,
  result: () => T
): Observable<T> {
  return fromEvent<KeyboardEvent>(document, eventName).pipe(
    filter(({ code }) => code === k),
    filter(({ repeat }) => !repeat),
    map(result)
  );
}
/**
 * Purely transforms a Coordinate object.
 * @param coord Coordinate to be transformed.
 * @param transX Value to transform x dimension by.
 * @param transY Value to transform y dimension by.
 * @returns A new, tranformed Coordinate object.
 */
export function moveCoordinate(
  coord: Coordinate,
  transX: number,
  transY: number
): Coordinate {
  return <Coordinate>{
    x: coord.x + transX,
    y: coord.y + transY,
  };
}

/**
 * Purely merges two coordinates together.
 * @param firstCoord
 * @param secondCoord
 * @returns A new Coordinate object, with the values of firstCoord
 * and secondCoord merged together.
 */
export function mergeCoordinates(
  firstCoord: Coordinate,
  secondCoord: Coordinate
): Coordinate {
  return <Coordinate>{
    x: firstCoord.x + secondCoord.x,
    y: firstCoord.y + secondCoord.y,
  };
}
