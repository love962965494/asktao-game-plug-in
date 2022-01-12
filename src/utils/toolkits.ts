export function simpleCloneKeep<T>(data: T): T {
  return JSON.parse(JSON.stringify(data))
}
