export interface SearchStrategy {
  search: (position: Position) => string;
}

export { default as MiniMax } from "./minimax";
