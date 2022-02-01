import fs from 'fs/promises'

export async function deleteDir(path: string) {
  try {
    await fs.access(path)
    const files = await fs.readdir(path)

    for (const file of files) {
      const currentPath = path + '/' + file
      const stats = await fs.stat(currentPath)

      if (stats.isDirectory()) {
        await deleteDir(currentPath)
      } else {
        await fs.unlink(currentPath)
      }
    }

    await fs.rmdir(path)
  } catch (error) {
    console.log('deleteDir error: ', error)
  }
}
