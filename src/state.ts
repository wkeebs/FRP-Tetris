export type State = Readonly<{
  gameEnd: boolean;
}>;

export const initialState: State = {
  gameEnd: false,
} as const;

/**
 * Updates the state by proceeding with one time step.
 *
 * @param s Current state
 * @returns Updated state
 */
export const tick = (s: State) => s;
