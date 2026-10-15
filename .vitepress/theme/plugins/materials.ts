import fs from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'

const MIME: Record<string, string> = {
  '.pdf':  'application/pdf',
  '.epub': 'application/epub+zip',
  '.md':   'text/markdown; charset=utf-8',
  '.zip':  'application/zip',
  '.txt':  'text/plain; charset=utf-8'
}

export default function materialsPlugin(
  srcDir: string,
  urlPrefix = '/resources'
): Plugin {
  const prefix = urlPrefix.replace(/\/$/, '')

  return {
    name: 'vitepress-materials',

    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith(prefix + '/')) return next()

        const rel = decodeURIComponent(
          req.url.slice(prefix.length + 1).split('?')[0]
        )
        const full = path.join(srcDir, rel)

        if (!full.startsWith(srcDir)) return next()
        if (!fs.existsSync(full) || !fs.statSync(full).isFile()) return next()

        const ext = path.extname(full).toLowerCase()
        res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream')
        res.setHeader('Cache-Control', 'no-cache')
        fs.createReadStream(full).pipe(res)
      })
    },

    generateBundle() {
      if (!fs.existsSync(srcDir)) return
      const walk = (dir: string, base: string) => {
        for (const f of fs.readdirSync(dir)) {
          const full = path.join(dir, f)
          const stat = fs.statSync(full)
          if (stat.isDirectory()) {
            walk(full, path.join(base, f))
          } else {
            this.emitFile({
              type: 'asset',
              fileName: `${prefix.replace(/^\//, '')}/${path.join(base, f)}`,
              source: fs.readFileSync(full)
            })
          }
        }
      }
      walk(srcDir, '')
    }
  }
}
