export type { Key, Event, State, Cube, Action, Piece };
export { Viewport, Constants, Block, Offset };

const Viewport = {
  CANVAS_WIDTH: 200,
  CANVAS_HEIGHT: 400,
  PREVIEW_WIDTH: 160,
  PREVIEW_HEIGHT: 80,
} as const;

const Constants = {
  TICK_RATE_MS: 100,
  FALL_RATE_MS: 200,
  GRID_WIDTH: 10,
  GRID_HEIGHT: 20,
  CUBE_SIZE_PX: 20,
  PIECE_SIZE: 4,
  ROW_WIDTH: 10,
} as const;

const Block = {
  WIDTH: Viewport.CANVAS_WIDTH / Constants.GRID_WIDTH,
  HEIGHT: Viewport.CANVAS_HEIGHT / Constants.GRID_HEIGHT,
};

type Key = "KeyS" | "KeyA" | "KeyD" | "KeyX" | "KeyZ";

type Event = "keydown" | "keyup" | "keypress";

type Shape = "I" | "J" | "L" | "O" | "S" | "T" | "Z";

type State = Readonly<{
  gameEnd: boolean;
  currentId: number;
  piece: Piece;
  staticCubes: ReadonlyArray<Cube>;
  exit: ReadonlyArray<Cube>;
  score: number;
  tickNo: number;
}>;

type Cube = Readonly<{
  id: number;
  x: number;
  y: number;
  colour: string;
}>;

type Piece = Readonly<{
  cubes: ReadonlyArray<Cube>;
  shape: Shape;
  rotationIndex: number;
}>;

// Action Type
/**
 * Actions modify state
 */
interface Action {
  apply(s: State): State;
}

// Offset Data
class Offset {
  static JLSTZ_OffsetData = [
    [
      [0, 0],
      [0, 0],
      [0, 0],
      [0, 0],
      [0, 0],
    ],
    [
      [0, 0],
      [1, 0],
      [1, -1],
      [0, 2],
      [1, 2],
    ],
    [
      [0, 0],
      [0, 0],
      [0, 0],
      [0, 0],
      [0, 0],
    ],
    [
      [0, 0],
      [-1, 0],
      [1, -1],
      [0, 2],
      [-1, 2],
    ],
  ];

  static I_OffsetData = [
    [
      [0, 0],
      [-1, 0],
      [2, 0],
      [-1, 0],
      [2, 0],
    ],
    [
      [-1, 0],
      [0, 0],
      [0, 0],
      [0, 1],
      [0, -2],
    ],
    [
      [-1, 1],
      [1, 1],
      [-2, 1],
      [1, 0],
      [-2, 0],
    ],
    [
      [0, 1],
      [0, 1],
      [0, 1],
      [0, -1],
      [0, 2],
    ],
  ];

  static O_OffsetData = [
    [
      [0, 0],
      [0, 0],
      [0, 0],
      [0, 0],
      [0, 0],
    ],
    [
      [0, -1],
      [0, 0],
      [0, 0],
      [0, 0],
      [0, 0],
    ],
    [
      [-1, -1],
      [0, 0],
      [0, 0],
      [0, 0],
      [0, 0],
    ],
    [
      [-1, 0],
      [0, 0],
      [0, 0],
      [0, 0],
      [0, 0],
    ],
  ];

  static getOffset = (shape: string) =>
    shape === "O"
      ? this.O_OffsetData
      : shape === "I"
      ? this.I_OffsetData
      : this.JLSTZ_OffsetData;
}
