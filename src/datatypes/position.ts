import { ClassicalBoard, generateEmptyBoard } from "./bitboard";

type State = {
  // castling rights
  // en passant square
  // halfmove counter
  // side to move
};

export const StartPosition = "startpos";

export interface Position {
  fen: string;
  board: ClassicalBoard;
  state: State;
}

export class PositionImpl implements Position {
  fen: string;
  board: ClassicalBoard;
  state: State;

  constructor(fen?: string) {
    this.fen = fen || StartPosition;
    this.board = fenToBoard(this.fen);
    this.state = fenToState(this.fen);
  }
}

const assignPieceToBoard = (
  board: ClassicalBoard,
  char: string,
  rank: number,
  file: number
) => {
  let position = (8 - rank) * 8 + file;

  if (char === char.toLowerCase()) {
    board.black[position] = 1;
  } else {
    board.white[position] = 1;
  }

  switch (char.toLowerCase()) {
    case "p":
      board.pawns[position] = 1;
      break;
    case "r":
      board.rooks[position] = 1;
      break;
    case "n":
      board.knights[position] = 1;
      break;
    case "b":
      board.bishops[position] = 1;
      break;
    case "q":
      board.queens[position] = 1;
      break;
    case "k":
      board.kings[position] = 1;
      break;
    default:
      break;
  }
};

export const fenToBoard = (fen: string): ClassicalBoard => {
  const pieces = fen.split(" ")[0];
  const ranks = pieces.split("/");

  let board = generateEmptyBoard();

  if (fen === "startpos") {
    fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";
  }

  ranks.forEach((subFen, index) => {
    const rank = 8 - index;
    let file = 0;

    for (let char of subFen) {
      if (isNaN(parseInt(char))) {
        assignPieceToBoard(board, char, rank, file);
        file++;
      } else {
        // skip empty spaces
        for (let reps = 0; reps < parseInt(char); reps++) {
          file++;
        }
      }
    }
  });

  return board;
};

export const fenToState = (fen: string): State => {
  if (fen === "startpos") {
    return {};
  }

  const [
    activeColor,
    castlingRights,
    enPassantTargets,
    halfmoveClock,
    fullMoveNumber,
  ] = fen.split(" ").slice(1);

  return {};
};