export const countOccurrences = (str: string, char: string) => {
  return str.split(char).length - 1;
};
