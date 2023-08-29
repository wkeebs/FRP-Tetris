export type { Key, Event, State, Cube, Action, Piece };
export { Viewport, Constants, Block, Offset };

const Viewport = {
  CANVAS_WIDTH: 200,
  CANVAS_HEIGHT: 400,
  PREVIEW_WIDTH: 160,
  PREVIEW_HEIGHT: 120,
} as const;

const Constants = {
  TICK_RATE_MS: 10,
  GRID_WIDTH: 10,
  GRID_HEIGHT: 20,
  CUBE_SIZE_PX: 20,
  PIECE_SIZE: 4,
  ROW_WIDTH: 10,
  LEVEL_GOAL: 5,
  START_FALL_RATE_MS: 400,
  FALL_RATE_LIMIT_MS: 100,
} as const;

const Block = {
  WIDTH: Viewport.CANVAS_WIDTH / Constants.GRID_WIDTH,
  HEIGHT: Viewport.CANVAS_HEIGHT / Constants.GRID_HEIGHT,
};

type Key = "KeyS" | "KeyA" | "KeyD" | "KeyX" | "KeyW";

type Event = "keydown" | "keyup" | "keypress";

type Shape = "I" | "J" | "L" | "O" | "S" | "T" | "Z";

type State = Readonly<{
  gameEnd: boolean;
  currentId: number;
  piece: Piece;
  nextPiece: Piece;
  staticCubes: ReadonlyArray<Cube>;
  exit: ReadonlyArray<Cube>;
  score: number;
  fallRateMs: number;
  level: number;
  levelProgress: number;
  highScore: number;
  tickProgress: number;
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

/**
 * Offset data for wall kicks - adapted to our coordinate system.
 * This data comes from a basic SRS rotation system, but I have adapted
 * the y-coordinates to match our SVG coords, as they are inverted in SRS.
 */
class Offset {
  static JLSTZ_OffsetData = [
    [
      [0, 0],
      [0, 0],
      [0, 0],
      [0, 0],
    ],
    [
      [0, 0],
      [1, 0],
      [0, 0],
      [-1, 0],
    ],
    [
      [0, 0],
      [1, 1],
      [0, 0],
      [-1, 1],
    ],
    [
      [0, 0],
      [0, -2],
      [0, 0],
      [0, -2],
    ],
    [
      [0, 0],
      [1, -2],
      [0, 0],
      [-1, -2],
    ],
  ];

  static I_OffsetData = [
    [
      [0, 0],
      [-1, 0],
      [-1, -1],
      [0, -1],
    ],
    [
      [-1, 0],
      [0, 0],
      [1, -1],
      [0, -1],
    ],
    [
      [2, 0],
      [0, 0],
      [-2, -1],
      [0, -1],
    ],
    [
      [-1, 0],
      [0, -1],
      [1, 0],
      [0, 1],
    ],
    [
      [2, 0],
      [0, 2],
      [-2, 0],
      [0, -2],
    ],
  ];

  static getOffset = (shape: string) =>
    shape === "I" ? this.I_OffsetData : this.JLSTZ_OffsetData;
}
