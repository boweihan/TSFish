import { EngineInput } from "../constants";
import { Position, PositionImpl } from "../position";
import timer from "../util/timer";

export default class UCIEngine {
  position: Position;

  constructor() {
    this.position = new PositionImpl();
  }

  public run(line: string) {
    // https://www.wbec-ridderkerk.nl/html/UCIProtocol.html
    // UCI commands are space delimited
    const tokens = line.split(" ");
    const args = tokens.slice(1);

    switch (tokens[0]) {
      case EngineInput.SETOPTION:
        // not implemented
        break;
      case EngineInput.UCINEWGAME:
        this.position = new PositionImpl();
        break;
      case EngineInput.POSITION:
        const mode = args[0];

        if (mode === "fen") {
          const fen = args.slice(1).join(" ");
          this.position = new PositionImpl(fen);
        } else if (mode === "startpos") {
          this.position = new PositionImpl();
        } else {
          console.log("Unknown Engine Position Mode.");
        }

        const moves = line
          .split("moves ")[1]
          ?.split(" ")
          .filter((move) => {
            return move !== "";
          });

        moves?.forEach((move) => {
          this.position.makeMove(this.position.parseUCIMove(move));
        });

        break;
      case EngineInput.GO:
        const commands = args;

        if (commands[0] === EngineInput.PERFT) {
          let depth = parseInt(args[1]);

          if (isNaN(depth)) {
            depth = 1;
          }

          const start = performance.now();

          const nodes = this.position.perft({
            depth,
          });

          const end = performance.now();
          const time = end - start;

          console.log(`Depth: ${depth} | Nodes: ${nodes} | Time: ${time}ms`);

          // timer.print(); // uncomment for detailed profiling

          // timer.reset();

          return;
        }

        for (let i = 0; i < commands.length; i++) {
          const command = commands[i];

          // https://backscattering.de/chess/uci/
          if (command === "wtime") {
            // do something
          } else if (command === "btime") {
            // do something
          } else if (command === "winc") {
            // do something
          } else if (command === "binc") {
            // do something
          } else if (command === "movestogo") {
            // do something
          } else if (command === "depth") {
            // do something
          } else if (command === "nodes") {
            // do something
          } else if (command === "mate") {
            // do something
          } else if (command === "movetime") {
            // do something
          } else if (command === "infinite") {
            // do something
          } else if (command === "ponder") {
            // do something
          } else if (command === "searchmoves") {
            // do something
          }
        }

        // start calculating
        console.log(`bestmove ${this.position.search()}`);

        break;
      case EngineInput.STOP:
        console.log(`bestmove ${this.position.search()}`);
        break;
      case EngineInput.PONDERHIT:
        // not implemented
        break;
      default:
        // send to engine thread
        console.log("Unknown Engine UCI Command.");
        break;
    }
  }
}
