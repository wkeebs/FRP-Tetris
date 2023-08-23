export type { Key, Event, State, Cube, Action };
export { Viewport, Constants, Block };

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

type Key = "KeyS" | "KeyA" | "KeyD";

type Event = "keydown" | "keyup" | "keypress";

type State = Readonly<{
  gameEnd: boolean;
  currentId: number;
  piece: ReadonlyArray<Cube>;
  cubes: ReadonlyArray<Cube>;
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

// Action Type
/**
 * Actions modify state
 */
interface Action {
  apply(s: State): State;
}
