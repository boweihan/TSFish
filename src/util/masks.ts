import { Masks, Max64BitInt, Squares } from "../constants";

export type PrecomputedMasks = {
  kingMasks: { [key: string]: bigint[] };
};

export const generateMasks = () => {
  let kingMasks: { [key: string]: bigint[] } = {};

  Object.keys(Squares).forEach((square) => {
    kingMasks[square] = generateKingMasks(BigInt(Squares[square]));
  });

  return { kingMasks };
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
