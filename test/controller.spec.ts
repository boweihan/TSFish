import UCIController from "../src/controller";

describe("UCIController", () => {
  let controller: UCIController;
  let logs: Array<string> = [];

  beforeEach(() => {
    jest.spyOn(console, "log").mockImplementation((log) => {
      logs.push(log);
    });
    // @ts-ignore
    jest.spyOn(process, "exit").mockImplementation(() => {});
    controller = new UCIController();
    logs = [];
  });

  it("starts the UCIEngine", () => {
    controller.start();
    expect(logs[0]).toBe("Welcome to TSFish!");
  });

  it("identifies itself with UCIOK", () => {
    controller.start();
    controller.processUCICommand("uci");
    expect(logs[1]).toBe("id name TSFish");
    expect(logs[2]).toBe("id author Bowei Han");
    expect(logs[3]).toBe("uciok");
  });

  it("responds that it is READYOK", () => {
    controller.start();
    controller.processUCICommand("isready");
    expect(logs[1]).toBe("readyok");
  });
});
