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

// ============================================================
// REBOT PICSUM - 100 FOTO
// ============================================================
const photos = [
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e",
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05",
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
  "https://images.unsplash.com/photo-1472214103451-9374bd1c798e",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba",
  "https://images.unsplash.com/photo-1518837695005-2083093ee35b",
  "https://images.unsplash.com/photo-1501594907352-04cda38ebc29",
  "https://images.unsplash.com/photo-1508739773434-c26b3d09e071",
  "https://images.unsplash.com/photo-1502082553048-f009c37129b9",
  "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d",
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1",
  "https://images.unsplash.com/photo-1483729558449-99ef09a8c325",
  "https://images.unsplash.com/photo-1493246507139-91e8fad9978e",
  "https://images.unsplash.com/photo-1497436072909-60f360e1d4b1",
  "https://images.unsplash.com/photo-1493246507139-91e8fad9978e",
  "https://images.unsplash.com/photo-1502920917128-1aa500764cbd",
  "https://images.unsplash.com/photo-1518241353330-0f7941c2f7fa",
  "https://images.unsplash.com/photo-1504198458649-3128b932f49e",
  "https://images.unsplash.com/photo-1518098268026-4e89f1a2cd8e",
  "https://images.unsplash.com/photo-1523712999610-f77fbcfc384",
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
  "https://images.unsplash.com/photo-1521295121783-8a321d551ad2",
  "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e",
  "https://images.unsplash.com/photo-1524492412937-b28074a5d7da",
  "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d",
  "https://images.unsplash.com/photo-1518709268805-4e9042af9f23",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9",
  "https://images.unsplash.com/photo-1517842645767-c639042777db",
  "https://images.unsplash.com/photo-1518791841217-8f162f1e1131",
  "https://images.unsplash.com/photo-1519689680058-324335c77eba",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
  "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f",
  "https://images.unsplash.com/photo-1526947425960-945c6e72858f",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
  "https://images.unsplash.com/photo-1531297484001-80022131f5a1",
  "https://images.unsplash.com/photo-1533105079780-92b9be482077",
  "https://images.unsplash.com/photo-1533050487297-09b450131914",
  "https://images.unsplash.com/photo-1533038590840-1cde6e668a91",
  "https://images.unsplash.com/photo-1533929736458-ca588d08c8be",
  "https://images.unsplash.com/photo-1534126511673-b6899657816a",
  "https://images.unsplash.com/photo-1534351590666-13e3e96b5017",
  "https://images.unsplash.com/photo-1534447677768-be436bb09401",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde",
  "https://images.unsplash.com/photo-1536782376847-5c9d14d97cc0",
  "https://images.unsplash.com/photo-1536987333706-fc9adfb10d5",
  "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6",
  "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e",
  "https://images.unsplash.com/photo-1541961017774-22349e4a1262",
  "https://images.unsplash.com/photo-1542038784456-1ea8e935640e",
  "https://images.unsplash.com/photo-1542051841857-5f90071e7989",
  "https://images.unsplash.com/photo-1542838776-a7c6f8e2b1f0",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2",
  "https://images.unsplash.com/photo-1544148103-0773bf10d330",
  "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957",
  "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c",
  "https://images.unsplash.com/photo-1545558014-8692077e9b5c",
  "https://images.unsplash.com/photo-1546182990-dffeafbe841d",
  "https://images.unsplash.com/photo-1547036967-23d11aacaee0",
  "https://images.unsplash.com/photo-1547891654-e66ed7ebb968",
  "https://images.unsplash.com/photo-1548013146-72479768bada",
  "https://images.unsplash.com/photo-1548199973-03cce0bbc87b",
  "https://images.unsplash.com/photo-1548240693-c7c69d3d0f5a",
  "https://images.unsplash.com/photo-1549366021-9f761d450615",
  "https://images.unsplash.com/photo-1550745165-9bc0b252726f",
  "https://images.unsplash.com/photo-1550751827-4bd374c3f58b",
  "https://images.unsplash.com/photo-1551009175-8a68da93d5f9",
  "https://images.unsplash.com/photo-1552058544-f2b08422138a",
  "https://images.unsplash.com/photo-1552519507-da3b142c6e3d",
  "https://images.unsplash.com/photo-1552832230-c0197dd311b5",
  "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a",
  "https://images.unsplash.com/photo-1553522195-1b5f5d2e8e2a",
  "https://images.unsplash.com/photo-1553877522-43269d4ea984",
  "https://images.unsplash.com/photo-1554048612-b6a482bc67e5",
  "https://images.unsplash.com/photo-1554080353-a576cf803bda",
  "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23",
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c",
  "https://images.unsplash.com/photo-1555617981-dac3880eac6e",
  "https://images.unsplash.com/photo-1557672172-298e090bd0f1",
  "https://images.unsplash.com/photo-1557804506-669a67965ba0",
  "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64",
  "https://images.unsplash.com/photo-1558655146-9f40138edfeb",
  "https://images.unsplash.com/photo-1558981403-c5f9899a28bc",
  "https://images.unsplash.com/photo-1558980664-10e7170b5703",
  "https://images.unsplash.com/photo-1559007174-2b7c8a5d1b0a",
  "https://images.unsplash.com/photo-1559757175-5700dde675bc",
  "https://images.unsplash.com/photo-1560015534-cee980ba7e13",
  "https://images.unsplash.com/photo-1560250097-0b93528c311a",
  "https://images.unsplash.com/photo-1560472354-b33ff0c44a43",
  "https://images.unsplash.com/photo-1560769629-975ec94e6a86",
  "https://images.unsplash.com/photo-1561070791-2526d30994b5",
  "https://images.unsplash.com/photo-1561154464-82e9adf32764",
  "https://images.unsplash.com/photo-1561214115-f2f134cc4912",
  "https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8"
]

// Helper buat bikin URL unsplash dengan ukuran
function buildUrl(base, w, h) {
  const width = Math.min(parseInt(w) || 500, 2000)
  const height = Math.min(parseInt(h) || 500, 2000)
  return `${base}?auto=format&fit=crop&w=${width}&h=${height}&q=80`
}

function hashSeed(str) {
  let hash = 0
  for (const c of String(str)) hash = (hash * 31 + c.charCodeAt(0)) >>> 0
  return hash
}

// ============================================================
// ROUTES PICSUM
// ============================================================

// Random: /picsum/500/500 atau /500/500
app.get(['/picsum/:w/:h', '/photo/:w/:h'], (req, res) => {
  const random = photos[Math.floor(Math.random() * photos.length)]
  res.redirect(buildUrl(random, req.params.w, req.params.h))
})

// Seed: /picsum/seed/rebot1/500/500 -> foto selalu sama kalo seed sama
app.get('/picsum/seed/:seed/:w/:h', (req, res) => {
  const idx = hashSeed(req.params.seed) % photos.length
  res.redirect(buildUrl(photos[idx], req.params.w, req.params.h))
})

// By ID: /picsum/id/5/500/500
app.get('/picsum/id/:id/:w/:h', (req, res) => {
  const id = parseInt(req.params.id)
  if (isNaN(id) || id < 0 || id >= photos.length) {
    return res.status(404).json({ status: false, message: `ID harus 0 - ${photos.length - 1}` })
  }
  res.redirect(buildUrl(photos[id], req.params.w, req.params.h))
})

// List JSON kayak picsum: /v2/list?page=1&limit=10
app.get(['/v2/list', '/picsum/list'], (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1)
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 30, 1), 100)
  const start = (page - 1) * limit
  const slice = photos.slice(start, start + limit)
  res.json(slice.map((url, i) => ({
    id: String(start + i),
    author: 'Rebot',
    width: 5000,
    height: 3333,
    url: url,
    download_url: buildUrl(url, 800, 600)
  })))
})

// Info picsum
app.get('/picsum', (req, res) => {
  res.json({
    service: 'Rebot Picsum',
    total: photos.length,
    examples: {
      random: '/picsum/500/500',
      seed: '/picsum/seed/rebot1/500/500',
      by_id: '/picsum/id/0/500/500',
      list: '/v2/list?page=1&limit=10'
    }
  })
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
    path: Object.keys(routes),
    picsum: {
      total_photos: photos.length,
      random: '/picsum/500/500',
      list: '/v2/list?page=1&limit=10'
    }
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