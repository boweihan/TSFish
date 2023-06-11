import {
  Masks,
  Max64BitInt,
  MoveType,
  Rank2,
  Rank7,
  Squares,
} from "../constants";
import { Move } from "../datatypes/move";
import { Position } from "../position";
import { PlayerColor } from "../types";

export const generateMoves = (position: Position) => {
  let moves: Move[] = [];

  const generateMovesForPiece = (
    board: bigint,
    callback: (...args: any[]) => Move[]
  ) => {
    while (board) {
      const ls1b = getLS1B(board);
      moves = moves.concat(callback(ls1b));
      board ^= ls1b; // remove ls1b from board
    }
  };

  const partialRight = (fn: Function, ...presetArgs: any[]) =>
    function partiallyApplied(...laterArgs: any[]) {
      return fn(...laterArgs, ...presetArgs);
    };

  const color = position.state.activeColor;

  generateMovesForPiece(
    position.board[color].pawn,
    partialRight(generatePawnMoves, color, position)
  );
  generateMovesForPiece(
    position.board[color].pawn,
    partialRight(generatePawnAttacks, color, position)
  );
  generateMovesForPiece(
    position.board[color].knight,
    partialRight(generateKnightMoves, position)
  );
  generateMovesForPiece(
    position.board[color].bishop,
    partialRight(generateBishopMoves, position)
  );
  generateMovesForPiece(
    position.board[color].rook,
    partialRight(generateRookMoves, position)
  );
  generateMovesForPiece(
    position.board[color].queen,
    partialRight(generateQueenMoves, position)
  );
  generateMovesForPiece(
    position.board[color].king,
    partialRight(generateKingMoves, position)
  );

  //  strip illegal moves (not performant)
  moves = moves.filter((move) => {
    position.makeMove(move);
    const isLegal = !position.isCheck(color);
    position.undoMove();
    return isLegal;
  });

  if (moves.length === 0) {
    // checkmate
  }

  return moves;
};

export const getLS1B = (board: bigint) => {
  // intersection of binary number and it's twos complement isolates the LS1B
  // https://www.chessprogramming.org/General_Setwise_Operations#TheLeastSignificantOneBitLS1B
  // javascript represents negative numbers as the twos complement
  return board & -board;
};

export const generatePawnMoves = (
  from: bigint,
  color: PlayerColor,
  position: Position
): Move[] => {
  const moves = [];

  switch (color) {
    case "w":
      // single push
      const singlePushW = from << BigInt(8);

      if (
        singlePushW & Max64BitInt && // 64 bits
        !position.isCollision(singlePushW)
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
        !position.isCollision(singlePushW) &&
        !position.isCollision(doublePushW)
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

      if (!position.isCollision(singlePushB)) {
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
        !position.isCollision(singlePushB) &&
        !position.isCollision(doublePushB)
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

const generatePawnAttack = (
  from: bigint,
  to: bigint,
  mask: bigint,
  position: Position
) => {
  const attacks = [];

  const enPassantTarget = Squares[position.state.enPassantTarget];

  if (to & Max64BitInt & mask && position.isCapture(from, to)) {
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

export const generatePawnAttacks = (
  from: bigint,
  color: PlayerColor,
  position: Position
): Move[] => {
  let attacks: Move[] = [];

  switch (color) {
    case "w":
      attacks = attacks.concat(
        generatePawnAttack(from, from << BigInt(7), Masks.NOT_H_FILE, position)
      );
      attacks = attacks.concat(
        generatePawnAttack(from, from << BigInt(9), Masks.NOT_A_FILE, position)
      );
      break;
    case "b":
      attacks = attacks.concat(
        generatePawnAttack(from, from >> BigInt(7), Masks.NOT_A_FILE, position)
      );
      attacks = attacks.concat(
        generatePawnAttack(from, from >> BigInt(9), Masks.NOT_H_FILE, position)
      );
      break;
    default:
      throw new Error("invalid player color!");
  }

  return attacks;
};

export const generateKnightMoves = (
  from: bigint,
  position: Position
): Move[] => {
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
    .filter((to) => !position.isCollision(to) || position.isCapture(from, to))
    .map((to) => ({
      from,
      to,
      kind: position.isCapture(from, to) ? MoveType.CAPTURE : MoveType.QUIET,
    }));
};

const generateRayMoves = (
  from: bigint,
  direction: (from: bigint) => bigint,
  position: Position
): Move[] => {
  const moves = [];

  let ray = from;

  while (ray) {
    ray = direction(ray);

    if (ray) {
      const collided = position.isCollision(ray);

      if (collided && !position.isCapture(from, ray)) break; // hit own piece

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

export const generateBishopMoves = (
  from: bigint,
  position: Position
): Move[] => {
  return generateRayMoves(
    from,
    (ray) => {
      ray <<= BigInt(7);
      ray &= Max64BitInt;
      ray &= Masks.NOT_H_FILE;

      return ray;
    },
    position
  )
    .concat(
      generateRayMoves(
        from,
        (ray) => {
          ray <<= BigInt(9);
          ray &= Max64BitInt;
          ray &= Masks.NOT_A_FILE;

          return ray;
        },
        position
      )
    )
    .concat(
      generateRayMoves(
        from,
        (ray) => {
          ray >>= BigInt(7);
          ray &= Masks.NOT_A_FILE;

          return ray;
        },
        position
      )
    )
    .concat(
      generateRayMoves(
        from,
        (ray) => {
          ray >>= BigInt(9);
          ray &= Masks.NOT_H_FILE;

          return ray;
        },
        position
      )
    );
};

export const generateRookMoves = (from: bigint, position: Position): Move[] => {
  return generateRayMoves(
    from,
    (ray) => {
      ray <<= BigInt(8);
      ray &= Max64BitInt;

      return ray;
    },
    position
  )
    .concat(
      generateRayMoves(
        from,
        (ray) => {
          ray >>= BigInt(8);

          return ray;
        },
        position
      )
    )
    .concat(
      generateRayMoves(
        from,
        (ray) => {
          ray <<= BigInt(1);
          ray &= Masks.NOT_A_FILE;

          return ray;
        },
        position
      )
    )
    .concat(
      generateRayMoves(
        from,
        (ray) => {
          ray >>= BigInt(1);
          ray &= Masks.NOT_H_FILE;

          return ray;
        },
        position
      )
    );
};

export const generateQueenMoves = (
  from: bigint,
  position: Position
): Move[] => {
  return generateBishopMoves(from, position)
    .concat(generateRookMoves(from, position))
    .map((move) => ({
      ...move,
    }));
};

export const generateKingMoves = (from: bigint, position: Position): Move[] => {
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
    .filter((to) => !position.isCollision(to) || position.isCapture(from, to))
    .map((to) => ({
      from,
      to,
      kind: position.isCapture(from, to) ? MoveType.CAPTURE : MoveType.QUIET,
    }));
};
