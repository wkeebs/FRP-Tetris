import { Action, Constants, Cube, State, Viewport } from "./types";
import { difference } from "./util";

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

const collidedX = (a: Cube) => (b: Cube) =>
  a.y === b.y // if vertically aligned
    ? a.x < b.x
      ? a.x === b.x - Constants.CUBE_SIZE_PX // if a on the left
      : b.x === a.x - Constants.CUBE_SIZE_PX // if b on the left
    : false;

/**
 * Checks if one cube is on top of another.
 * We specify top and bottom, as we only want to check if
 * moving pieces are landing on non-moving pieces, to avoid
 * moving pieces getting stuck under "hangovers".
 *
 * @param top The top cube, moving in practice.
 * @param bottom The bottom cube, static in practice.
 * @returns If they are collided.
 */
const collidedY = (top: Cube) => (bottom: Cube) =>
  top.x === bottom.x && top.y + Constants.CUBE_SIZE_PX === bottom.y;

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
    return this.handleVerticalCollisions(this.handleHorizontalCollisions(s));
  };

  static hitBottom = (c: Cube) =>
    c.y >= Viewport.CANVAS_HEIGHT - Constants.CUBE_SIZE_PX;

  handleVerticalCollisions = (s: State): State => {
    const pieceHitBottom = s.piece.some(Move.hitBottom);
    const verticalCollision =
      s.piece.some((c) => s.cubes.some(collidedY(c))) || pieceHitBottom;

    return {
      ...s,
      piece: s.piece.map((cube: Cube) => {
        return {
          ...cube,
          x: cube.x,
          y: cube.y + (verticalCollision ? 0 : this.y),
        };
      }),
    };
  };

  handleHorizontalCollisions = (s: State): State => {
    // Has the piece collided with the right side of the board?
    const atRight = s.piece.some(
      (c: Cube) => c.x + this.x > Viewport.CANVAS_WIDTH - Constants.CUBE_SIZE_PX
    );
    // Has the piece collided with the left side of the board?
    const atLeft = s.piece.some((c: Cube) => c.x + this.x < 0);
    // Has the piece collided with another cube horizontally?
    const pieceCollidedX = s.piece.some((c) => s.cubes.some(collidedX(c)));
    const horizontalCollision = pieceCollidedX || atLeft || atRight;
    return {
      ...s,
      piece: s.piece.map((cube: Cube) => {
        return {
          ...cube,
          x: cube.x + (horizontalCollision ? 0 : this.x),
          y: cube.y,
        };
      }),
    };
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
  apply = (s: State): State =>
    Tick.filterVerticallyCollided(Tick.incrementIds(Tick.removeFullRows(s)));

  static incrementIds = (s: State): State =>
    s.piece.length === 0
      ? {
          ...s,
          currentId: s.currentId + Constants.PIECE_SIZE,
          piece: nextPiece({
            ...s,
            currentId: s.currentId + Constants.PIECE_SIZE,
          }),
        }
      : s;

  static removeFullRows = (s: State): State => {
    // Checks if a row that contains a given cube is full, based on cube height
    const checkRow = (cube: Cube) =>
      s.cubes.filter((c) => c.y === cube.y).length ===
      Viewport.CANVAS_WIDTH / Constants.CUBE_SIZE_PX;

    const exitCubes = s.cubes.filter(checkRow);
    const newCubes = difference(s.cubes)(exitCubes);
    return {
      ...s,
      cubes: newCubes,
      exit: exitCubes,
    };
  };

  static filterVerticallyCollided = (s: State): State => {
    const pieceHitBottom = s.piece.some(Move.hitBottom);
    const verticalCollision =
      s.piece.some((c) => s.cubes.some(collidedY(c))) || pieceHitBottom;
    return {
      ...s,
      piece: verticalCollision ? [] : s.piece,
      cubes: verticalCollision ? s.cubes.concat(s.piece) : s.cubes,
    };
  };
}

//////////////// STATE UPDATES //////////////////////

const reduceState = (s: State, action: Action) => action.apply(s);
