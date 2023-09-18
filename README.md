# TSFish

TSFish is a chess engine with a UCI interface, written with TypeScript and NodeJS, intended for use as a bot on Lichess.org.

**_2023/09/14 update - TSFish now runs on [Bun](https://bun.sh/)._**

To install bun:

`curl -fsSL https://bun.sh/install | bash # for macOS, Linux, and WSL`

To run in development mode:

`bun start`

To build:

`bun run build`

to run the build:

`bun run build:exec`

to run tests:

`bun test`

## Implementation Notes

Interface

- UCI - https://backscattering.de/chess/uci/

Multi-threading (`src/worker`)

- NodeJS supports a form of parallelism with worker_threads, with which you can spawn separate processes to execute code. This isn't traditional multi-threading in the sense that threads can't access the execution context of their parents but worker_threads can communicate to eachother by passing events.

Board representation (`src/datatypes`)

- Bitboards represented as 64 bit BigInts. Manual enforcement of 64 bit maximum. JavaScript supports bitwise operations which makes it efficient to perform operations such as checking the existence of a piece. Shifting bits on a bitboard is an efficient way to generate moves for a piece.

Game State (`src/position`)

- The Position class is responsible for game state, board tracking, and move making.

Move generation (`src/generator`)

- Move generation uses pre-generated move caches but calculates around collisions and captures at runtime.
- Move generation is done in a pseudo-legal manner (doesn't consider checks and pins at generation time) with the exception of castling, in which intermediate steps are "check"ed.
- Pseudo-legal moves are pruned for legality post-generation in the `generateMoves()` function.

Search (`src/search`)

- Search uses a simplified Alpha-Beta algorithm (https://www.chessprogramming.org/Alpha-Beta) using the NegaMax framework.

Evaluation (`src/search`)

- Evaluation uses a symmetric evaluation function in which pieces have weighted scores and the algorithm is essentially `score = sum(scores_side) - sum(scores_opposing_side)`

## PERFT Benchmarks from startpos (approximate, on my dev laptop)

09/17/2023 - optimize around king moves and pinned pieces

- Perft(1) - 0.55 ms
- Perft(2) - 1.4 ms
- Perft(3) - 22 ms
- Perft(4) - 339 ms
- Perft(5) - 10 s

06/15/2023

- Perft(1) - 2.7 ms
- Perft(2) - 13.1 ms
- Perft(3) - 165 ms
- Perft(4) - 2.73 s
- Perft(5) - 63 s (definitely some room for improvement here!)

06/08/2023

- Perft(5) - 141.894s - 155256461 (with invalid moves)
- Perft(4) - 3.144s - 3347643 (with invalid moves)

## Improvements TBD

- Magic bitboards to speed up move generation of sliding pieces
- Quiescence search addition to search
- Improved evaluation function
- Support opening books
- Support endgame tablebases
