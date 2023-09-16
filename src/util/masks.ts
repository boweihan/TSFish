import { Masks, Max64BitInt, Squares } from "../constants";

export type PrecomputedMasks = {
  kingMasks: { [key: string]: bigint[] };
  knightMasks: { [key: string]: bigint[] };
};

export const generateMasks = () => {
  let kingMasks: { [key: string]: bigint[] } = {};
  let knightMasks: { [key: string]: bigint[] } = {};

  Object.keys(Squares).forEach((square) => {
    kingMasks[square] = generateKingMasks(Squares[square]);
    knightMasks[square] = generateKnightMasks(Squares[square]);
  });

  return { kingMasks, knightMasks };
};

export const generateKingMasks = (from: bigint) => {
  return [
    (from << BigInt(8)) & Max64BitInt, // no
    (from << BigInt(7)) & Masks.NOT_H_FILE, // noEa
    (from >> BigInt(1)) & Masks.NOT_H_FILE, // ea
    (from >> BigInt(9)) & Masks.NOT_H_FILE, // soEa
    from >> BigInt(8), // so
    (from >> BigInt(7)) & Masks.NOT_A_FILE, // soWe
    (from << BigInt(1)) & Masks.NOT_A_FILE, // we
    (from << BigInt(9)) & Masks.NOT_A_FILE, // noWe
  ].filter(Boolean);
};

export const generateKnightMasks = (from: bigint) => {
  return [
    (from << BigInt(17)) & Masks.NOT_A_FILE, // noNoEa
    (from << BigInt(10)) & Masks.NOT_AB_FILE, // noEaEa
    (from >> BigInt(6)) & Masks.NOT_AB_FILE, // soEaEa
    (from >> BigInt(15)) & Masks.NOT_A_FILE, // soSoEa
    (from << BigInt(15)) & Masks.NOT_H_FILE, // noNoWe
    (from << BigInt(6)) & Masks.NOT_GH_FILE, // noWeWe
    (from >> BigInt(10)) & Masks.NOT_GH_FILE, // soWeWe
    (from >> BigInt(17)) & Masks.NOT_H_FILE, // soSoWe
  ].filter(Boolean);
};
