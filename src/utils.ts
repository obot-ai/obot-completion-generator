export const range = (length: number, startAt: number) => {
  return Array.from(Array(length).keys()).map((num: number) => (num + startAt))
}
