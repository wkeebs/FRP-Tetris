import { merge, scan, interval, filter, fromEvent } from "rxjs";
import { Coordinate, Cube, Key, Move, Piece } from "./types";
import { observeKey, mergeCoordinates } from "./util";
import { Constants } from "./main";
import { moveSvgElement } from "./view";

const key$ = fromEvent<KeyboardEvent>(document, "keypress");

const fromKey = (keyCode: Key) =>
  key$.pipe(filter(({ code }) => code === keyCode));

export const initial_coords = <Coordinate>{ x: 0, y: 0 };

// Coordinate objects to utilise when moving in each direction.
export const moveLeftCoord = <Coordinate>{ x: -1 * Constants.MOVE_BY, y: 0 },
  moveRightCoord = <Coordinate>{ x: Constants.MOVE_BY, y: 0 },
  moveDownCoord = <Coordinate>{ x: 0, y: Constants.MOVE_BY };

/** Create an Observable for each movement direction */
export const moveLeft$ = observeKey("keydown", "KeyA", () => moveLeftCoord),
  moveRight$ = observeKey("keydown", "KeyD", () => moveRightCoord),
  moveDown$ = observeKey("keydown", "KeyS", () => moveDownCoord);

/** Main movement stream */
export const moveInputStream$ = merge(moveLeft$, moveRight$, moveDown$);

/** Returns a subscription to move a given Cube object */
export const moveCubeSubscription = (cube: Cube) =>
  moveInputStream$
    .pipe(
      scan(
        (accum: Coordinate, val: Coordinate) => mergeCoordinates(accum, val),
        cube.position
      )
    )
    .subscribe(moveSvgElement(cube.svgElement));

/** Returns a subscription to move an entire Piece object */
export const movePieceSubscription = (piece?: Piece) =>
  piece ? piece.cubes.map(moveCubeSubscription): null;


/** Determines the rate of time steps */
export const tick$ = interval(Constants.TICK_RATE_MS);


