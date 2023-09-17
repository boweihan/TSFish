import { SquaresReverse } from "../constants";
import { BitBoard } from "../datatypes";

export const stringify = (board: BitBoard): string =>
  SquaresReverse[board.toString(2)];

export const getLS1B = (board: BitBoard) => {
  // intersection of binary number and it's twos complement isolates the LS1B
  // https://www.chessprogramming.org/General_Setwise_Operations#TheLeastSignificantOneBitLS1B
  // javascript represents negative numbers as the twos complement
  return board & -board;
};

export const countBits = (board: BitBoard) => {
  let count = 0;

  while (board) {
    count++;
    const ls1b = getLS1B(board);
    board ^= ls1b;
  }

  return count;
};

export const fanOut = (board: BitBoard) => {
  const pieces = [];

  while (board) {
    const ls1b = getLS1B(board);
    pieces.push(ls1b);
    board ^= ls1b;
  }

  return pieces;
};
