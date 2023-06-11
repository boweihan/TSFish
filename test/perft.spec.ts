import UCIEngine from "../src/engine";

describe("PERFT", () => {
  let engine: UCIEngine;
  let logs: Array<string> = [];

  beforeEach(() => {
    jest.spyOn(console, "log").mockImplementation((log) => {
      logs.push(log);
    });
    engine = new UCIEngine();
    logs = [];
  });

  it("returns accurate PERFT 0 for default position", () => {
    engine.run("ucinewgame");
    engine.run("position startpos");
    engine.run("perft 0");

    expect(logs[0].split(" | ")[1].trim()).toEqual("Nodes: 1");
  });

  it("returns accurate PERFT 1 for default position", () => {
    engine.run("ucinewgame");
    engine.run("position startpos");
    engine.run("perft 1");

    expect(logs[0].split(" | ")[1].trim()).toEqual("Nodes: 20");
  });

  it("returns accurate PERFT 2 for default position", () => {
    engine.run("ucinewgame");
    engine.run("position startpos");
    engine.run("perft 2");

    expect(logs[0].split(" | ")[1].trim()).toEqual("Nodes: 400");
  });

  it("returns accurate PERFT 3 for default position", () => {
    engine.run("ucinewgame");
    engine.run("position startpos");
    engine.run("perft 3");

    expect(logs[0].split(" | ")[1].trim()).toEqual("Nodes: 8902");
  });

  it("returns accurate PERFT 4 for default position", () => {
    engine.run("ucinewgame");
    engine.run("position startpos");
    engine.run("perft 4");

    expect(logs[0].split(" | ")[1].trim()).toEqual("Nodes: 197281");
  });

  it("returns accurate PERFT 1 for promotion position", () => {
    engine.run(
      "position fen rnbq1bnr/ppppP1pp/5k2/8/8/2K5/PPP1pPPP/RNBQ1BNR w - - 0 8"
    );
    engine.run("perft 1");

    expect(logs[0].split(" | ")[1].trim()).toEqual("Nodes: 47");
  });

  it("returns accurate PERFT 2 for promotion position", () => {
    engine.run(
      "position fen rnbq1bnr/ppppP1pp/5k2/8/8/2K5/PPP1pPPP/RNBQ1BNR w - - 0 8"
    );
    engine.run("perft 2");

    expect(logs[0].split(" | ")[1].trim()).toEqual("Nodes: 1412");
  });

  it("returns accurate PERFT 3 for promotion position", () => {
    engine.run(
      "position fen rnbq1bnr/ppppP1pp/5k2/8/8/2K5/PPP1pPPP/RNBQ1BNR w - - 0 8"
    );
    engine.run("perft 3");

    expect(logs[0].split(" | ")[1].trim()).toEqual("Nodes: 58478");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
