import { merge, interval, filter, fromEvent, map } from "rxjs";
import { Constants, Key} from "./types";
import { observeKey } from "./util";
import { Move, Rotate, Tick } from "./state";

export {
  key$,
  tick$,
  fromKey,
  moveAllDirections$,
  moveDown$,
  moveLeft$,
  moveRight$,
  autoMoveDown$,
  rotate$
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
  autoMoveDown$ = interval(Constants.FALL_RATE_MS).pipe(map((_) => new Move(0, Constants.CUBE_SIZE_PX)));

/** Rotation streams */
const rotateClockwise$ = observeKey(
  "keydown",
  "KeyX",
  () => new Rotate(true, true)
)

const rotateCounterClockwise$ = observeKey(
  "keydown",
  "KeyZ",
  () => new Rotate(false, true)
)

const rotate$ = merge(rotateClockwise$, rotateCounterClockwise$);

/** Main movement stream */
const moveAllDirections$ = merge(moveLeft$, moveRight$, moveDown$);
