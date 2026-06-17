import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'

let ffmpegInstance = null

async function getFFmpeg(onLog) {
  if (ffmpegInstance) return ffmpegInstance
  const ffmpeg = new FFmpeg()
  if (onLog) ffmpeg.on('log', ({ message }) => onLog(message))
  // Load core from CDN as blob URLs (avoids CORS / COEP issues)
  const base = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd'
  await ffmpeg.load({
    coreURL: await toBlobURL(`${base}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${base}/ffmpeg-core.wasm`, 'application/wasm'),
  })
  ffmpegInstance = ffmpeg
  return ffmpeg
}

export async function extractAudio(videoFile, onLog) {
  const ff = await getFFmpeg(onLog)
  const ext = videoFile.name?.split('.').pop() || 'mp4'
  await ff.writeFile(`input.${ext}`, await fetchFile(videoFile))
  await ff.exec(['-i', `input.${ext}`, '-vn', '-acodec', 'libmp3lame', '-q:a', '4', 'audio.mp3'])
  const data = await ff.readFile('audio.mp3')
  return new Blob([data.buffer], { type: 'audio/mpeg' })
}

export async function mergeAudioWithVideo(videoFile, audioBlob, onLog) {
  const ff = await getFFmpeg(onLog)
  const ext = videoFile.name?.split('.').pop() || 'mp4'
  await ff.writeFile(`input.${ext}`, await fetchFile(videoFile))
  await ff.writeFile('dubbed.mp3', await fetchFile(audioBlob))
  await ff.exec([
    '-i', `input.${ext}`,
    '-i', 'dubbed.mp3',
    '-c:v', 'copy',
    '-c:a', 'aac',
    '-map', '0:v:0',
    '-map', '1:a:0',
    '-shortest',
    'output.mp4',
  ])
  const data = await ff.readFile('output.mp4')
  return new Blob([data.buffer], { type: 'video/mp4' })
}
