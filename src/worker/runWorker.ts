import { Worker } from "worker_threads";

type WorkerCallback = (err: any, result?: any) => any;

const runWorker = (
  path: string,
  cb: WorkerCallback,
  workerData: object | null = null
) => {
  const worker = new Worker(path, { workerData });
  worker.on("message", cb.bind(null, null));
  worker.on("error", cb);
  worker.on("exit", (exitCode) => {
    console.log("worker exiting", exitCode);
    if (exitCode === 0) {
      return null;
    }
    return cb(new Error(`Worker has stopped with code ${exitCode}`));
  });
  return worker;
};

export default runWorker;
