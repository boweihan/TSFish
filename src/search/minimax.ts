import { SearchStrategy } from ".";
import { MoveType } from "../constants";
import { Move } from "../datatypes/move";
import { Position } from "../position";
import { countBits, stringify } from "../util/board";

export default class MiniMax implements SearchStrategy {
  position: Position;

  constructor(position: Position) {
    this.position = position;
  }

  search = (): string => {
    const bestMove = this.alphaBetaRootNode(3);

    if (!bestMove) {
      throw new Error("No move found");
    }

    const move = `${stringify(bestMove.from)}${stringify(bestMove.to)}`;

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

    for (const move of this.position.generateMoves()) {
      this.position.makeMove(move);
      const value = -this.alphaBeta(-Infinity, Infinity, depth - 1);
      this.position.undoMove();
      if (value >= bestScore) {
        bestScore = value;
        bestMove = move;
      }
    }

    return bestMove;
  };

  alphaBeta = (alpha: number, beta: number, depthleft: number): number => {
    if (depthleft === 0) return this.evaluate();

    for (const move of this.position.generateMoves()) {
      this.position.makeMove(move);
      const score = -this.alphaBeta(-beta, -alpha, depthleft - 1);
      this.position.undoMove();
      if (score >= beta) return beta;
      if (score > alpha) alpha = score;
    }

    return alpha;
  };

  evaluate = (): number => {
    let score = 0;

    const board = this.position.board;

    const whitePieces = board.w.piece;
    const blackPieces = board.b.piece;

    // material
    score += countBits(whitePieces & board.w.pawn) * 100;
    score += countBits(whitePieces & board.w.knight) * 320;
    score += countBits(whitePieces & board.w.bishop) * 330;
    score += countBits(whitePieces & board.w.rook) * 500;
    score += countBits(whitePieces & board.w.queen) * 900;
    score += countBits(whitePieces & board.w.king) * 20000;

    score -= countBits(blackPieces & board.b.pawn) * 100;
    score -= countBits(blackPieces & board.b.knight) * 320;
    score -= countBits(blackPieces & board.b.bishop) * 330;
    score -= countBits(blackPieces & board.b.rook) * 500;
    score -= countBits(blackPieces & board.b.queen) * 900;
    score -= countBits(blackPieces & board.b.king) * 20000;

    // mobility
    score += this.position.generateMoves().length * 10;

    return score;
  };
}
