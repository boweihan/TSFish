import { DefaultFEN, EngineInput } from "../constants";
import { Position, PositionImpl } from "../position";

export default class UCIEngine {
  position: Position;

  constructor() {
    this.position = new PositionImpl();
  }

  public run(line: string) {
    // https://www.wbec-ridderkerk.nl/html/UCIProtocol.html
    // UCI commands are space delimited
    const tokens = line.split(" ");

    switch (tokens[0]) {
      case EngineInput.SETOPTION:
        // not implemented
        break;
      case EngineInput.UCINEWGAME:
        this.position = new PositionImpl();
        break;
      case EngineInput.POSITION:
        const args = tokens.slice(1);
        const mode = args[0];

        if (mode === "fen") {
          const fen = args.slice(1).join(" ");
          this.position = new PositionImpl(fen);
        } else if (mode === "startpos") {
          this.position = new PositionImpl(DefaultFEN);
        } else {
          console.log("Unknown Engine Position Mode.");
        }
        break;
      case EngineInput.GO:
        break;
      case EngineInput.PERFT:
        let depth = parseInt(tokens[1]);

        if (isNaN(depth)) {
          depth = 1;
        }

        const start = performance.now();

        const nodes = this.position.perft(depth);

        const end = performance.now();
        const time = end - start;

        console.log(`Depth: ${depth} | Nodes: ${nodes} | Time: ${time}ms`);
        break;
      default:
        // send to engine thread
        console.log("Unknown Engine UCI Command.");
        break;
    }
  }
}
