
import express from 'express'
import multer from 'multer'
import { spawn } from 'node:child_process'
import {
  mkdtemp,
  writeFile,
  readFile,
  rm
} from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'

const app = express()
const PORT = process.env.PORT || 7860

app.disable('x-powered-by')
app.use(express.json({ limit: '10kb' }))

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024,
    files: 1
  }
})

const routes = {
  '/mp4tomp3': {
    codec: 'libmp3lame',
    format: 'mp3',
    bitrate: '192k',
    mimetype: 'audio/mpeg',
    filename: 'audio.mp3'
  },

  '/mp4towav': {
    codec: 'pcm_s16le',
    format: 'wav',
    mimetype: 'audio/wav',
    filename: 'audio.wav'
  },

  '/mp4tovn': {
    codec: 'libopus',
    format: 'ogg',
    bitrate: '64k',
    mimetype: 'audio/ogg; codecs=opus',
    filename: 'voice.ogg'
  },

  '/audiotovn': {
    codec: 'libopus',
    format: 'ogg',
    bitrate: '64k',
    mimetype: 'audio/ogg; codecs=opus',
    filename: 'voice.ogg'
  },

  '/tovn': {
    codec: 'libopus',
    format: 'ogg',
    bitrate: '64k',
    mimetype: 'audio/ogg; codecs=opus',
    filename: 'voice.ogg'
  }
}

function runFFmpeg(input, output, config) {
  return new Promise((resolve, reject) => {
    const args = [
      '-nostdin',
      '-hide_banner',
      '-loglevel', 'error',
      '-y',
      '-i', input,
      '-map', '0:a:0',
      '-vn'
    ]

    if (config.codec === 'libopus') {
      args.push(
        '-c:a', 'libopus',
        '-b:a', config.bitrate,
        '-vbr', 'on',
        '-compression_level', '10',
        '-application', 'voip',
        '-f', 'ogg'
      )
    } else if (config.codec === 'libmp3lame') {
      args.push(
        '-c:a', 'libmp3lame',
        '-b:a', config.bitrate,
        '-f', 'mp3'
      )
    } else {
      args.push(
        '-c:a', config.codec,
        '-f', config.format
      )
    }

    args.push(output)

    const process = spawn('ffmpeg', args, {
      stdio: ['ignore', 'ignore', 'pipe']
    })

    let error = ''
    let settled = false

    const timer = setTimeout(() => {
      process.kill('SIGKILL')
      finish(new Error('Conversion timeout'))
    }, 120000)

    function finish(err) {
      if (settled) return
      settled = true
      clearTimeout(timer)
      err ? reject(err) : resolve()
    }

    process.stderr.on('data', chunk => {
      error += chunk.toString()
      if (error.length > 8000) {
        error = error.slice(-8000)
      }
    })

    process.on('error', finish)

    process.on('close', code => {
      if (code === 0) return finish()
      finish(new Error(error || `FFmpeg exited: ${code}`))
    })
  })
}

app.get('/', (req, res) => {
  res.json({
    message: 'Rebot Converter API',
    owner: 'Rebot',
    status: 'online',
    uptime: Math.floor(process.uptime()),
    path: Object.keys(routes)
  })
})

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'rebot-converter'
  })
})

async function convert(req, res, config) {
  let dir

  try {
    if (!req.file?.buffer?.length) {
      return res.status(400).json({
        status: false,
        message: 'File is required. Use multipart field: file'
      })
    }

    dir = await mkdtemp(join(tmpdir(), 'rebot-'))

    const input = join(dir, 'input')
    const output = join(dir, config.filename)

    await writeFile(input, req.file.buffer)

    await runFFmpeg(input, output, config)

    const result = await readFile(output)

    if (!result.length) {
      throw new Error('Empty conversion result')
    }

    res.set({
      'Content-Type': config.mimetype,
      'Content-Length': result.length,
      'Content-Disposition':
        `attachment; filename="${config.filename}"`,
      'Cache-Control': 'no-store',
      'X-Request-Id': randomUUID()
    })

    return res.send(result)

  } catch (error) {
    console.error('[CONVERTER]', error.message)

    if (!res.headersSent) {
      return res.status(422).json({
        status: false,
        message: 'Failed to convert media',
        error: error.message
      })
    }
  } finally {
    if (dir) {
      await rm(dir, {
        recursive: true,
        force: true
      }).catch(() => {})
    }
  }
}

for (const [path, config] of Object.entries(routes)) {
  app.post(
    path,
    upload.single('file'),
    (req, res) => convert(req, res, config)
  )
}

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      status: false,
      message: err.message
    })
  }

  console.error('[SERVER]', err)

  if (!res.headersSent) {
    res.status(500).json({
      status: false,
      message: 'Internal server error'
    })
  }
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╭──────────────────────────────╮
│       REBOT CONVERTER        │
├──────────────────────────────┤
│ Status : ONLINE              │
│ Port   : ${PORT}                 │
│ Engine : FFmpeg              │
╰──────────────────────────────╯
  `)
})
