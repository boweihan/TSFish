import { SquaresReverse } from "../constants";
import { BitBoard } from "../datatypes";

export const stringify = (board: BitBoard): string =>
  SquaresReverse[board.toString(2)];
