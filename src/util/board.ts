import {
  Masks,
  Max64BitInt,
  MoveType,
  Pieces,
  SquaresReverse,
} from "../constants";
import { BitBoard, ClassicalBitBoards } from "../datatypes";
import { Move, Piece } from "../datatypes/move";
import { PlayerColor } from "../types";

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

export const determinePiece = (
  board: ClassicalBitBoards,
  from: BitBoard
): Piece => {
  const { w, b } = board;

  let piece;

  (w.pawn & from || b.pawn & from) && (piece = Pieces.PAWN);
  (w.rook & from || b.rook & from) && (piece = Pieces.ROOK);
  (w.knight & from || b.knight & from) && (piece = Pieces.KNIGHT);
  (w.bishop & from || b.bishop & from) && (piece = Pieces.BISHOP);
  (w.queen & from || b.queen & from) && (piece = Pieces.QUEEN);
  (w.king & from || b.king & from) && (piece = Pieces.KING);

  if (!piece) {
    throw new Error(`Invalid piece at ${stringify(from)}`);
  }

  return piece;
};

export const isCollision = (board: ClassicalBitBoards, to: BitBoard) => {
  return (board.w.piece & to) | (board.b.piece & to);
};

export const isCapture = (
  board: ClassicalBitBoards,
  to: BitBoard,
  color: PlayerColor
) => {
  return board[color === "w" ? "b" : "w"].piece & to;
};

export const shiftNE = (from: BitBoard) => {
  from <<= BigInt(7);
  from &= Max64BitInt;
  from &= Masks.NOT_H_FILE;

  return from;
};

export const shiftNW = (from: BitBoard) => {
  from <<= BigInt(9);
  from &= Max64BitInt;
  from &= Masks.NOT_A_FILE;

  return from;
};

export const shiftSW = (from: BitBoard) => {
  from >>= BigInt(7);
  from &= Masks.NOT_A_FILE;

  return from;
};

export const shiftSE = (from: BitBoard) => {
  from >>= BigInt(9);
  from &= Masks.NOT_H_FILE;

  return from;
};

export const shiftUp = (from: BitBoard) => {
  from <<= BigInt(8);
  from &= Max64BitInt;

  return from;
};

export const shiftDown = (from: BitBoard) => {
  from >>= BigInt(8);

  return from;
};

export const shiftLeft = (from: BitBoard) => {
  from <<= BigInt(1);
  from &= Masks.NOT_A_FILE;

  return from;
};

export const shiftRight = (from: BitBoard) => {
  from >>= BigInt(1);
  from &= Masks.NOT_H_FILE;

  return from;
};

export const calculatePinnedPieces = (
  board: ClassicalBitBoards,
  color: PlayerColor
) => {
  // start from the king of the specified color
  const king = board[color].king;

  // look in all directions for the first piece of the same color
  return [
    searchForDirectionalPin(king, board, color, shiftNE, true),
    searchForDirectionalPin(king, board, color, shiftNW, true),
    searchForDirectionalPin(king, board, color, shiftSW, true),
    searchForDirectionalPin(king, board, color, shiftSE, true),
    searchForDirectionalPin(king, board, color, shiftUp, false),
    searchForDirectionalPin(king, board, color, shiftDown, false),
    searchForDirectionalPin(king, board, color, shiftLeft, false),
    searchForDirectionalPin(king, board, color, shiftRight, false),
  ]
    .flat()
    .reduce((a, b) => a | b, BigInt(0));
};

const searchForDirectionalPin = (
  from: BitBoard,
  board: ClassicalBitBoards,
  color: PlayerColor,
  direction: (from: BitBoard) => BitBoard,
  isDiagonal: boolean
): BitBoard[] => {
  const pieces = [];

  const opponentColor = color === "w" ? "b" : "w";
  const opponentBoard = board[opponentColor];

  let ray = from;

  while (ray) {
    ray = direction(ray);

    if (ray) {
      const collided = isCollision(board, ray);

      if (collided) {
        // hit a piece
        if (!isCapture(board, ray, color)) {
          // hit own piece
          if (pieces.length === 0) {
            // first hit is our own piece, possible pin
            pieces.push(ray);
          } else {
            // second or greater hit is our own piece, not a pin
            return [];
          }
        } else {
          // hit opponent piece
          if (pieces.length === 1) {
            // second hit is opposing piece
            if (ray & opponentBoard.queen) {
              // pinned by a queen
              return pieces;
            } else if (isDiagonal && ray & opponentBoard.bishop) {
              // pinned by a bishop
              return pieces;
            } else if (!isDiagonal && ray & opponentBoard.rook) {
              // pinned by a rook
              return pieces;
            } else {
              // not a sliding piece, not pinned
              return [];
            }
          } else {
            // first hit is opposing piece, not pinned
            return [];
          }
        }
      }
    }
  }

  return [];
};
