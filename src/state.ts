import { first, onErrorResumeNext, take, takeLast } from "rxjs";
import { randomShape$ } from "./observable";
import {
  Action,
  Constants,
  Cube,
  Offset,
  Piece,
  State,
  Viewport,
} from "./types";
import {
  RNG,
  calculateScore,
  collidedX,
  collidedY,
  difference,
  modulo,
  validPosition,
} from "./util";

export { initialState, reduceState, Move, Tick, Rotate, AddPiece };

// const colours = ["cyan", "yellow", "purple", "green", "blue", "red", "orange"];

/////////////// INITIAL STATE ////////////////////
const INITIAL_ID = 1;
const INITIAL_COORDS = { x: 60, y: -20 };

const INITIAL_PIECE: Piece = {
  cubes: [],
  shape: "O",
  rotationIndex: 0,
};

const initialState: State = {
  gameEnd: false,
  currentId: 0,
  piece: INITIAL_PIECE,
  staticCubes: [],
  exit: [],
  score: 0,
  tickNo: 0,
} as const;

// We build the piece so that the first cube is the rotation pivot.
const createPiece =
  (s: State) =>
  (pType: string): Piece => {
    const createCube =
      (cColour: string) =>
      (cId: number) =>
      (cX: number, cY: number): Cube => {
        return <Cube>{
          id: cId,
          x: cX,
          y: cY,
          colour: cColour,
        };
      };

    const cyanCube = createCube("cyan"),
      blueCube = createCube("blue"),
      orangeCube = createCube("orange"),
      yellowCube = createCube("yellow"),
      greenCube = createCube("green"),
      purpleCube = createCube("purple"),
      redCube = createCube("red");

    const buildShape =
      (builder: Function) =>
      (xOffset1: number, yOffset1: number) =>
      (xOffset2: number, yOffset2: number) =>
      (xOffset3: number, yOffset3: number) =>
      (xOffset4: number, yOffset4: number) =>
        [
          builder(s.currentId + 1)(
            INITIAL_COORDS.x + xOffset1 * Constants.CUBE_SIZE_PX,
            INITIAL_COORDS.y + yOffset1 * Constants.CUBE_SIZE_PX
          ),
          builder(s.currentId + 2)(
            INITIAL_COORDS.x + xOffset2 * Constants.CUBE_SIZE_PX,
            INITIAL_COORDS.y + yOffset2 * Constants.CUBE_SIZE_PX
          ),
          builder(s.currentId + 3)(
            INITIAL_COORDS.x + xOffset3 * Constants.CUBE_SIZE_PX,
            INITIAL_COORDS.y + yOffset3 * Constants.CUBE_SIZE_PX
          ),
          builder(s.currentId + 4)(
            INITIAL_COORDS.x + xOffset4 * Constants.CUBE_SIZE_PX,
            INITIAL_COORDS.y + yOffset4 * Constants.CUBE_SIZE_PX
          ),
        ];

    return pType === "I"
      ? <Piece>{
          cubes: buildShape(cyanCube)(0, 1)(0, 0)(0, 2)(0, 3),
          shape: "I",
          rotationIndex: 0,
        }
      : pType === "J"
      ? <Piece>{
          cubes: buildShape(blueCube)(1, 1)(0, 0)(0, 1)(2, 1),
          shape: "J",
          rotationIndex: 0,
        }
      : pType === "L"
      ? <Piece>{
          cubes: buildShape(orangeCube)(1, 1)(0, 1)(2, 1)(2, 0),
          shape: "L",
          rotationIndex: 0,
        }
      : pType === "O"
      ? <Piece>{
          cubes: buildShape(yellowCube)(0, 1)(0, 0)(1, 0)(1, 1),
          shape: "O",
          rotationIndex: 0,
        }
      : pType === "S"
      ? <Piece>{
          cubes: buildShape(greenCube)(1, 1)(0, 1)(1, 0)(2, 0),
          shape: "S",
          rotationIndex: 0,
        }
      : pType === "T"
      ? <Piece>{
          cubes: buildShape(purpleCube)(1, 1)(0, 1)(1, 0)(2, 1),
          shape: "T",
          rotationIndex: 0,
        }
      : <Piece>{
          cubes: buildShape(redCube)(1, 1)(0, 0)(1, 0)(2, 1),
          shape: "Z",
          rotationIndex: 0,
        };
  };

//////////////// ACTION CLASSES //////////////////////
class Move implements Action {
  /**
   * Moves a piece by a given number of pixels in the x and y directions.
   * @param x
   * @param y
   */
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

  static verticallyCollided = (s: State): boolean => {
    const pieceHitBottom = s.piece.cubes.some(Move.hitBottom);
    const verticalCollision = s.piece.cubes.some((c) =>
      s.staticCubes.some(collidedY(c))
    );
    return !pieceHitBottom && !verticalCollision;
  };

  handleVerticalCollisions = (s: State): State =>
    <State>{
      ...s,
      piece: <Piece>{
        ...s.piece,
        cubes: s.piece.cubes.map((cube: Cube) => {
          return {
            ...cube,
            x: cube.x,
            y: cube.y + (Move.verticallyCollided(s) ? this.y : 0),
          };
        }),
      },
    };

  static canMoveHorizontal =
    (s: State) =>
    (x: number): boolean => {
      // Has the piece collided with the right side of the board?
      const atRight = s.piece.cubes.some(
        (c: Cube) => c.x + x > Viewport.CANVAS_WIDTH - Constants.CUBE_SIZE_PX
      );
      // Has the piece collided with the left side of the board?
      const atLeft = s.piece.cubes.some((c: Cube) => c.x + x < 0);
      // Has the piece collided with another cube horizontally?
      const pieceCollidedX = s.piece.cubes.some((c) =>
        s.staticCubes.some(collidedX(c))
      );
      return !pieceCollidedX && !atLeft && !atRight;
    };

  handleHorizontalCollisions = (s: State): State =>
    <State>{
      ...s,
      piece: <Piece>{
        ...s.piece,
        cubes: s.piece.cubes.map((cube: Cube) => {
          return {
            ...cube,
            x: cube.x + (Move.canMoveHorizontal(s)(this.x) ? this.x : 0),
            y: cube.y,
          };
        }),
      },
    };

  canMove = (s: State) => {
    return s !== this.apply(s);
  };
}

class Rotate implements Action {
  constructor(
    public readonly clockwise: boolean,
    public readonly offset: boolean
  ) {}
  apply = (s: State): State => this.rotatePiece(s)(this.clockwise, this.offset);

  rotatePiece =
    (s: State) =>
    (clockwise: boolean, shouldOffset: boolean): State => {
      // if (s.piece.shape == "O")return s
      // Calculate the new index of orientation, based on whether we are going
      // clockwise or not. The module keeps it within range [0, 4].
      const newRotationIndex = modulo(
        clockwise ? s.piece.rotationIndex + 1 : s.piece.rotationIndex - 1,
        4
      );

      // This rotates each cube.
      // Note that the rotation centers around the first cube in the array.
      const newCubes = s.piece.cubes.map((c) =>
        this.rotateCube(c, clockwise)(s.piece.cubes[0].x, s.piece.cubes[0].y)
      );

      // Performs the offset on the state
      return this.offsetPiece({
        ...s,
        piece: <Piece>{
          ...s.piece,
          cubes: newCubes,
        },
      })(newRotationIndex);
    };

  /**
   * Rotates a tile 90 degrees around the center (origin) cube.
   * @param c The cube to be rotated.
   * @param clockwise Are we rotating clockwise?
   * @param originX The x-coord of the origin cube
   * @param originY The y-coord of the origin cube
   * @returns A repositioned cube
   */
  rotateCube =
    (c: Cube, clockwise: boolean) =>
    (originX: number, originY: number): Cube => {
      // Coordinates relative to the center (origin) cube
      const relativeX = c.x - originX;
      const relativeY = c.y - originY;

      // Rotation matrix dependent on if we are rotating clockwise or not
      const rotationMatrix = clockwise
        ? [
            [0, -1],
            [1, 0],
          ]
        : [
            [0, 1],
            [-1, 0],
          ];

      // Calculate new positions based on the rotation matrix
      const newX =
        rotationMatrix[0][0] * relativeX + rotationMatrix[1][0] * relativeY;
      const newY =
        rotationMatrix[0][1] * relativeX + rotationMatrix[1][1] * relativeY;

      // Return the newly positioned cube - coordinates back to global.
      return {
        ...c,
        x: newX + originX,
        y: newY + originY,
      };
    };

  /**
   * Checks if a piece can be offset based on the current state of the board.
   * @param s The current state.
   * @param newRotationIndex The rotation index the piece is to be moved to.
   * @returns The updated state.
   */
  offsetPiece =
    (s: State) =>
    (newRotationIndex: number): State => {
      // Gets the offset data from the Offset class - so we can test rotations.
      const offsetData = Offset.getOffset(s.piece.shape);

      // Check the offset tests
      const offsetCalcs = offsetData
        .map((test: number[][]) => {
          const offset1 = test[s.piece.rotationIndex];
          const offset2 = test[newRotationIndex];

          const finalOffsetX = offset1[0] - offset2[0];
          const finalOffsetY = offset1[1] - offset2[1];

          const testMove = new Move(
            finalOffsetX * Constants.CUBE_SIZE_PX,
            finalOffsetY * Constants.CUBE_SIZE_PX
          );
          const canMove = testMove.canMove(s);
          return canMove ? [finalOffsetX, finalOffsetY] : [0, 0];
        })
        .filter((val) => val[0] !== 0 && val[1] !== 0);

      // Checks if any of the moves passed
      if (offsetCalcs.length > 0) {
        console.log(offsetCalcs.length);
        // If a move passed, we just take the first valid move.
        const movePiece = new Move(
          offsetCalcs[0][0] * Constants.CUBE_SIZE_PX,
          offsetCalcs[0][1] * Constants.CUBE_SIZE_PX
        );
        return movePiece.apply(s);
      } else {
        return s;
      }
    };

  conflictTest =
    (s: State) =>
    (offsetX: number, offsetY: number): boolean => {
      const movedCubes = s.piece.cubes.map(
        (c) =>
          <Cube>{
            ...c,
            x: c.x + offsetX * Constants.CUBE_SIZE_PX,
            y: c.y + offsetY * Constants.CUBE_SIZE_PX,
          }
      );
      const movedPiece = <Piece>{
        ...s.piece,
        cubes: movedCubes
      }
      return validPosition(s)(movedPiece)
    };
}

class Tick implements Action {
  constructor(public readonly elapsed: number) {}
  apply = (s: State): State => {
    return Tick.gameOver(Tick.filterVerticallyCollided(Tick.removeFullRows(s)));
  };

  static removeFullRows = (s: State): State => {
    // Checks if a row that contains a given cube is full, based on cube height
    const checkRow = (cube: Cube) =>
      s.staticCubes.filter((c) => c.y === cube.y).length ===
      Constants.ROW_WIDTH;

    // All cubes in full rows (to be removed)
    const exitCubes = s.staticCubes.filter(checkRow);
    const numRowsRemoved = Math.floor(exitCubes.length / Constants.ROW_WIDTH);

    // The lowest y coordinate of cubes that are removed.
    // So, we must move cubes above this down.
    const moveAboveY = Math.max(...exitCubes.map((x) => x.y));
    // Cubes that are not removed
    const newCubes = difference(s.staticCubes)(exitCubes);
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
      staticCubes: cubesOut,
      exit: exitCubes,
      score: s.score + calculateScore(numRowsRemoved),
    };
  };

  static filterVerticallyCollided = (s: State): State => {
    const pieceHitBottom = s.piece.cubes.some(Move.hitBottom);
    const verticalCollision =
      s.piece.cubes.some((c) => s.staticCubes.some(collidedY(c))) ||
      pieceHitBottom;
    return {
      ...s,
      piece: <Piece>{
        ...s.piece,
        cubes: verticalCollision ? [] : s.piece.cubes,
      },
      staticCubes: verticalCollision
        ? s.staticCubes.concat(s.piece.cubes)
        : s.staticCubes,
    };
  };

  static gameOver = (s: State): State => {
    return {
      ...s,
      gameEnd: s.staticCubes.filter((c: Cube) => c.y <= 0).length > 0,
    };
  };
}

class AddPiece implements Action {
  constructor(readonly shape: string) {}
  apply = (s: State): State => this.nextPiece(s);

  nextPiece = (s: State): State =>
    s.piece.cubes.length === 0
      ? {
          ...s,
          currentId: s.currentId + Constants.PIECE_SIZE,
          piece: createPiece({
            ...s,
            currentId: s.currentId + Constants.PIECE_SIZE,
          })(this.shape),
          tickNo: s.tickNo + 1,
        }
      : {
          ...s,
          tickNo: s.tickNo + 1,
        };
}

//////////////// STATE UPDATES //////////////////////

const reduceState = (s: State, action: Action) => action.apply(s);
