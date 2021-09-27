function toArray<T>(maybeArr: T | T[]): T[] {
  return Array.isArray(maybeArr) ? maybeArr : [maybeArr];
}

/** The maximum is exclusive and the minimum is inclusive */
function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}