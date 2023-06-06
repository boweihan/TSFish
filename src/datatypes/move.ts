import { BitBoard } from "./bitboard";

export type MoveKind = bigint; // 16 bits

export type Move = {
  from: BitBoard;
  to: BitBoard;
  kind: MoveKind;
};
