import UCIEngine from "../src/engine";

// TODO: integration tests
describe.skip("UCIEngine", () => {
  let engine: UCIEngine;
  let logs: Array<string> = [];

  beforeEach(() => {
    jest.spyOn(console, "log").mockImplementation((log) => {
      logs.push(log);
    });
    engine = new UCIEngine();
    logs = [];
  });

  it("returns the default position", () => {
    engine.run("position");
  });

  it("starts a new game", () => {
    engine.run("ucinewgame");
    engine.run("position");
  });

  it("starts from a custom position", () => {
    const fen = "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1";
    engine.run(`position ${fen}`);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
