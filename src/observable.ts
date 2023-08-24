import { merge, interval, filter, fromEvent, map } from "rxjs";
import { Constants, Key } from "./types";
import { createRngStreamFromSource, observeKey } from "./util";
import { AddPiece, Move, Rotate, Tick } from "./state";

export {
  key$,
  tick$,
  fromKey,
  moveAllDirections$,
  moveDown$,
  moveLeft$,
  moveRight$,
  autoMoveDown$,
  rotate$,
  randomShape$
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
  ),
  autoMoveDown$ = interval(Constants.FALL_RATE_MS).pipe(
    map((_) => new Move(0, Constants.CUBE_SIZE_PX))
  );

  const shapes = ["I", "J", "L", "O", "S", "T", "Z"]
  // Random number generation - scaled to [0, 7] for the number of pieces
  // An arbitrary interval of 10ms is chosen for each random piece creation.
const randomShape$ = createRngStreamFromSource(interval(200), 7)(283419).pipe(
  map((x: number) => shapes[Math.floor(Math.abs(x))]),
  map((shape: string) => new AddPiece(shape))
)

/** Rotation streams */
const rotateClockwise$ = observeKey(
  "keydown",
  "KeyX",
  () => new Rotate(true)
);

const rotateCounterClockwise$ = observeKey(
  "keydown",
  "KeyZ",
  () => new Rotate(false)
);

const rotate$ = merge(rotateClockwise$, rotateCounterClockwise$);

/** Main movement stream */
const moveAllDirections$ = merge(moveLeft$, moveRight$, moveDown$);
