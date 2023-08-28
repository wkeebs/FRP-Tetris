import { merge, interval, filter, fromEvent, map } from "rxjs";
import { Constants, Key } from "./types";
import { createRngStreamFromSource, observeKey } from "./util";
import { AddPiece, Move, NewGame, Rotate, Tick } from "./state";

export {
  key$,
  tick$,
  fromKey,
  moveAllDirections$,
  moveDown$,
  moveLeft$,
  moveRight$,
  rotate$,
  randomShape$,
};

const fromKey = (keyCode: Key) =>
  key$.pipe(filter(({ code }) => code === keyCode));

// All keypresses
const key$ = fromEvent<KeyboardEvent>(document, "keypress");

// Game tickrate
const tick$ = interval(Constants.TICK_RATE_MS).pipe(
  map((elapsed) => new Tick(elapsed))
);

/** Create an Observable for each movement direction */
const moveLeft$ = observeKey(
    "keydown",
    "KeyA",
    () => new Move(-1 * Constants.CUBE_SIZE_PX, 0)
  ),
  moveRight$ = observeKey(
    "keydown",
    "KeyD",
    () => new Move(Constants.CUBE_SIZE_PX, 0)
  ),
  moveDown$ = observeKey(
    "keydown",
    "KeyS",
    () => new Move(0, Constants.CUBE_SIZE_PX)
  );

const shapes = ["I", "J", "L", "O", "S", "T", "Z"];
// Random number generation - scaled to [0, 7] for the number of pieces
// An arbitrary interval of 10ms is chosen for each random piece creation.
const seed = 283419; // note the arbitrary seed here
const randomShape$ = createRngStreamFromSource(
  interval(200),
  7 // for the number of pieces
)(seed).pipe(map((x: number) => new AddPiece(shapes[Math.floor(Math.abs(x))])));

/** Rotation streams */
const rotateClockwise$ = observeKey("keydown", "KeyX", () => new Rotate(true));

const rotateCounterClockwise$ = observeKey(
  "keydown",
  "KeyW",
  () => new Rotate(false)
);

const rotate$ = merge(rotateClockwise$, rotateCounterClockwise$);

/** Main movement stream */
const moveAllDirections$ = merge(moveLeft$, moveRight$, moveDown$);

