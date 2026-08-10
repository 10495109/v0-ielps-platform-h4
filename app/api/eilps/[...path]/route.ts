import { type NextRequest, NextResponse } from 'next/server'

/**
 * Same-origin proxy to the LIVE EILPS server.
 *
 * The browser calls /api/eilps/<path>, this handler forwards it to
 * https://eilps.com/<path> server-side, carrying the caller's cookies so the
 * live session is preserved. This avoids cross-origin/credentialed CORS
 * failures against eilps.com while keeping the live backend untouched
 * ("No live frontend changes. Map only.").
 */

const UPSTREAM = process.env.EILPS_API_BASE || 'https://eilps.com'
const TIMEOUT_MS = 8000

async function forward(req: NextRequest, path: string[]) {
  const suffix = path.join('/')
  const search = req.nextUrl.search || ''
  const target = `${UPSTREAM}/${suffix}${search}`

  const headers = new Headers()
  const cookie = req.headers.get('cookie')
  const auth = req.headers.get('authorization')
  const contentType = req.headers.get('content-type')
  if (cookie) headers.set('cookie', cookie)
  if (auth) headers.set('authorization', auth)
  if (contentType) headers.set('content-type', contentType)
  headers.set('accept', 'application/json')

  const method = req.method.toUpperCase()
  const hasBody = method !== 'GET' && method !== 'HEAD'
  const body = hasBody ? await req.text() : undefined

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const upstream = await fetch(target, {
      method,
      headers,
      body,
      redirect: 'manual',
      signal: controller.signal,
    })
    const text = await upstream.text()
    const res = new NextResponse(text, {
      status: upstream.status,
      headers: {
        'content-type':
          upstream.headers.get('content-type') || 'application/json',
      },
    })
    const setCookie = upstream.headers.get('set-cookie')
    if (setCookie) res.headers.append('set-cookie', setCookie)
    return res
  } catch (err) {
    const reason = err instanceof Error ? err.message : 'unknown'
    return NextResponse.json(
      { error: 'upstream_unreachable', reason, target },
      { status: 502 },
    )
  } finally {
    clearTimeout(timer)
  }
}

type Ctx = { params: Promise<{ path: string[] }> }

export async function GET(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params
  return forward(req, path)
}
export async function POST(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params
  return forward(req, path)
}
export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params
  return forward(req, path)
}
export async function PUT(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params
  return forward(req, path)
}
export async function DELETE(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params
  return forward(req, path)
}
