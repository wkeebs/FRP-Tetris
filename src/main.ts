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

import "./observable.ts";
import "./state.ts";
import { Coordinate, Key, Event, Cube } from "./types.ts";
import { createSquarePiece, mergeCoordinates, observeKey } from "./util.ts";
import "./view.ts";

import { Observable, fromEvent, interval, merge } from "rxjs";
import { map, filter, scan } from "rxjs/operators";
import { State, initialState, tick } from "./state.ts";
import { createSvgElement, moveSvgElement, show, hide, render } from "./view.ts";
import {
  initial_coords as INITIAL_COORDS,
  moveCubeSubscription,
  movePieceSubscription,
  tick$,
} from "./observable.ts";

/** ==================== Constants ==================== **/
export const Viewport = {
  CANVAS_WIDTH: 200,
  CANVAS_HEIGHT: 400,
  PREVIEW_WIDTH: 160,
  PREVIEW_HEIGHT: 80,
} as const;

export const Constants = {
  TICK_RATE_MS: 1000,
  GRID_WIDTH: 10,
  GRID_HEIGHT: 20,
  MOVE_BY: 20,
} as const;

export const Block = {
  WIDTH: Viewport.CANVAS_WIDTH / Constants.GRID_WIDTH,
  HEIGHT: Viewport.CANVAS_HEIGHT / Constants.GRID_HEIGHT,
};

const INITIAL_ID = "1";

/** ==================== MAIN LOOP ==================== **/
/**
 * This is the function called on page load. Your main game loop
 * should be called here.
 */
export function main() {
  /** ==================== Canvas Elements ==================== **/
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

  /** ==================== Text Fields ==================== **/
  const levelText = document.querySelector("#levelText") as HTMLElement;
  const scoreText = document.querySelector("#scoreText") as HTMLElement;
  const highScoreText = document.querySelector("#highScoreText") as HTMLElement;

  /** ==================== Rendering ==================== **/
  // const testPiece = createSquarePiece(svg, INITIAL_COORDS);
  const previewPiece = createSquarePiece(preview, { x: 60, y: 20 });
  // const testPieceSubscription = movePieceSubscription(testPiece);



  const source$ = merge(tick$)
    .pipe(
      scan((s: State) => tick(s), {
        ...initialState,
        currentPiece: createSquarePiece(svg, INITIAL_COORDS),
      })
    )
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
