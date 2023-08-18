import { Action, Constants, Cube, State, Viewport } from "./types";

export { initialState, reduceState, Move, AddPiece, Tick };

/////////////// INITIAL STATE ////////////////////
const INITIAL_ID = 1;
const INITIAL_COORDS = { x: 60, y: -20 };

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

//////////////// ACTION CLASSES //////////////////////
class Move implements Action {
  constructor(public readonly x: number, public readonly y: number) {}
  apply = (s: State): State => {
    return handleCollisions({
      ...s,
      piece: s.piece.map((cube: Cube) => {
        return {
          ...cube,
          x: cube.x + this.x,
          y: cube.y + this.y,
        };
      }),
    });
  };
}

class AddPiece implements Action {
  constructor(public readonly cubes: ReadonlyArray<Cube>) {}
  apply = (s: State): State => {
    return {
      ...s,
    };
  };
}

class Tick implements Action {
  constructor(public readonly elapsed: number) {}
  apply = (s: State): State => {
    return handleCollisions({
      ...s,
    });
  };
}

//////////////// STATE UPDATES //////////////////////
// const moveCube =
//   (move: Move) =>
//   (cube: Cube): Cube => {
//     return {
//       ...cube,
//       x: cube.x + move.x,
//       y: cube.y + move.y,
//     };
//   };

const handleCollisions = (s: State): State => {
  const hitBottom = (c: Cube) =>
    c.y >= Viewport.CANVAS_HEIGHT - Constants.MOVE_BY;

  const pieceAtBottom = s.piece.some(hitBottom);

  return {
    ...s,
    piece: pieceAtBottom ? [] : s.piece,
    cubes: pieceAtBottom ? s.cubes.concat(s.piece) : s.cubes
  };
};

const updateId = (c: Cube): Cube => <Cube>{ ...c, id: Number(c.id) + 4 };

const reduceState = (s: State, action: Action) => action.apply(s);
