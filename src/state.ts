import { Subscription } from "rxjs";
import { movePieceSubscription } from "./observable";
import { Cube, Piece } from "./types";
import { createSquarePiece } from "./util";

export type State = Readonly<{
  gameEnd: boolean;
  currentPiece?: Piece;
  subscriptionState: SubscriptionState;
  pieces: ReadonlyArray<Piece>;
  exit: ReadonlyArray<Piece>;
}>;

export type SubscriptionState = Readonly<{
  subscribed: boolean,
  subscription?: Subscription[] | null
}>

export const initialState: State = {
  gameEnd: false,
  subscriptionState: {subscribed: false},
  pieces: [],
  exit: [],
} as const;

/**
 * Updates the state by proceeding with one time step.
 *
 * @param s Current state
 * @returns Updated state
 */
export const tick = (s: State) => {
  if (!s.subscriptionState.subscribed) {
    const currentPieceSubscriptionState: SubscriptionState = {
      subscribed: true,
      subscription: movePieceSubscription(s.currentPiece)
    }
    return <State>{
      ...s,
      subscriptionState: currentPieceSubscriptionState
    }
  }
  return s;
};
