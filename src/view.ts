/**
 * Manages the game view.
 *
 * All visual interactions on the webpage are handled here.
 * Specifically, most of the side effects occur here, and
 * hence this is the most "impure" file that you will encounter.
 *
 * @author William Keeble
 */

/////////////// [IMPORTS AND EXPORTS] ////////////////////

import { fromEvent } from "rxjs";
import { HardDown, Move, createPiece, initialState } from "./state";
import { Block, Cube, State, Viewport } from "./types";
import { attr, isNotNullOrUndefined } from "./util";
import { main } from "./main";

export { initialiseView, updateView, updateHighScore };

/////////////// [UTILITY FUNCTIONS FOR VIEW] ////////////////////

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
 * Displays a SVG element on the canvas. Brings to foreground.
 * @param elem SVG element to display
 */
export const show = (elem: SVGGraphicsElement | HTMLElement) => {
  if (elem) {
    if (elem instanceof SVGGraphicsElement) {
      elem.setAttribute("visibility", "visible");
    }
    elem.classList.remove("hidden");
    elem.parentNode!.appendChild(elem);
  } else {
    console.log("elem not found");
  }
};

/**
 * Hides a SVG element on the canvas.
 * @param elem SVG element to hide
 */
export const hide = (elem: SVGGraphicsElement | HTMLElement) => {
  if (elem) {
    if (elem instanceof SVGGraphicsElement) {
      elem.setAttribute("visibility", "hidden");
    }
    elem.classList.add("hidden");
  }
};

/**
 * Clears the view, resetting to an initial "clean" state.
 */
export const clearView = () => {
  const svg = document.querySelector("#svgCanvas") as SVGGraphicsElement &
    HTMLElement;
  const gameover = document.querySelector("#gameOver") as SVGGraphicsElement &
    HTMLElement;
  const restart = document.querySelector("#restart") as HTMLElement;

  svg.innerHTML = "";
  svg.appendChild(gameover);
  hide(gameover);
  hide(restart);
};

/**
 * Updates the high score, if it is larger than the old high score.
 * @param newHighScore The potential new high score.
 */
const updateHighScore = (newHighScore: number) => {
  const highScoreText = document.querySelector("#highScoreText") as HTMLElement,
    oldHighScore = highScoreText.innerText;
  highScoreText.innerText =
    newHighScore > Number(oldHighScore) ? String(newHighScore) : oldHighScore;
  console.log(newHighScore, highScoreText.innerText);
};

/**
 * Initialises view elements
 */
const initialiseView = () => {
  const svg = document.querySelector("#svgCanvas") as SVGGraphicsElement &
    HTMLElement;
  const preview = document.querySelector("#svgPreview") as SVGGraphicsElement &
    HTMLElement;

  svg.setAttribute("height", `${Viewport.CANVAS_HEIGHT}`);
  svg.setAttribute("width", `${Viewport.CANVAS_WIDTH}`);
  preview.setAttribute("height", `${Viewport.PREVIEW_HEIGHT}`);
  preview.setAttribute("width", `${Viewport.PREVIEW_WIDTH}`);
};

/////////////// [MAIN UPDATE VIEW] ////////////////////

const updateView =
  (onFinish: () => void) =>
  (s: State): void => {
    // Visual element references
    const svg = document.querySelector("#svgCanvas") as SVGGraphicsElement &
      HTMLElement;
    const preview = document.querySelector(
      "#svgPreview"
    ) as SVGGraphicsElement & HTMLElement;
    const gameover = document.querySelector("#gameOver") as SVGGraphicsElement &
      HTMLElement;
    const container = document.querySelector("#main") as HTMLElement;
    const restart = document.querySelector("#restart") as HTMLElement;

    // Text fields
    const levelText = document.querySelector("#levelText") as HTMLElement;
    const scoreText = document.querySelector("#scoreText") as HTMLElement;
    const highScoreText = document.querySelector(
      "#highScoreText"
    ) as HTMLElement;

    // If elements are null, exit function early
    if (!svg || !preview) return;

    // Find all SVG elements with the color "none" - these are the preview cubes
    const cubesToRemove = preview.querySelectorAll('rect[color= "none"]');
    cubesToRemove.forEach((cube) => {
      try {
        console.log("removed transparent cube");
        svg.removeChild(cube);
      } catch (e) {}
    });

    // Update positions
    const updateCubeView = (root: HTMLElement) => (cube: Cube) => {
      const cubeElement = document.getElementById(String(cube.id));
      if (cubeElement) {
        cubeElement.setAttribute("x", String(cube.x));
        cubeElement.setAttribute("y", String(cube.y));
      } else {
        const c = createSvgElement(root.namespaceURI, "rect", {
          height: `${Block.HEIGHT}`,
          width: `${Block.WIDTH}`,
          x: `${cube.x}`,
          y: `${cube.y}`,
          style: `fill: ${cube.colour}`,
        });
        c.setAttribute("id", String(cube.id));
        root.appendChild(c);
      }
    };

    const displayOnSvg = updateCubeView(svg);
    s.staticCubes.forEach(displayOnSvg);
    s.piece.cubes.forEach(displayOnSvg);
    s.dropPreview.forEach(displayOnSvg);

    // Render the preview
    preview.innerHTML = "";
    const previewPiece = createPiece(initialState)(s.nextPiece.shape);
    previewPiece.cubes.forEach((cube: Cube) => {
      const c = createSvgElement(preview.namespaceURI, "rect", {
        height: `${Block.HEIGHT}`,
        width: `${Block.WIDTH}`,
        x: `${cube.x - 10}`,
        y: `${cube.y + 60}`,
        style: `fill: ${cube.colour}`,
      });
      c.setAttribute("id", String(cube.id));
      preview.appendChild(c);
    });

    // Update high score if needed
    updateHighScore(s.highScore);

    // Remove all cubes that need to be deleted
    s.exit
      .map((cube) => document.getElementById(String(cube.id)))
      .filter(isNotNullOrUndefined)
      .forEach((v) => {
        try {
          svg.removeChild(v);
        } catch (e) {
          console.log("Already removed: " + v.id);
        }
      });

    // Update level, score and high score
    levelText.innerHTML = String(s.level);
    scoreText.innerHTML = String(s.score);

    // Game end
    if (s.gameEnd) {
      show(gameover);
      restart.innerText = "Restart Game";
      show(restart);
      onFinish();
    } else {
      show(container);
      hide(gameover);
      hide(restart);
    }
  };
