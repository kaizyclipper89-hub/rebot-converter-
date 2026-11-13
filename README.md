
---
title: Rebot Converter
emoji: 🎧
colorFrom: blue
colorTo: purple
sdk: docker
app_port: 7860
pinned: false
---

# Rebot Converter API

Media converter API powered by Node.js and FFmpeg.

## Endpoints

| Endpoint | Description |
|---|---|
| GET / | API information |
| GET /health | Health check |
| POST /mp4tomp3 | MP4 to MP3 |
| POST /mp4towav | MP4 to WAV |
| POST /mp4tovn | MP4 to OGG Opus |
| POST /audiotovn | Audio to OGG Opus |
| POST /tovn | Audio/Video to OGG Opus |

## Request

Content-Type: multipart/form-data

Field: file

## Response

Returns converted audio as binary data.

## Limit

Maximum upload: 50 MB.
