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
  DefaultFEN,
  Masks,
  Max64BitInt,
  MoveType,
  Pieces,
  Rank2,
  Rank7,
  Squares,
  SquaresReverse,
} from "../constants";
import { Move, Piece } from "../datatypes/move";
import { prettyPrint } from "../util/prettyPrint";
import { cloneDeep } from "../util/deepCopy";

type State = {
  activeColor: PlayerColor;
  castlingRights: CastlingRights;
  enPassantTarget: EnPassantTarget;
  halfMoveClock: HalfMoveClock;
  fullMoveNumber: FullMoveNumber;
};

export interface Position {
  board: ClassicalBitBoards;
  state: State;
}

export class PositionImpl implements Position {
  board: ClassicalBitBoards;
  state: State;
  history: { board: ClassicalBitBoards; state: State }[];

  constructor(fen?: string) {
    fen = fen || DefaultFEN;
    this.board = boardsToBitBoards(this.fenToBoard(fen));
    this.state = this.fenToState(fen);
    this.history = [];
  }

  private fenToBoard = (fen: string): ClassicalBoards => {
    const piece = fen.split(" ")[0];
    const ranks = piece.split("/");

    let board = generateEmptyBoard();

    ranks.forEach((subFen, index) => {
      const rank = 8 - index;
      let file = 0;

      for (let char of subFen) {
        if (isNaN(parseInt(char))) {
          let position = (8 - rank) * 8 + file;
          const color = char === char.toLowerCase() ? Color.BLACK : Color.WHITE;

          let populatePiece = (color: "b" | "w") => {
            switch (char.toLowerCase()) {
              case "p":
                board[color].pawn[position] = 1;
                break;
              case "r":
                board[color].rook[position] = 1;
                break;
              case "n":
                board[color].knight[position] = 1;
                break;
              case "b":
                board[color].bishop[position] = 1;
                break;
              case "q":
                board[color].queen[position] = 1;
                break;
              case "k":
                board[color].king[position] = 1;
                break;
              default:
                break;
            }
          };

          board[color].piece[position] = 1;
          populatePiece(color);
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

  makeMove(move: Move) {
    // put board in board history (for undo)
    this.history.push(cloneDeep({ board: this.board, state: this.state }));

    // handle quiet move
    move.kind === MoveType.QUIET && this.makeQuietMove(move);

    // handle capture
    move.kind === MoveType.CAPTURE && this.makeCaptureMove(move);

    // handle castle
    // handle en passant
    // handle promotion
    // update board state
    // validate that king isn't in check due to pseudo-legal move generation
  }

  private determinePiece(from: BitBoard): Piece {
    const { w, b } = this.board;

    let piece;

    (w.pawn & from || b.pawn & from) && (piece = Pieces.PAWN);
    (w.rook & from || b.rook & from) && (piece = Pieces.ROOK);
    (w.knight & from || b.knight & from) && (piece = Pieces.KNIGHT);
    (w.bishop & from || b.bishop & from) && (piece = Pieces.BISHOP);
    (w.queen & from || b.queen & from) && (piece = Pieces.QUEEN);
    (w.king & from || b.king & from) && (piece = Pieces.KING);

    if (!piece) {
      throw new Error(`Invalid piece at ${from}`);
    }

    return piece;
  }

  private makeQuietMove(move: Move) {
    const { from, to } = move;

    // check which color is moving
    const color = this.board.w.piece & from ? "w" : "b";

    const fromPiece = this.determinePiece(from);

    // update pieces bitboard
    this.board[color].piece = this.remove(this.board[color].piece, from);
    this.board[color].piece = this.set(this.board[color].piece, to);

    // update piece bitboard
    this.board[color][fromPiece] = this.remove(
      this.board[color][fromPiece],
      from
    );
    this.board[color][fromPiece] = this.set(this.board[color][fromPiece], to);
  }

  private makeCaptureMove(move: Move) {
    const { from, to } = move;

    // check which color is moving
    const color = this.board.w.piece & from ? "w" : "b";
    const oppositeColor = color === "w" ? "b" : "w";

    const fromPiece = this.determinePiece(from);

    // update pieces bitboard
    this.board[color].piece = this.remove(this.board[color].piece, from);
    this.board[color].piece = this.set(this.board[color].piece, to);

    // update piece bitboard
    this.board[color][fromPiece] = this.remove(
      this.board[color][fromPiece],
      from
    );
    this.board[color][fromPiece] = this.set(this.board[color][fromPiece], to);

    // update opponent's piece bitboard
    const toPiece = this.determinePiece(to);

    this.board[oppositeColor].piece = this.remove(
      this.board[oppositeColor].piece,
      to
    );
    this.board[oppositeColor][toPiece] = this.remove(
      this.board[oppositeColor][toPiece],
      to
    );
  }

  undoMove() {
    // retrieve move from board history
    const entry = this.history.pop();

    if (entry) {
      // restore board
      this.board = entry.board;

      // restore state
      this.state = entry.state;
    }
  }

  generateMoves() {
    let moves: Move[] = [];

    const generateMovesForPiece = (
      board: bigint,
      callback: (...args: any[]) => Move[]
    ) => {
      while (board) {
        const ls1b = this.getLS1B(board);
        moves = moves.concat(callback(ls1b));
        board ^= ls1b; // remove ls1b from board
      }
    };

    const partialRight = (fn: Function, ...presetArgs: any[]) =>
      function partiallyApplied(...laterArgs: any[]) {
        return fn(...laterArgs, ...presetArgs);
      };
    // white
    generateMovesForPiece(
      this.board.w.pawn,
      partialRight(this.generatePawnMoves, "w")
    );
    generateMovesForPiece(this.board.w.knight, this.generateKnightMoves);
    generateMovesForPiece(this.board.w.bishop, this.generateBishopMoves);
    generateMovesForPiece(this.board.w.rook, this.generateRookMoves);
    generateMovesForPiece(this.board.w.queen, this.generateQueenMoves);
    generateMovesForPiece(this.board.w.king, this.generateKingMoves);

    // black
    generateMovesForPiece(
      this.board.b.pawn,
      partialRight(this.generatePawnMoves, "b")
    );
    generateMovesForPiece(this.board.b.knight, this.generateKnightMoves);
    generateMovesForPiece(this.board.b.bishop, this.generateBishopMoves);
    generateMovesForPiece(this.board.b.rook, this.generateRookMoves);
    generateMovesForPiece(this.board.b.queen, this.generateQueenMoves);
    generateMovesForPiece(this.board.b.king, this.generateKingMoves);

    return moves;
  }

  perft(depth: number) {
    const moves = this.generateMoves();

    console.log(
      moves
        .map(
          ({ from, to }) =>
            `${this.determinePiece(from)} ${SquaresReverse[from.toString(2)]} ${
              SquaresReverse[to.toString(2)]
            }`
        )
        .join("\n")
    );

    if (depth === 1) {
      return moves.length;
    }

    let nodes = 0;

    for (let move of moves) {
      this.makeMove(move);
      nodes += this.perft(depth - 1);
      this.undoMove();
    }

    return nodes;
  }

  getLS1B(board: bigint) {
    // intersection of binary number and it's twos complement isolates the LS1B
    // https://www.chessprogramming.org/General_Setwise_Operations#TheLeastSignificantOneBitLS1B
    // javascript represents negative numbers as the twos complement
    return board & -board;
  }

  isCollision(to: bigint) {
    return (this.board.w.piece & to) | (this.board.b.piece & to);
  }

  isCapture(from: bigint, to: bigint) {
    if (this.board.w.piece & from) {
      return this.board.b.piece & to && this.isCollision(to);
    }

    if (this.board.b.piece & from) {
      return this.board.w.piece & to && this.isCollision(to);
    }

    return false;
  }

  generatePawnMoves = (from: bigint, color: PlayerColor): Move[] => {
    const moves = [];

    switch (color) {
      case "w":
        // single push
        const singlePushW = from << BigInt(8);

        if (
          singlePushW & Max64BitInt && // 64 bits
          !this.isCollision(singlePushW)
        ) {
          moves.push({
            from,
            to: singlePushW,
            kind: MoveType.QUIET,
          }); // ensure pawn pushes don't go off the board for white
        }

        // double push
        const doublePushW = from << BigInt(16);

        if (
          from & Rank2 && // rank2
          doublePushW & Max64BitInt && // 64 bits
          !this.isCollision(singlePushW) &&
          !this.isCollision(doublePushW)
        ) {
          moves.push({
            from,
            to: doublePushW,
            kind: MoveType.DOUBLE_PAWN_PUSH,
          });
        }
        // promotion
        break;
      case "b":
        // single push
        const singlePushB = from >> BigInt(8);

        if (!this.isCollision(singlePushB)) {
          moves.push({
            from,
            to: singlePushB,
            kind: MoveType.QUIET,
          });
        }

        // double push
        const doublePushB = from >> BigInt(16);

        if (
          from & Rank7 && // rank 7
          !this.isCollision(singlePushB) &&
          !this.isCollision(doublePushB)
        ) {
          moves.push({
            from,
            to: doublePushB,
            kind: MoveType.DOUBLE_PAWN_PUSH,
          });
        }
        // promotion
        break;
      default:
        throw new Error("invalid player color!");
    }

    return moves;
  };

  generatePawnAttacks = (from: bigint, color: PlayerColor): Move[] => {
    const attacks = [];

    switch (color) {
      case "w":
        const rightAttackW = from << BigInt(7);

        if (
          rightAttackW &
            Max64BitInt & // 64 bits
            Masks.NOT_H_FILE && // no wrapping
          this.isCapture(from, rightAttackW)
        )
          attacks.push({
            from,
            to: rightAttackW,
            kind: MoveType.CAPTURE,
          });

        const leftAttackW = from << BigInt(9);

        if (
          leftAttackW & Max64BitInt & Masks.NOT_A_FILE &&
          this.isCapture(from, leftAttackW)
        )
          attacks.push({
            from,
            to: leftAttackW,
            kind: MoveType.CAPTURE,
          });
        break;
      case "b":
        const rightAttackB = from >> BigInt(7);

        if (
          rightAttackB & Masks.NOT_A_FILE &&
          this.isCapture(from, rightAttackB)
        )
          attacks.push({
            from,
            to: rightAttackB,
            kind: MoveType.CAPTURE,
          });

        const leftAttackB = from >> BigInt(9);

        if (
          leftAttackB & Masks.NOT_H_FILE &&
          this.isCapture(from, leftAttackB)
        ) {
          attacks.push({
            from,
            to: leftAttackB,
            kind: MoveType.CAPTURE,
          });
        }
        break;
      default:
        throw new Error("invalid player color!");
    }

    return attacks;
  };

  generateKnightMoves = (from: bigint): Move[] => {
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
      .filter((to) => !this.isCollision(to) || this.isCapture(from, to))
      .map((to) => ({
        from,
        to,
        kind: this.isCapture(from, to) ? MoveType.CAPTURE : MoveType.QUIET,
      }));
  };

  generateBishopMoves = (from: bigint): Move[] => {
    const moves = [];

    // loop through each of the directions and add to the moveset
    let noEaRay = from;

    while (noEaRay) {
      noEaRay <<= BigInt(7);
      noEaRay &= Max64BitInt;
      noEaRay &= Masks.NOT_H_FILE;

      if (noEaRay) {
        const collided = this.isCollision(noEaRay);

        if (collided && !this.isCapture(from, noEaRay)) break; // hit own piece

        moves.push({
          from,
          to: noEaRay,
          kind: collided ? MoveType.CAPTURE : MoveType.QUIET,
        });

        if (collided) break;
      }
    }

    let noWeRay = from;

    while (noWeRay) {
      noWeRay <<= BigInt(9);
      noWeRay &= Max64BitInt;
      noWeRay &= Masks.NOT_A_FILE;

      if (noWeRay) {
        const collided = this.isCollision(noWeRay);

        if (collided && !this.isCapture(from, noWeRay)) break; // hit own piece

        moves.push({
          from,
          to: noWeRay,
          kind: collided ? MoveType.CAPTURE : MoveType.QUIET,
        });

        if (collided) break;
      }
    }

    let soEaRay = from;

    while (soEaRay) {
      soEaRay >>= BigInt(9);
      soEaRay &= Masks.NOT_H_FILE;

      if (soEaRay) {
        const collided = this.isCollision(soEaRay);

        if (collided && !this.isCapture(from, soEaRay)) break; // hit own piece

        moves.push({
          from,
          to: soEaRay,
          kind: collided ? MoveType.CAPTURE : MoveType.QUIET,
        });

        if (collided) break;
      }
    }

    let soWeRay = from;

    while (soWeRay) {
      soWeRay >>= BigInt(7);
      soWeRay &= Masks.NOT_A_FILE;

      if (soWeRay) {
        const collided = this.isCollision(soWeRay);

        if (collided && !this.isCapture(from, soWeRay)) break; // hit own piece

        moves.push({
          from,
          to: soWeRay,
          kind: collided ? MoveType.CAPTURE : MoveType.QUIET,
        });

        if (collided) break;
      }
    }

    return moves;
  };

  generateRookMoves = (from: bigint): Move[] => {
    const moves = [];

    // loop through each of the directions and add to the moveset
    let noRay = from;

    while (noRay) {
      noRay <<= BigInt(8);
      noRay &= Max64BitInt;

      if (noRay) {
        const collided = this.isCollision(noRay);

        if (collided && !this.isCapture(from, noRay)) break; // hit own piece

        moves.push({
          from,
          to: noRay,
          kind: collided ? MoveType.CAPTURE : MoveType.QUIET,
        });

        if (collided) break;
      }
    }

    let eaRay = from;

    while (eaRay) {
      eaRay >>= BigInt(1);
      eaRay &= Masks.NOT_H_FILE;

      if (eaRay) {
        const collided = this.isCollision(eaRay);

        if (collided && !this.isCapture(from, eaRay)) break; // hit own piece

        moves.push({
          from,
          to: eaRay,
          kind: this.isCollision(eaRay) ? MoveType.CAPTURE : MoveType.QUIET,
        });

        if (collided) break;
      }
    }

    let soRay = from;

    while (soRay) {
      soRay >>= BigInt(8);

      if (soRay) {
        const collided = this.isCollision(soRay);

        if (collided && !this.isCapture(from, soRay)) break; // hit own piece

        moves.push({
          from,
          to: soRay,
          kind: collided ? MoveType.CAPTURE : MoveType.QUIET,
        });

        if (collided) break;
      }
    }

    let weRay = from;

    while (weRay) {
      weRay <<= BigInt(1);
      weRay &= Masks.NOT_A_FILE;

      if (weRay) {
        const collided = this.isCollision(weRay);

        if (collided && !this.isCapture(from, weRay)) break; // hit own piece

        moves.push({
          from,
          to: weRay,
          kind: collided ? MoveType.CAPTURE : MoveType.QUIET,
        });

        if (collided) break;
      }
    }

    return moves;
  };

  generateQueenMoves = (from: bigint): Move[] => {
    return this.generateBishopMoves(from)
      .concat(this.generateRookMoves(from))
      .map((move) => ({
        ...move,
      }));
  };

  generateKingMoves = (from: bigint): Move[] => {
    return [
      (from << BigInt(8)) & Max64BitInt, // no
      (from << BigInt(7)) & Masks.NOT_H_FILE, // noEa
      (from >> BigInt(1)) & Masks.NOT_H_FILE, // ea
      (from >> BigInt(9)) & Masks.NOT_H_FILE, // soEa
      from >> BigInt(8), // so
      (from >> BigInt(7)) & Masks.NOT_A_FILE, // soWe
      (from << BigInt(1)) & Masks.NOT_A_FILE, // we
      (from << BigInt(9)) & Masks.NOT_A_FILE, // noWe
    ]
      .filter(Boolean)
      .filter((to) => !this.isCollision(to) || this.isCapture(from, to))
      .map((to) => ({
        from,
        to,
        kind: this.isCapture(from, to) ? MoveType.CAPTURE : MoveType.QUIET,
      }));
  };

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
