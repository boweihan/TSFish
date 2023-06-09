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
    engine.run("position");
    engine.run("perft 0");

    expect(logs[0].split(" | ")[1].trim()).toEqual("Nodes: 1");
  });

  it("returns accurate PERFT 1 for default position", () => {
    engine.run("ucinewgame");
    engine.run("position");
    engine.run("perft 1");

    expect(logs[0].split(" | ")[1].trim()).toEqual("Nodes: 20");
  });

  it("returns accurate PERFT 2 for default position", () => {
    engine.run("ucinewgame");
    engine.run("position");
    engine.run("perft 2");

    expect(logs[0].split(" | ")[1].trim()).toEqual("Nodes: 400");
  });

  it("returns accurate PERFT 3 for default position", () => {
    engine.run("ucinewgame");
    engine.run("position");
    engine.run("perft 3");

    expect(logs[0].split(" | ")[1].trim()).toEqual("Nodes: 8902");
  });

  it.skip("returns accurate PERFT 4 for default position", () => {
    engine.run("ucinewgame");
    engine.run("position");
    engine.run("perft 4");

    expect(logs[0].split(" | ")[1].trim()).toEqual("Nodes: 197281");
  });

  it.skip("returns accurate PERFT 5 for default position", () => {
    engine.run("ucinewgame");
    engine.run("position");
    engine.run("perft 5");

    expect(logs[0].split(" | ")[1].trim()).toEqual("Nodes: 4865609");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
