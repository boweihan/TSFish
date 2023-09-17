import { MoveType, Pieces, SquaresReverse } from "../constants";
import { BitBoard } from "../datatypes";
import { Move, Piece } from "../datatypes/move";

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

export const determinePromotionPiece = (move: Move): Piece => {
  const { kind } = move;

  switch (kind) {
    case MoveType.KNIGHT_PROMOTION:
    case MoveType.KNIGHT_PROMO_CAPTURE:
      return Pieces.KNIGHT;
    case MoveType.BISHOP_PROMOTION:
    case MoveType.BISHOP_PROMO_CAPTURE:
      return Pieces.BISHOP;
    case MoveType.ROOK_PROMOTION:
    case MoveType.ROOK_PROMO_CAPTURE:
      return Pieces.ROOK;
    case MoveType.QUEEN_PROMOTION:
    case MoveType.QUEEN_PROMO_CAPTURE:
      return Pieces.QUEEN;
    default:
      throw new Error(`Invalid promotion move type: ${kind}`);
  }
};
