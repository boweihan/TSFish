import { Castling, SquaresReverse } from "../constants";
import { BitBoard } from "../datatypes";
import { CastlingRights } from "../types";

export const stringify = (board: BitBoard) => {
  return SquaresReverse[board.toString(2)];
};

export const sameFile = (from: BitBoard, to: BitBoard) => {
  return stringify(from)[0] === stringify(to)[0];
};

export const sameRank = (from: BitBoard, to: BitBoard) => {
  return stringify(from)[1] === stringify(to)[1];
};

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

export const stringifyCastlingRights = (castling: CastlingRights): string => {
  let serialized = "";

  if (castling.K) {
    serialized += Castling.WHITE_KING_SIDE;
  }

  if (castling.Q) {
    serialized += Castling.WHITE_QUEEN_SIDE;
  }

  if (castling.k) {
    serialized += Castling.BLACK_KING_SIDE;
  }

  if (castling.q) {
    serialized += Castling.BLACK_QUEEN_SIDE;
  }

  if (!serialized.length) {
    serialized = "-";
  }

  return serialized;
};

export const serializeCastlingRights = (castling: string) => {
  const serialized: CastlingRights = {
    K: false,
    Q: false,
    k: false,
    q: false,
  };

  if (castling.includes(Castling.WHITE_KING_SIDE)) {
    serialized.K = true;
  }

  if (castling.includes(Castling.WHITE_QUEEN_SIDE)) {
    serialized.Q = true;
  }

  if (castling.includes(Castling.BLACK_KING_SIDE)) {
    serialized.k = true;
  }

  if (castling.includes(Castling.BLACK_QUEEN_SIDE)) {
    serialized.q = true;
  }

  return serialized;
};

export const forEachSquare = (
  board: BitBoard,
  callback: (...args: BitBoard[]) => void
) => {
  while (board) {
    const ls1b = getLS1B(board);
    callback(ls1b);
    board ^= ls1b; // remove ls1b from board
  }
};
