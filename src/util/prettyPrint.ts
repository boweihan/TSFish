export const prettyPrint = (board: bigint) => {
  const ranks = 8;
  const binaryStr = board.toString(2).padStart(64, "0");

  let result = "";

  for (let rank = 0; rank < ranks; rank++) {
    result +=
      binaryStr
        .slice(rank * 8, rank * 8 + 8)
        .split("")
        .join(" ") + "\n";
  }

  console.log(result);
};
