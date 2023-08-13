/**
 * Inside this file you will use the classes and functions from rx.js
 * to add visuals to the svg element in index.html, animate them, and make them interactive.
 *
 * Study and complete the tasks in observable exercises first to get ideas.
 *
 * Course Notes showing Asteroids in FRP: https://tgdwyer.github.io/asteroids/
 *
 * You will be marked on your functional programming style
 * as well as the functionality that you implement.
 *
 * Document your code!
 */

import "./style.css";

import { Observable, fromEvent, interval, merge } from "rxjs";
import { map, filter, scan } from "rxjs/operators";

/** Constants */

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

/** User input */

type Key = "KeyS" | "KeyA" | "KeyD";

type Event = "keydown" | "keyup" | "keypress";

/** Utility functions */

/**
 * Creates an Observable object for a given event.
 * @param eventName The Event.
 * @param k The Key.
 * @param result The resulting function.
 * @returns The Observable object.
 */
const observeKey = <T>(
  eventName: Event,
  k: Key,
  result: () => T
): Observable<T> =>
  fromEvent<KeyboardEvent>(document, eventName).pipe(
    filter(({ code }) => code === k),
    filter(({ repeat }) => !repeat),
    map(result)
  );

/** State processing */

type State = Readonly<{
  gameEnd: boolean;
}>;

const initialState: State = {
  gameEnd: false,
} as const;

/**
 * Updates the state by proceeding with one time step.
 *
 * @param s Current state
 * @returns Updated state
 */
const tick = (s: State) => s;

/** Element Positioning */
// class Move {
//   constructor(public readonly position: Coordinate) {}
// }

type Coordinate = Readonly<{
  x: number;
  y: number;
}>;

/**
 * Purely transforms a Coordinate object.
 * @param coord Coordinate to be transformed.
 * @param transX Value to transform x dimension by.
 * @param transY Value to transform y dimension by.
 * @returns A new, tranformed Coordinate object.
 */
function moveCoordinate(
  coord: Coordinate,
  transX: number,
  transY: number
): Coordinate {
  return <Coordinate>{
    x: coord.x + transX,
    y: coord.y + transY,
  };
}

/**
 * Purely merges two coordinates together.
 * @param firstCoord
 * @param secondCoord
 * @returns A new Coordinate object, with the values of firstCoord
 * and secondCoord merged together.
 */
function mergeCoordinates(
  firstCoord: Coordinate,
  secondCoord: Coordinate
): Coordinate {
  return <Coordinate>{
    x: firstCoord.x + secondCoord.x,
    y: firstCoord.y + secondCoord.y,
  };
}

/** Rendering (side effects) */

/**
 * Displays a SVG element on the canvas. Brings to foreground.
 * @param elem SVG element to display
 */
const show = (elem: SVGGraphicsElement) => {
  elem.setAttribute("visibility", "visible");
  elem.parentNode!.appendChild(elem);
};

/**
 * Hides a SVG element on the canvas.
 * @param elem SVG element to hide
 */
const hide = (elem: SVGGraphicsElement) =>
  elem.setAttribute("visibility", "hidden");

/**
 * Creates an SVG element with the given properties.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/SVG/Element for valid
 * element names and properties.
 *
 * @param namespace Namespace of the SVG element
 * @param name SVGElement name
 * @param props Properties to set on the SVG element
 * @returns SVG element
 */
const createSvgElement = (
  namespace: string | null,
  name: string,
  props: Record<string, string> = {}
) => {
  const elem = document.createElementNS(namespace, name) as SVGElement;
  Object.entries(props).forEach(([k, v]) => elem.setAttribute(k, v));
  return elem;
};

/**
 * Impurely moves an SVG element.
 *
 * !! ONLY for use when subscribing to an Observable !!
 * @param elem
 * @param coords
 */
const moveSvgElement = (elem: SVGElement) => (coords: Coordinate) => {
  elem.setAttribute("x", String(coords.x));
  elem.setAttribute("y", String(coords.y));
};

/**
 * This is the function called on page load. Your main game loop
 * should be called here.
 */
export function main() {
  // Canvas elements
  const svg = document.querySelector("#svgCanvas") as SVGGraphicsElement &
    HTMLElement;
  const preview = document.querySelector("#svgPreview") as SVGGraphicsElement &
    HTMLElement;
  const gameover = document.querySelector("#gameOver") as SVGGraphicsElement &
    HTMLElement;
  const container = document.querySelector("#main") as HTMLElement;

  svg.setAttribute("height", `${Viewport.CANVAS_HEIGHT}`);
  svg.setAttribute("width", `${Viewport.CANVAS_WIDTH}`);
  preview.setAttribute("height", `${Viewport.PREVIEW_HEIGHT}`);
  preview.setAttribute("width", `${Viewport.PREVIEW_WIDTH}`);

  // Text fields
  const levelText = document.querySelector("#levelText") as HTMLElement;
  const scoreText = document.querySelector("#scoreText") as HTMLElement;
  const highScoreText = document.querySelector("#highScoreText") as HTMLElement;

  /** User input */

  const key$ = fromEvent<KeyboardEvent>(document, "keypress");

  const fromKey = (keyCode: Key) =>
    key$.pipe(filter(({ code }) => code === keyCode));

  /** Movement Streams */
  const INITIAL_COORDS = <Coordinate>{ x: 0, y: 0 };

  // Coordinate objects to utilise when moving in each direction.
  const moveLeftCoord = <Coordinate>{ x: -1 * Constants.MOVE_BY, y: 0 },
    moveRightCoord = <Coordinate>{ x: Constants.MOVE_BY, y: 0 },
    moveDownCoord = <Coordinate>{ x: 0, y: Constants.MOVE_BY };

  /** Observables */

  /** Create an Observable for each movement direction */
  const moveLeft$ = observeKey("keydown", "KeyA", () => moveLeftCoord),
    moveRight$ = observeKey("keydown", "KeyD", () => moveRightCoord),
    moveDown$ = observeKey("keydown", "KeyS", () => moveDownCoord);

  /** Main movement stream */
  const moveStream$ = merge(moveLeft$, moveRight$, moveDown$).pipe(
    scan(mergeCoordinates, INITIAL_COORDS)
  );

  /** Determines the rate of time steps */
  const tick$ = interval(Constants.TICK_RATE_MS);

  /**
   * Renders the current state to the canvas.
   *
   * In MVC terms, this updates the View using the Model.
   *
   * @param s Current state
   */
  const render = (s: State) => {
    // Add blocks to the main grid canvas
    const cube = createSvgElement(svg.namespaceURI, "rect", {
      height: `${Block.HEIGHT}`,
      width: `${Block.WIDTH}`,
      x: "0",
      y: "0",
      style: "fill: green",
    });
    svg.appendChild(cube);

    /** TEMPORARY FOR MOVING THE INITIAL CUBE */
    const moveCube = moveSvgElement(cube);

    moveStream$.subscribe((coord: Coordinate) => {
      moveCube(coord);
    });
    /** */

    // Add a block to the preview canvas
    const cubePreview = createSvgElement(preview.namespaceURI, "rect", {
      height: `${Block.HEIGHT}`,
      width: `${Block.WIDTH}`,
      x: `${Block.WIDTH * 2}`,
      y: `${Block.HEIGHT}`,
      style: "fill: green",
    });
    preview.appendChild(cubePreview);
  };

  const source$ = merge(tick$)
    .pipe(scan((s: State) => ({ gameEnd: false }), initialState))
    .subscribe((s: State) => {
      render(s);

      if (s.gameEnd) {
        show(gameover);
      } else {
        hide(gameover);
      }
    });
}

// The following simply runs your main function on window load.  Make sure to leave it in place.
if (typeof window !== "undefined") {
  window.onload = () => {
    main();
  };
}
