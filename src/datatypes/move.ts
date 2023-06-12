import { BitBoard } from "./bitboard";

export type MoveKind = bigint; // 16 bits

export type Piece = "pawn" | "knight" | "bishop" | "rook" | "queen" | "king";

export type Move = {
  from: BitBoard;
  to: BitBoard;
  kind: MoveKind;
};

export type CastlingRight = "K" | "Q" | "k" | "q";
