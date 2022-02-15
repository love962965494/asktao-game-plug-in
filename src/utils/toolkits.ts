export function simpleCloneKeep<T>(data: T): T {
  return JSON.parse(JSON.stringify(data))
}

export function sleep(time: number) {
  let start = new Date().getTime()
  while (new Date().getTime() - start < time) {}
}

export function setTimeoutPromise(callback: Function, time: number): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        await callback()
        resolve()
      } catch (error) {
        reject(error)
      }
    }, time)
  })
}
