/**
 * Utility functions for use in calculation throughout the game.
 *
 * @author William Keeble
 */

/////////////// [IMPORTS AND EXPORTS] ////////////////////

import { Observable, fromEvent } from "rxjs";
import { map, filter, scan } from "rxjs/operators";

import {
  Key,
  Event,
  Cube,
  Constants,
  Piece,
  State,
  Viewport,
} from "./types.ts";

export {
  observeKey,
  RNG,
  isNotNullOrUndefined,
  attr,
  difference,
  collidedX,
  calculateScore,
  collidedY,
  modulo,
  validPosition,
};

/////////////// [UTILITY FUNCTIONS] ////////////////////

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
   * Takes hash value and scales it to the range [0, scale]
   */
  public static scale = (hash: number) => (scale: number) =>
    (((2 * hash) / (RNG.m - 1) - 1) * scale) % scale;
}

/**
 * Converts values in a stream to random numbers in the range [-1, 1]
 *
 * This usually would be implemented as an RxJS operator, but that is currently
 * beyond the scope of this course.
 *
 * @param source$ The source Observable, elements of this are replaced with random numbers
 * @param scale The number to scale our randomness to (e.g., scale = 7 -> [0,6])
 * @param seed The seed for the random number generator
 */
export function createRngStreamFromSource<T extends number>(
  source$: Observable<T>,
  scale: number
) {
  return function createRngStream(seed: number = 0): Observable<number> {
    const randomNumberStream = source$.pipe(
      scan((accum: number, val: number) => {
        return RNG.scale(RNG.hash(accum + val * seed))(scale);
      })
    );
    return randomNumberStream;
  };
}

/**
 * set a number of attributes on an Element at once
 * @param e the Element
 * @param o a property bag
 */
const attr = (e: Element, o: { [p: string]: unknown }) => {
  for (const k in o) e.setAttribute(k, String(o[k]));
};
const difference = (a: ReadonlyArray<Cube>) => (b: ReadonlyArray<Cube>) =>
  a.filter((x) => !b.includes(x));

/**
 * A custom modulo function, which works for both positive and negative numbers.
 * @param x The number to be divided.
 * @param m The number to divide by.
 * @returns
 */
const modulo = (x: number, m: number) => ((x % m) + m) % m;

/**
 * Type guard for use in filters
 * @param input something that might be null or undefined
 */
function isNotNullOrUndefined<T extends object>(
  input: null | undefined | T
): input is T {
  return input != null;
}

/**
 * Checks if two cubes have collided horizontally.
 * @param a The first cube.
 * @param b The second cube.
 * @returns Have they collided on the X-axis?
 */
const collidedX = (a: Cube) => (b: Cube) =>
  a.y === b.y // if vertically aligned
    ? a.x < b.x
      ? a.x === b.x - Constants.CUBE_SIZE_PX // if a on the left
      : b.x === a.x - Constants.CUBE_SIZE_PX // if b on the left
    : false;

/**
 * Checks if one cube is on top of another.
 * We specify top and bottom cubes, as we only want to check if
 * moving pieces are landing on non-moving pieces, to avoid
 * moving pieces getting stuck under "hangovers".
 *
 * @param top The top cube, moving in practice.
 * @param bottom The bottom cube, static in practice.
 * @returns If they are collided.
 */
const collidedY = (top: Cube) => (bottom: Cube) =>
  top.x === bottom.x && top.y + Constants.CUBE_SIZE_PX === bottom.y;

const validPosition = (s: State) => (cube: Cube) => {
  const xOn =
    cube.x <= Viewport.CANVAS_WIDTH - Constants.CUBE_SIZE_PX && cube.x >= 0;
  const yOn = cube.y <= Viewport.CANVAS_HEIGHT - Constants.CUBE_SIZE_PX;
  const colliding = s.staticCubes.some((c) => cube.x === c.x && cube.y === c.y);
  return xOn && yOn && !colliding;
};

/**
 * Calculates the score to be added, given the number of rows that are removed.
 * @param numRows The number of rows.
 * @returns The score.
 */
const calculateScore = (numRows: number): number =>
  numRows === 1
    ? 40
    : numRows === 2
    ? 100
    : numRows === 3
    ? 300
    : numRows === 4
    ? 1200
    : 0;
