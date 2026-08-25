/**
 * Turns the single-file build into the fragment published as a hosted artifact.
 *
 * The artifact host wraps whatever it is given in <!doctype html><head></head><body>,
 * so the page content has to be handed over without those tags. Everything is
 * inlined except Google Fonts, which is the one external host the artifact CSP
 * admits. The result still opens directly in a browser.
 *
 * Usage: npm run build:artifact   (runs build:single first)
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const input = resolve(here, '../dist-single/index.html')
const output = resolve(here, '../../docs/dashboard.html')

const src = readFileSync(input, 'utf8')
const head = src.slice(src.indexOf('<head>') + 6, src.indexOf('</head>'))

const sliceTag = (openPattern, close) => {
  const m = head.match(openPattern)
  if (!m || m.index === undefined) throw new Error(`Missing ${openPattern} in build output`)
  const start = m.index + m[0].length
  const end = head.indexOf(close, start)
  if (end === -1) throw new Error(`Unterminated ${close} in build output`)
  return head.slice(start, end)
}

const title = /<title>([\s\S]*?)<\/title>/.exec(head)?.[1]?.trim()
const fontHref = /href="(https:\/\/fonts\.googleapis\.com\/css2[^"]+)"/.exec(head)?.[1]
if (!title || !fontHref) throw new Error('Could not read title or font URL from build output')

const css = sliceTag(/<style[^>]*>/, '</style>')
const js = sliceTag(/<script type="module"[^>]*>/, '</script>')

writeFileSync(
  output,
  [
    `<title>${title}</title>`,
    '<link rel="preconnect" href="https://fonts.googleapis.com">',
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
    `<link rel="stylesheet" href="${fontHref}">`,
    `<style>${css}</style>`,
    '<div id="root"></div>',
    `<script type="module">${js}</script>`,
  ].join('\n') + '\n',
)

console.log(`docs/dashboard.html written (${(css.length + js.length) / 1024 | 0} kB inlined)`)
