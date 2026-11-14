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
  "https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8",
  // ada 200 poto
  "https://images.unsplash.com/photo-1465101162946-4377e57745c3",
  "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07",
  "https://images.unsplash.com/photo-1465188162913-8fb5709d6d57",
  "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8",
  "https://images.unsplash.com/photo-1470770841072-f978cf4d019e",
  "https://images.unsplash.com/photo-1470794112992-ee0af8d2e5b4",
  "https://images.unsplash.com/photo-1470813740244-df37b8c1edcb",
  "https://images.unsplash.com/photo-1470075801209-17f9ec0cada6",
  "https://images.unsplash.com/photo-1470246973918-29a93221c455",
  "https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc",
  "https://images.unsplash.com/photo-1470093851219-69951fcbb533",
  "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5",
  "https://images.unsplash.com/photo-1483982258113-b72862e6e2f5",
  "https://images.unsplash.com/photo-1484318571209-661cfeb6d2b6",
  "https://images.unsplash.com/photo-1484704849700-f032a568e944",
  "https://images.unsplash.com/photo-1486078695445-0497c2f58cfe",
  "https://images.unsplash.com/photo-1486427944299-d1955d23e34d",
  "https://images.unsplash.com/photo-1487029752779-a1a37d4a9e2c",
  "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df",
  "https://images.unsplash.com/photo-1489824904134-891ab64532f1",
  "https://images.unsplash.com/photo-1490750967868-88aa4486c946",
  "https://images.unsplash.com/photo-1491002052546-bf38f186af56",
  "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a",
  "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7",
  "https://images.unsplash.com/photo-1493863641943-9b68992a8d07",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
  "https://images.unsplash.com/photo-1495603889485-34c96a5b6a7d",
  "https://images.unsplash.com/photo-1495954484750-af469f2f9be5",
  "https://images.unsplash.com/photo-1496203695688-3b898c242788",
  "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9",
  "https://images.unsplash.com/photo-1499084732479-de2c02d45fc4",
  "https://images.unsplash.com/photo-1499750310107-5fef28a66643",
  "https://images.unsplash.com/photo-1499996860823-5214fcc65f8f",
  "https://images.unsplash.com/photo-1500049242364-5f1f9f5a1b0a",
  "https://images.unsplash.com/photo-1500051638674-ff996a0ec29e",
  "https://images.unsplash.com/photo-1500375592092-40eb2168fd21",
  "https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d",
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429",
  "https://images.unsplash.com/photo-1500634245200-e5245c7574ef",
  "https://images.unsplash.com/photo-1500835556837-99ac94a94552",
  "https://images.unsplash.com/photo-1500964757637-c85e8a162699",
  "https://images.unsplash.com/photo-1501084817091-a4f3d1d19e07",
  "https://images.unsplash.com/photo-1501196357638-7d3d8b5b2b0a",
  "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4",
  "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb",
  "https://images.unsplash.com/photo-1501426026826-31c667bdf23f",
  "https://images.unsplash.com/photo-1501554728187-ce583db33af7",
  "https://images.unsplash.com/photo-1501700493788-fa1a4fc9fe62",
  "https://images.unsplash.com/photo-1501854140801-50d01698950b",
  "https://images.unsplash.com/photo-1501959181532-7d2a603b2d4a",
  "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6",
  "https://images.unsplash.com/photo-1502117859338-fd9daa518a9a",
  "https://images.unsplash.com/photo-1502161254066-6c74afbf07aa",
  "https://images.unsplash.com/photo-1502224562085-639556652f33",
  "https://images.unsplash.com/photo-1502394202744-021cfbb17454",
  "https://images.unsplash.com/photo-1502472584811-0a2f2f7b5b0a",
  "https://images.unsplash.com/photo-1502519144081-acca18599776",
  "https://images.unsplash.com/photo-1502602898657-3e91760cbb34",
  "https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b",
  "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453",
  "https://images.unsplash.com/photo-1502904550040-7534597425ae",
  "https://images.unsplash.com/photo-1503017964651-9d8e3b0b1b0a",
  "https://images.unsplash.com/photo-1503104834685-7205e8607eb9",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
  "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91",
  "https://images.unsplash.com/photo-1508341591423-4347099e1f19",
  "https://images.unsplash.com/photo-1517840901100-8179e982acb7",
  "https://images.unsplash.com/photo-1519689373023-dd07c7988603",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1",
  "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e",
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04",
  "https://images.unsplash.com/photo-1531123897727-8f129e1688ce",
  "https://images.unsplash.com/photo-1533106418989-88406c7cc8ca",
  "https://images.unsplash.com/photo-1533616688419-b7a585564566",
  "https://images.unsplash.com/photo-1533630217389-3a5c05d4f2b6",
  "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c",
  "https://images.unsplash.com/photo-1544006659-f0b21884ce1d",
  "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b",
  "https://images.unsplash.com/photo-1546519638-68e109498ffc",
  "https://images.unsplash.com/photo-1546527868-ccb7ee7dfa6a",
  "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c",
  "https://images.unsplash.com/photo-1548690312-e3b507d8c110",
  "https://images.unsplash.com/photo-1549241218-9e8c0b2c0b1a",
  "https://images.unsplash.com/photo-1552058544-f2b08422138a",
  "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126",
  "https://images.unsplash.com/photo-1554151228-14d9def656e4",
  "https://images.unsplash.com/photo-1555009393-3d0e4f5b5b0a",
  "https://images.unsplash.com/photo-1555507036-ab1f4038808a",
  "https://images.unsplash.com/photo-1556157382-97eda2d62296",
  "https://images.unsplash.com/photo-1557800636-894a64c1696f",
  "https://images.unsplash.com/photo-1558002038-1055907df827",
  "https://images.unsplash.com/photo-1558402529-d2638a7023e9",
  "https://images.unsplash.com/photo-1559297434-fae8a1916a79",
  "https://images.unsplash.com/photo-1560807707-8cc77767d783",
  "https://images.unsplash.com/photo-1560095633-84a2a3a2a2a2",
  "https://images.unsplash.com/photo-1561037404-61cd46aa615b",
  "https://images.unsplash.com/photo-1561501900-3701fa6a0864"
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