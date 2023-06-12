import { PlayerColor } from ".";

export function isValidPlayerColor(input: string): input is PlayerColor {
  return input === "w" || input === "b";
}

export function isValidCastlingRights(input: string): input is string {
  const specialChars = /^[KkQq-]*$/;
  return specialChars.test(input);
}

export function isNumber(input: number): input is number {
  return !isNaN(input);
}
