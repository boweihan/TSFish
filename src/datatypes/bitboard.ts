import { PlayerColor } from "../types";

// https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-1.html#recursive-conditional-types
type Tuple<T, N extends number> = N extends N
  ? number extends N
    ? T[]
    : _TupleOf<T, N, []>
  : never;

type _TupleOf<T, N extends number, R extends unknown[]> = R["length"] extends N
  ? R
  : _TupleOf<T, N, [T, ...R]>;

export type BitBoard = bigint;

export type ColoredBitBoards = {
  pieces: BitBoard;
  kings: BitBoard;
  queens: BitBoard;
  rooks: BitBoard;
  bishops: BitBoard;
  knights: BitBoard;
  pawns: BitBoard;
};

export type ClassicalBitBoards = {
  [K in PlayerColor]: ColoredBitBoards;
};
export type ColoredBoards = {
  pieces: Board;
  kings: Board;
  queens: Board;
  rooks: Board;
  bishops: Board;
  knights: Board;
  pawns: Board;
};

export type ClassicalBoards = {
  [K in PlayerColor]: ColoredBoards;
};

export type Board = Tuple<number, 64>;

// prettier-ignore
export const EmptyBoard = [
  0, 0, 0, 0, 0, 0, 0, 0, // 8
  0, 0, 0, 0, 0, 0, 0, 0, // 7
  0, 0, 0, 0, 0, 0, 0, 0, // 6
  0, 0, 0, 0, 0, 0, 0, 0, // 5
  0, 0, 0, 0, 0, 0, 0, 0, // 4
  0, 0, 0, 0, 0, 0, 0, 0, // 3
  0, 0, 0, 0, 0, 0, 0, 0, // 2
  0, 0, 0, 0, 0, 0, 0, 0, // 1
]

export const generateEmptyBoard = (): ClassicalBoards => ({
  w: {
    pieces: [...EmptyBoard] as Board,
    kings: [...EmptyBoard] as Board,
    queens: [...EmptyBoard] as Board,
    rooks: [...EmptyBoard] as Board,
    bishops: [...EmptyBoard] as Board,
    knights: [...EmptyBoard] as Board,
    pawns: [...EmptyBoard] as Board,
  },
  b: {
    pieces: [...EmptyBoard] as Board,
    kings: [...EmptyBoard] as Board,
    queens: [...EmptyBoard] as Board,
    rooks: [...EmptyBoard] as Board,
    bishops: [...EmptyBoard] as Board,
    knights: [...EmptyBoard] as Board,
    pawns: [...EmptyBoard] as Board,
  },
});

export const boardToBitBoard = (board: Board) =>
  BigInt(
    parseInt(
      board.reduce((a, b) => a + b, ""),
      2 // convert to binary
    )
  );

export const boardsToBitBoards = (
  boards: ClassicalBoards
): ClassicalBitBoards => {
  return {
    w: {
      pieces: boardToBitBoard(boards.w.pieces),
      kings: boardToBitBoard(boards.w.kings),
      queens: boardToBitBoard(boards.w.queens),
      rooks: boardToBitBoard(boards.w.rooks),
      bishops: boardToBitBoard(boards.w.bishops),
      knights: boardToBitBoard(boards.w.knights),
      pawns: boardToBitBoard(boards.w.pawns),
    },
    b: {
      pieces: boardToBitBoard(boards.b.pieces),
      kings: boardToBitBoard(boards.b.kings),
      queens: boardToBitBoard(boards.b.queens),
      rooks: boardToBitBoard(boards.b.rooks),
      bishops: boardToBitBoard(boards.b.bishops),
      knights: boardToBitBoard(boards.b.knights),
      pawns: boardToBitBoard(boards.b.pawns),
    },
  };
};
