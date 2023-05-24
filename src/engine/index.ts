import { EngineInput } from "../constants";
import { Position, PositionImpl } from "../datatypes";

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
        this.position = new PositionImpl(tokens.slice(1).join(" "));
        console.log(this.position.fen);
        break;
      case EngineInput.GO:
        console.log(this.position.fen);
        break;
      case EngineInput.PERFT:
        // not implemented
        break;
      default:
        // send to engine thread
        console.log("Unknown Engine UCI Command.");
        break;
    }
  }
}
