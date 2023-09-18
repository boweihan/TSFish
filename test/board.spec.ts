import { describe, expect, it } from "bun:test";
import { calculatePinnedPieces } from "../src/util/board";
import { PositionImpl } from "../src/position";
import { Squares } from "../src/constants";

describe("board utils", () => {
  it("correctly returns pinned pieces for a position", () => {
    const position = new PositionImpl(
      "rnb1k1nr/pppp2pp/4p3/5p2/1b1P1B1q/2N2N2/PPP1PPPP/R2QKB1R w KQkq - 4 5"
    );
    expect(calculatePinnedPieces(position.board, "w")).toEqual(
      Squares.c3 ^ Squares.f2
    );
  });

  it("correctly returns pinned pieces for a position", () => {
    const position = new PositionImpl(
      "rnb1k1n1/p2p2p1/1p2r3/2b1Bp2/P1pP4/2N1KN1q/1PP1PP1P/R2Q1B1R b q - 2 14"
    );
    expect(calculatePinnedPieces(position.board, "w")).toEqual(
      Squares.d4 ^ Squares.e5 ^ Squares.f3
    );
  });
});
