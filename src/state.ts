import { Cube, INITIAL_COORDS, Move, State } from "./types";

export { tick, initialState, handleCollisions, reduceState };

/////////////// INITIAL STATE ////////////////////
const INITIAL_ID = 1;

const initialPiece: ReadonlyArray<Cube> = [
  <Cube>{
    id: INITIAL_ID,
    x: INITIAL_COORDS.x,
    y: INITIAL_COORDS.y,
    colour: "green",
  },
  <Cube>{
    id: INITIAL_ID + 1,
    x: INITIAL_COORDS.x + 20,
    y: INITIAL_COORDS.y,
    colour: "green",
  },
  <Cube>{
    id: INITIAL_ID + 2,
    x: INITIAL_COORDS.x,
    y: INITIAL_COORDS.y + 20,
    colour: "green",
  },
  <Cube>{
    id: INITIAL_ID + 3,
    x: INITIAL_COORDS.x + 20,
    y: INITIAL_COORDS.y + 20,
    colour: "green",
  },
];

const initialState: State = {
  gameEnd: false,
  currentId: 0,
  piece: initialPiece,
  cubes: [],
  exit: [],
} as const;

//////////////// STATE UPDATES //////////////////////
const moveCube =
  (move: Move) =>
  (cube: Cube): Cube => {
    return {
      ...cube,
      x: cube.x + move.x,
      y: cube.y + move.y,
    };
  };

const updateId = (c: Cube): Cube => <Cube>{ ...c, id: Number(c.id) + 4};

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
  action instanceof Move
    ? {
        ...s,
        piece: s.piece.map(moveCube(action)),
      }
    : tick(s);
