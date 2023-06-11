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
  MoveType,
  Pieces,
  SquaresReverse,
} from "../constants";
import { Move, Piece } from "../datatypes/move";
import { cloneDeep } from "../util/deepCopy";
import { prettyPrint } from "../util/prettyPrint";
import {
  generateBishopMoves,
  generateKingMoves,
  generateKnightMoves,
  generateMoves,
  generatePawnAttacks,
  generateQueenMoves,
  generateRookMoves,
} from "../util/moves";

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

  perft: (depth: number) => number;
  isCollision: (bitboard: BitBoard) => bigint;
  isCapture: (from: BitBoard, to: BitBoard) => bigint;
  isCheck: (color: PlayerColor) => boolean;
  isAttacked: (square: BitBoard, color: PlayerColor) => boolean;
  makeMove: (move: Move) => void;
  undoMove: () => void;
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

    // handle promotions
    (move.kind === MoveType.KNIGHT_PROMOTION ||
      move.kind === MoveType.BISHOP_PROMOTION ||
      move.kind === MoveType.ROOK_PROMOTION ||
      move.kind === MoveType.QUEEN_PROMOTION) &&
      this.makePromotionMove(move);

    // handle promotion captures
    (move.kind === MoveType.KNIGHT_PROMO_CAPTURE ||
      move.kind === MoveType.BISHOP_PROMO_CAPTURE ||
      move.kind === MoveType.ROOK_PROMO_CAPTURE ||
      move.kind === MoveType.QUEEN_PROMO_CAPTURE) &&
      this.makePromotionCapture(move);

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

  private determinePromotionPiece(move: Move): Piece {
    const { kind } = move;

    switch (kind) {
      case MoveType.KNIGHT_PROMOTION:
      case MoveType.KNIGHT_PROMO_CAPTURE:
        return Pieces.KNIGHT;
      case MoveType.BISHOP_PROMOTION:
      case MoveType.BISHOP_PROMO_CAPTURE:
        return Pieces.BISHOP;
      case MoveType.ROOK_PROMOTION:
      case MoveType.ROOK_PROMO_CAPTURE:
        return Pieces.ROOK;
      case MoveType.QUEEN_PROMOTION:
      case MoveType.QUEEN_PROMO_CAPTURE:
        return Pieces.QUEEN;
      default:
        throw new Error(`Invalid promotion move type: ${kind}`);
    }
  }

  private updateBitboards(
    color: PlayerColor,
    piece: Piece,
    from: BitBoard,
    to?: BitBoard,
    promotion?: Piece
  ) {
    // update piece bitboard
    this.board[color][piece] = this.remove(this.board[color][piece], from);

    if (to) {
      if (promotion) {
        this.board[color][promotion] = this.set(
          this.board[color][promotion],
          to
        );
      } else {
        this.board[color][piece] = this.set(this.board[color][piece], to);
      }
    }

    // update pieces bitboard
    this.board[color].piece = this.remove(this.board[color].piece, from);

    if (to) {
      this.board[color].piece = this.set(this.board[color].piece, to);
    }
  }

  private makeQuietMove(move: Move) {
    const { from, to } = move;

    const color = this.board.w.piece & from ? "w" : "b";

    const piece = this.determinePiece(from);

    // update half move clock
    if (piece !== Pieces.PAWN) {
      this.updateHalfMoveClock();
    } else {
      this.resetHalfMoveClock();
    }

    this.updateBitboards(color, piece, from, to);
  }

  private makeCaptureMove(move: Move) {
    const { from, to } = move;

    const piece = this.determinePiece(from);
    const capturedPiece = this.determinePiece(to);

    // check which color is moving
    const color = this.board.w.piece & from ? "w" : "b";
    const oppositeColor = color === "w" ? "b" : "w";

    // update half move clock
    this.resetHalfMoveClock();

    // update moving piece bitboard
    this.updateBitboards(color, piece, from, to);

    // update opponent's piece bitboard
    this.updateBitboards(oppositeColor, capturedPiece, to);
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
    this.updateBitboards(color, Pieces.PAWN, from, to);

    // update opponent's piece bitboard
    this.updateBitboards(
      oppositeColor,
      Pieces.PAWN,
      oppositeColor === "w" ? to << BigInt(8) : to >> BigInt(8)
    );

    // update half move clock
    this.resetHalfMoveClock();
  }

  private makePromotionMove(move: Move) {
    const { from, to } = move;

    const color = this.board.w.piece & from ? "w" : "b";

    const promoPiece = this.determinePromotionPiece(move);

    // update half move clock
    this.resetHalfMoveClock();

    this.updateBitboards(color, Pieces.PAWN, from, to, promoPiece);
  }

  private makePromotionCapture(move: Move) {
    const { from, to } = move;

    const color = this.board.w.piece & from ? "w" : "b";
    const oppositeColor = color === "w" ? "b" : "w";

    const promoPiece = this.determinePromotionPiece(move);
    const capturedPiece = this.determinePiece(to);

    // update half move clock
    this.resetHalfMoveClock();

    // update moving piece bitboard
    this.updateBitboards(color, Pieces.PAWN, from, to, promoPiece);

    // update opponent's piece bitboard
    this.updateBitboards(oppositeColor, capturedPiece, to);
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

  perft(depth: number, move?: string, startingDepth: number = depth) {
    if (depth === 0) {
      return 1;
    }

    const moves = generateMoves(this);

    // console.log(
    //   moves.map(
    //     (move) =>
    //       `${SquaresReverse[move.from.toString(2)]} -> ${
    //         SquaresReverse[move.to.toString(2)]
    //       } : ${move.kind}`
    //   )
    // );

    if (depth === 1) {
      const nodes = moves.length;

      // console.log(`${move}: ${nodes}, kind: ${moves[0].kind}`);

      return nodes;
    }

    let nodes = 0;

    for (let move of moves) {
      this.makeMove(move);
      nodes += this.perft(
        depth - 1,
        `${SquaresReverse[move.from.toString(2)]}${
          SquaresReverse[move.to.toString(2)]
        }`,
        startingDepth
      );
      this.undoMove();
    }

    // if (depth === startingDepth - 1) console.log(`${move}: ${nodes}`);

    return nodes;
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

    return BigInt(0);
  }

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

  private resetHalfMoveClock() {
    this.state.halfMoveClock = 0;
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

  isAttacked(square: bigint, color: PlayerColor) {
    const opponentColor = color === Color.WHITE ? Color.BLACK : Color.WHITE;
    const opponentBoard = this.board[opponentColor];

    // generating attacks for pieces can effectively create masks for each piece type

    // check if opponent's pawns are attacking
    const pawnAttacks = generatePawnAttacks(square, color, this).reduce(
      (a, b) => a | b.to,
      BigInt(0)
    );

    if (pawnAttacks & opponentBoard.pawn) return true;

    // check if opponent's knights are attacking
    const knightAttacks = generateKnightMoves(square, this).reduce(
      (a, b) => a | b.to,
      BigInt(0)
    );

    if (knightAttacks & opponentBoard.knight) return true;

    // check if opponent's bishops are attacking
    const bishopAttacks = generateBishopMoves(square, this).reduce(
      (a, b) => a | b.to,
      BigInt(0)
    );

    if (bishopAttacks & opponentBoard.bishop) return true;

    // check if opponent's rooks are attacking
    const rookAttacks = generateRookMoves(square, this).reduce(
      (a, b) => a | b.to,
      BigInt(0)
    );

    if (rookAttacks & opponentBoard.rook) return true;

    // check if opponent's queens are attacking
    const queenAttacks = generateQueenMoves(square, this).reduce(
      (a, b) => a | b.to,
      BigInt(0)
    );

    if (queenAttacks & opponentBoard.queen) return true;

    // check if opponent's king is attacking
    const kingAttacks = generateKingMoves(square, this).reduce(
      (a, b) => a | b.to,
      BigInt(0)
    );

    if (kingAttacks & opponentBoard.king) return true;

    return false;
  }

  isCheck(color: PlayerColor) {
    const kingSquare = this.board[color].king;
    return this.isAttacked(kingSquare, color);
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
