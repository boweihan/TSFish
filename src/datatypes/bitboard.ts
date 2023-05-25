// https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-1.html#recursive-conditional-types
type Tuple<T, N extends number> = N extends N
  ? number extends N
    ? T[]
    : _TupleOf<T, N, []>
  : never;

type _TupleOf<T, N extends number, R extends unknown[]> = R["length"] extends N
  ? R
  : _TupleOf<T, N, [T, ...R]>;

export type BitBoard = Tuple<number, 64>;

export type ClassicalBoard = {
  white: BitBoard;
  black: BitBoard;
  kings: BitBoard;
  queens: BitBoard;
  rooks: BitBoard;
  bishops: BitBoard;
  knights: BitBoard;
  pawns: BitBoard;
};

// prettier-ignore
export const EmptyBitBoard = [
  0, 0, 0, 0, 0, 0, 0, 0, // 8
  0, 0, 0, 0, 0, 0, 0, 0, // 7
  0, 0, 0, 0, 0, 0, 0, 0, // 6
  0, 0, 0, 0, 0, 0, 0, 0, // 5
  0, 0, 0, 0, 0, 0, 0, 0, // 4
  0, 0, 0, 0, 0, 0, 0, 0, // 3
  0, 0, 0, 0, 0, 0, 0, 0, // 2
  0, 0, 0, 0, 0, 0, 0, 0, // 1
]

export const generateEmptyBoard = () => ({
  white: [...EmptyBitBoard] as BitBoard,
  black: [...EmptyBitBoard] as BitBoard,
  kings: [...EmptyBitBoard] as BitBoard,
  queens: [...EmptyBitBoard] as BitBoard,
  rooks: [...EmptyBitBoard] as BitBoard,
  bishops: [...EmptyBitBoard] as BitBoard,
  knights: [...EmptyBitBoard] as BitBoard,
  pawns: [...EmptyBitBoard] as BitBoard,
});

// // TODO
// export type MagicBoard = {}