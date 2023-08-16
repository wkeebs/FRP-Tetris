import { Cube, INITIAL_COORDS, Move, State } from "./types";

export { tick, initialState, handleCollisions, reduceState };

/////////////// INITIAL STATE ////////////////////
const INITIAL_ID = "1";

const initialPiece: Cube[] = [
  new Cube(INITIAL_ID, INITIAL_COORDS, "green"),
  new Cube(INITIAL_ID + 1, new Move(INITIAL_COORDS.x + 20, INITIAL_COORDS.y), "green"),
  new Cube(INITIAL_ID + 2, new Move(INITIAL_COORDS.x, INITIAL_COORDS.y + 20), "green"),
  new Cube(
    INITIAL_ID + 3,
    new Move(INITIAL_COORDS.x + 20, INITIAL_COORDS.y + 20), "green"
  ),
];

const initialState: State = {
  gameEnd: false,
  id: 0,
  piece: initialPiece,
  cubes: [],
  exit: [],
} as const;

//////////////// STATE UPDATES //////////////////////
const moveCube = (move: Move) => (cube: Cube): Cube => {
  return {
    ...cube,
    pos: {
      x: cube.pos.x + move.x,
      y: cube.pos.y + move.y,
    },
  };
};

const handleCollisions = (s: State): State => {
  return {
    ...s,
  };
};

const tick = (s: State): State => {
  return {
    ...s,
  };
};

const reduceState = (s: State, action: Move | number): State =>
  action instanceof Move ? {
    ...s,
    piece: s.piece.map(moveCube(action))
  } : tick(s);
