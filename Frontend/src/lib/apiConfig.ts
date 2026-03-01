export function getApiBaseUrl(): string {
  const hostname = window.location.hostname
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1'
  
  return isLocalhost
    ? 'http://localhost:7022/tracker/api'
    : `http://${hostname}:7022/tracker/api`
}

export function getImageBaseUrl(): string {
  const hostname = window.location.hostname
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1'
  
  if (isLocalhost) {
    return ''
  }
  
  return `http://${hostname}:7022`
}
