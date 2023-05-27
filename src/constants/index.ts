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
  PAWN: "pawn",
  KNIGHT: "knight",
  BISHOP: "bishop",
  ROOK: "rook",
  QUEEN: "queen",
  KING: "king",
};

export const DefaultFEN =
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w - - 0 1";
