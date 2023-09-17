import { BitBoard } from "../datatypes";
import { Move } from "../datatypes/move";
import { PlayerColor } from "../types";

export interface MoveGenerator {
  generate: () => Move[];
  generateAttacksOnSquare: (square: BitBoard, color: PlayerColor) => BitBoard;

  generatePawnMoves: (from: BitBoard, color: PlayerColor) => Move[];
  generateKnightMoves: (from: BitBoard, color: PlayerColor) => Move[];
  generateBishopMoves: (from: BitBoard, color: PlayerColor) => Move[];
  generateRookMoves: (from: BitBoard, color: PlayerColor) => Move[];
  generateQueenMoves: (from: BitBoard, color: PlayerColor) => Move[];
  generateKingMoves: (
    from: BitBoard,
    color: PlayerColor,
    generateCastlingMoves?: boolean
  ) => Move[];

  generatePawnAttacks: (from: BitBoard, color: PlayerColor) => Move[];
}

export { default as PseudoLegalGenerator } from "./pseudoLegal";
