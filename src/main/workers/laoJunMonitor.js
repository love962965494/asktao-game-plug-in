const { parentPort } = require('worker_threads')
const path = require('path')
const { exec } = require('child_process');
const playSound = require('play-sound')(opts = {});
const { MyPromise } = require('../../distUtils/customizePromise')

const pinTu = path.join(__dirname, '../../../python/images/GUIElements/laoJunRelative/pinTu.png')
const xuanZe = path.join(__dirname, '../../../python/images/GUIElements/laoJunRelative/xuanZe.png')
const zhuanQuan = path.join(__dirname, '../../../python/images/GUIElements/laoJunRelative/zhuanQUan.png')
const laoJunMp3 = path.join(__dirname, '../../../static/laojun.mp3')
const scriptPath = path.join(__dirname, '../../../python/findImageWithinTemplate.py')

parentPort.on('message', async ({ payload }) => {
  const { filePath } = payload

  const promise1 = MyPromise((resolve, reject) => {
    exec(`python -u ${scriptPath} ${filePath} ${pinTu}`, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(stdout.trim() === 'True')
    });
  })

  const promise2 = MyPromise((resolve, reject) => {
    exec(`python -u ${scriptPath} ${filePath} ${xuanZe}`, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(stdout.trim() === 'True')
    });
  })
  
  const promise3 = MyPromise((resolve, reject) => {
    exec(`python -u ${scriptPath} ${filePath} ${zhuanQuan}`, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(stdout.trim() === 'True')
    });
  })

  Promise.all([promise1, promise2, promise3]).then((results) => {
    if (results.filter(Boolean).length > 0) {
      playSound.play(laoJunMp3);
    }
  })
})
