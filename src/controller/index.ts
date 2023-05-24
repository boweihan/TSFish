import readline from "readline";
import { EngineInput, EngineOutput } from "../constants";

export default class UCIController {
  rl: readline.Interface;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false,
    });
  }

  start() {
    console.log("Welcome to TSFish!");

    this.rl.on("line", (line) => {
      switch (line) {
        case EngineInput.UCI:
          console.log(
            `${EngineOutput.ID} name TSFish`,
            `${EngineOutput.ID} author Bowei Han`,
            EngineOutput.UCIOK
          );
          break;
        case EngineInput.ISREADY:
          console.log(EngineOutput.READYOK);
          break;
        case EngineInput.DEBUG:
          // not implemented
          break;
        case EngineInput.REGISTER:
          // not implemented
          break;
        case EngineInput.STOP:
          // not implemented
          break;
        case EngineInput.PONDERHIT:
          // not implemented
          break;
        case EngineInput.QUIT:
          console.log("Thanks for using TSFish! Exiting...");
          process.exit(0);
          break;
        default:
          // send to engine thread
          console.log(line);
          break;
      }
    });
  }
}
