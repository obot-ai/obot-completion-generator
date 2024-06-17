import type { MatchedKeyword } from "./types"

export const range = (length: number, startAt: number) => {
  return Array.from(Array(length).keys()).map((num: number) => (num + startAt))
}

export const isSameKeyword = (kwA: MatchedKeyword, kwB: MatchedKeyword): boolean => {
  if (
    kwA.text !== kwB.text ||
    kwA.startAt !== kwB.startAt ||
    kwA.endAt !== kwB.endAt
  ) {
    return false
  }
  return true
}
