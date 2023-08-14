import { Observable, fromEvent, interval, merge } from "rxjs";
import { map, filter, scan } from "rxjs/operators";
import { moveSvgElement } from "./view";

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

export class Move {
  constructor(public readonly position: Coordinate) {}
}

export class Cube {
  constructor(
    public readonly id: string,
    public readonly position: Coordinate,
    public readonly svgElement: SVGElement
  ) {}
  move = (coord: Coordinate) => {
    moveSvgElement(this.svgElement);
    return new Cube(this.id, coord, this.svgElement);
  }
}
