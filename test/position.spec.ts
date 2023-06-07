import { MoveType } from "../src/constants";
import { Squares } from "../src/constants";
import { boardsToBitBoards } from "../src/datatypes";
import { PositionImpl } from "../src/position";

const prettyPrint = (board: bigint) => {
  const ranks = 8;
  const binaryStr = board.toString(2).padStart(64, "0");

  let result = "";

  for (let rank = 0; rank < ranks; rank++) {
    result +=
      binaryStr
        .slice(rank * 8, rank * 8 + 8)
        .split("")
        .join(" ") + "\n";
  }
  console.log(result);
};

prettyPrint(
  new PositionImpl("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b - - 0 1")
    .generatePawnAttacks(
      BigInt(
        0b0000000000000000000000000000000000000000000100000000000000000000
      ),
      "b"
    )
    .map((a) => a.to)
    .reduce((a, b) => a | b)
);

describe("Position", () => {
  it("makes a capture", () => {
    const position = new PositionImpl(
      "rnbqkbnr/pppp1ppp/8/4p3/3P4/8/PPP1PPPP/RNBQKBNR w KQkq e6 0 2"
    );
    position.makeMove({
      from: Squares.d4,
      to: Squares.e5,
      kind: MoveType.CAPTURE,
    });
    expect(position.board.w.piece.toString(2)).toEqual(
      "100000000000000000001110111111111111"
    );
    expect(position.board.w.pawn.toString(2)).toEqual(
      "100000000000000000001110111100000000"
    );
  });

  it("makes a quiet move", () => {
    const position = new PositionImpl(
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b - - 0 1"
    );
    position.makeMove({
      from: Squares.a2,
      to: Squares.a3,
      kind: MoveType.QUIET,
    });
    expect(position.board.w.piece.toString(2)).toEqual(
      "100000000111111111111111"
    );
    expect(position.board.w.pawn.toString(2)).toEqual(
      "100000000111111100000000"
    );
  });

  it("generates pawn attacks", () => {
    expect(
      new PositionImpl("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b - - 0 1")
        .generatePawnAttacks(
          BigInt(
            0b0000000000000000000000000000000000000000000100000000000000000000
          ),
          "b"
        )
        .map((a) => a.to)
        .reduce((a, b) => a | b)
        .toString(2)
    ).toEqual("10100000000000");
  });

  it("generates pawn attacks", () => {
    expect(
      new PositionImpl("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b - - 0 1")
        .generatePawnAttacks(
          BigInt(
            0b0000000000000000000000000000000000000000000100000000000000000000
          ),
          "w"
        )
        .map((a) => a.to)
        .reduce((a, b) => a | b)
        .toString(2)
    ).toEqual("101000000000000000000000000000");
  });

  it("generates pawn attacks", () => {
    expect(
      new PositionImpl("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b - - 0 1")
        .generatePawnAttacks(
          BigInt(
            0b0000000000000000000000000000000000000000100000000000000000000000
          ),
          "b"
        )
        .map((a) => a.to)
        .reduce((a, b) => a | b)
        .toString(2)
    ).toEqual("100000000000000");
  });

  it("generates pawn attacks", () => {
    expect(
      new PositionImpl("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b - - 0 1")
        .generatePawnAttacks(
          BigInt(
            0b0000000000000000000000000000000000000000100000000000000000000000
          ),
          "w"
        )
        .map((a) => a.to)
        .reduce((a, b) => a | b)
        .toString(2)
    ).toEqual("1000000000000000000000000000000");
  });

  it("generates queen moves", () => {
    expect(
      new PositionImpl("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b - - 0 1")
        .generateQueenMoves(
          BigInt(
            0b0000000000000000000000000000000000000000100000000000000000000000
          )
        )
        .map((a) => a.to)
        .reduce((a, b) => a | b)
        .toString(2)
    ).toEqual(
      "1000010010001000100100001010000011000000011111111100000010100000"
    );
  });

  it("generates queen moves", () => {
    expect(
      new PositionImpl("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b - - 0 1")
        .generateQueenMoves(
          BigInt(
            0b0000000000000000000000000000000000000100000000000000000000000000
          )
        )
        .map((a) => a.to)
        .reduce((a, b) => a | b)
        .toString(2)
    ).toEqual(
      "100010000100100000101010000111011111011000011100001010100100100"
    );
  });

  it("generates rook moves", () => {
    expect(
      new PositionImpl("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b - - 0 1")
        .generateRookMoves(
          BigInt(
            0b0000000000000000000000000000000000000000100000000000000000000000
          )
        )
        .map((a) => a.to)
        .reduce((a, b) => a | b)
        .toString(2)
    ).toEqual(
      "1000000010000000100000001000000010000000011111111000000010000000"
    );
  });

  it("generates rook moves", () => {
    expect(
      new PositionImpl("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b - - 0 1")
        .generateRookMoves(
          BigInt(
            0b0000000000000000000000000000000000000100000000000000000000000000
          )
        )
        .map((a) => a.to)
        .reduce((a, b) => a | b)
        .toString(2)
    ).toEqual("10000000100000001000000010011111011000001000000010000000100");
  });

  it("generates bishop moves", () => {
    expect(
      new PositionImpl("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b - - 0 1")
        .generateBishopMoves(
          BigInt(
            0b0000000000000000000000000000000000000100000000000000000000000000
          )
        )
        .map((a) => a.to)
        .reduce((a, b) => a | b)
        .toString(2)
    ).toEqual(
      "100000000100000000100010000101000000000000010100001000100100000"
    );
  });

  it("generates bishop moves", () => {
    expect(
      new PositionImpl("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b - - 0 1")
        .generateBishopMoves(
          BigInt(
            0b0000000000000000000000000000000000100000000000000000000000000000
          )
        )
        .map((a) => a.to)
        .reduce((a, b) => a | b)
        .toString(2)
    ).toEqual("1000000100100010000101000000000000010100001000100000000100");
  });

  it("generates bishop moves", () => {
    expect(
      new PositionImpl("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b - - 0 1")
        .generateBishopMoves(
          BigInt(
            0b1000000000000000000000000000000000000000000000000000000000000000
          )
        )
        .map((a) => a.to)
        .reduce((a, b) => a | b)
        .toString(2)
    ).toEqual("1000000001000000001000000001000000001000000001000000001");
  });

  it("generates bishop moves", () => {
    expect(
      new PositionImpl("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b - - 0 1")
        .generateBishopMoves(
          BigInt(
            0b0000000010000000000000000000000000000000000000000000000000000000
          )
        )
        .map((a) => a.to)
        .reduce((a, b) => a | b)
        .toString(2)
    ).toEqual(
      "100000000000000010000000010000000010000000010000000010000000010"
    );
  });

  it("generates double pushes for black", () => {
    expect(
      new PositionImpl("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b - - 0 1")
        .generatePawnMoves(
          BigInt(
            0b0000000010000000000000000000000000000000000000000000000000000000
          ),
          "b"
        )
        .map((a) => a.to)
        .reduce((a, b) => a | b)
        .toString(2)
    ).toEqual("100000001000000000000000000000000000000000000000");
  });

  it("generates double pushes for white", () => {
    expect(
      new PositionImpl("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b - - 0 1")
        .generatePawnMoves(
          BigInt(
            0b0000000000000000000000000000000000000000000000000000000100000000
          ),
          "w"
        )
        .map((a) => a.to)
        .reduce((a, b) => a | b)
        .toString(2)
    ).toEqual("1000000010000000000000000");
  });

  it("generates pawn moves", () => {
    expect(
      new PositionImpl("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b - - 0 1")
        .generatePawnMoves(
          BigInt(
            0b0000000000000000000100000000000000000000000000000000000000000000
          ),
          "b"
        )
        .map((a) => a.to)
        .reduce((a, b) => a | b)
        .toString(2)
    ).toEqual("1000000000000000000000000000000000000");
  });

  it("generates pawn moves", () => {
    expect(
      new PositionImpl("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b - - 0 1")
        .generatePawnMoves(
          BigInt(
            0b0000000000000000000100000000000000000000000000000000000000000000
          ),
          "w"
        )
        .map((a) => a.to)
        .reduce((a, b) => a | b)
        .toString(2)
    ).toEqual("10000000000000000000000000000000000000000000000000000");
  });

  it("generates king moves", () => {
    expect(
      new PositionImpl("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b - - 0 1")
        .generateKingMoves(
          BigInt(
            0b0000000000000000000100000000000000000000000000000000000000000000
          )
        )
        .map((a) => a.to)
        .reduce((a, b) => a | b)
        .toString(2)
    ).toEqual("111000001010000011100000000000000000000000000000000000");
  });

  it("generates knight moves", () => {
    expect(
      new PositionImpl("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b - - 0 1")
        .generateKnightMoves(
          BigInt(
            0b0000000000000000000000000000000000000000000000000000000000100000
          )
        )
        .map((a) => a.to)
        .reduce((a, b) => a | b)
        .toString(2)
    ).toEqual("10100001000100000000000");
  });

  it("generates knight moves", () => {
    expect(
      new PositionImpl("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b - - 0 1")
        .generateKnightMoves(
          BigInt(
            0b0000000000000000000100000000000000000000000000000000000000000000
          )
        )
        .map((a) => a.to)
        .reduce((a, b) => a | b)
        .toString(2)
    ).toEqual("10100001000100000000000100010000101000000000000000000000000000");
  });

  it("gets least significant bit", () => {
    expect(
      new PositionImpl("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b - - 0 1")
        .getLS1B(BigInt(0b00111001010000000))
        .toString(2)
    ).toEqual("10000000");
  });

  it("gets least significant bit", () => {
    expect(
      new PositionImpl("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b - - 0 1")
        .getLS1B(BigInt(0b00111001010110000))
        .toString(2)
    ).toEqual("10000");
  });

  it("sets a bit", () => {
    expect(
      new PositionImpl("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b - - 0 1")
        .set(BigInt(0), Squares.b1)
        .toString(2)
    ).toEqual("1000000");
  });

  it("removes a bit", () => {
    expect(
      new PositionImpl("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b - - 0 1")
        .remove(Squares.b1, Squares.b1)
        .toString(2)
    ).toEqual("0");
  });

  it("transforms board to bitboard", () => {
    expect(
      new PositionImpl(
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b - - 0 1"
      ).board.w.bishop.toString(2)
    ).toEqual("100100");
  });

  it("transforms board to bitboard", () => {
    expect(
      new PositionImpl(
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b - - 0 1"
      ).board.b.pawn.toString(2)
    ).toEqual("11111111000000000000000000000000000000000000000000000000");
  });

  it("correctly translates FEN to state", () => {
    expect(
      new PositionImpl("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b - - 0 1")
        .state
    ).toEqual({
      activeColor: "b",
      castlingRights: "-",
      enPassantTarget: "-",
      halfMoveClock: 0,
      fullMoveNumber: 1,
    });
  });

  it("correctly translates FEN to state", () => {
    expect(
      new PositionImpl("8/5k2/3p4/1p1Pp2p/pP2Pp1P/P4P1K/8/8 b - - 99 50").state
    ).toEqual({
      activeColor: "b",
      castlingRights: "-",
      enPassantTarget: "-",
      halfMoveClock: 99,
      fullMoveNumber: 50,
    });
  });

  it("correctly translates FEN to state", () => {
    expect(
      new PositionImpl(
        "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1"
      ).state
    ).toEqual({
      activeColor: "b",
      castlingRights: "KQkq",
      enPassantTarget: "e3",
      halfMoveClock: 0,
      fullMoveNumber: 1,
    });
  });

  it("handles invalid color", () => {
    const fen = "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR c KQkq e3 0 1";
    expect(() => new PositionImpl(fen)).toThrow(`Invalid FEN: ${fen}`);
  });

  it("handles invalid castling rights", () => {
    const fen = "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b xq e3 0 1";
    expect(() => new PositionImpl(fen)).toThrow(`Invalid FEN: ${fen}`);
  });

  it("correctly translates fen piece to bitboard representation", () => {
    expect(
      new PositionImpl("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b - - 0 1")
        .board
    ).toEqual(
      boardsToBitBoards({
        w: {
          // prettier-ignore
          bishop: [
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 1, 0, 0, 1, 0, 0,
          ],
          // prettier-ignore
          king: [
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 1, 0, 0, 0,
          ],
          // prettier-ignore
          knight: [
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 1, 0, 0, 0, 0, 1, 0,
          ],
          // prettier-ignore
          pawn: [
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            1, 1, 1, 1, 1, 1, 1, 1,
            0, 0, 0, 0, 0, 0, 0, 0,
          ],
          // prettier-ignore
          queen: [
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 1, 0, 0, 0, 0,
          ],
          // prettier-ignore
          rook: [
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            1, 0, 0, 0, 0, 0, 0, 1,
          ],
          // prettier-ignore
          piece: [
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 1, 1,
          ],
        },
        b: {
          // prettier-ignore
          bishop: [
            0, 0, 1, 0, 0, 1, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
          ],
          // prettier-ignore
          piece: [
            1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 1, 1,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
          ],
          // prettier-ignore
          king: [
            0, 0, 0, 0, 1, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
          ],
          // prettier-ignore
          knight: [
            0, 1, 0, 0, 0, 0, 1, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
          ],
          // prettier-ignore
          pawn: [
            0, 0, 0, 0, 0, 0, 0, 0,
            1, 1, 1, 1, 1, 1, 1, 1,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
          ],
          // prettier-ignore
          queen: [
            0, 0, 0, 1, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
          ],
          // prettier-ignore
          rook: [
            1, 0, 0, 0, 0, 0, 0, 1,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
          ],
        },
      })
    );
  });

  it("correctly translates fen piece to bitboard representation", () => {
    expect(new PositionImpl("8/8/8/4p1K1/2k1P3/8/8/8 b - - 0 1").board).toEqual(
      boardsToBitBoards({
        w: {
          // prettier-ignore
          bishop: [
              0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0,
            ],
          // prettier-ignore
          king: [
              0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 1, 0,
              0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0,
            ],
          // prettier-ignore
          knight: [
              0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0,
            ],
          // prettier-ignore
          pawn: [
              0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 1, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0,
            ],
          // prettier-ignore
          queen: [
              0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0,
            ],
          // prettier-ignore
          rook: [
              0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0,
            ],
          // prettier-ignore
          piece: [
              0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 1, 0,
              0, 0, 0, 0, 1, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0, 0,
            ],
        },
        b: {
          // prettier-ignore
          bishop: [
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
          ],
          // prettier-ignore
          piece: [
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 1, 0, 0, 0,
            0, 0, 1, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
          ],
          // prettier-ignore
          king: [
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 1, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
          ],
          // prettier-ignore
          knight: [
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
          ],
          // prettier-ignore
          pawn: [
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 1, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
          ],
          // prettier-ignore
          queen: [
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
          ],
          // prettier-ignore
          rook: [
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
          ],
        },
      })
    );
  });

  it("correctly translates fen piece to bitboard representation", () => {
    expect(
      new PositionImpl("8/5k2/3p4/1p1Pp2p/pP2Pp1P/P4P1K/8/8 b - - 99 50").board
    ).toEqual(
      boardsToBitBoards({
        w: {
          // prettier-ignore
          bishop: [
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
          ],
          // prettier-ignore
          king: [
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 1,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
          ],
          // prettier-ignore
          knight: [
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
          ],
          // prettier-ignore
          pawn: [
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 1, 0, 0, 0, 0,
            0, 1, 0, 0, 1, 0, 0, 1,
            1, 0, 0, 0, 0, 1, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
          ],
          // prettier-ignore
          queen: [
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
          ],
          // prettier-ignore
          rook: [
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
          ],
          // prettier-ignore
          piece: [
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 1, 0, 0, 0, 0,
            0, 1, 0, 0, 1, 0, 0, 1,
            1, 0, 0, 0, 0, 1, 0, 1,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
          ],
        },
        b: {
          // prettier-ignore
          bishop: [
          0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0,
        ],
          // prettier-ignore
          piece: [
          0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 1, 0, 0,
          0, 0, 0, 1, 0, 0, 0, 0,
          0, 1, 0, 0, 1, 0, 0, 1,
          1, 0, 0, 0, 0, 1, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0,
        ],
          // prettier-ignore
          king: [
          0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 1, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0,
        ],
          // prettier-ignore
          knight: [
          0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0,
        ],
          // prettier-ignore
          pawn: [
          0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 1, 0, 0, 0, 0,
          0, 1, 0, 0, 1, 0, 0, 1,
          1, 0, 0, 0, 0, 1, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0,
        ],
          // prettier-ignore
          queen: [
          0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0,
        ],
          // prettier-ignore
          rook: [
          0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0,
        ],
        },
      })
    );
  });
});
