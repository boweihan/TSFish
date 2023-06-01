import {
  CastlingRights,
  EnPassantTarget,
  FullMoveNumber,
  HalfMoveClock,
  PlayerColor,
  isValidCastlingRights,
  isValidPlayerColor,
} from "../types";
import { ClassicalBoards, generateEmptyBoard } from "../datatypes/bitboard";
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

  encodeMoves() {
    // TODO: implement
  }

  getLS1B(board: bigint) {
    // intersection of binary number and it's twos complement isolates the LS1B
    // https://www.chessprogramming.org/General_Setwise_Operations#TheLeastSignificantOneBitLS1B
    // javascript represents negative numbers as the twos complement
    return board & -board;
  }

  generatePawnMoves(square: bigint) {
    // TODO: implement
  }

  generateKnightMoves(square: bigint) {
    let startpos = this.set(BigInt(0), square);

    return [
      (startpos << BigInt(17)) & Masks.NOT_A_FILE, // noNoEa
      (startpos << BigInt(10)) & Masks.NOT_AB_FILE, // noEaEa
      (startpos >> BigInt(6)) & Masks.NOT_AB_FILE, // soEaEa
      (startpos >> BigInt(15)) & Masks.NOT_A_FILE, // soSoEa
      (startpos << BigInt(15)) & Masks.NOT_H_FILE, // noNoWe
      (startpos << BigInt(6)) & Masks.NOT_GH_FILE, // noWeWe
      (startpos >> BigInt(10)) & Masks.NOT_GH_FILE, // soWeWe
      (startpos >> BigInt(17)) & Masks.NOT_H_FILE, // soSoWe
    ].filter(Boolean);
  }

  generateBishopMoves(square: bigint) {
    // TODO: implement
  }

  generateRookMoves(square: bigint) {
    // TODO: implement
  }

  generateQueenMoves(square: bigint) {
    // TODO: implement
  }

  generateKingMoves(square: bigint) {
    let startpos = this.set(BigInt(0), square);

    return [
      startpos << BigInt(8), // no
      (startpos << BigInt(7)) & Masks.NOT_H_FILE, // noEa
      (startpos >> BigInt(1)) & Masks.NOT_H_FILE, // ea
      (startpos >> BigInt(9)) & Masks.NOT_H_FILE, // soEa
      startpos >> BigInt(8), // so
      (startpos >> BigInt(7)) & Masks.NOT_A_FILE, // soWe
      (startpos << BigInt(1)) & Masks.NOT_A_FILE, // we
      (startpos << BigInt(9)) & Masks.NOT_A_FILE, // noWe
    ].filter(Boolean);
  }

  move() {
    // TODO: implement
  }

  undoMove() {
    // TODO: implement
  }

  set(board: bigint, square: bigint): bigint {
    return (board |= square);
  }

  remove(board: bigint, square: bigint): bigint {
    return (board &= ~square);
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
