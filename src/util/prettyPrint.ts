import { ClassicalBitBoards } from "../datatypes";

export const prettify = (board: bigint) => {
  const ranks = 8;
  const binaryStr = board.toString(2).padStart(64, "0");

  let result = "";

  for (let rank = 0; rank < ranks; rank++) {
    result +=
      binaryStr
        .slice(rank * 8, rank * 8 + 8)
        .split("")
        .join(" ") + "\n";
  }

  return result;
};

export const prettyPrint = (board: bigint) => {
  console.log(prettify(board));
};

export const prettyPrintBoard = (board: ClassicalBitBoards) => {
  console.log({
    w: {
      piece: prettify(board.w.piece),
      pawn: prettify(board.w.pawn),
      knight: prettify(board.w.knight),
      bishop: prettify(board.w.bishop),
      rook: prettify(board.w.rook),
      queen: prettify(board.w.queen),
      king: prettify(board.w.king),
    },
    b: {
      piece: prettify(board.b.piece),
      pawn: prettify(board.b.pawn),
      knight: prettify(board.b.knight),
      bishop: prettify(board.b.bishop),
      rook: prettify(board.b.rook),
      queen: prettify(board.b.queen),
      king: prettify(board.b.king),
    },
  });
};
