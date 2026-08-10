import { readdirSync, statSync, readFileSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'

/**
 * Prefixes public asset paths with the basePath after export.
 *
 * Next rewrites asset paths it can see through next/image and next/link, but a
 * path written as a plain string in a component — "/hero-learning.png" — is
 * just a string, and basePath never touches it. Exported to /learner those
 * become 404s.
 *
 * Rather than keep a hand-written list of filenames in step with the design,
 * this walks public/ and prefixes exactly the files that exist there.
 */

const BASE_PATH = process.env.BASE_PATH ?? '/learner'
const PUBLIC_DIR = 'public'
const OUT_DIR = process.env.OUT_DIR ?? 'out'
const TEXT_EXT = new Set(['.html', '.js', '.mjs', '.txt', '.json', '.css'])

function walk(dir) {
  const found = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) found.push(...walk(full))
    else found.push(full)
  }
  return found
}

// Every asset in public/, as the absolute path the browser would request.
const assets = walk(PUBLIC_DIR)
  .map((file) => '/' + relative(PUBLIC_DIR, file).split(/[\\/]/).join('/'))
  // Longest first so /pathways/adult.png is not partly matched by a shorter path.
  .sort((a, b) => b.length - a.length)

if (!assets.length) {
  console.error('no assets found in %s', PUBLIC_DIR)
  process.exit(1)
}

const escaped = assets.map((a) => a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
// Only inside a quote, so "/icon.svg" is rewritten but "https://x/icon.svg" is not.
const pattern = new RegExp(`(\\\\"|"|')(${escaped.join('|')})(?=\\\\"|"|')`, 'g')

let files = 0
let total = 0
for (const file of walk(OUT_DIR)) {
  const dot = file.lastIndexOf('.')
  if (dot < 0 || !TEXT_EXT.has(file.slice(dot))) continue

  const source = readFileSync(file, 'utf8')
  let count = 0
  const next = source.replace(pattern, (match, quote, path) => {
    // Already prefixed by an earlier run, or by Next itself.
    if (path.startsWith(BASE_PATH + '/')) return match
    count += 1
    return quote + BASE_PATH + path
  })
  if (count) {
    writeFileSync(file, next)
    files += 1
    total += count
  }
}

console.log('prefixed %d asset paths across %d files with %s', total, files, BASE_PATH)
