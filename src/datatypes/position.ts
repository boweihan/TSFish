import {
  CastlingRights,
  EnPassantTarget,
  FullMoveNumber,
  HalfMoveClock,
  PlayerColor,
  isValidCastlingRights,
  isValidPlayerColor,
} from "../types";
import {
  ClassicalBoards,
  ClassicalBitBoards,
  generateEmptyBoard,
  boardsToBitBoards,
} from "./bitboard";
import { Color } from "../constants";

type State = {
  activeColor: PlayerColor;
  castlingRights: CastlingRights;
  enPassantTarget: EnPassantTarget;
  halfMoveClock: HalfMoveClock;
  fullMoveNumber: FullMoveNumber;
};

export const StartPosition = "startpos";

export interface Position {
  fen: string;
  board: ClassicalBitBoards;
  state: State;
}

export class PositionImpl implements Position {
  fen: string;
  board: ClassicalBitBoards;
  state: State;

  constructor(fen?: string) {
    this.fen = fen || StartPosition;
    this.board = boardsToBitBoards(fenToBoard(this.fen));
    this.state = fenToState(this.fen);
  }
}

const assignPieceToBoard = (
  board: ClassicalBoards,
  char: string,
  rank: number,
  file: number
) => {
  let position = (8 - rank) * 8 + file;
  const color = char === char.toLowerCase() ? Color.BLACK : Color.WHITE;

  let populatePieces = (color: "b" | "w") => {
    switch (char.toLowerCase()) {
      case "p":
        board[color].pawns[position] = 1;
        break;
      case "r":
        board[color].rooks[position] = 1;
        break;
      case "n":
        board[color].knights[position] = 1;
        break;
      case "b":
        board[color].bishops[position] = 1;
        break;
      case "q":
        board[color].queens[position] = 1;
        break;
      case "k":
        board[color].kings[position] = 1;
        break;
      default:
        break;
    }
  };

  board[color].pieces[position] = 1;
  populatePieces(color);
};

export const fenToBoard = (fen: string): ClassicalBoards => {
  const pieces = fen.split(" ")[0];
  const ranks = pieces.split("/");

  let board = generateEmptyBoard();

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
    return {
      activeColor: "w",
      castlingRights: "KQkq",
      enPassantTarget: "-",
      halfMoveClock: 0,
      fullMoveNumber: 1,
    };
  }

  const [
    activeColor,
    castlingRights,
    enPassantTarget,
    halfMoveClock,
    fullMoveNumber,
  ] = fen.split(" ").slice(1);

  if (
    !isValidPlayerColor(activeColor) ||
    !isValidCastlingRights(castlingRights)
  ) {
    throw new Error(`Invalid FEN: ${fen}`);
  }

  return {
    activeColor,
    castlingRights,
    enPassantTarget,
    halfMoveClock: parseInt(halfMoveClock),
    fullMoveNumber: parseInt(fullMoveNumber),
  };
};
