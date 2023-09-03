/**
 * The main file, ran on page load.
 *
 * This file is the initialisation point for all functionality in the game.
 *
 * @author William Keeble
 */

/////////////// [IMPORTS AND EXPORTS] ////////////////////

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

export { gameLoop, main };

/////////////// [MAIN GAME FUNCTIONALITY] ////////////////////

function gameLoop(s: State = initialState) {
  /**
   * Initialises a main game loop.
   * @param s The state.
   */
  // All actions streams consolidated here.
  const action$: Observable<Action> = merge(
    tick$,
    moveAllDirections$,
    rotate$,
    randomShape$
  );
  // Bind the new game button.
  const newGameBtn = document.querySelector("#restart") as HTMLElement,
    gameLoop$ = fromEvent(newGameBtn, "click")
      .pipe(map(() => new NewGame(action$)))
      .pipe(scan(reduceState, s)),
    subscription: Subscription = gameLoop$.subscribe(() => clearView()); // clear the view at the end of each round
}

/**
 * Called on page load, initialises the view and game loop.
 */
function main() {
  initialiseView();
  gameLoop();
}

// The following simply runs your main function on window load.  Make sure to leave it in place.
if (typeof window !== "undefined") {
  window.onload = () => {
    main();
  };
}
