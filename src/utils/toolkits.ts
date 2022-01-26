export function simpleCloneKeep<T>(data: T): T {
  return JSON.parse(JSON.stringify(data))
}

export function sleep(time: number) {
  let start = new Date().getTime()
  while (new Date().getTime() - start < time) {}
}
