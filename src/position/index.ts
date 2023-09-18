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
  Castling,
  Color,
  DefaultFEN,
  MoveType,
  Pieces,
  Squares,
} from "../constants";
import { Move, Piece } from "../datatypes/move";
import { cloneDeep } from "../util/deepCopy";
import timer from "../util/timer";
import { PrecomputedMasks, generateMasks } from "../util/masks";
import {
  determinePiece,
  determinePromotionPiece,
  isCapture,
  stringify,
} from "../util/board";
import {
  serializeCastlingRights,
  stringifyCastlingRights,
} from "../util/castling";
import { MiniMax, SearchStrategy } from "../search";
import { MoveGenerator, PseudoLegalGenerator } from "../generator";

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
  masks: PrecomputedMasks;

  perft: ({ depth }: { depth: number }) => number;
  makeMove: (move: Move) => void;
  undoMove: () => void;
  generateMoves: () => Move[];
  parseUCIMove: (move: string) => Move;
  positionToFen: () => string;
  isCheck: (color: PlayerColor) => BitBoard;
  isOwnCollision: (to: BitBoard, color: PlayerColor) => BitBoard;
  search: () => string;
}

export class PositionImpl implements Position {
  board: ClassicalBitBoards;
  state: State;
  history: { board: ClassicalBitBoards; state: State }[];
  masks: PrecomputedMasks;
  searchStrategy: SearchStrategy;
  moveGenerator: MoveGenerator;

  constructor(fen?: string) {
    fen = fen || DefaultFEN;
    this.board = boardsToBitBoards(this.fenToBoard(fen));
    this.state = this.fenToState(fen);
    this.history = [];
    this.masks = generateMasks();
    this.searchStrategy = new MiniMax(this);
    this.moveGenerator = new PseudoLegalGenerator(this);
  }

  parseUCIMove = (move: string): Move => {
    const from = Squares[move.slice(0, 2)];
    const to = Squares[move.slice(2, 4)];

    const color = from & this.board.w.piece ? Color.WHITE : Color.BLACK;
    const capture = isCapture(this.board, to, color);

    let moveType = capture ? MoveType.CAPTURE : MoveType.QUIET;

    // handle promotion
    if (move.length === 5) {
      const promotion = move[4];

      if (promotion === "n") {
        moveType = capture
          ? MoveType.KNIGHT_PROMO_CAPTURE
          : MoveType.KNIGHT_PROMOTION;
      } else if (promotion === "b") {
        moveType = capture
          ? MoveType.BISHOP_PROMO_CAPTURE
          : MoveType.BISHOP_PROMOTION;
      } else if (promotion === "r") {
        moveType = capture
          ? MoveType.ROOK_PROMO_CAPTURE
          : MoveType.ROOK_PROMOTION;
      } else if (promotion === "q") {
        moveType = capture
          ? MoveType.QUEEN_PROMO_CAPTURE
          : MoveType.QUEEN_PROMOTION;
      }
    }

    // handle castle
    if (move === "e1g1" || move === "e8g8") {
      moveType = MoveType.KING_CASTLE;
    } else if (move === "e1c1" || move === "e8c8") {
      moveType = MoveType.QUEEN_CASTLE;
    }

    // handle enpassant capture
    if (
      moveType === MoveType.CAPTURE &&
      determinePiece(this.board, from) === Pieces.PAWN &&
      Squares[this.state.enPassantTarget] === to
    ) {
      moveType = MoveType.EN_PASSANT;
    }

    return { from, to, kind: moveType };
  };

  fenToBoard = (fen: string): ClassicalBoards => {
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

  fenToState(fen: string): State {
    if (fen === "startpos") {
      return {
        activeColor: "w",
        castlingRights: serializeCastlingRights("KQkq"),
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
      castlingRights: serializeCastlingRights(castlingRights),
      enPassantTarget,
      halfMoveClock: parseInt(halfMoveClock),
      fullMoveNumber: parseInt(fullMoveNumber),
    };
  }

  positionToFen() {
    // generate fen based on board
    let fen = "";

    // generate piece placement
    const whitePieces = this.board.w.piece.toString(2).padStart(64, "0");
    const blackPieces = this.board.b.piece.toString(2).padStart(64, "0");

    let rankFens = [];

    for (let rank = 0; rank < 8; rank++) {
      let rankFen = "";
      let pad = 0;

      for (let file = 0; file < 8; file++) {
        const position = rank * 8 + file;
        const whitePiece = whitePieces[position];
        const blackPiece = blackPieces[position];

        if (whitePiece === "1") {
          const piece = determinePiece(
            this.board,
            BigInt(1) << BigInt(63 - position)
          );

          if (pad > 0) {
            rankFen += pad.toString();
            pad = 0;
          }

          if (piece === Pieces.PAWN) {
            rankFen += "P";
          } else if (piece === Pieces.ROOK) {
            rankFen += "R";
          } else if (piece === Pieces.KNIGHT) {
            rankFen += "N";
          } else if (piece === Pieces.BISHOP) {
            rankFen += "B";
          } else if (piece === Pieces.QUEEN) {
            rankFen += "Q";
          } else if (piece === Pieces.KING) {
            rankFen += "K";
          }
        } else if (blackPiece === "1") {
          const piece = determinePiece(
            this.board,
            BigInt(1) << BigInt(63 - position)
          );

          if (pad > 0) {
            rankFen += pad.toString();
            pad = 0;
          }

          if (piece === Pieces.PAWN) {
            rankFen += "p";
          } else if (piece === Pieces.ROOK) {
            rankFen += "r";
          } else if (piece === Pieces.KNIGHT) {
            rankFen += "n";
          } else if (piece === Pieces.BISHOP) {
            rankFen += "b";
          } else if (piece === Pieces.QUEEN) {
            rankFen += "q";
          } else if (piece === Pieces.KING) {
            rankFen += "k";
          }
        } else {
          pad++;
        }

        if (file === 7) {
          if (pad > 0) {
            rankFen += pad.toString();
            pad = 0;
          }
        }
      }

      rankFens.push(rankFen);
    }

    fen += rankFens.join("/");

    // generate active color
    fen += ` ${this.state.activeColor}`;

    // generate castling rights
    fen += ` ${stringifyCastlingRights(this.state.castlingRights)}`;

    // generate enpassant target
    fen += ` ${this.state.enPassantTarget}`;

    // generate half move clock
    fen += ` ${this.state.halfMoveClock}`;

    // generate full move number
    fen += ` ${this.state.fullMoveNumber}`;

    return fen;
  }

  updateBitboards(
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

  makeMove = (move: Move) =>
    timer.time("makeMove", () => {
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

      // handle castling moves
      (move.kind === MoveType.KING_CASTLE ||
        move.kind === MoveType.QUEEN_CASTLE) &&
        this.makeCastlingMove(move);

      // update board state
      this.updateActiveColor();

      this.updateFullMoveNumber();
    });

  makeQuietMove(move: Move) {
    const { from, to } = move;

    const color = this.board.w.piece & from ? "w" : "b";

    const piece = determinePiece(this.board, from);

    // check if castling rights should be updated
    if (piece === Pieces.KING || piece === Pieces.ROOK) {
      this.updateCastlingRights(color, from, piece);
    }

    // update half move clock
    if (piece !== Pieces.PAWN) {
      this.updateHalfMoveClock();
    } else {
      this.resetHalfMoveClock();
    }

    this.updateBitboards(color, piece, from, to);
  }

  makeCaptureMove(move: Move) {
    const { from, to } = move;

    const piece = determinePiece(this.board, from);
    const capturedPiece = determinePiece(this.board, to);

    // check which color is moving
    const color = this.board.w.piece & from ? "w" : "b";
    const oppositeColor = color === "w" ? "b" : "w";

    // check if castling rights should be updated
    if (piece === Pieces.KING || piece === Pieces.ROOK) {
      this.updateCastlingRights(color, from, piece);
    }

    // update half move clock
    this.resetHalfMoveClock();

    // update moving piece bitboard
    this.updateBitboards(color, piece, from, to);

    // update opponent's piece bitboard
    this.updateBitboards(oppositeColor, capturedPiece, to);
  }

  makeDoublePawnPush(move: Move) {
    const { from } = move;

    const color = this.board.w.piece & from ? "w" : "b";
    const square = color === "w" ? from << BigInt(8) : from >> BigInt(8);

    this.updateEnPassantSquare(stringify(square));

    this.makeQuietMove(move);
  }

  makeEnPassantCapture(move: Move) {
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

  makePromotionMove(move: Move) {
    const { from, to } = move;

    const color = this.board.w.piece & from ? "w" : "b";

    const promoPiece = determinePromotionPiece(move);

    // update half move clock
    this.resetHalfMoveClock();

    this.updateBitboards(color, Pieces.PAWN, from, to, promoPiece);
  }

  makePromotionCapture(move: Move) {
    const { from, to } = move;

    const color = this.board.w.piece & from ? "w" : "b";
    const oppositeColor = color === "w" ? "b" : "w";

    const promoPiece = determinePromotionPiece(move);
    const capturedPiece = determinePiece(this.board, to);

    // update half move clock
    this.resetHalfMoveClock();

    // update moving piece bitboard
    this.updateBitboards(color, Pieces.PAWN, from, to, promoPiece);

    // update opponent's piece bitboard
    this.updateBitboards(oppositeColor, capturedPiece, to);
  }

  makeCastlingMove(move: Move) {
    const { from, to } = move;

    const color = this.board.w.king & from ? "w" : "b";

    // update half move clock
    this.updateHalfMoveClock();

    // update king bitboard
    this.updateBitboards(color, Pieces.KING, from, to);

    // update rook bitboard
    if (to === Squares.g1) {
      this.updateBitboards(color, Pieces.ROOK, Squares.h1, Squares.f1);
    } else if (to === Squares.c1) {
      this.updateBitboards(color, Pieces.ROOK, Squares.a1, Squares.d1);
    } else if (to === Squares.g8) {
      this.updateBitboards(color, Pieces.ROOK, Squares.h8, Squares.f8);
    } else if (to === Squares.c8) {
      this.updateBitboards(color, Pieces.ROOK, Squares.a8, Squares.d8);
    }

    // update castling rights
    this.updateCastlingRights(color, from, Pieces.KING);
  }

  undoMove = () =>
    timer.time("undoMove", () => {
      // retrieve move from board history
      const entry = this.history.pop();

      if (entry) {
        // restore board
        this.board = entry.board;

        // restore state
        this.state = entry.state;
      }
    });

  perft({
    depth,
    move,
    startingDepth = depth,
  }: {
    depth: number;
    move?: string;
    startingDepth?: number;
  }) {
    if (depth === 0) {
      return 1;
    }

    const moves = this.generateMoves();

    // add to move generation time

    // console.log(
    //   moves.map(
    //     (move) =>
    //       `${stringify(move.from)} -> ${
    //         stringify(move.to)
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

      nodes += this.perft({
        depth: depth - 1,
        move: `${stringify(move.from)}${stringify(move.to)}`,
        startingDepth,
      });

      this.undoMove();
    }

    // if (depth === startingDepth - 1) console.log(`${move}: ${nodes}`);

    return nodes;
  }

  isOwnCollision(to: BitBoard, color: PlayerColor) {
    return this.board[color].piece & to;
  }

  set(board: BitBoard, square: BitBoard): BitBoard {
    return (board |= square);
  }

  remove(board: BitBoard, square: BitBoard): BitBoard {
    return (board &= ~square);
  }

  updateEnPassantSquare(target: string) {
    this.state.enPassantTarget = target;
  }

  updateCastlingRights(color: PlayerColor, from: BitBoard, piece: Piece) {
    if (piece === Pieces.KING) {
      if (color === Color.WHITE) {
        this.state.castlingRights[Castling.WHITE_KING_SIDE] = false;
        this.state.castlingRights[Castling.WHITE_QUEEN_SIDE] = false;
      } else {
        this.state.castlingRights[Castling.BLACK_KING_SIDE] = false;
        this.state.castlingRights[Castling.BLACK_QUEEN_SIDE] = false;
      }
    } else if (piece === Pieces.ROOK) {
      if (color === Color.WHITE) {
        if (from === Squares.a1) {
          this.state.castlingRights[Castling.WHITE_QUEEN_SIDE] = false;
        } else if (from === Squares.h1) {
          this.state.castlingRights[Castling.WHITE_KING_SIDE] = false;
        }
      } else {
        if (from === Squares.a8) {
          this.state.castlingRights[Castling.BLACK_QUEEN_SIDE] = false;
        } else if (from === Squares.h8) {
          this.state.castlingRights[Castling.BLACK_KING_SIDE] = false;
        }
      }
    }
  }

  updateActiveColor() {
    this.state.activeColor =
      this.state.activeColor === Color.WHITE ? Color.BLACK : Color.WHITE;
  }

  resetHalfMoveClock() {
    this.state.halfMoveClock = 0;
  }

  updateHalfMoveClock() {
    this.state.halfMoveClock++;
  }

  updateFullMoveNumber() {
    if (this.state.activeColor === Color.WHITE) {
      this.state.fullMoveNumber++;
    }
  }

  isCheck(color: PlayerColor) {
    return this.moveGenerator.generateAttacksOnSquare(
      this.board[color].king,
      color
    );
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

  generateMoves() {
    return this.moveGenerator.generate();
  }

  search() {
    return this.searchStrategy.search();
  }
}
