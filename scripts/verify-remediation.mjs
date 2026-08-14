import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const ignored = new Set(['node_modules', '.next', '.git', 'release'])
const sourceExtensions = new Set(['.ts', '.tsx', '.js', '.mjs', '.md', '.json'])

function filesAt(directory) {
  const output = []
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue
    const absolute = path.join(directory, entry.name)
    if (entry.isDirectory()) output.push(...filesAt(absolute))
    else if (sourceExtensions.has(path.extname(entry.name))) output.push(absolute)
  }
  return output
}

const files = ['app', 'components', 'lib'].flatMap((directory) => filesAt(path.join(root, directory)))
const corpus = files.map((file) => fs.readFileSync(file, 'utf8')).join('\n')
const checks = [
  ['canonical API prefix', !corpus.includes('/api/eilps')],
  ['obsolete activity attempt route removed', !corpus.includes('/api/activities/attempts')],
  ['obsolete lesson route removed', !corpus.includes('/api/lessons/:id')],
  ['verified activity submission present', corpus.includes('/api/activities/:lessonId/submissions')],
  ['verified progress completion present', corpus.includes('/api/progress/lesson')],
  ['Discovery catalogue corrected', corpus.includes('/api/discovery/catalogue')],
  ['lightweight curriculum summary present', corpus.includes('/api/curriculum/deep-summary')],
  ['dashboard deep catalogue removed', !files.filter((file) => file.includes(`${path.sep}lib${path.sep}apps${path.sep}`)).some((file) => fs.readFileSync(file, 'utf8').includes('/api/curriculum/deep-catalog'))],
  ['no invented pronunciation score', !corpus.includes('Pronunciation score') && !corpus.includes('AI coach: stress')],
  ['preview noindex present', corpus.includes('googleBot: { index: false, follow: false }')],
  ['Analytics retained once in root layout', (fs.readFileSync(path.join(root, 'app', 'layout.tsx'), 'utf8').match(/<Analytics\s*\/>/g) || []).length === 1],
  ['all runtime service templates present', ['eilps-web', 'eilps-api', 'eilps-worker', 'eilps-learner'].every((name) => fs.existsSync(path.join(root, 'deploy', 'services', `${name}.service`)))],
]

for (const [name, passed] of checks) console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`)
if (checks.some(([, passed]) => !passed)) process.exit(1)
