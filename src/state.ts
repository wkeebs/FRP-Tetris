import { INITIAL_ID } from "./main";
import { Cube, INITIAL_COORDS, Move, State } from "./types";

export { tick, initialState };


/////////////// INITIAL STATE ////////////////////
const initialCubes: Cube[] = [
    new Cube(INITIAL_ID, INITIAL_COORDS),
    new Cube(INITIAL_ID + 1, new Move(INITIAL_COORDS.x + 20, INITIAL_COORDS.y)),
    new Cube(INITIAL_ID + 2, new Move(INITIAL_COORDS.x, INITIAL_COORDS.y + 20)),
    new Cube(INITIAL_ID + 3, new Move(INITIAL_COORDS.x + 20, INITIAL_COORDS.y + 20))
  ]

const initialState: State = {
    gameEnd: false,
    id: 0,
    piece: initialCubes,
    cubes: [],
    exit: []
  } as const


//////////////// STATE UPDATES //////////////////////
const handleCollisions = (s: State): State => {
  return {
    ...s
  }
}

const tick = (s: State): State => {
  return {
    ...s
  }
}

const reduceState = (s: State): State => {
  return {
    ...s
  }
}