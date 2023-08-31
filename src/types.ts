/**
 * All types and constants required in the game.
 *
 * We also define the offset data for the wall kicks here.
 *
 * @author William Keeble
 */

export type { Key, Event, State, Cube, Action, Piece };
export { Viewport, Constants, Block, Offset };

/////////////// [CONSTANTS] ////////////////////
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
  LEVEL_GOAL: 4,
  START_FALL_RATE_MS: 400,
  FALL_RATE_LIMIT_MS: 100,
} as const;

const Block = {
  WIDTH: Viewport.CANVAS_WIDTH / Constants.GRID_WIDTH,
  HEIGHT: Viewport.CANVAS_HEIGHT / Constants.GRID_HEIGHT,
};

/////////////// [TYPE DEFINITIONS] ////////////////////

// All keys needed
type Key = "KeyS" | "KeyA" | "KeyD" | "KeyW" | "KeyR" | "Space";

// All events needed
type Event = "keydown" | "keyup" | "keypress";

// All shapes in the game
type Shape = "I" | "J" | "L" | "O" | "S" | "T" | "Z";

// The State.
type State = Readonly<{
  gameEnd: boolean; // Is the game over?
  currentId: number; // The current starting ID of the piece.
  piece: Piece; // The current moving piece.
  nextPiece: Piece; // The piece that will be spawned next. In the preview.
  staticCubes: ReadonlyArray<Cube>; // All of the "dropped" cubes.
  exit: ReadonlyArray<Cube>; // All cubes to be deleted.
  score: number; // The current score.
  fallRateMs: number; // The current fall rate of the piece.
  level: number; // Current level.
  levelProgress: number; // Current progress into the level (e.g., 100/200 score)
  highScore: number; // Current highest score for this session.
  tickProgress: number; // How far into the tick are we? Used to determine when to move down automatically.
  dropPreview: ReadonlyArray<Cube> // All cubes that preview a hard drop landing.
}>;

// A single cube / tile.
type Cube = Readonly<{
  id: number;
  x: number;
  y: number;
  colour: string;
}>;

// A piece - collection of cubes.
type Piece = Readonly<{
  rotationAxis: Cube;
  cubes: ReadonlyArray<Cube>;
  shape: Shape;
  rotationIndex: number;
}>;

// Action type - modified state.
interface Action {
  apply(s: State): State;
}

/////////////// [OFFSET DATA] ////////////////////

/**
 * Offset data for wall kicks - adapted to our coordinate system.
 * This data comes from a basic SRS rotation system, but I have adapted
 * the y-coordinates to match our SVG coords, as ours are inverted
 * compared to SRS.
 */
class Offset {
  /**
   * Offset data for J, L, S, T and Z pieces.
   */
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

  /**
   * Offset data for the I piece.
   */
  static I_OffsetData = [
    [
      [0, 0],
      [-2, 0],
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
      [1, 0],
      [0, 1],
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

  /**
   * Returns the offset for a given shape.
   * @param shape The shape.
   * @returns The offset data.
   */
  static getOffset = (shape: string) =>
    shape === "I" ? this.I_OffsetData : this.JLSTZ_OffsetData;
}
