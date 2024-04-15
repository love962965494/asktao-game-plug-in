let pausePromiseCounter = 0;
const pausePromiseResolveMap = new Map();

export async function MyPromise<T>(callback: (resolve: (value: T) => void, reject: (reason?: any) => void) => void) {
  await checkPause()
  return new Promise(callback)
}

function checkPause(): Promise<void> {
  if (!global.appContext.isInterrupted) {
    return Promise.resolve()
  }

  return MyPromise<void>(resolve => {
    const currentPromiseId = ++pausePromiseCounter;
    pausePromiseResolveMap.set(currentPromiseId, () => {
      pausePromiseResolveMap.delete(currentPromiseId);
      resolve();
    });
  })
}

function executePauseResolveMap() {
  if (!global.appContext.isInterrupted) {
    pausePromiseResolveMap.forEach(resolve => resolve())
    pausePromiseResolveMap.clear()
  }
}