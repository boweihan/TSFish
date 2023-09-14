import { describe, beforeEach, expect, it, mock } from "bun:test";
import UCIController from "../src/controller";

describe("UCIController", () => {
  let controller: UCIController;
  let logs: Array<string> = [];

  beforeEach(() => {
    console.log = mock((l) => logs.push(l));
    process.exit = mock((code) => {
      throw new Error();
    });
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
