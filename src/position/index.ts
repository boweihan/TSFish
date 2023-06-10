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
import { cloneDeep } from "../util/deepCopy";
import { prettyPrint } from "../util/prettyPrint";

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

    // clear enpassant target
    this.updateEnPassantSquare("-");

    // handle quiet move
    move.kind === MoveType.QUIET && this.makeQuietMove(move);

    // handle enpassant capture
    move.kind === MoveType.EN_PASSANT && this.makeEnPassantCapture(move);

    // handle double pawn push and update enpassant square
    move.kind === MoveType.DOUBLE_PAWN_PUSH && this.makeDoublePawnPush(move);

    // handle capture
    move.kind === MoveType.CAPTURE && this.makeCaptureMove(move);

    // update board state
    this.updateActiveColor();

    this.updateFullMoveNumber();
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
      throw new Error(`Invalid piece at ${SquaresReverse[from.toString(2)]}`);
    }

    return piece;
  }

  private updateBitboards(color: PlayerColor, from: BitBoard, to?: BitBoard) {
    const piece = this.determinePiece(from);

    // update piece bitboard
    this.board[color][piece] = this.remove(this.board[color][piece], from);

    if (to) {
      // if to is null, it's a capture
      this.board[color][piece] = this.set(this.board[color][piece], to);
    }

    // update pieces bitboard
    this.board[color].piece = this.remove(this.board[color].piece, from);

    if (to) {
      // if to is null, it's a capture
      this.board[color].piece = this.set(this.board[color].piece, to);
    }
  }

  private makeQuietMove(move: Move) {
    const { from, to } = move;

    const color = this.board.w.piece & from ? "w" : "b";

    // update half move clock
    if (this.determinePiece(from) !== Pieces.PAWN) {
      this.state.halfMoveClock++;
    } else {
      this.state.halfMoveClock = 0;
    }

    this.updateBitboards(color, from, to);
  }

  private makeCaptureMove(move: Move) {
    const { from, to } = move;

    // check which color is moving
    const color = this.board.w.piece & from ? "w" : "b";
    const oppositeColor = color === "w" ? "b" : "w";

    // update half move clock
    this.state.halfMoveClock = 0;

    // update moving piece bitboard
    this.updateBitboards(color, from, to);

    // update opponent's piece bitboard
    this.updateBitboards(oppositeColor, to);
  }

  private makeDoublePawnPush(move: Move) {
    const { from } = move;

    const color = this.board.w.piece & from ? "w" : "b";
    const square = color === "w" ? from << BigInt(8) : from >> BigInt(8);

    this.updateEnPassantSquare(SquaresReverse[square.toString(2)]);

    this.makeQuietMove(move);
  }

  private makeEnPassantCapture(move: Move) {
    const { from, to } = move;

    const color = this.board.w.piece & from ? "w" : "b";
    const oppositeColor = color === "w" ? "b" : "w";

    // update moving piece bitboard
    this.updateBitboards(color, from, to);

    // update opponent's piece bitboard
    this.updateBitboards(
      oppositeColor,
      oppositeColor === "w" ? to << BigInt(8) : to >> BigInt(8)
    );

    // update half move clock
    this.state.halfMoveClock = 0;
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

    const color = this.state.activeColor;

    generateMovesForPiece(
      this.board[color].pawn,
      partialRight(this.generatePawnMoves, color)
    );
    generateMovesForPiece(
      this.board[color].pawn,
      partialRight(this.generatePawnAttacks, color)
    );
    generateMovesForPiece(this.board[color].knight, this.generateKnightMoves);
    generateMovesForPiece(this.board[color].bishop, this.generateBishopMoves);
    generateMovesForPiece(this.board[color].rook, this.generateRookMoves);
    generateMovesForPiece(this.board[color].queen, this.generateQueenMoves);
    generateMovesForPiece(this.board[color].king, this.generateKingMoves);

    return moves;
  }

  perft(depth: number) {
    if (!depth) return 1;

    const moves = this.generateMoves();

    // console.log(
    //   moves.map(
    //     (move) =>
    //       `${SquaresReverse[move.from.toString(2)]} -> ${
    //         SquaresReverse[move.to.toString(2)]
    //       }`
    //   )
    // );

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

  private isCollision(to: bigint) {
    return (this.board.w.piece & to) | (this.board.b.piece & to);
  }

  private isCapture(from: bigint, to: bigint) {
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

  private generatePawnAttack = (from: bigint, to: bigint, mask: bigint) => {
    const attacks = [];

    const enPassantTarget = Squares[this.state.enPassantTarget];

    if (to & Max64BitInt & mask && this.isCapture(from, to)) {
      attacks.push({
        from,
        to,
        kind: MoveType.CAPTURE,
      });
    }

    if (enPassantTarget && to & enPassantTarget & mask) {
      attacks.push({
        from,
        to,
        kind: MoveType.EN_PASSANT,
      });
    }

    return attacks;
  };

  generatePawnAttacks = (from: bigint, color: PlayerColor): Move[] => {
    let attacks: Move[] = [];

    switch (color) {
      case "w":
        attacks = attacks.concat(
          this.generatePawnAttack(from, from << BigInt(7), Masks.NOT_H_FILE)
        );
        attacks = attacks.concat(
          this.generatePawnAttack(from, from << BigInt(9), Masks.NOT_A_FILE)
        );
        break;
      case "b":
        attacks = attacks.concat(
          this.generatePawnAttack(from, from >> BigInt(7), Masks.NOT_A_FILE)
        );
        attacks = attacks.concat(
          this.generatePawnAttack(from, from >> BigInt(9), Masks.NOT_H_FILE)
        );
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

  private generateRayMoves = (
    from: bigint,
    direction: (from: bigint) => bigint
  ): Move[] => {
    const moves = [];

    let ray = from;

    while (ray) {
      ray = direction(ray);

      if (ray) {
        const collided = this.isCollision(ray);

        if (collided && !this.isCapture(from, ray)) break; // hit own piece

        moves.push({
          from,
          to: ray,
          kind: collided ? MoveType.CAPTURE : MoveType.QUIET,
        });

        if (collided) break;
      }
    }

    return moves;
  };

  generateBishopMoves = (from: bigint): Move[] => {
    return this.generateRayMoves(from, (ray) => {
      ray <<= BigInt(7);
      ray &= Max64BitInt;
      ray &= Masks.NOT_H_FILE;

      return ray;
    })
      .concat(
        this.generateRayMoves(from, (ray) => {
          ray <<= BigInt(9);
          ray &= Max64BitInt;
          ray &= Masks.NOT_A_FILE;

          return ray;
        })
      )
      .concat(
        this.generateRayMoves(from, (ray) => {
          ray >>= BigInt(7);
          ray &= Masks.NOT_A_FILE;

          return ray;
        })
      )
      .concat(
        this.generateRayMoves(from, (ray) => {
          ray >>= BigInt(9);
          ray &= Masks.NOT_H_FILE;

          return ray;
        })
      );
  };

  generateRookMoves = (from: bigint): Move[] => {
    return this.generateRayMoves(from, (ray) => {
      ray <<= BigInt(8);
      ray &= Max64BitInt;

      return ray;
    })
      .concat(
        this.generateRayMoves(from, (ray) => {
          ray >>= BigInt(8);

          return ray;
        })
      )
      .concat(
        this.generateRayMoves(from, (ray) => {
          ray <<= BigInt(1);
          ray &= Masks.NOT_A_FILE;

          return ray;
        })
      )
      .concat(
        this.generateRayMoves(from, (ray) => {
          ray >>= BigInt(1);
          ray &= Masks.NOT_H_FILE;

          return ray;
        })
      );
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

  private updateEnPassantSquare(target: string) {
    this.state.enPassantTarget = target;
  }

  private updateCastlingRights() {
    // TODO: implement
  }

  private updateActiveColor() {
    this.state.activeColor =
      this.state.activeColor === Color.WHITE ? Color.BLACK : Color.WHITE;
  }

  private updateHalfMoveClock() {
    this.state.halfMoveClock++;
  }

  private updateFullMoveNumber() {
    if (this.state.activeColor === Color.WHITE) {
      this.state.fullMoveNumber++;
    }
  }

  incrementClock() {
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
    return false;
  }

  isInsufficientMaterial() {
    // TODO: implement
    return false;
  }

  isThreefoldRepetition() {
    // TODO: implement
    return false;
  }

  isFiftyMoveRule() {
    // https://www.chessprogramming.org/Halfmove_Clock
    return this.state.halfMoveClock >= 100;
  }

  isDraw() {
    return (
      this.isStalemate() ||
      this.isInsufficientMaterial() ||
      this.isThreefoldRepetition()
    );
  }
}
