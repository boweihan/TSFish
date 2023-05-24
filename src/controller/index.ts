import readline from "readline";
import path from "path";
import { Worker } from "worker_threads";
import { EngineInput, EngineOutput } from "../constants";
import runWorker from "../util/runWorker";

export default class UCIController {
  private rl: readline.Interface;
  private worker: Worker;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false,
    });
    this.worker = runWorker(
      path.resolve(__dirname, "../engine/worker.js"),
      (err, result) => {
        console.log(err, result);
      }
    );
  }

  public start() {
    console.log("Welcome to TSFish!");

    this.rl.on("line", (line) => {
      // https://www.wbec-ridderkerk.nl/html/UCIProtocol.html
      // UCI commands are space delimited
      const tokens = line.split(" ");

      switch (tokens[0]) {
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
          this.worker.postMessage(line);
          break;
      }
    });
  }
}
