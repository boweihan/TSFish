import type { Piece } from "../datatypes/move";
import { PlayerColor } from "../types";

export const EngineInput = {
  UCI: "uci",
  DEBUG: "debug",
  ISREADY: "isready",
  SETOPTION: "setoption",
  REGISTER: "register",
  UCINEWGAME: "ucinewgame",
  POSITION: "position",
  GO: "go",
  STOP: "stop",
  PONDERHIT: "ponderhit",
  QUIT: "quit",
  PERFT: "perft",
  STARTPOS: "startpos",
};

export const EngineOutput = {
  ID: "id",
  UCIOK: "uciok",
  READYOK: "readyok",
  BESTMOVE: "bestmove",
  COPYPROTECTION: "copyprotection",
  REGISTRATION: "registration",
  INFO: "info",
  OPTION: "option",
};

export const Color = {
  WHITE: "w" as PlayerColor,
  BLACK: "b" as PlayerColor,
};

export const Pieces = {
  PAWN: "pawn" as Piece,
  KNIGHT: "knight" as Piece,
  BISHOP: "bishop" as Piece,
  ROOK: "rook" as Piece,
  QUEEN: "queen" as Piece,
  KING: "king" as Piece,
};

export const DefaultFEN =
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w - - 0 1";

export const Masks = {
  NOT_A_FILE: BigInt("18374403900871474942"), // must instantiate as string - not hex or number - or inaccurate
  NOT_AB_FILE: BigInt("18229723555195321596"),
  NOT_GH_FILE: BigInt("4557430888798830399"),
  NOT_H_FILE: BigInt("9187201950435737471"),
};

export const Squares = {
  h1: BigInt(
    0b0000000000000000000000000000000000000000000000000000000000000001
  ),
  g1: BigInt(
    0b0000000000000000000000000000000000000000000000000000000000000010
  ),
  f1: BigInt(
    0b0000000000000000000000000000000000000000000000000000000000000100
  ),
  e1: BigInt(
    0b0000000000000000000000000000000000000000000000000000000000001000
  ),
  d1: BigInt(
    0b0000000000000000000000000000000000000000000000000000000000010000
  ),
  c1: BigInt(
    0b0000000000000000000000000000000000000000000000000000000000100000
  ),
  b1: BigInt(
    0b0000000000000000000000000000000000000000000000000000000001000000
  ),
  a1: BigInt(
    0b0000000000000000000000000000000000000000000000000000000010000000
  ),
  h2: BigInt(
    0b0000000000000000000000000000000000000000000000000000000100000000
  ),
  g2: BigInt(
    0b0000000000000000000000000000000000000000000000000000001000000000
  ),
  f2: BigInt(
    0b0000000000000000000000000000000000000000000000000000010000000000
  ),
  e2: BigInt(
    0b0000000000000000000000000000000000000000000000000000100000000000
  ),
  d2: BigInt(
    0b0000000000000000000000000000000000000000000000000001000000000000
  ),
  c2: BigInt(
    0b0000000000000000000000000000000000000000000000000010000000000000
  ),
  b2: BigInt(
    0b0000000000000000000000000000000000000000000000000100000000000000
  ),
  a2: BigInt(
    0b0000000000000000000000000000000000000000000000001000000000000000
  ),
  h3: BigInt(
    0b0000000000000000000000000000000000000000000000010000000000000000
  ),
  g3: BigInt(
    0b0000000000000000000000000000000000000000000000100000000000000000
  ),
  f3: BigInt(
    0b0000000000000000000000000000000000000000000001000000000000000000
  ),
  e3: BigInt(
    0b0000000000000000000000000000000000000000000010000000000000000000
  ),
  d3: BigInt(
    0b0000000000000000000000000000000000000000000100000000000000000000
  ),
  c3: BigInt(
    0b0000000000000000000000000000000000000000001000000000000000000000
  ),
  b3: BigInt(
    0b0000000000000000000000000000000000000000010000000000000000000000
  ),
  a3: BigInt(
    0b0000000000000000000000000000000000000000100000000000000000000000
  ),
  h4: BigInt(
    0b0000000000000000000000000000000000000001000000000000000000000000
  ),
  g4: BigInt(
    0b0000000000000000000000000000000000000010000000000000000000000000
  ),
  f4: BigInt(
    0b0000000000000000000000000000000000000100000000000000000000000000
  ),
  e4: BigInt(
    0b0000000000000000000000000000000000001000000000000000000000000000
  ),
  d4: BigInt(
    0b0000000000000000000000000000000000010000000000000000000000000000
  ),
  c4: BigInt(
    0b0000000000000000000000000000000000100000000000000000000000000000
  ),
  b4: BigInt(
    0b0000000000000000000000000000000001000000000000000000000000000000
  ),
  a4: BigInt(
    0b0000000000000000000000000000000010000000000000000000000000000000
  ),
  h5: BigInt(
    0b0000000000000000000000000000000100000000000000000000000000000000
  ),
  g5: BigInt(
    0b0000000000000000000000000000001000000000000000000000000000000000
  ),
  f5: BigInt(
    0b0000000000000000000000000000010000000000000000000000000000000000
  ),
  e5: BigInt(
    0b0000000000000000000000000000100000000000000000000000000000000000
  ),
  d5: BigInt(
    0b0000000000000000000000000001000000000000000000000000000000000000
  ),
  c5: BigInt(
    0b0000000000000000000000000010000000000000000000000000000000000000
  ),
  b5: BigInt(
    0b0000000000000000000000000100000000000000000000000000000000000000
  ),
  a5: BigInt(
    0b0000000000000000000000001000000000000000000000000000000000000000
  ),
  h6: BigInt(
    0b0000000000000000000000010000000000000000000000000000000000000000
  ),
  g6: BigInt(
    0b0000000000000000000000100000000000000000000000000000000000000000
  ),
  f6: BigInt(
    0b0000000000000000000001000000000000000000000000000000000000000000
  ),
  e6: BigInt(
    0b0000000000000000000010000000000000000000000000000000000000000000
  ),
  d6: BigInt(
    0b0000000000000000000100000000000000000000000000000000000000000000
  ),
  c6: BigInt(
    0b0000000000000000001000000000000000000000000000000000000000000000
  ),
  b6: BigInt(
    0b0000000000000000010000000000000000000000000000000000000000000000
  ),
  a6: BigInt(
    0b0000000000000000100000000000000000000000000000000000000000000000
  ),
  h7: BigInt(
    0b0000000000000001000000000000000000000000000000000000000000000000
  ),
  g7: BigInt(
    0b0000000000000010000000000000000000000000000000000000000000000000
  ),
  f7: BigInt(
    0b0000000000000100000000000000000000000000000000000000000000000000
  ),
  e7: BigInt(
    0b0000000000001000000000000000000000000000000000000000000000000000
  ),
  d7: BigInt(
    0b0000000000010000000000000000000000000000000000000000000000000000
  ),
  c7: BigInt(
    0b0000000000100000000000000000000000000000000000000000000000000000
  ),
  b7: BigInt(
    0b0000000001000000000000000000000000000000000000000000000000000000
  ),
  a7: BigInt(
    0b0000000010000000000000000000000000000000000000000000000000000000
  ),
  h8: BigInt(
    0b0000000100000000000000000000000000000000000000000000000000000000
  ),
  g8: BigInt(
    0b0000001000000000000000000000000000000000000000000000000000000000
  ),
  f8: BigInt(
    0b0000010000000000000000000000000000000000000000000000000000000000
  ),
  e8: BigInt(
    0b0000100000000000000000000000000000000000000000000000000000000000
  ),
  d8: BigInt(
    0b0001000000000000000000000000000000000000000000000000000000000000
  ),
  c8: BigInt(
    0b0010000000000000000000000000000000000000000000000000000000000000
  ),
  b8: BigInt(
    0b0100000000000000000000000000000000000000000000000000000000000000
  ),
  a8: BigInt(
    0b1000000000000000000000000000000000000000000000000000000000000000
  ),
} as { [key: string]: bigint };

export const SquaresReverse = Object.keys(Squares).reduce((acc, key) => {
  // @ts-ignore
  const value = Squares[key];
  acc[value.toString(2)] = key;
  return acc;
}, {} as { [key: string]: string });

// ordinal represents binary index of a square
export const MoveType = {
  QUIET: BigInt(0),
  DOUBLE_PAWN_PUSH: BigInt(1),
  KING_CASTLE: BigInt(2),
  QUEEN_CASTLE: BigInt(3),
  CAPTURE: BigInt(4),
  EN_PASSANT: BigInt(5),
  KNIGHT_PROMOTION: BigInt(6),
  BISHOP_PROMOTION: BigInt(7),
  ROOK_PROMOTION: BigInt(8),
  QUEEN_PROMOTION: BigInt(9),
  KNIGHT_PROMO_CAPTURE: BigInt(10),
  BISHOP_PROMO_CAPTURE: BigInt(11),
  ROOK_PROMO_CAPTURE: BigInt(12),
  QUEEN_PROMO_CAPTURE: BigInt(13),
};

export const Max64BitInt = BigInt("18446744073709551615");
export const Rank2 = BigInt("65280");
export const Rank7 = BigInt("71776119061217280");
