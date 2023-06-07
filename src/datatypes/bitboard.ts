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
  piece: BitBoard;
  king: BitBoard;
  queen: BitBoard;
  rook: BitBoard;
  bishop: BitBoard;
  knight: BitBoard;
  pawn: BitBoard;
};

export type ClassicalBitBoards = {
  [K in PlayerColor]: ColoredBitBoards;
};
export type ColoredBoards = {
  piece: Board;
  king: Board;
  queen: Board;
  rook: Board;
  bishop: Board;
  knight: Board;
  pawn: Board;
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
    piece: [...EmptyBoard] as Board,
    king: [...EmptyBoard] as Board,
    queen: [...EmptyBoard] as Board,
    rook: [...EmptyBoard] as Board,
    bishop: [...EmptyBoard] as Board,
    knight: [...EmptyBoard] as Board,
    pawn: [...EmptyBoard] as Board,
  },
  b: {
    piece: [...EmptyBoard] as Board,
    king: [...EmptyBoard] as Board,
    queen: [...EmptyBoard] as Board,
    rook: [...EmptyBoard] as Board,
    bishop: [...EmptyBoard] as Board,
    knight: [...EmptyBoard] as Board,
    pawn: [...EmptyBoard] as Board,
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
      piece: boardToBitBoard(boards.w.piece),
      king: boardToBitBoard(boards.w.king),
      queen: boardToBitBoard(boards.w.queen),
      rook: boardToBitBoard(boards.w.rook),
      bishop: boardToBitBoard(boards.w.bishop),
      knight: boardToBitBoard(boards.w.knight),
      pawn: boardToBitBoard(boards.w.pawn),
    },
    b: {
      piece: boardToBitBoard(boards.b.piece),
      king: boardToBitBoard(boards.b.king),
      queen: boardToBitBoard(boards.b.queen),
      rook: boardToBitBoard(boards.b.rook),
      bishop: boardToBitBoard(boards.b.bishop),
      knight: boardToBitBoard(boards.b.knight),
      pawn: boardToBitBoard(boards.b.pawn),
    },
  };
};
