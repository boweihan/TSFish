import {
  CastlingRights,
  EnPassantTarget,
  FullMoveNumber,
  HalfMoveClock,
  PlayerColor,
  isValidCastlingRights,
  isValidPlayerColor,
} from "../types";
import { ClassicalBoards, generateEmptyBoard } from "./bitboard";
import { Color } from "../constants";

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

  public toFen() {
    // TODO: implement
  }

  public generateMoves() {
    // TODO: implement
  }

  public move() {
    // TODO: implement
  }

  public undoMove() {
    // TODO: implement
  }

  public get() {
    // TODO: implement
  }

  public set() {
    // TODO: implement
  }

  public updateCastlingRights() {
    // TODO: implement
  }

  public updateActiveColor() {
    // TODO: implement
  }

  public updateEnPassantSquare() {
    // TODO: implement
  }

  public updateSideToMove() {
    // TODO: implement
  }

  public incrementClock() {
    // TODO: implement
  }

  public isAttacked() {
    // TODO: implement
  }

  public isCheck() {
    // TODO: implement
  }

  public isCheckmate() {
    // TODO: implement
  }

  public isStalemate() {
    // TODO: implement
  }

  public isInsufficientMaterial() {
    // TODO: implement
  }

  public isThreefoldRepetition() {
    // TODO: implement
  }

  public isDraw() {
    // TODO: implement
  }
}
