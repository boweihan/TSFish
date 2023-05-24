import { EngineInput, EngineOutput } from "../constants";

export default class UCIEngine {
  public run(line: string) {
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
  }
}
