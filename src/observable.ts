/**
 * Contains observable functionality for the game.
 *
 * Initialises all movement keys, rotations, random shapes and ticks.
 *
 * @author William Keeble
 */

/////////////// [IMPORTS AND EXPORTS] ////////////////////

import { merge, interval, filter, fromEvent, map } from "rxjs";
import { Constants, Key } from "./types";
import { createRngStreamFromSource, observeKey } from "./util";
import { AddPiece, HardDown, Move, NewGame, Rotate, Tick } from "./state";

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

/////////////// [OBSERVABLE DEFINITIONS] ////////////////////

// All keypresses
const key$ = fromEvent<KeyboardEvent>(document, "keypress");

const fromKey = (keyCode: Key) =>
  key$.pipe(filter(({ code }) => code === keyCode));

// Game tickrate
const tick$ = interval(Constants.TICK_RATE_MS).pipe(
  map((elapsed) => new Tick(elapsed))
);

// Create an Observable for each movement direction
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
  hardDown$ = observeKey("keydown", "Space", () => new HardDown());

// Random number generation - scaled to [0, 7] for the number of pieces
const shapes = ["I", "J", "L", "O", "S", "T", "Z"];

// Random shape stream
const randSeed = new Date().getMilliseconds(); // impure function used for the seed
const randomShape$ = createRngStreamFromSource(
  interval(1), // every 1ms, to ensure a good random spread
  7 // <-- the number of pieces in the game
)(randSeed).pipe(
  map((x: number) => new AddPiece(shapes[Math.floor(Math.abs(x))]))
);

// Rotation streams.
const rotateClockwise$ = observeKey("keydown", "KeyR", () => new Rotate(true));

const rotateCounterClockwise$ = observeKey(
  "keydown",
  "KeyW",
  () => new Rotate(false)
);

const rotate$ = merge(rotateClockwise$, rotateCounterClockwise$);

// Main movement stream.
const moveAllDirections$ = merge(moveLeft$, moveRight$, moveDown$, hardDown$);
