import readline from "readline";
import { EngineInput, EngineOutput } from "../constants";

export default class UCIEngine {
  private rl: readline.Interface;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false,
    });
  }

  public start() {
    console.log("--- TSFish Engine Started ---");

    this.rl.on("line", (line) => {
      console.log(line);

      switch (line) {
        case EngineInput.SETOPTION:
          // not implemented
          break;
        case EngineInput.UCINEWGAME:
          // not implemented
          break;
        case EngineInput.POSITION:
          // not implemented
          break;
        case EngineInput.GO:
          // not implemented
          break;
        case EngineInput.PERFT:
          // not implemented
          break;
        default:
          // send to engine thread
          console.log("Unknown Engine UCI Command.");
          break;
      }
    });
  }
}
