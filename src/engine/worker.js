const path = require("path");

// https://www.calebpitan.com/blog/the-magic-of-using-typescript-at-runtime
require("ts-node").register();
require(path.resolve(__dirname, "worker.ts"));
