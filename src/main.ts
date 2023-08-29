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
import "./view.ts";

import { Observable, Subscription, fromEvent, interval, merge } from "rxjs";
import { map, scan } from "rxjs/operators";
import { Move, NewGame, initialState, reduceState } from "./state.ts";
import { clearView, initialiseView, updateView } from "./view.ts";
import {
  moveAllDirections$,
  randomShape$,
  rotate$,
  tick$,
} from "./observable.ts";
import { Action, Constants, State } from "./types.ts";

export function gameLoop(s: State = initialState) {
  // Increases in speed based on the level
  const action$: Observable<Action> = merge(
    tick$,
    moveAllDirections$,
    rotate$,
    randomShape$
  );
  const restartBtn = document.querySelector("#restart") as HTMLElement,
    gameLoop$ = fromEvent(restartBtn, "click")
      .pipe(map(() => new NewGame(action$)))
      .pipe(scan(reduceState, s)),
    subscription: Subscription = gameLoop$.subscribe(() => clearView()); // clear the view at the end of each round
}

/**
 * This is the function called on page load. Your main game loop
 * should be called here.
 */
export function main() {
  initialiseView();
  gameLoop();
}

// The following simply runs your main function on window load.  Make sure to leave it in place.
if (typeof window !== "undefined") {
  window.onload = () => {
    main();
  };
}
