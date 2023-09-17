import { describe, expect, it } from "bun:test";
import { Color, DefaultFEN, MoveType } from "../src/constants";
import { Squares } from "../src/constants";
import { boardsToBitBoards } from "../src/datatypes";
import { PositionImpl } from "../src/position";
import { prettyPrint } from "../src/util/prettyPrint";
import { getLS1B } from "../src/util/board";

// prettyPrint(
//   // new PositionImpl("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
//   //   .generateKnightMoves(
//   //     BigInt(0b0000000000000000000000000000000000000000000000000000000000000010)
//   //   )
//   //   .map((a) => a.to)
//   //   .reduce((a, b) => a | b)
// );

describe("Position", () => {
  it("spits out the right FEN", () => {
    const fen =
      "r3k2r/4pp1p/1pnq1n1b/pBPp2p1/4P1b1/N1PQBP2/PP2N1PP/1R2K2R w Kkq a6 0 12";
    const position = new PositionImpl(fen);
    position.makeMove(position.parseUCIMove("e4e5"));
    position.makeMove(position.parseUCIMove("h8f8"));
    position.makeMove(position.parseUCIMove("e5d6"));
    position.makeMove(position.parseUCIMove("d5d4"));
    expect(position.positionToFen()).toEqual(
      "r3kr2/4pp1p/1pnP1n1b/pBP3p1/3p2b1/N1PQBP2/PP2N1PP/1R2K2R w Kq - 0 14"
    );
  });

  it("spits out the right FEN", () => {
    const fen =
      "r3k2r/4pp1p/1pnq1n1b/pBPp2p1/4P1b1/N1PQBP2/PP2N1PP/1R2K2R w Kkq a6 0 12";
    const position = new PositionImpl(fen);
    expect(position.positionToFen()).toEqual(fen);
  });

  it("spits out the right default FEN", () => {
    const position = new PositionImpl();
    expect(position.positionToFen()).toEqual(DefaultFEN);
  });

  it("castles the white rook", () => {
    const position = new PositionImpl(
      "r3k2r/4pp1p/1pnq1n1b/pBPp2p1/4P1b1/N1PQBP2/PP2N1PP/1R2K2R w Kkq a6 0 12"
    );
    const moves = position.generateKingMoves(Squares.e1, "w");
    expect(
      moves.filter(
        (move) =>
          move.kind === MoveType.KING_CASTLE ||
          move.kind === MoveType.QUEEN_CASTLE
      ).length
    ).toEqual(1);
  });

  it("doesn't allow castling through check", () => {
    const position = new PositionImpl(
      "r3k2r/4pp1p/Bpnq1n1b/p1Pp2p1/4P1b1/N1PQBP2/PP2N1PP/1R2K2R b Kkq - 1 12"
    );
    const moves = position.generateKingMoves(Squares.e8, "b");
    expect(
      moves.filter(
        (move) =>
          move.kind === MoveType.KING_CASTLE ||
          move.kind === MoveType.QUEEN_CASTLE
      ).length
    ).toEqual(1);
  });

  it("generates castling moves", () => {
    const position = new PositionImpl(
      "r4rk1/p2qpp1p/1pn2npb/1BPp4/4P1b1/N1P2P2/PPQBN1PP/1R2K2R w K - 1 11"
    );
    const moves = position.generateKingMoves(Squares.e1, "w");
    expect(
      moves.filter(
        (move) =>
          move.kind === MoveType.KING_CASTLE ||
          move.kind === MoveType.QUEEN_CASTLE
      ).length
    ).toEqual(1);
  });

  it("generates castling moves", () => {
    const position = new PositionImpl(
      "r4rk1/pp1qpp1p/2n2npb/1BPp4/4P1b1/2P2P2/PPQBN1PP/RN2K2R w KQ - 6 10"
    );
    const moves = position.generateKingMoves(Squares.e1, "w");
    expect(
      moves.filter(
        (move) =>
          move.kind === MoveType.KING_CASTLE ||
          move.kind === MoveType.QUEEN_CASTLE
      ).length
    ).toEqual(1);
  });

  it("generates castling moves", () => {
    const position = new PositionImpl(
      "r3k2r/pp1qpp1p/2n2npb/1BPp4/4P1b1/2P2P2/PPQBN1PP/RN2K2R b KQkq - 5 9"
    );
    const moves = position.generateKingMoves(Squares.e8, "b");
    expect(
      moves.filter(
        (move) =>
          move.kind === MoveType.KING_CASTLE ||
          move.kind === MoveType.QUEEN_CASTLE
      ).length
    ).toEqual(2);
  });

  it("generates pawn attack promotions", () => {
    const position = new PositionImpl(
      "rnbq1bnr/ppppP1pp/5k2/8/8/2K5/PPP1pPPP/RNBQ1BNR w - - 0 8"
    );
    const wMoves = position.generatePawnAttacks(Squares.e7, Color.WHITE);
    expect(wMoves.length).toEqual(8);

    const bMoves = position.generatePawnAttacks(Squares.e2, Color.BLACK);
    expect(bMoves.length).toEqual(8);
  });

  it("generates pawn push promotions", () => {
    const position = new PositionImpl(
      "rnbq1bnr/ppppP1pp/5k2/8/8/2K5/PPP1pPPP/RNBQ1BNR w - - 0 8"
    );

    const wMoves = position.generatePawnMoves(Squares.e7, Color.WHITE);
    expect(wMoves.length).toEqual(4);

    const bMoves = position.generatePawnMoves(Squares.e2, Color.BLACK);
    expect(bMoves.length).toEqual(4);
  });

  it("correctly checks if a piece is under attack", () => {
    const position = new PositionImpl(
      "r2q1bnr/p1ppk1pp/bNn2p2/1p2p3/3P2Q1/4P3/PPP2PPP/R1B1KBNR b KQ - 5 7"
    );
    expect(position.isAttacked(Squares.e5, Color.BLACK)).toEqual(true);
    expect(position.isAttacked(Squares.d7, Color.BLACK)).toEqual(true);
    expect(position.isAttacked(Squares.a8, Color.BLACK)).toEqual(true);
    expect(position.isAttacked(Squares.g7, Color.BLACK)).toEqual(true);
    expect(position.isAttacked(Squares.b5, Color.BLACK)).toEqual(true);
    expect(position.isAttacked(Squares.d8, Color.BLACK)).toEqual(false);
    expect(position.isAttacked(Squares.f8, Color.BLACK)).toEqual(false);
    expect(position.isAttacked(Squares.g8, Color.BLACK)).toEqual(false);
    expect(position.isAttacked(Squares.h8, Color.BLACK)).toEqual(false);
    expect(position.isAttacked(Squares.h7, Color.BLACK)).toEqual(false);
    expect(position.isAttacked(Squares.f6, Color.BLACK)).toEqual(false);
    expect(position.isAttacked(Squares.e7, Color.BLACK)).toEqual(false);

    expect(position.isAttacked(Squares.b6, Color.WHITE)).toEqual(true);
    expect(position.isAttacked(Squares.d4, Color.WHITE)).toEqual(true);
    expect(position.isAttacked(Squares.g4, Color.WHITE)).toEqual(false);
    expect(position.isAttacked(Squares.e3, Color.WHITE)).toEqual(false);
    expect(position.isAttacked(Squares.f2, Color.WHITE)).toEqual(false);
    expect(position.isAttacked(Squares.g1, Color.WHITE)).toEqual(false);
    expect(position.isAttacked(Squares.h1, Color.WHITE)).toEqual(false);
  });

  it("correctly checks if a piece is under attack", () => {
    const position = new PositionImpl(
      "rnbqkbnr/pppp1ppp/8/4p3/3P4/8/PPP1PPPP/RNBQKBNR w KQkq e6 0 2"
    );
    expect(position.isAttacked(Squares.e5, Color.BLACK)).toEqual(true);
    expect(position.isAttacked(Squares.e5, Color.WHITE)).toEqual(false);
    expect(position.isAttacked(Squares.d4, Color.WHITE)).toEqual(true);
  });

  it("correctly handles the half move clock", () => {
    const position = new PositionImpl(
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w - - 50 1"
    );
    expect(position.state.halfMoveClock).toEqual(50);
    position.makeMove({
      from: Squares.b1,
      to: Squares.c3,
      kind: MoveType.QUIET,
    });
    expect(position.state.halfMoveClock).toEqual(51);
    position.makeMove({
      from: Squares.a7,
      to: Squares.a6,
      kind: MoveType.QUIET,
    });
    expect(position.state.halfMoveClock).toEqual(0);
    position.makeMove({
      from: Squares.c3,
      to: Squares.d5,
      kind: MoveType.QUIET,
    });
    expect(position.state.halfMoveClock).toEqual(1);
    position.makeMove({
      from: Squares.g8,
      to: Squares.f6,
      kind: MoveType.QUIET,
    });
    expect(position.state.halfMoveClock).toEqual(2);
    position.makeMove({
      from: Squares.d5,
      to: Squares.e7,
      kind: MoveType.CAPTURE,
    });
    expect(position.state.halfMoveClock).toEqual(0);
  });

  it("makes an enpassant capture", () => {
    const position = new PositionImpl(
      "rnbqkbnr/pp1p1ppp/8/2pPp3/8/8/PPP1PPPP/RNBQKBNR w KQkq c6 0 3"
    );

    position.makeMove({
      from: Squares.d5,
      to: Squares.c6,
      kind: MoveType.EN_PASSANT,
    });

    expect(position.board.w.piece.toString(2)).toEqual(
      "1000000000000000000000000000001110111111111111"
    );
    expect(position.board.w.pawn.toString(2)).toEqual(
      "1000000000000000000000000000001110111100000000"
    );
    expect(position.board.b.piece.toString(2)).toEqual(
      "1111111111010111000000000000100000000000000000000000000000000000"
    );
    expect(position.board.b.pawn.toString(2)).toEqual(
      "11010111000000000000100000000000000000000000000000000000"
    );
  });

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

  it("makes a double pawn push", () => {
    const position = new PositionImpl(
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b - - 0 1"
    );
    position.makeMove({
      from: Squares.a2,
      to: Squares.a4,
      kind: MoveType.DOUBLE_PAWN_PUSH,
    });
    expect(position.board.w.piece.toString(2)).toEqual(
      "10000000000000000111111111111111"
    );
    expect(position.board.w.pawn.toString(2)).toEqual(
      "10000000000000000111111100000000"
    );
    // TODO: update enpassant square test
  });

  it("generates enpassant attack", () => {
    const position = new PositionImpl(
      "rnbqkbnr/pp1p1ppp/8/2pPp3/8/8/PPP1PPPP/RNBQKBNR w KQkq c6 0 3"
    );
    expect(
      position
        .generatePawnAttacks(BigInt(Squares.d5), "w")
        .map((a) => a.to)
        .reduce((a, b) => a | b)
        .toString(2)
    ).toEqual(Squares.c6.toString(2));
  });

  it("generates pawn attacks for black if they attack white pieces", () => {
    const position = new PositionImpl(
      "rn2kbn1/p1p1ppp1/3rq3/1p1Q1b1p/P1PP1B1P/4R3/1P2PPP1/RN2KBN1 b Qq a3 0 10"
    );
    expect(
      position
        .generatePawnAttacks(Squares.b5, "b")
        .map((a) => a.to)
        .reduce((a, b) => a | b)
        .toString(2)
    ).toEqual("10100000000000000000000000000000");
  });

  it("generates pawn attacks for white if they attack black pieces", () => {
    const position = new PositionImpl(
      "rn2kbn1/p1p1ppp1/2r1q3/1p1Q1b1p/2PP1B1P/4R3/PP2PPP1/RN2KBN1 b Qq c3 0 9"
    );
    expect(
      position
        .generatePawnAttacks(Squares.c4, "w")
        .map((a) => a.to)
        .reduce((a, b) => a | b)
        .toString(2)
    ).toEqual(Squares.b5.toString(2));
  });

  it("generates queen moves", () => {
    const position = new PositionImpl(
      "rn2kbn1/ppp1pp2/2r1q1p1/3Q1b1p/3P1B1P/4R3/PPP1PPP1/RN2KBN1 w Qq - 0 9"
    );
    expect(
      position
        .generateQueenMoves(Squares.d5, "w")
        .map((a) => a.to)
        .reduce((a, b) => a | b)
        .toString(2)
    ).toEqual("1000000010000001110001110110000101000010001000000000000000000");
  });

  it("generates black rook moves and attacks on white pieces", () => {
    const position = new PositionImpl(
      "rn1qkbn1/ppp1ppp1/2r5/3p1bBp/3P3P/4R3/PPP1PPP1/RN1QKBN1 b Qq - 5 6"
    );
    expect(
      position
        .generateRookMoves(Squares.c6, "b")
        .map((a) => a.to)
        .reduce((a, b) => a | b)
        .toString(2)
    ).toEqual("110111110010000000100000001000000010000000000000");
  });

  it("generates white rook moves and attacks on black pieces", () => {
    const position = new PositionImpl(
      "rn1qkbn1/ppp1ppp1/6r1/3p1b1p/3P1B1P/4R3/PPP1PPP1/RN1QKBN1 w Qq - 4 6"
    );
    expect(
      position
        .generateRookMoves(Squares.e3, "w")
        .map((a) => a.to)
        .reduce((a, b) => a | b)
        .toString(2)
    ).toEqual("1000000010000000100000001000111101110000000000000000");
  });

  it("generates black bishop attacks on white pieces", () => {
    const position = new PositionImpl(
      "rn1qkbnr/ppp1pppp/8/3p1bB1/3P4/8/PPP1PPPP/RN1QKBNR b KQkq - 3 3"
    );
    expect(
      position
        .generateBishopMoves(Squares.f5, "b")
        .map((a) => a.to)
        .reduce((a, b) => a | b)
        .toString(2)
    ).toEqual("10000000010000000010100000000000001010000100010010000000000000");
  });

  it("generate white bishop attacks on black pieces", () => {
    const position = new PositionImpl(
      "rnbqkbnr/ppp1pp1p/6p1/3p4/3P1B2/8/PPP1PPPP/RN1QKBNR w KQkq - 0 3"
    );
    expect(
      position
        .generateBishopMoves(Squares.f4, "w")
        .map((a) => a.to)
        .reduce((a, b) => a | b)
        .toString(2)
    ).toEqual("100000000100010000101000000000000010100001000000100000");
  });

  it("generates no bishop moves if contained by own pieces", () => {
    const position = new PositionImpl(
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    );
    expect(position.generateBishopMoves(Squares.c1, "w")).toEqual([]);
  });

  it("generates bishop moves that stop at a collision", () => {
    const position = new PositionImpl(
      "rnbqk1nr/bppp1ppp/p3p3/P7/8/4PP2/1PPP2PP/RNBQKBNR b KQkq - 0 5"
    );
    expect(
      position
        .generateBishopMoves(Squares.a7, "b")
        .map((a) => a.to)
        .reduce((a, b) => a | b)
        .toString(2)
    ).toEqual("10000000010000000010000000010000000000000000000");
  });

  it("doesn't generate black pawn moves that result in collisions", () => {
    const position = new PositionImpl(
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b - - 0 1"
    );
    expect(position.generatePawnMoves(Squares.h3, "b")).toEqual([]);
  });

  it("doesn't generate white pawn moves that result in collisions", () => {
    const position = new PositionImpl(
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b - - 0 1"
    );
    expect(
      position
        .generatePawnMoves(Squares.a5, "b")
        .map((a) => a.to)
        .reduce((a, b) => a | b)
        .toString(2)
    ).toEqual(Squares.a4.toString(2));
  });

  it("generates single and double push black pawn moves", () => {
    const position = new PositionImpl(
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b - - 0 1"
    );
    expect(
      position
        .generatePawnMoves(Squares.h7, "b")
        .map((a) => a.to)
        .reduce((a, b) => a | b)
        .toString(2)
    ).toEqual("10000000100000000000000000000000000000000");
  });

  it("generates single and double push white pawn moves", () => {
    const position = new PositionImpl(
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b - - 0 1"
    );
    expect(
      position
        .generatePawnMoves(Squares.a2, "w")
        .map((a) => a.to)
        .reduce((a, b) => a | b)
        .toString(2)
    ).toEqual("10000000100000000000000000000000");
  });

  it("generates king moves that don't collide with own pieces", () => {
    const position = new PositionImpl(
      "rnk2bn1/p1p1ppp1/3rq3/1p1Q1b1p/PKPP1B1P/4R3/1P2PPP1/RN3BN1 w - - 11 16"
    );
    expect(
      position
        .generateKingMoves(Squares.b4, "w")
        .map((a) => a.to)
        .reduce((a, b) => a | b)
        .toString(2)
    ).toEqual("1110000000000000111000000000000000000000");
  });

  it.skip("generates king moves that don't put the king in check", () => {
    const position = new PositionImpl(
      "rn1k1bn1/p1p1ppp1/3rq3/1pKQ1b1p/P1PP1B1P/4R3/1P2PPP1/RN3BN1 w - - 13 17"
    );
    expect(
      position
        .generateKingMoves(Squares.c5, "w")
        .map((a) => a.to)
        .reduce((a, b) => a | b)
        .toString(2)
    ).toEqual("01000000100000001000000000000000000000000000000");
  });

  it("generates knight moves", () => {
    const position = new PositionImpl(
      "r2k1bn1/p1p1ppp1/3rq3/1pKQNb1p/P1Pn1B1P/4R3/1P2PPP1/RN3B2 w - - 0 19"
    );
    expect(
      position
        .generateKnightMoves(Squares.e5, "w")
        .map((a) => a.to)
        .reduce((a, b) => a | b)
        .toString(2)
    ).toEqual("10100001000100000000000000010000101000000000000000000");
  });

  it("generates knight moves", () => {
    const position = new PositionImpl(
      "r3kbn1/p1p1ppp1/2Nrq3/1pKQ1b1p/P1Pn1B1P/4R3/1P2PPP1/RN3B2 w - - 2 20"
    );
    expect(
      position
        .generateKnightMoves(Squares.c6, "w")
        .map((a) => a.to)
        .reduce((a, b) => a | b)
        .toString(2)
    ).toEqual(
      "101000010001000000000001000100001010000000000000000000000000000"
    );
  });

  it("generates knight moves", () => {
    const position = new PositionImpl(
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    );
    expect(
      position
        .generateKnightMoves(Squares.g1, "w")
        .map((a) => a.to)
        .reduce((a, b) => a | b)
        .toString(2)
    ).toEqual("1010000000000000000");
  });

  it("gets least significant bit", () => {
    const position = new PositionImpl(
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    );
    expect(getLS1B(BigInt(0b00111001010000000)).toString(2)).toEqual(
      Squares.a1.toString(2)
    );
  });

  it("gets least significant bit", () => {
    const position = new PositionImpl(
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    );
    expect(getLS1B(BigInt(0b00111001010110000)).toString(2)).toEqual(
      Squares.d1.toString(2)
    );
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
      castlingRights: {
        K: false,
        Q: false,
        k: false,
        q: false,
      },
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
      castlingRights: {
        K: false,
        Q: false,
        k: false,
        q: false,
      },
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
      castlingRights: {
        K: true,
        Q: true,
        k: true,
        q: true,
      },
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
