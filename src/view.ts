import { Block, Cube, Move, State, Viewport } from "./types";
import { attr, isNotNullOrUndefined } from "./util";

export { initialiseView, updateView };

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
 * @param elem
 * @param coords
 */
const moveSvgElement = (elem: SVGElement) => (move: Move) => {
  elem.setAttribute("x", String(move.x));
  elem.setAttribute("y", String(move.y));
};

/**
 * Displays a SVG element on the canvas. Brings to foreground.
 * @param elem SVG element to display
 */
export const show = (elem: SVGGraphicsElement) => {
  elem.setAttribute("visibility", "visible");
  elem.parentNode!.appendChild(elem);
};

/**
 * Hides a SVG element on the canvas.
 * @param elem SVG element to hide
 */
export const hide = (elem: SVGGraphicsElement) =>
  elem.setAttribute("visibility", "hidden");

const initialiseView = () => {
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
};

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

    // Text fields
    const levelText = document.querySelector("#levelText") as HTMLElement;
    const scoreText = document.querySelector("#scoreText") as HTMLElement;
    const highScoreText = document.querySelector(
      "#highScoreText"
      ) as HTMLElement;
      
    // if elements are null, exit function early
      if (!svg || preview) return;

    // Update positions
    const updateCubeView = (root: HTMLElement) => (cube: Cube) => {
      const createCube = () => {
        const c = createSvgElement(root.namespaceURI, "rect", {
          height: `${Block.HEIGHT}`,
          width: `${Block.WIDTH}`,
          x: `${Block.WIDTH * 2}`,
          y: `${Block.HEIGHT}`,
          style: `fill: ${cube.colour}`,
        });
        root.appendChild(c);
        console.log("DONE")
        return c;
      }
      const c = document.getElementById(cube.id) || createCube();
      attr(c, {id: cube.id, pos: cube.pos, colour: cube.colour});

    };
    s.cubes.forEach(updateCubeView(svg));
    s.piece.forEach(updateCubeView(svg));

    // remove all cubes that need to be deleted
    s.exit
      .map((c) => document.getElementById(c.id))
      .filter(isNotNullOrUndefined)
      .forEach((v) => {
        try {
          svg.removeChild(v);
        } catch (e) {
          console.log("Already removed: " + v.id);
        }
      });

    // game end
    if (s.gameEnd) {
      show(gameover);
    } else {
      hide(gameover);
    }
  };
