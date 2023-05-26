export function isNumber(input: number): input is number {
  return !isNaN(input);
}
