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
  Masks,
  Max64BitInt,
  MoveType,
  Pieces,
  Rank1,
  Rank2,
  Rank7,
  Rank8,
  Squares,
  SquaresReverse,
} from "../constants";
import { Move, Piece } from "../datatypes/move";
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

  perft: (depth: number) => number;
  makeMove: (move: Move) => void;
  undoMove: () => void;
  parseUCIMove: (move: string) => Move;
  positionToFen: () => string;
  search: () => string;
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

  search = (): string => {
    const bestMove = this.alphaBetaRootNode(3);

    if (!bestMove) {
      throw new Error("No move found");
    }

    const move = `${SquaresReverse[bestMove.from.toString(2)]}${
      SquaresReverse[bestMove.to.toString(2)]
    }`;

    if (
      bestMove.kind === MoveType.QUEEN_PROMOTION ||
      bestMove.kind === MoveType.QUEEN_PROMO_CAPTURE
    ) {
      return `${move}q`;
    } else if (
      bestMove.kind === MoveType.ROOK_PROMOTION ||
      bestMove.kind === MoveType.ROOK_PROMO_CAPTURE
    ) {
      return `${move}r`;
    } else if (
      bestMove.kind === MoveType.BISHOP_PROMOTION ||
      bestMove.kind === MoveType.BISHOP_PROMO_CAPTURE
    ) {
      return `${move}b`;
    } else if (
      bestMove.kind === MoveType.KNIGHT_PROMOTION ||
      bestMove.kind === MoveType.KNIGHT_PROMO_CAPTURE
    ) {
      return `${move}n`;
    }

    return move;
  };

  alphaBetaRootNode = (depth: number): Move | undefined => {
    let bestScore = -Infinity;
    let bestMove: Move | undefined = undefined;

    for (const move of this.generateMoves()) {
      this.makeMove(move);
      const value = -this.alphaBeta(-Infinity, Infinity, depth - 1);
      this.undoMove();
      if (value >= bestScore) {
        bestScore = value;
        bestMove = move;
      }
    }

    return bestMove;
  };

  alphaBeta = (alpha: number, beta: number, depthleft: number): number => {
    if (depthleft === 0) return this.evaluate();

    for (const move of this.generateMoves()) {
      this.makeMove(move);
      const score = -this.alphaBeta(-beta, -alpha, depthleft - 1);
      this.undoMove();
      if (score >= beta) return beta;
      if (score > alpha) alpha = score;
    }

    return alpha;
  };

  evaluate = (): number => {
    let score = 0;

    const whitePieces = this.board.w.piece;
    const blackPieces = this.board.b.piece;

    // material
    score += this.countBits(whitePieces & this.board.w.pawn) * 100;
    score += this.countBits(whitePieces & this.board.w.knight) * 320;
    score += this.countBits(whitePieces & this.board.w.bishop) * 330;
    score += this.countBits(whitePieces & this.board.w.rook) * 500;
    score += this.countBits(whitePieces & this.board.w.queen) * 900;
    score += this.countBits(whitePieces & this.board.w.king) * 20000;

    score -= this.countBits(blackPieces & this.board.b.pawn) * 100;
    score -= this.countBits(blackPieces & this.board.b.knight) * 320;
    score -= this.countBits(blackPieces & this.board.b.bishop) * 330;
    score -= this.countBits(blackPieces & this.board.b.rook) * 500;
    score -= this.countBits(blackPieces & this.board.b.queen) * 900;
    score -= this.countBits(blackPieces & this.board.b.king) * 20000;

    // mobility
    score += this.generateMoves().length * 10;

    return score;
  };

  countBits = (board: BitBoard) => {
    let count = 0;

    while (board) {
      count++;
      const ls1b = this.getLS1B(board);
      board ^= ls1b;
    }

    return count;
  };

  parseUCIMove = (move: string): Move => {
    const from = Squares[move.slice(0, 2)];
    const to = Squares[move.slice(2, 4)];

    const color = from & this.board.w.piece ? Color.WHITE : Color.BLACK;
    const capture = this.isCapture(to, color);

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
      this.determinePiece(from) === Pieces.PAWN &&
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
        castlingRights: this.serializeCastlingRights("KQkq"),
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
      castlingRights: this.serializeCastlingRights(castlingRights),
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
          const piece = this.determinePiece(BigInt(1) << BigInt(63 - position));

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
          const piece = this.determinePiece(BigInt(1) << BigInt(63 - position));

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
    fen += ` ${this.stringifyCastlingRights(this.state.castlingRights)}`;

    // generate enpassant target
    fen += ` ${this.state.enPassantTarget}`;

    // generate half move clock
    fen += ` ${this.state.halfMoveClock}`;

    // generate full move number
    fen += ` ${this.state.fullMoveNumber}`;

    return fen;
  }

  stringifyCastlingRights = (castling: CastlingRights): string => {
    let serialized = "";

    if (castling.K) {
      serialized += Castling.WHITE_KING_SIDE;
    }

    if (castling.Q) {
      serialized += Castling.WHITE_QUEEN_SIDE;
    }

    if (castling.k) {
      serialized += Castling.BLACK_KING_SIDE;
    }

    if (castling.q) {
      serialized += Castling.BLACK_QUEEN_SIDE;
    }

    if (!serialized.length) {
      serialized = "-";
    }

    return serialized;
  };

  serializeCastlingRights = (castling: string) => {
    const serialized: CastlingRights = {
      K: false,
      Q: false,
      k: false,
      q: false,
    };

    if (castling.includes(Castling.WHITE_KING_SIDE)) {
      serialized.K = true;
    }

    if (castling.includes(Castling.WHITE_QUEEN_SIDE)) {
      serialized.Q = true;
    }

    if (castling.includes(Castling.BLACK_KING_SIDE)) {
      serialized.k = true;
    }

    if (castling.includes(Castling.BLACK_QUEEN_SIDE)) {
      serialized.q = true;
    }

    return serialized;
  };

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

    // handle castling moves
    (move.kind === MoveType.KING_CASTLE ||
      move.kind === MoveType.QUEEN_CASTLE) &&
      this.makeCastlingMove(move);

    // update board state
    this.updateActiveColor();

    this.updateFullMoveNumber();
  }

  determinePiece(from: BitBoard): Piece {
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

  determinePromotionPiece(move: Move): Piece {
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

  makeQuietMove(move: Move) {
    const { from, to } = move;

    const color = this.board.w.piece & from ? "w" : "b";

    const piece = this.determinePiece(from);

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

    const piece = this.determinePiece(from);
    const capturedPiece = this.determinePiece(to);

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

    this.updateEnPassantSquare(SquaresReverse[square.toString(2)]);

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

    const promoPiece = this.determinePromotionPiece(move);

    // update half move clock
    this.resetHalfMoveClock();

    this.updateBitboards(color, Pieces.PAWN, from, to, promoPiece);
  }

  makePromotionCapture(move: Move) {
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

    const moves = this.generateMoves();

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

  isCollision(to: BitBoard) {
    return (this.board.w.piece & to) | (this.board.b.piece & to);
  }

  isCapture(to: BitBoard, color: PlayerColor) {
    if (color === Color.WHITE) {
      return this.board.b.piece & to;
    }

    if (color === Color.BLACK) {
      return this.board.w.piece & to;
    }

    return BigInt(0);
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

  isAttacked(
    square: BitBoard,
    color: PlayerColor,
    isCastling: boolean = false
  ) {
    const opponentColor = color === Color.WHITE ? Color.BLACK : Color.WHITE;
    const opponentBoard = this.board[opponentColor];

    // generating attacks for pieces can effectively create masks for each piece type

    // check if opponent's pawns are attacking
    const pawnAttacks = this.generatePawnAttacks(square, color).reduce(
      (a, b) => a | b.to,
      BigInt(0)
    );

    if (pawnAttacks & opponentBoard.pawn) return true;

    // check if opponent's knights are attacking
    const knightAttacks = this.generateKnightMoves(square, color).reduce(
      (a, b) => a | b.to,
      BigInt(0)
    );

    if (knightAttacks & opponentBoard.knight) return true;

    // check if opponent's bishops are attacking
    const bishopAttacks = this.generateBishopMoves(square, color).reduce(
      (a, b) => a | b.to,
      BigInt(0)
    );

    if (bishopAttacks & opponentBoard.bishop) return true;

    // check if opponent's rooks are attacking
    const rookAttacks = this.generateRookMoves(square, color).reduce(
      (a, b) => a | b.to,
      BigInt(0)
    );

    if (rookAttacks & opponentBoard.rook) return true;

    // check if opponent's queens are attacking
    const queenAttacks = this.generateQueenMoves(square, color).reduce(
      (a, b) => a | b.to,
      BigInt(0)
    );

    if (queenAttacks & opponentBoard.queen) return true;

    // check if opponent's king is attacking
    const kingAttacks = this.generateKingMoves(
      square,
      color,
      isCastling
    ).reduce((a, b) => a | b.to, BigInt(0));

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

  generateMoves = () => {
    let moves: Move[] = [];

    const generateMovesForPiece = (
      board: BitBoard,
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
    generateMovesForPiece(
      this.board[color].knight,
      partialRight(this.generateKnightMoves, color)
    );
    generateMovesForPiece(
      this.board[color].bishop,
      partialRight(this.generateBishopMoves, color)
    );
    generateMovesForPiece(
      this.board[color].rook,
      partialRight(this.generateRookMoves, color)
    );
    generateMovesForPiece(
      this.board[color].queen,
      partialRight(this.generateQueenMoves, color)
    );
    generateMovesForPiece(
      this.board[color].king,
      partialRight(this.generateKingMoves, color)
    );

    //  strip illegal moves (not performant)
    moves = moves.filter((move) => {
      this.makeMove(move);
      const isLegal = !this.isCheck(color);
      this.undoMove();
      return isLegal;
    });

    if (moves.length === 0) {
      // checkmate
    }

    return moves;
  };

  getLS1B = (board: BitBoard) => {
    // intersection of binary number and it's twos complement isolates the LS1B
    // https://www.chessprogramming.org/General_Setwise_Operations#TheLeastSignificantOneBitLS1B
    // javascript represents negative numbers as the twos complement
    return board & -board;
  };

  generatePawnMoves = (from: BitBoard, color: PlayerColor): Move[] => {
    const moves = [];

    switch (color) {
      case "w":
        // single push
        const singlePushW = from << BigInt(8);

        if (
          singlePushW & Max64BitInt && // 64 bits
          !this.isCollision(singlePushW)
        ) {
          const promotions = this.generatePromotions(from, singlePushW, color);
          if (promotions.length > 0) {
            moves.push(...promotions);
          } else {
            moves.push({
              from,
              to: singlePushW,
              kind: MoveType.QUIET,
            }); // ensure pawn pushes don't go off the board for white
          }
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
          const promotions = this.generatePromotions(from, singlePushB, color);

          if (promotions.length > 0) {
            moves.push(...promotions);
          } else {
            moves.push({
              from,
              to: singlePushB,
              kind: MoveType.QUIET,
            }); // ensure pawn pushes don't go off the board for white
          }
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

  generatePromotions = (from: BitBoard, to: BitBoard, color: PlayerColor) => {
    const promotions = [];

    if ((color === "w" && to & Rank8) || (color === "b" && to & Rank1)) {
      // black or white promotion
      promotions.push({
        from,
        to,
        kind: MoveType.KNIGHT_PROMOTION,
      });
      promotions.push({
        from,
        to,
        kind: MoveType.BISHOP_PROMOTION,
      });
      promotions.push({
        from,
        to,
        kind: MoveType.ROOK_PROMOTION,
      });
      promotions.push({
        from,
        to,
        kind: MoveType.QUEEN_PROMOTION,
      });
    }

    return promotions;
  };

  generateCapturePromotions = (
    from: BitBoard,
    to: BitBoard,
    color: PlayerColor
  ) => {
    const promotions = [];

    if ((color === "w" && to & Rank8) || (color === "b" && to & Rank1)) {
      // black or white promotion
      promotions.push({
        from,
        to,
        kind: MoveType.KNIGHT_PROMO_CAPTURE,
      });
      promotions.push({
        from,
        to,
        kind: MoveType.BISHOP_PROMO_CAPTURE,
      });
      promotions.push({
        from,
        to,
        kind: MoveType.ROOK_PROMO_CAPTURE,
      });
      promotions.push({
        from,
        to,
        kind: MoveType.QUEEN_PROMO_CAPTURE,
      });
    }

    return promotions;
  };

  generatePawnAttack = (
    from: BitBoard,
    to: BitBoard,
    mask: BitBoard,
    color: PlayerColor
  ) => {
    const attacks = [];

    const enPassantTarget = Squares[this.state.enPassantTarget];

    if (to & Max64BitInt & mask && this.isCapture(to, color)) {
      const promotions = this.generateCapturePromotions(from, to, color);

      if (promotions.length > 0) {
        attacks.push(...promotions);
      } else {
        attacks.push({
          from,
          to,
          kind: MoveType.CAPTURE,
        });
      }
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

  generatePawnAttacks = (from: BitBoard, color: PlayerColor): Move[] => {
    let attacks: Move[] = [];

    switch (color) {
      case "w":
        attacks = attacks.concat(
          this.generatePawnAttack(
            from,
            from << BigInt(7),
            Masks.NOT_H_FILE,
            color
          )
        );
        attacks = attacks.concat(
          this.generatePawnAttack(
            from,
            from << BigInt(9),
            Masks.NOT_A_FILE,
            color
          )
        );
        break;
      case "b":
        attacks = attacks.concat(
          this.generatePawnAttack(
            from,
            from >> BigInt(7),
            Masks.NOT_A_FILE,
            color
          )
        );
        attacks = attacks.concat(
          this.generatePawnAttack(
            from,
            from >> BigInt(9),
            Masks.NOT_H_FILE,
            color
          )
        );
        break;
      default:
        throw new Error("invalid player color!");
    }

    return attacks;
  };

  generateKnightMoves = (from: BitBoard, color: PlayerColor): Move[] => {
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
      .filter((to) => !this.isCollision(to) || this.isCapture(to, color))
      .map((to) => ({
        from,
        to,
        kind: this.isCapture(to, color) ? MoveType.CAPTURE : MoveType.QUIET,
      }));
  };

  generateRayMoves = (
    from: BitBoard,
    direction: (from: BitBoard) => BitBoard,
    color: PlayerColor
  ): Move[] => {
    const moves = [];

    let ray = from;

    while (ray) {
      ray = direction(ray);

      if (ray) {
        const collided = this.isCollision(ray);

        if (collided && !this.isCapture(ray, color)) break; // hit own piece

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

  generateBishopMoves = (from: BitBoard, color: PlayerColor): Move[] => {
    return this.generateRayMoves(
      from,
      (ray) => {
        ray <<= BigInt(7);
        ray &= Max64BitInt;
        ray &= Masks.NOT_H_FILE;

        return ray;
      },
      color
    )
      .concat(
        this.generateRayMoves(
          from,
          (ray) => {
            ray <<= BigInt(9);
            ray &= Max64BitInt;
            ray &= Masks.NOT_A_FILE;

            return ray;
          },
          color
        )
      )
      .concat(
        this.generateRayMoves(
          from,
          (ray) => {
            ray >>= BigInt(7);
            ray &= Masks.NOT_A_FILE;

            return ray;
          },
          color
        )
      )
      .concat(
        this.generateRayMoves(
          from,
          (ray) => {
            ray >>= BigInt(9);
            ray &= Masks.NOT_H_FILE;

            return ray;
          },
          color
        )
      );
  };

  generateRookMoves = (from: BitBoard, color: PlayerColor): Move[] => {
    return this.generateRayMoves(
      from,
      (ray) => {
        ray <<= BigInt(8);
        ray &= Max64BitInt;

        return ray;
      },
      color
    )
      .concat(
        this.generateRayMoves(
          from,
          (ray) => {
            ray >>= BigInt(8);

            return ray;
          },
          color
        )
      )
      .concat(
        this.generateRayMoves(
          from,
          (ray) => {
            ray <<= BigInt(1);
            ray &= Masks.NOT_A_FILE;

            return ray;
          },
          color
        )
      )
      .concat(
        this.generateRayMoves(
          from,
          (ray) => {
            ray >>= BigInt(1);
            ray &= Masks.NOT_H_FILE;

            return ray;
          },
          color
        )
      );
  };

  generateQueenMoves = (from: BitBoard, color: PlayerColor): Move[] => {
    return this.generateBishopMoves(from, color)
      .concat(this.generateRookMoves(from, color))
      .map((move) => ({
        ...move,
      }));
  };

  generateCastlingMoves = (color: PlayerColor): Move[] => {
    const castlingMoves: Move[] = [];

    const generateKingCastle = (from: BitBoard, color: PlayerColor) => {
      if (
        !this.isCollision(from >> BigInt(1)) &&
        !this.isCollision(from >> BigInt(2)) &&
        !this.isAttacked(from, color, true) &&
        !this.isAttacked(from >> BigInt(1), color, true) &&
        !this.isAttacked(from >> BigInt(2), color, true)
      ) {
        return {
          from,
          to: from >> BigInt(2),
          kind: MoveType.KING_CASTLE,
        };
      }
    };

    const generateQueenCastle = (from: BitBoard, color: PlayerColor) => {
      if (
        !this.isCollision(from << BigInt(1)) &&
        !this.isCollision(from << BigInt(2)) &&
        !this.isCollision(from << BigInt(3)) &&
        !this.isAttacked(from, color, true) &&
        !this.isAttacked(from << BigInt(1), color, true) &&
        !this.isAttacked(from << BigInt(2), color, true)
      ) {
        return {
          from,
          to: from << BigInt(2),
          kind: MoveType.QUEEN_CASTLE,
        };
      }
    };

    if (color === "w") {
      if (this.state.castlingRights[Castling.WHITE_KING_SIDE]) {
        const kingCastle = generateKingCastle(this.board.w.king, color);
        if (kingCastle) castlingMoves.push(kingCastle);
      }
      if (this.state.castlingRights[Castling.WHITE_QUEEN_SIDE]) {
        const queenCastle = generateQueenCastle(this.board.w.king, color);
        if (queenCastle) castlingMoves.push(queenCastle);
      }
    } else if (color === "b") {
      if (this.state.castlingRights[Castling.BLACK_KING_SIDE]) {
        const kingCastle = generateKingCastle(this.board.b.king, color);
        if (kingCastle) castlingMoves.push(kingCastle);
      }
      if (this.state.castlingRights[Castling.BLACK_QUEEN_SIDE]) {
        const queenCastle = generateQueenCastle(this.board.b.king, color);
        if (queenCastle) castlingMoves.push(queenCastle);
      }
    }

    return castlingMoves;
  };

  generateKingMoves = (
    from: BitBoard,
    color: PlayerColor,
    isCastling: boolean = false
  ): Move[] => {
    const moves = [
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
      .filter((to) => !this.isCollision(to) || this.isCapture(to, color))
      .map((to) => ({
        from,
        to,
        kind: this.isCapture(to, color) ? MoveType.CAPTURE : MoveType.QUIET,
      }));

    return moves.concat(isCastling ? [] : this.generateCastlingMoves(color));
  };
}
