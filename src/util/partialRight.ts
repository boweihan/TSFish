export const partialRight = (fn: Function, ...presetArgs: any[]) =>
  function partiallyApplied(...laterArgs: any[]) {
    return fn(...laterArgs, ...presetArgs);
  };
