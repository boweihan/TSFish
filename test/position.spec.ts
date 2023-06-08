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
  new PositionImpl("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
    .generateKnightMoves(
      BigInt(0b0000000000000000000000000000000000000000000000000000000000000010)
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

  it("generates pawn attacks for black if they attack white pieces", () => {
    expect(
      new PositionImpl(
        "rn2kbn1/p1p1ppp1/3rq3/1p1Q1b1p/P1PP1B1P/4R3/1P2PPP1/RN2KBN1 b Qq a3 0 10"
      )
        .generatePawnAttacks(
          BigInt(
            0b0000000000000000000000000100000000000000000000000000000000000000
          ),
          "b"
        )
        .map((a) => a.to)
        .reduce((a, b) => a | b)
        .toString(2)
    ).toEqual("10100000000000000000000000000000");
  });

  it("generates pawn attacks for white if they attack black pieces", () => {
    expect(
      new PositionImpl(
        "rn2kbn1/p1p1ppp1/2r1q3/1p1Q1b1p/2PP1B1P/4R3/PP2PPP1/RN2KBN1 b Qq c3 0 9"
      )
        .generatePawnAttacks(
          BigInt(
            0b0000000000000000000000000000000000100000000000000000000000000000
          ),
          "w"
        )
        .map((a) => a.to)
        .reduce((a, b) => a | b)
        .toString(2)
    ).toEqual("100000000000000000000000000000000000000");
  });

  it("generates queen moves", () => {
    expect(
      new PositionImpl(
        "rn2kbn1/ppp1ppp1/2r1q3/3Q1b1p/3P1B1P/4R3/PPP1PPP1/RN2KBN1 b Qq - 0 8"
      )
        .generateQueenMoves(
          BigInt(
            0b0000000000000000000000000001000000000000000000000000000000000000
          )
        )
        .map((a) => a.to)
        .reduce((a, b) => a | b)
        .toString(2)
    ).toEqual("1000000010000001110001110110000101000010001000000000000000000");
  });

  it("generates black rook moves and attacks on white pieces", () => {
    expect(
      new PositionImpl(
        "rn1qkbn1/ppp1ppp1/2r5/3p1b1p/3P1B1P/4R3/PPP1PPP1/RN1QKBN1 w Qq - 4 6"
      )
        .generateRookMoves(
          BigInt(
            0b0000000000000000001000000000000000000000000000000000000000000000
          )
        )
        .map((a) => a.to)
        .reduce((a, b) => a | b)
        .toString(2)
    ).toEqual("110111110010000000100000001000000010000000000000");
  });

  it("generates white rook moves and attacks on black pieces", () => {
    expect(
      new PositionImpl(
        "rn1qkbn1/ppp1ppp1/7r/3p1b1p/3P1B1P/4R3/PPP1PPP1/RN1QKBN1 b Qq - 3 5"
      )
        .generateRookMoves(
          BigInt(
            0b0000000000000000000000000000000000000000000010000000000000000000
          )
        )
        .map((a) => a.to)
        .reduce((a, b) => a | b)
        .toString(2)
    ).toEqual("1000000010000000100000001000111101110000000000000000");
  });

  it("generates black bishop attacks on white pieces", () => {
    expect(
      new PositionImpl(
        "rn1qkbnr/ppp1pppp/8/3p1b2/3P1B2/8/PPP1PPPP/RN1QKBNR w KQkq - 2 3"
      )
        .generateBishopMoves(
          BigInt(
            0b0000000000000000000000000000010000000000000000000000000000000000
          )
        )
        .map((a) => a.to)
        .reduce((a, b) => a | b)
        .toString(2)
    ).toEqual("10000000010000000010100000000000001010000100010010000000000000");
  });

  it("generate white bishop attacks on black pieces", () => {
    expect(
      new PositionImpl(
        "rnbqkbnr/ppp1pppp/8/3p4/3P1B2/8/PPP1PPPP/RN1QKBNR b KQkq - 1 2"
      )
        .generateBishopMoves(
          BigInt(
            0b0000000000000000000000000000000000000100000000000000000000000000
          )
        )
        .map((a) => a.to)
        .reduce((a, b) => a | b)
        .toString(2)
    ).toEqual("100000000100010000101000000000000010100001000000100000");
  });

  it("generates no bishop moves if contained by own pieces", () => {
    expect(
      new PositionImpl(
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b - - 0 1"
      ).generateBishopMoves(
        BigInt(
          0b1000000000000000000000000000000000000000000000000000000000000000
        )
      )
    ).toEqual([]);
  });

  it("generates bishop moves that stop at a collision", () => {
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
    ).toEqual("10000000010000000010000000010000000010000000000");
  });

  it("doesn't generate black pawn moves that result in collisions", () => {
    expect(
      new PositionImpl(
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b - - 0 1"
      ).generatePawnMoves(
        BigInt(
          0b0000000000000000000000000000000000000000000000010000000000000000
        ),
        "b"
      )
    ).toEqual([]);
  });

  it("doesn't generate white pawn moves that result in collisions", () => {
    expect(
      new PositionImpl("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b - - 0 1")
        .generatePawnMoves(
          BigInt(
            0b0000000000000000000000001000000000000000000000000000000000000000
          ),
          "b"
        )
        .map((a) => a.to)
        .reduce((a, b) => a | b)
        .toString(2)
    ).toEqual("10000000000000000000000000000000");
  });

  it("generates single and double push black pawn moves", () => {
    expect(
      new PositionImpl("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b - - 0 1")
        .generatePawnMoves(
          BigInt(
            0b0000000000000001000000000000000000000000000000000000000000000000
          ),
          "b"
        )
        .map((a) => a.to)
        .reduce((a, b) => a | b)
        .toString(2)
    ).toEqual("10000000100000000000000000000000000000000");
  });

  it("generates single and double push white pawn moves", () => {
    expect(
      new PositionImpl("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b - - 0 1")
        .generatePawnMoves(
          BigInt(
            0b0000000000000000000000000000000000000000000000001000000000000000
          ),
          "w"
        )
        .map((a) => a.to)
        .reduce((a, b) => a | b)
        .toString(2)
    ).toEqual("10000000100000000000000000000000");
  });

  it("generates king moves that don't collide with own pieces", () => {
    expect(
      new PositionImpl(
        "rnk2bn1/p1p1ppp1/3rq3/1p1Q1b1p/PKPP1B1P/4R3/1P2PPP1/RN3BN1 w - - 11 16"
      )
        .generateKingMoves(
          BigInt(
            0b0000000000000000000000000000000001000000000000000000000000000000
          )
        )
        .map((a) => a.to)
        .reduce((a, b) => a | b)
        .toString(2)
    ).toEqual("1110000000000000111000000000000000000000");
  });

  it.skip("generates king moves that don't put the king in check", () => {
    expect(
      new PositionImpl(
        "rn1k1bn1/p1p1ppp1/3rq3/1pKQ1b1p/P1PP1B1P/4R3/1P2PPP1/RN3BN1 w - - 13 17"
      )
        .generateKingMoves(
          BigInt(
            0b0000000000000000000000000010000000000000000000000000000000000000
          )
        )
        .map((a) => a.to)
        .reduce((a, b) => a | b)
        .toString(2)
    ).toEqual("01000000100000001000000000000000000000000000000");
  });

  it("generates knight moves", () => {
    expect(
      new PositionImpl(
        "r2k1bn1/p1p1ppp1/3rq3/1pKQNb1p/P1Pn1B1P/4R3/1P2PPP1/RN3B2 w - - 0 19"
      )
        .generateKnightMoves(
          BigInt(
            0b0000000000000000000000000000100000000000000000000000000000000000
          )
        )
        .map((a) => a.to)
        .reduce((a, b) => a | b)
        .toString(2)
    ).toEqual("10100001000100000000000000010000101000000000000000000");
  });

  it("generates knight moves", () => {
    expect(
      new PositionImpl(
        "r3kbn1/p1p1ppp1/2Nrq3/1pKQ1b1p/P1Pn1B1P/4R3/1P2PPP1/RN3B2 w - - 2 20"
      )
        .generateKnightMoves(
          BigInt(
            0b0000000000000000001000000000000000000000000000000000000000000000
          )
        )
        .map((a) => a.to)
        .reduce((a, b) => a | b)
        .toString(2)
    ).toEqual(
      "101000010001000000000001000100001010000000000000000000000000000"
    );
  });

  it("generates knight moves", () => {
    expect(
      new PositionImpl(
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
      )
        .generateKnightMoves(
          BigInt(
            0b0000000000000000000000000000000000000000000000000000000000000010
          )
        )
        .map((a) => a.to)
        .reduce((a, b) => a | b)
        .toString(2)
    ).toEqual("1010000000000000000");
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
