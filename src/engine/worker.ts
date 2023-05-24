import UCIEngine from "./index";
import { parentPort } from "worker_threads";

const engine = new UCIEngine();

parentPort?.on("message", (message) => {
  engine.run(message);
});
