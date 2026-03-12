export function getApiBaseUrl(): string {
  // Always use the Vite proxy path (relative) to avoid CORS preflight issues.
  // Vite proxies /tracker/api/* → http://localhost:7022/tracker/api/*
  return '/tracker/api'
}

export function getImageBaseUrl(): string {
  const hostname = window.location.hostname
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1'

  if (isLocalhost) {
    return ''
  }

  return `http://${hostname}:7022`
}
