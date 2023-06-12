import { CastlingRight } from "../datatypes/move";

export * from "./predicates";

export type PlayerColor = "w" | "b";

export type CastlingRights = { [key in CastlingRight]: boolean };

export type EnPassantTarget = string;

export type HalfMoveClock = number;

export type FullMoveNumber = number;
