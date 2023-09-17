import { Castling } from "../constants";
import { CastlingRights } from "../types";

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
