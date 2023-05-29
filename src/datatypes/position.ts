import {
  CastlingRights,
  EnPassantTarget,
  FullMoveNumber,
  HalfMoveClock,
  PlayerColor,
  isValidCastlingRights,
  isValidPlayerColor,
} from "../types";
import { ClassicalBoards, generateEmptyBoard } from "./bitboard";
import { Color, Masks } from "../constants";

type State = {
  activeColor: PlayerColor;
  castlingRights: CastlingRights;
  enPassantTarget: EnPassantTarget;
  halfMoveClock: HalfMoveClock;
  fullMoveNumber: FullMoveNumber;
};

export const StartPosition = "startpos";

export interface Position {
  board: ClassicalBoards;
  state: State;
}

export class PositionImpl implements Position {
  board: ClassicalBoards;
  state: State;

  constructor(fen?: string) {
    fen = fen || StartPosition;
    this.board = this.fenToBoard(fen);
    this.state = this.fenToState(fen);
  }

  private fenToBoard = (fen: string): ClassicalBoards => {
    const pieces = fen.split(" ")[0];
    const ranks = pieces.split("/");

    let board = generateEmptyBoard();

    ranks.forEach((subFen, index) => {
      const rank = 8 - index;
      let file = 0;

      for (let char of subFen) {
        if (isNaN(parseInt(char))) {
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

  private fenToState(fen: string): State {
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
  }

  toFen() {
    // TODO: implement
  }

  generateMoves() {
    // for all pieces
    // generate move targets
    // for all capture targets generate captures (move or capture list)
    // for all empty square targets generate quiet moves (move list)
  }

  generateKnightMoves(square: bigint) {
    let attacks = BigInt(0);
    let bitboard = this.set(BigInt(0), square);

    const moves = [
      (bitboard << BigInt(17)) & Masks.NOT_A_FILE, // noNoEa
      (bitboard << BigInt(10)) & Masks.NOT_AB_FILE, // noEaEa
      (bitboard >> BigInt(6)) & Masks.NOT_AB_FILE, // soEaEa
      (bitboard >> BigInt(15)) & Masks.NOT_A_FILE, // soSoEa
      (bitboard << BigInt(15)) & Masks.NOT_H_FILE, // noNoWe
      (bitboard << BigInt(6)) & Masks.NOT_GH_FILE, // noWeWe
      (bitboard >> BigInt(10)) & Masks.NOT_GH_FILE, // soWeWe
      (bitboard >> BigInt(17)) & Masks.NOT_H_FILE, // soSoWe
    ];

    moves.forEach((move) => {
      if (move != BigInt(0)) {
        attacks |= move;
      }
    });

    // TODO: clamp at 64 bits?
    return attacks;
  }

  move() {
    // TODO: implement
  }

  undoMove() {
    // TODO: implement
  }

  get() {
    // TODO: implement
  }

  set(board: bigint, square: bigint): bigint {
    return (board |= BigInt(1) << square);
  }

  updateCastlingRights() {
    // TODO: implement
  }

  updateActiveColor() {
    // TODO: implement
  }

  updateEnPassantSquare() {
    // TODO: implement
  }

  updateSideToMove() {
    // TODO: implement
  }

  incrementClock() {
    // TODO: implement
  }

  isAttacked() {
    // TODO: implement
  }

  isCheck() {
    // TODO: implement
  }

  isCheckmate() {
    // TODO: implement
  }

  isStalemate() {
    // TODO: implement
  }

  isInsufficientMaterial() {
    // TODO: implement
  }

  isThreefoldRepetition() {
    // TODO: implement
  }

  isDraw() {
    // TODO: implement
  }
}
