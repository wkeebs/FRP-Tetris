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

const nextPiece = (s: State): ReadonlyArray<Cube> => {
  return squarePiece(s);
};

const collidedX = (a: Cube, b: Cube) => {
  if (a.y === b.y) {
    // if a is on the left
    if (a.x < b.x) {
      return a.x === b.x - Constants.CUBE_SIZE_PX;
    } else {
      return b.x === a.x - Constants.CUBE_SIZE_PX;
    }
  }
  return false;
};

// a.y === b.y &&
//   (a.x === b.x - Constants.CUBE_SIZE_PX ||
//     a.x - Constants.CUBE_SIZE_PX === b.x);

const collidedY = (a: Cube, b: Cube) =>
  a.x === b.x &&
  (a.y === b.y + Constants.CUBE_SIZE_PX ||
    a.y + Constants.CUBE_SIZE_PX === b.y);

//////////////// ACTION CLASSES //////////////////////
/**
 *
 */
class Move implements Action {
  constructor(public readonly x: number, public readonly y: number) {}
  /**
   * Computes a new state based on the movement of the current piece.
   * @param s The old state.
   * @returns The new state.
   */
  apply = (s: State): State => {
    // True if any of the piece is at the rightmost limit of the board.
    const atRight = s.piece.some(
      (c: Cube) => c.x + this.x > Viewport.CANVAS_WIDTH - Constants.CUBE_SIZE_PX
    );
    // True if any of the piece is at the leftmost limit of the board.
    const atLeft = s.piece.some((c: Cube) => c.x + this.x < 0);
    const pieceCollidedX = s.piece.some((p) =>
      s.cubes.some((c) => collidedX(p, c))
    );
    return handleCollisions({
      ...s,
      piece:
        atRight || atLeft || pieceCollidedX
          ? s.piece
          : s.piece.map((cube: Cube) => {
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

const squarePiece = (s: State): ReadonlyArray<Cube> => {
  return [
    <Cube>{
      id: s.currentId + 1,
      x: INITIAL_COORDS.x,
      y: INITIAL_COORDS.y,
      colour: "green",
    },
    <Cube>{
      id: s.currentId + 2,
      x: INITIAL_COORDS.x + 20,
      y: INITIAL_COORDS.y,
      colour: "green",
    },
    <Cube>{
      id: s.currentId + 3,
      x: INITIAL_COORDS.x,
      y: INITIAL_COORDS.y + 20,
      colour: "green",
    },
    <Cube>{
      id: s.currentId + 4,
      x: INITIAL_COORDS.x + 20,
      y: INITIAL_COORDS.y + 20,
      colour: "green",
    },
  ];
};

class Tick implements Action {
  constructor(public readonly elapsed: number) {}
  apply = (s: State): State => {
    return s.piece.length === 0
      ? {
          ...s,
          currentId: s.currentId + Constants.PIECE_SIZE,
          piece: nextPiece({
            ...s,
            currentId: s.currentId + Constants.PIECE_SIZE,
          }),
        }
      : s;
  };
}

//////////////// STATE UPDATES //////////////////////

const handleCollisions = (s: State): State => {
  // Is a cube at the bottom?
  const hitBottom = (c: Cube) =>
    c.y >= Viewport.CANVAS_HEIGHT - Constants.CUBE_SIZE_PX;

  // True if the any part of piece is at the bottom of the board.
  const pieceCollidedY = s.piece.some((p) =>
    s.cubes.some((c) => collidedY(p, c))
  );
  const pieceHitBottom = s.piece.some(hitBottom);

  return {
    ...s,
    piece: pieceHitBottom || pieceCollidedY ? [] : s.piece,
    cubes: pieceHitBottom || pieceCollidedY ? s.cubes.concat(s.piece) : s.cubes,
  };
};

const reduceState = (s: State, action: Action) => action.apply(s);
