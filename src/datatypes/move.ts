import { PlayerColor } from "../types";
import { BitBoard } from "./bitboard";

export type MoveKind = bigint; // 16 bits

export type Piece = "pawn" | "knight" | "bishop" | "rook" | "queen" | "king";

export type Move = {
  from: BitBoard;
  to: BitBoard;
  kind: MoveKind;
};

export type CastlingRight = "K" | "Q" | "k" | "q";

export type Threat = {
  from: BitBoard;
  to: BitBoard;
  piece: Piece;
};

export type ThreatMap = {
  [key: string]: Threat[];
};

export type ThreatMaps = {
  [key in PlayerColor]: ThreatMap;
};
