import express from 'express'
import path from 'node:path'
import * as zlib from 'node:zlib'

/**
 * URL 검증
 * @param {string} url
 */
const hasURL = (url) => {
  return path.extname(url) !== ''
}

/**
 * Vite Dev Server 생성
 * @param {string} root
 * @param {number | undef} hmrPort
 */
const createViteDevServer = async (root, hmrPort) => {
  return (await import('vite')).createServer({
      root,
      logLevel: isTest ? 'error' : 'info',
      server: {
        middlewareMode: true,
        watch: {
          usePolling: true,
          interval: 100,
        },
        hmr: {
          port: hmrPort,
        },
      },
      appType: 'custom',
    })
}

/**
 * 응답 데이터 압축
 */
const createCompression = async () => {
  return (await import('compression')).default({
        brotli: {
          flush: zlib.constants.BROTLI_OPERATION_FLUSH,
        },
        flush: zlib.constants.Z_SYNC_FLUSH,
      });
}

/**
 * Vite Dev Server 헤더 추출
 * @param {import('vite').ViteDevServer} vite
 * @param {string} url
 * @param {boolean} isProd
 */
const getViteHead = async (vite, url, isProd) => {
      let viteHead = !isProd
        ? await vite.transformIndexHtml(
            url,
            `<html><head></head><body></body></html>`,
          )
        : '';

      viteHead = viteHead.substring(
        viteHead.indexOf('<head>') + 6,
        viteHead.indexOf('</head>'),
      );

      return viteHead;
}

/**
 * Server Rendering 설정
 * @param {import('vite').ViteDevServer} vite
 * @param {boolean} isProd
 */
const getServerEntry = async (vite, isProd) => {
  if (!isProd) {
    return vite.ssrLoadModule('/src/entry-server.tsx')
  } else {
    return import('./dist/server/entry-server.js')
  }
}

/** 테스트 환경 유무 */
const isTest = process.env.NODE_ENV === 'test' || !!process.env.VITE_TEST_BUILD

/** 서버 생성 */
export async function createServer(
  root = process.cwd(),
  isProd = process.env.NODE_ENV === 'production',
  hmrPort,
) {
  const app = express()

  /**
   * @type {import('vite').ViteDevServer}
   */
  let vite
  if (!isProd) {
    vite = await createViteDevServer(root, hmrPort);
    app.use(vite.middlewares)
  } else {
    const compression = await createCompression();
    app.use(compression);
  }

  if (isProd) {
    app.use(express.static('./dist/client'))
  }

  app.use('*', async (req, res) => {
    try {
      const url = req.originalUrl

      if (hasURL(url)) {
        console.warn(`${url} is not valid router path`)
        res.status(404)
        res.end(`${url} is not valid router path`)
        return
      }

      let viteHead = await getViteHead(vite, url, isProd);
      const entry = await getServerEntry(vite, isProd);

      console.info('Rendering: ', url, '...')
      entry.render({ req, res, head: viteHead })
    } catch (e) {
      !isProd && vite.ssrFixStacktrace(e)
      console.info(e.stack)
      res.status(500).end(e.stack)
    }
  })

  return { app, vite }
}

if (!isTest) {
  createServer().then(async ({ app }) =>
    app.listen(3000), () => {
      console.info('Client Server: http://localhost:3000')
    })
}
