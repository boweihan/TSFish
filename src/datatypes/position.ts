import { ClassicalBoard, EmptyBoard } from "./bitboard";

type State = {
  // castling rights
  // en passant square
  // halfmove counter
  // side to move
};

export const StartPosition = "startpos";

export interface Position {
  fen: string;
  board: ClassicalBoard;
  state: State;
}

export class PositionImpl implements Position {
  fen: string;
  board: ClassicalBoard;
  state: State;

  constructor(fen?: string) {
    this.fen = fen || StartPosition;
    this.board = EmptyBoard;
    this.state = {};
  }
}
