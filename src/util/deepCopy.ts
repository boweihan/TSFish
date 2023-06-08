export const cloneDeep = (obj: any) => {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  const newObj: any = Array.isArray(obj) ? [] : {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      newObj[key] = cloneDeep(obj[key]);
    }
  }
  return newObj;
};
