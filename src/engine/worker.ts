import UCIEngine from "./index";
import { parentPort } from "node:worker_threads";

const engine = new UCIEngine();

parentPort?.on("message", (message) => {
  engine.run(message);
});
