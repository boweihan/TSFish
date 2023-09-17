import { SquaresReverse } from "../constants";
import { BitBoard } from "../datatypes";

export const stringify = (board: BitBoard) => {
  return SquaresReverse[board.toString(2)];
};

export const sameFile = (from: BitBoard, to: BitBoard) => {
  return stringify(from)[0] === stringify(to)[0];
};

export const sameRank = (from: BitBoard, to: BitBoard) => {
  return stringify(from)[1] === stringify(to)[1];
};
