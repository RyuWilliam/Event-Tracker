export function getApiBaseUrl(): string {
  // Always use the Vite proxy path (relative) to avoid CORS preflight issues.
  // Vite proxies /tracker/api/* → http://localhost:7022/tracker/api/*
  return '/tracker/api'
}

export function getImageBaseUrl(): string {
  return ""
}
