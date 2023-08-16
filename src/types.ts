
export type { Key, Event, State };
export { Cube, Move, Viewport, Constants, Block, INITIAL_COORDS };

const Viewport = {
  CANVAS_WIDTH: 200,
  CANVAS_HEIGHT: 400,
  PREVIEW_WIDTH: 160,
  PREVIEW_HEIGHT: 80,
} as const;

const Constants = {
  TICK_RATE_MS: 1000,
  GRID_WIDTH: 10,
  GRID_HEIGHT: 20,
  MOVE_BY: 20,
} as const;

const Block = {
  WIDTH: Viewport.CANVAS_WIDTH / Constants.GRID_WIDTH,
  HEIGHT: Viewport.CANVAS_HEIGHT / Constants.GRID_HEIGHT,
};

const INITIAL_COORDS = { x: 60, y: 0 };

type Key = "KeyS" | "KeyA" | "KeyD";

type Event = "keydown" | "keyup" | "keypress";

type State = Readonly<{
  gameEnd: boolean;
  id: number,
  piece: ReadonlyArray<Cube>
  cubes: ReadonlyArray<Cube>;
  exit: ReadonlyArray<Cube>;
}>;

// Action Type
class Move {
  constructor(public readonly x: number, public readonly y: number) {}
}

class Cube {
  constructor(
    public readonly id: string,
    public readonly pos: Move,
  ) {}
}
