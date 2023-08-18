import { merge, interval, filter, fromEvent, map } from "rxjs";
import { Constants, Key} from "./types";
import { observeKey } from "./util";
import { Move, Tick } from "./state";

export {
  key$,
  tick$,
  fromKey,
  moveAllDirections$,
  moveDown$,
  moveLeft$,
  moveRight$,
  autoMoveDown$,
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
    () => new Move(-1 * Constants.MOVE_BY, 0)
  ),
  moveRight$ = observeKey(
    "keydown",
    "KeyD",
    () => new Move(Constants.MOVE_BY, 0)
  ),
  moveDown$ = observeKey(
    "keydown",
    "KeyS",
    () => new Move(0, Constants.MOVE_BY)
  ),
  autoMoveDown$ = tick$.pipe(map((_) => new Move(0, Constants.MOVE_BY)));

/** Main movement stream */
const moveAllDirections$ = merge(moveLeft$, moveRight$, moveDown$);
