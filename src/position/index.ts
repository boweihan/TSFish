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
  generateEmptyBoard,
  boardsToBitBoards,
  ClassicalBitBoards,
  BitBoard,
} from "../datatypes/bitboard";
import {
  Color,
  Masks,
  Max64BitInt,
  MoveType,
  Rank2,
  Rank7,
} from "../constants";
import { Move, MoveKind } from "../datatypes/move";

type State = {
  activeColor: PlayerColor;
  castlingRights: CastlingRights;
  enPassantTarget: EnPassantTarget;
  halfMoveClock: HalfMoveClock;
  fullMoveNumber: FullMoveNumber;
};

export const StartPosition = "startpos";

export interface Position {
  board: ClassicalBitBoards;
  state: State;
}

export class PositionImpl implements Position {
  board: ClassicalBitBoards;
  state: State;

  constructor(fen?: string) {
    fen = fen || StartPosition;
    this.board = boardsToBitBoards(this.fenToBoard(fen));
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

  makeMove() {
    // TODO: implement
  }

  undoMove() {
    // TODO: implement
  }

  generateMoves() {
    let moves: Move[] = [];

    const generateMovesForPiece = (
      board: bigint,
      callback: (...args: any[]) => Move[]
    ) => {
      while (board) {
        const ls1b = this.getLS1B(board);
        moves.concat(callback(ls1b));
        board ^= ls1b; // remove ls1b from board
      }
    };

    const partialRight = (fn: Function, ...presetArgs: any[]) => {
      return function partiallyApplied(...laterArgs: any[]) {
        return fn(...laterArgs, ...presetArgs);
      };
    };

    // white
    generateMovesForPiece(
      this.board.w.pawns,
      partialRight(this.generatePawnMoves, "w")
    );
    generateMovesForPiece(this.board.w.knights, this.generateKnightMoves);
    generateMovesForPiece(this.board.w.bishops, this.generateBishopMoves);
    generateMovesForPiece(this.board.w.rooks, this.generateRookMoves);
    generateMovesForPiece(this.board.w.queens, this.generateQueenMoves);
    generateMovesForPiece(this.board.w.kings, this.generateKingMoves);

    // black
    generateMovesForPiece(
      this.board.b.pawns,
      partialRight(this.generatePawnMoves, "b")
    );
    generateMovesForPiece(this.board.b.knights, this.generateKnightMoves);
    generateMovesForPiece(this.board.b.bishops, this.generateBishopMoves);
    generateMovesForPiece(this.board.b.rooks, this.generateRookMoves);
    generateMovesForPiece(this.board.b.queens, this.generateQueenMoves);
    generateMovesForPiece(this.board.b.kings, this.generateKingMoves);

    return moves;
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

  generatePawnMoves(from: bigint, color: PlayerColor): Move[] {
    const moves = [];

    switch (color) {
      case "w":
        // single push
        if ((from << BigInt(8)) & Max64BitInt)
          moves.push({ from, to: from << BigInt(8), kind: MoveType.Quiet }); // ensure pawn pushes don't go off the board for white
        // double push
        if (from & Rank2 & Max64BitInt) {
          moves.push({
            from,
            to: from << BigInt(16),
            kind: MoveType.DoublePawnPush,
          });
        }
        // promotion
        break;
      case "b":
        // single push
        moves.push({ from, to: from >> BigInt(8), kind: MoveType.Quiet });
        // double push
        if (from & Rank7) {
          moves.push({
            from,
            to: from >> BigInt(16),
            kind: MoveType.DoublePawnPush,
          });
        }
        // promotion
        break;
      default:
        throw new Error("invalid player color!");
    }

    return moves;
  }

  generatePawnAttacks(from: bigint, color: PlayerColor): Move[] {
    const attacks = [];

    switch (color) {
      case "w":
        if ((from << BigInt(7)) & Max64BitInt & Masks.NOT_H_FILE)
          attacks.push({ from, to: from << BigInt(7), kind: MoveType.Capture });
        if ((from << BigInt(9)) & Max64BitInt & Masks.NOT_A_FILE)
          attacks.push({ from, to: from << BigInt(9), kind: MoveType.Capture });
        break;
      case "b":
        if ((from >> BigInt(7)) & Masks.NOT_A_FILE)
          attacks.push({ from, to: from >> BigInt(7), kind: MoveType.Capture });
        if ((from >> BigInt(9)) & Masks.NOT_H_FILE) {
          attacks.push({ from, to: from >> BigInt(9), kind: MoveType.Capture });
        }
        break;
      default:
        throw new Error("invalid player color!");
    }

    return attacks;
  }

  generateKnightMoves(from: bigint): Move[] {
    return [
      (from << BigInt(17)) & Masks.NOT_A_FILE, // noNoEa
      (from << BigInt(10)) & Masks.NOT_AB_FILE, // noEaEa
      (from >> BigInt(6)) & Masks.NOT_AB_FILE, // soEaEa
      (from >> BigInt(15)) & Masks.NOT_A_FILE, // soSoEa
      (from << BigInt(15)) & Masks.NOT_H_FILE, // noNoWe
      (from << BigInt(6)) & Masks.NOT_GH_FILE, // noWeWe
      (from >> BigInt(10)) & Masks.NOT_GH_FILE, // soWeWe
      (from >> BigInt(17)) & Masks.NOT_H_FILE, // soSoWe
    ]
      .filter(Boolean)
      .map((to) => ({ from, to, kind: MoveType.Quiet })); // TODO: add captures
  }

  generateBishopMoves(from: bigint): Move[] {
    const moves = [];

    // loop through each of the directions and add to the moveset
    let noEaRay = from;

    while (noEaRay) {
      noEaRay <<= BigInt(7);
      noEaRay &= Max64BitInt;
      noEaRay &= Masks.NOT_H_FILE;

      if (noEaRay) {
        moves.push({ from, to: noEaRay, kind: MoveType.Quiet });
      }
    }

    let noWeRay = from;

    while (noWeRay) {
      noWeRay <<= BigInt(9);
      noWeRay &= Max64BitInt;
      noWeRay &= Masks.NOT_A_FILE;

      if (noWeRay) {
        moves.push({ from, to: noWeRay, kind: MoveType.Quiet });
      }
    }

    let soEaRay = from;

    while (soEaRay) {
      soEaRay >>= BigInt(9);
      soEaRay &= Masks.NOT_H_FILE;

      if (soEaRay) {
        moves.push({ from, to: soEaRay, kind: MoveType.Quiet });
      }
    }

    let soWeRay = from;

    while (soWeRay) {
      soWeRay >>= BigInt(7);
      soWeRay &= Masks.NOT_A_FILE;

      if (soWeRay) {
        moves.push({ from, to: soWeRay, kind: MoveType.Quiet });
      }
    }

    return moves;
  }

  generateRookMoves(from: bigint): Move[] {
    const moves = [];

    // loop through each of the directions and add to the moveset
    let noRay = from;

    while (noRay) {
      noRay <<= BigInt(8);
      noRay &= Max64BitInt;

      if (noRay) {
        moves.push({ from, to: noRay, kind: MoveType.Quiet });
      }
    }

    let eaRay = from;

    while (eaRay) {
      eaRay >>= BigInt(1);
      eaRay &= Masks.NOT_H_FILE;

      if (eaRay) {
        moves.push({ from, to: eaRay, kind: MoveType.Quiet });
      }
    }

    let soRay = from;

    while (soRay) {
      soRay >>= BigInt(8);

      if (soRay) {
        moves.push({ from, to: soRay, kind: MoveType.Quiet });
      }
    }

    let weRay = from;

    while (weRay) {
      weRay <<= BigInt(1);
      weRay &= Masks.NOT_A_FILE;

      if (weRay) {
        moves.push({ from, to: weRay, kind: MoveType.Quiet });
      }
    }

    return moves;
  }

  generateQueenMoves(from: bigint): Move[] {
    return this.generateBishopMoves(from).concat(this.generateRookMoves(from));
  }

  generateKingMoves(from: bigint): Move[] {
    return [
      from << BigInt(8), // no
      (from << BigInt(7)) & Masks.NOT_H_FILE, // noEa
      (from >> BigInt(1)) & Masks.NOT_H_FILE, // ea
      (from >> BigInt(9)) & Masks.NOT_H_FILE, // soEa
      from >> BigInt(8), // so
      (from >> BigInt(7)) & Masks.NOT_A_FILE, // soWe
      (from << BigInt(1)) & Masks.NOT_A_FILE, // we
      (from << BigInt(9)) & Masks.NOT_A_FILE, // noWe
    ]
      .filter(Boolean)
      .map((to) => ({ from, to, kind: MoveType.Quiet })); // TODO: add captures
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
