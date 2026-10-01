const CANONICAL_BASE = '/vennom';
const IMMUTABLE_ASSET_PREFIX = '/_app/immutable/';

function matchVennomPath(pathname: string): { suffix: string; canonical: boolean } | null {
  const match = /^\/([^/]+)(\/.*)?$/.exec(pathname);
  if (!match || match[1].toLowerCase() !== 'vennom') return null;

  const suffix = match[2] ?? '';
  return {
    suffix,
    canonical: match[1] === 'vennom' && suffix !== ''
  };
}

function withResponseHeaders(response: Response, assetPath: string): Response {
  const headers = new Headers(response.headers);
  const contentType = headers.get('content-type') ?? '';

  headers.set('x-content-type-options', 'nosniff');
  headers.set('referrer-policy', 'strict-origin-when-cross-origin');

  if (assetPath.startsWith(IMMUTABLE_ASSET_PREFIX)) {
    headers.set('cache-control', 'public, max-age=31536000, immutable');
  } else if (contentType.includes('text/html') || assetPath === '/sw.js' || assetPath === '/registerSW.js') {
    headers.set('cache-control', 'no-cache');
  } else {
    headers.set('cache-control', 'public, max-age=3600, stale-while-revalidate=86400');
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);
    const route = matchVennomPath(url.pathname);

    if (!route) return fetch(request);

    if (!route.canonical) {
      url.pathname = `${CANONICAL_BASE}${route.suffix || '/'}`;
      return Response.redirect(url.toString(), 308);
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method Not Allowed', {
        status: 405,
        headers: { allow: 'GET, HEAD' }
      });
    }

    const assetPath = route.suffix || '/';
    const assetUrl = new URL(request.url);
    assetUrl.pathname = assetPath;
    const assetRequest = new Request(assetUrl, request);
    const response = await env.ASSETS.fetch(assetRequest);

    return withResponseHeaders(response, assetPath);
  }
} satisfies ExportedHandler<Env>;
