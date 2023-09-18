import { MoveGenerator } from ".";
import {
  Castling,
  Masks,
  Max64BitInt,
  MoveType,
  Pieces,
  Rank1,
  Rank2,
  Rank7,
  Rank8,
  Squares,
} from "../constants";
import { BitBoard } from "../datatypes";
import { Move } from "../datatypes/move";
import { Position } from "../position";
import { PlayerColor } from "../types";
import {
  calculatePinnedPieces,
  determinePiece,
  fanOut,
  isCapture,
  isCollision,
  shiftDown,
  shiftLeft,
  shiftNE,
  shiftNW,
  shiftRight,
  shiftSE,
  shiftSW,
  shiftUp,
  stringify,
} from "../util/board";
import { prettyPrint } from "../util/prettyPrint";
import timer from "../util/timer";

export default class PseudoLegalGenerator implements MoveGenerator {
  position: Position;

  constructor(position: Position) {
    this.position = position;
  }

  generate = () =>
    timer.time("generateMove", () => {
      const color = this.position.state.activeColor;

      let moves: Move[] = Object.values(Pieces)
        .map((piece) => ({
          piece,
          pieceBitBoards: fanOut(this.position.board[color][piece]),
        }))
        .map(({ piece, pieceBitBoards }) =>
          pieceBitBoards
            .map((pieceBitBoard) => {
              switch (piece) {
                case Pieces.PAWN:
                  return this.generatePawnMoves(pieceBitBoard, color).concat(
                    this.generatePawnAttacks(pieceBitBoard, color)
                  );
                case Pieces.KNIGHT:
                  return this.generateKnightMoves(pieceBitBoard, color);
                case Pieces.BISHOP:
                  return this.generateBishopMoves(pieceBitBoard, color);
                case Pieces.ROOK:
                  return this.generateRookMoves(pieceBitBoard, color);
                case Pieces.QUEEN:
                  return this.generateQueenMoves(pieceBitBoard, color);
                case Pieces.KING:
                  return this.generateKingMoves(pieceBitBoard, color);
                default:
                  throw new Error(`Invalid piece: ${piece}`);
              }
            })
            .flat()
        )
        .flat();

      const pins = calculatePinnedPieces(this.position.board, color);

      const isInCheck = this.generateAttacksOnSquare(
        this.position.board[color].king,
        color
      );

      moves = moves.filter((move) => {
        if (
          move.kind === MoveType.KING_CASTLE ||
          move.kind === MoveType.QUEEN_CASTLE
        ) {
          // castling moves are always legal
          timer.time("legalMoves", () => 1);
          return true;
        }

        // check if the move is legal the slow way if
        // - king is in check
        // - the piece is pinned
        // - the piece is the current color king
        if (
          isInCheck ||
          move.from & pins ||
          this.position.board[color].king & move.from
        ) {
          this.position.makeMove(move);

          const isLegal = !this.generateAttacksOnSquare(
            this.position.board[color].king,
            color
          );

          this.position.undoMove();

          timer.time("checkedMoves", () => 1);

          return isLegal;
        }

        //  everything else is legal
        timer.time("legalMoves", () => 1);

        return true;
      });

      if (moves.length === 0) {
        // checkmated
      }

      return moves;
    });

  generatePawnMoves = (from: BitBoard, color: PlayerColor): Move[] =>
    timer.time("pawnMove", () => {
      const moves = [];

      switch (color) {
        case "w":
          // single push
          const singlePushW = from << BigInt(8);

          if (
            singlePushW & Max64BitInt && // 64 bits
            !isCollision(this.position.board, singlePushW)
          ) {
            const promotions = this.generatePromotions(
              from,
              singlePushW,
              color
            );
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
            !isCollision(this.position.board, singlePushW) &&
            !isCollision(this.position.board, doublePushW)
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

          if (!isCollision(this.position.board, singlePushB)) {
            const promotions = this.generatePromotions(
              from,
              singlePushB,
              color
            );

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
            !isCollision(this.position.board, singlePushB) &&
            !isCollision(this.position.board, doublePushB)
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
    });

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

    const enPassantTarget = Squares[this.position.state.enPassantTarget];

    if (to & Max64BitInt & mask && isCapture(this.position.board, to, color)) {
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

  generatePawnAttacks = (from: BitBoard, color: PlayerColor): Move[] =>
    timer.time("pawnAttack", () => {
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
    });

  generateRayMoves = (
    from: BitBoard,
    shift: (from: BitBoard) => BitBoard,
    color: PlayerColor
  ): Move[] => {
    const moves = [];

    let ray = from;

    while (ray) {
      ray = shift(ray);

      if (ray) {
        const collided = isCollision(this.position.board, ray);

        if (collided && !isCapture(this.position.board, ray, color)) break; // hit own piece

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

  generateBishopMoves = (from: BitBoard, color: PlayerColor): Move[] =>
    timer.time("bishopMove", () => {
      return this.generateRayMoves(from, shiftNE, color)
        .concat(this.generateRayMoves(from, shiftNW, color))
        .concat(this.generateRayMoves(from, shiftSW, color))
        .concat(this.generateRayMoves(from, shiftSE, color));
    });

  generateRookMoves = (from: BitBoard, color: PlayerColor): Move[] =>
    timer.time("rookMove", () => {
      return this.generateRayMoves(from, shiftUp, color)
        .concat(this.generateRayMoves(from, shiftDown, color))
        .concat(this.generateRayMoves(from, shiftLeft, color))
        .concat(this.generateRayMoves(from, shiftRight, color));
    });

  generateQueenMoves = (from: BitBoard, color: PlayerColor): Move[] =>
    timer.time("queenMove", () => {
      return this.generateBishopMoves(from, color)
        .concat(this.generateRookMoves(from, color))
        .map((move) => ({
          ...move,
        }));
    });

  generateCastlingMoves = (color: PlayerColor): Move[] =>
    timer.time("castlingMove", () => {
      const castlingMoves: Move[] = [];

      const generateKingCastle = (from: BitBoard, color: PlayerColor) => {
        if (
          !isCollision(this.position.board, from >> BigInt(1)) &&
          !isCollision(this.position.board, from >> BigInt(2)) &&
          !this.generateAttacksOnSquare(from, color) &&
          !this.generateAttacksOnSquare(from >> BigInt(1), color) &&
          !this.generateAttacksOnSquare(from >> BigInt(2), color)
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
          !isCollision(this.position.board, from << BigInt(1)) &&
          !isCollision(this.position.board, from << BigInt(2)) &&
          !isCollision(this.position.board, from << BigInt(3)) &&
          !this.generateAttacksOnSquare(from, color) &&
          !this.generateAttacksOnSquare(from << BigInt(1), color) &&
          !this.generateAttacksOnSquare(from << BigInt(2), color)
        ) {
          return {
            from,
            to: from << BigInt(2),
            kind: MoveType.QUEEN_CASTLE,
          };
        }
      };

      const { board, state } = this.position;

      if (color === "w") {
        if (state.castlingRights[Castling.WHITE_KING_SIDE]) {
          const kingCastle = generateKingCastle(board.w.king, color);
          if (kingCastle) castlingMoves.push(kingCastle);
        }
        if (state.castlingRights[Castling.WHITE_QUEEN_SIDE]) {
          const queenCastle = generateQueenCastle(board.w.king, color);
          if (queenCastle) castlingMoves.push(queenCastle);
        }
      } else if (color === "b") {
        if (state.castlingRights[Castling.BLACK_KING_SIDE]) {
          const kingCastle = generateKingCastle(board.b.king, color);
          if (kingCastle) castlingMoves.push(kingCastle);
        }
        if (state.castlingRights[Castling.BLACK_QUEEN_SIDE]) {
          const queenCastle = generateQueenCastle(board.b.king, color);
          if (queenCastle) castlingMoves.push(queenCastle);
        }
      }

      return castlingMoves;
    });

  generateKingMoves = (
    from: BitBoard,
    color: PlayerColor,
    generateCastlingMoves: boolean = true
  ): Move[] =>
    timer.time("kingMove", () => {
      const moves = this.position.masks.kingMasks[stringify(from)]
        .filter((to) => !this.position.isOwnCollision(to, color))
        .map((to) => ({
          from,
          to,
          kind: isCapture(this.position.board, to, color)
            ? MoveType.CAPTURE
            : MoveType.QUIET,
        }));

      return moves.concat(
        generateCastlingMoves ? this.generateCastlingMoves(color) : []
      );
    });

  generateKnightMoves = (from: BitBoard, color: PlayerColor): Move[] =>
    timer.time("knightMove", () => {
      return this.position.masks.knightMasks[stringify(from)]
        .filter((to) => !this.position.isOwnCollision(to, color))
        .map((to) => ({
          from,
          to,
          kind: isCapture(this.position.board, to, color)
            ? MoveType.CAPTURE
            : MoveType.QUIET,
        }));
    });

  generateAttacksOnSquare = (
    square: BitBoard,
    color: PlayerColor
  ): BitBoard => {
    const opponentColor = color === "w" ? "b" : "w";

    const pawnAttacks =
      this.generatePawnAttacks(square, color).reduce(
        (a, b) => a | b.to,
        BigInt(0)
      ) & this.position.board[opponentColor].pawn;

    const knightAttacks =
      this.generateKnightMoves(square, color).reduce(
        (a, b) => a | b.to,
        BigInt(0)
      ) & this.position.board[opponentColor].knight;

    const bishopAttacks =
      this.generateBishopMoves(square, color).reduce(
        (a, b) => a | b.to,
        BigInt(0)
      ) & this.position.board[opponentColor].bishop;

    const rookAttacks =
      this.generateRookMoves(square, color).reduce(
        (a, b) => a | b.to,
        BigInt(0)
      ) & this.position.board[opponentColor].rook;

    const queenAttacks =
      this.generateQueenMoves(square, color).reduce(
        (a, b) => a | b.to,
        BigInt(0)
      ) & this.position.board[opponentColor].queen;

    const kingAttacks =
      this.generateKingMoves(square, color, false).reduce(
        (a, b) => a | b.to,
        BigInt(0)
      ) & this.position.board[opponentColor].king;

    return (
      (pawnAttacks |
        knightAttacks |
        bishopAttacks |
        rookAttacks |
        queenAttacks |
        kingAttacks) &
      this.position.board[opponentColor].piece
    );
  };
}
