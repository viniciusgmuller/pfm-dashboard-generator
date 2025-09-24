# Dashboard Worker

Worker service for generating dashboard screenshots using Puppeteer.

## Features

- ✅ Individual screenshot generation
- ✅ Batch processing with real-time progress
- ✅ Optimized for Railway deployment
- ✅ Health checks and monitoring
- ✅ Error handling and recovery

## Endpoints

- `GET /` - Worker status
- `GET /health` - Health check
- `POST /generate-screenshot` - Generate single screenshot
- `POST /generate-batch` - Generate multiple screenshots with SSE progress

## Local Development

```bash
cd worker
npm install
npm start
```

## Deployment to Railway

1. Push to GitHub
2. Connect Railway to this repository
3. Set root directory to `/worker`
4. Deploy automatically

The worker will be available at your Railway-provided URL.