import { Observable, fromEvent, interval, merge } from "rxjs";
import { map, filter, scan } from "rxjs/operators";

export type Key = "KeyS" | "KeyA" | "KeyD";

export type Event = "keydown" | "keyup" | "keypress";

/**
 * A Coordinate type for identifying and manipulating element position
 * relative to the game canvas.
 */
export type Coordinate = Readonly<{
  x: number;
  y: number;
}>;
