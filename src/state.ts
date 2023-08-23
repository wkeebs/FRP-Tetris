import { Action, Constants, Cube, State, Viewport } from "./types";
import { RNG, difference } from "./util";

export { initialState, reduceState, Move, AddPiece, Tick };

const colours = ["cyan", "yellow", "purple", "green", "blue", "red", "orange"];
const getRandomColour = (s: State) =>
  colours[RNG.hash(s.tickNo) % colours.length];

/////////////// INITIAL STATE ////////////////////
const INITIAL_ID = 1;
const INITIAL_COORDS = { x: 60, y: -20 };

const INITIAL_PIECE: ReadonlyArray<Cube> = [
  <Cube>{
    id: INITIAL_ID,
    x: INITIAL_COORDS.x,
    y: INITIAL_COORDS.y,
    colour: "yellow",
  },
  <Cube>{
    id: INITIAL_ID + 1,
    x: INITIAL_COORDS.x + 20,
    y: INITIAL_COORDS.y,
    colour: "yellow",
  },
  <Cube>{
    id: INITIAL_ID + 2,
    x: INITIAL_COORDS.x,
    y: INITIAL_COORDS.y + 20,
    colour: "yellow",
  },
  <Cube>{
    id: INITIAL_ID + 3,
    x: INITIAL_COORDS.x + 20,
    y: INITIAL_COORDS.y + 20,
    colour: "yellow",
  },
];

const initialState: State = {
  gameEnd: false,
  currentId: 0,
  piece: INITIAL_PIECE,
  cubes: [],
  exit: [],
  score: 0,
  tickNo: 0,
} as const;

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

const calculateScore = (numRows: number): number =>
  numRows === 1
    ? 40
    : numRows === 2
    ? 100
    : numRows === 3
    ? 300
    : numRows === 4
    ? 1200
    : 0;

const createI = (s: State): ReadonlyArray<Cube> => {
  return [
    <Cube>{
      id: s.currentId + 1,
      x: INITIAL_COORDS.x,
      y: INITIAL_COORDS.y,
      colour: "cyan",
    },
    <Cube>{
      id: s.currentId + 2,
      x: INITIAL_COORDS.x,
      y: INITIAL_COORDS.y + Constants.CUBE_SIZE_PX,
      colour: "cyan",
    },
    <Cube>{
      id: s.currentId + 3,
      x: INITIAL_COORDS.x,
      y: INITIAL_COORDS.y + 2 * Constants.CUBE_SIZE_PX,
      colour: "cyan",
    },
    <Cube>{
      id: s.currentId + 4,
      x: INITIAL_COORDS.x,
      y: INITIAL_COORDS.y + 3 * Constants.CUBE_SIZE_PX,
      colour: "cyan",
    },
  ];
};

const createJ = (s: State): ReadonlyArray<Cube> => {
  return [
    <Cube>{
      id: s.currentId + 1,
      x: INITIAL_COORDS.x,
      y: INITIAL_COORDS.y,
      colour: "blue",
    },
    <Cube>{
      id: s.currentId + 2,
      x: INITIAL_COORDS.x,
      y: INITIAL_COORDS.y + Constants.CUBE_SIZE_PX,
      colour: "blue",
    },
    <Cube>{
      id: s.currentId + 3,
      x: INITIAL_COORDS.x + Constants.CUBE_SIZE_PX,
      y: INITIAL_COORDS.y + Constants.CUBE_SIZE_PX,
      colour: "blue",
    },
    <Cube>{
      id: s.currentId + 4,
      x: INITIAL_COORDS.x + 2 * Constants.CUBE_SIZE_PX,
      y: INITIAL_COORDS.y + Constants.CUBE_SIZE_PX,
      colour: "blue",
    },
  ];
};

const createL = (s: State): ReadonlyArray<Cube> => {
  return [
    <Cube>{
      id: s.currentId + 1,
      x: INITIAL_COORDS.x,
      y: INITIAL_COORDS.y + Constants.CUBE_SIZE_PX,
      colour: "orange",
    },
    <Cube>{
      id: s.currentId + 2,
      x: INITIAL_COORDS.x + Constants.CUBE_SIZE_PX,
      y: INITIAL_COORDS.y + Constants.CUBE_SIZE_PX,
      colour: "orange",
    },
    <Cube>{
      id: s.currentId + 3,
      x: INITIAL_COORDS.x + 2 * Constants.CUBE_SIZE_PX,
      y: INITIAL_COORDS.y + Constants.CUBE_SIZE_PX,
      colour: "orange",
    },
    <Cube>{
      id: s.currentId + 4,
      x: INITIAL_COORDS.x + 2 * Constants.CUBE_SIZE_PX,
      y: INITIAL_COORDS.y,
      colour: "orange",
    },
  ];
};

const createO = (s: State): ReadonlyArray<Cube> => {
  return [
    <Cube>{
      id: s.currentId + 1,
      x: INITIAL_COORDS.x,
      y: INITIAL_COORDS.y,
      colour: "yellow",
    },
    <Cube>{
      id: s.currentId + 2,
      x: INITIAL_COORDS.x + Constants.CUBE_SIZE_PX,
      y: INITIAL_COORDS.y,
      colour: "yellow",
    },
    <Cube>{
      id: s.currentId + 3,
      x: INITIAL_COORDS.x,
      y: INITIAL_COORDS.y + Constants.CUBE_SIZE_PX,
      colour: "yellow",
    },
    <Cube>{
      id: s.currentId + 4,
      x: INITIAL_COORDS.x + Constants.CUBE_SIZE_PX,
      y: INITIAL_COORDS.y + Constants.CUBE_SIZE_PX,
      colour: "yellow",
    },
  ];
};

const createS = (s: State): ReadonlyArray<Cube> => {
  return [
    <Cube>{
      id: s.currentId + 1,
      x: INITIAL_COORDS.x,
      y: INITIAL_COORDS.y + Constants.CUBE_SIZE_PX,
      colour: "green",
    },
    <Cube>{
      id: s.currentId + 2,
      x: INITIAL_COORDS.x + Constants.CUBE_SIZE_PX,
      y: INITIAL_COORDS.y + Constants.CUBE_SIZE_PX,
      colour: "green",
    },
    <Cube>{
      id: s.currentId + 3,
      x: INITIAL_COORDS.x + Constants.CUBE_SIZE_PX,
      y: INITIAL_COORDS.y,
      colour: "green",
    },
    <Cube>{
      id: s.currentId + 4,
      x: INITIAL_COORDS.x + 2 * Constants.CUBE_SIZE_PX,
      y: INITIAL_COORDS.y,
      colour: "green",
    },
  ];
};

const createT = (s: State): ReadonlyArray<Cube> => {
  return [
    <Cube>{
      id: s.currentId + 1,
      x: INITIAL_COORDS.x,
      y: INITIAL_COORDS.y + Constants.CUBE_SIZE_PX,
      colour: "purple",
    },
    <Cube>{
      id: s.currentId + 2,
      x: INITIAL_COORDS.x + Constants.CUBE_SIZE_PX,
      y: INITIAL_COORDS.y + Constants.CUBE_SIZE_PX,
      colour: "purple",
    },
    <Cube>{
      id: s.currentId + 3,
      x: INITIAL_COORDS.x + Constants.CUBE_SIZE_PX,
      y: INITIAL_COORDS.y,
      colour: "purple",
    },
    <Cube>{
      id: s.currentId + 4,
      x: INITIAL_COORDS.x + 2 * Constants.CUBE_SIZE_PX,
      y: INITIAL_COORDS.y + Constants.CUBE_SIZE_PX,
      colour: "purple",
    },
  ];
};

const createZ = (s: State): ReadonlyArray<Cube> => {
  return [
    <Cube>{
      id: s.currentId + 1,
      x: INITIAL_COORDS.x,
      y: INITIAL_COORDS.y,
      colour: "red",
    },
    <Cube>{
      id: s.currentId + 2,
      x: INITIAL_COORDS.x + Constants.CUBE_SIZE_PX,
      y: INITIAL_COORDS.y + Constants.CUBE_SIZE_PX,
      colour: "red",
    },
    <Cube>{
      id: s.currentId + 3,
      x: INITIAL_COORDS.x + Constants.CUBE_SIZE_PX,
      y: INITIAL_COORDS.y,
      colour: "red",
    },
    <Cube>{
      id: s.currentId + 4,
      x: INITIAL_COORDS.x + 2 * Constants.CUBE_SIZE_PX,
      y: INITIAL_COORDS.y + Constants.CUBE_SIZE_PX,
      colour: "red",
    },
  ];
};

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

class Rotate implements Action {
  constructor(public readonly clockwise: boolean, public readonly offset: boolean) {}
  apply = (s: State): State => {
    return {
      ...s
    }
  }

  rotatePiece = (clockwise: boolean, offset: boolean): Cube[] => {
    
  }

  rotateCube = (cube: Cube, clockwise: boolean): Cube => {

  }

  offsetPiece = (oldRotationIndex: number[], newRotationIndex: number[]): Cube[] => {

  }
}

const createPieces = [
  createI,
  createJ,
  createL,
  createO,
  createS,
  createT,
  createZ,
];

const nextPiece = (s: State): ReadonlyArray<Cube> =>
  createPieces[RNG.hash(s.tickNo) % createPieces.length](s);

class Tick implements Action {
  constructor(public readonly elapsed: number) {}
  apply = (s: State): State => {
    return Tick.gameOver(
      Tick.filterVerticallyCollided(Tick.incrementIds(Tick.removeFullRows(s)))
    );
  };

  static incrementIds = (s: State): State =>
    s.piece.length === 0
      ? {
          ...s,
          currentId: s.currentId + Constants.PIECE_SIZE,
          piece: nextPiece({
            ...s,
            currentId: s.currentId + Constants.PIECE_SIZE,
          }),
          tickNo: s.tickNo + 1
        }
      : {
        ...s,
        tickNo: s.tickNo + 1
      };

  static removeFullRows = (s: State): State => {
    // Checks if a row that contains a given cube is full, based on cube height
    const checkRow = (cube: Cube) =>
      s.cubes.filter((c) => c.y === cube.y).length === Constants.ROW_WIDTH;

    // All cubes in full rows (to be removed)
    const exitCubes = s.cubes.filter(checkRow);
    const numRowsRemoved = Math.floor(exitCubes.length / Constants.ROW_WIDTH);

    // The lowest y coordinate of cubes that are removed.
    // So, we must move cubes above this down.
    const moveAboveY = Math.max(...exitCubes.map((x) => x.y));
    // Cubes that are not removed
    const newCubes = difference(s.cubes)(exitCubes);
    // Cubes that need to be shifted down
    const cubesToShift = newCubes.filter((c) => c.y < moveAboveY);
    // Those cubes are moved down
    const shiftedCubes = cubesToShift.map(
      (c) =>
        <Cube>{
          ...c,
          y: c.y + numRowsRemoved * Constants.CUBE_SIZE_PX,
        }
    );
    // All of the cubes that were not removed, with those shifted that needed to be.
    const cubesOut = difference(newCubes)(cubesToShift).concat(shiftedCubes);
    return {
      ...s,
      cubes: cubesOut,
      exit: exitCubes,
      score: s.score + calculateScore(numRowsRemoved),
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

  static gameOver = (s: State): State => {
    return {
      ...s,
      gameEnd: s.cubes.filter((c: Cube) => c.y <= 0).length > 0,
    };
  };
}

//////////////// STATE UPDATES //////////////////////

const reduceState = (s: State, action: Action) => action.apply(s);
