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
        let fen = tokens.slice(1).join(" ");
        if (tokens[1] === EngineInput.STARTPOS) {
          fen = DefaultFEN;
        }
        this.position = new PositionImpl(fen);
        break;
      case EngineInput.GO:
        break;
      case EngineInput.PERFT:
        new PositionImpl().perft(1);
        break;
      default:
        // send to engine thread
        console.log("Unknown Engine UCI Command.");
        break;
    }
  }
}
