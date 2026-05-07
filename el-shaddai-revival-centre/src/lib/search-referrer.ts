/** Classify referrer hostname into a search-engine label; null when not search. */
export function classifySearchEngineHost(hostRaw: string): string | null {
  const host = hostRaw.trim().toLowerCase()
  if (!host) return null
  if (host === 'google.com' || host === 'www.google.com' || /\.google\./.test(host)) return 'Google'
  if (/\.?yandex\./.test(host) || host.startsWith('yandex.')) return 'Yandex'
  if (/\.bing\./.test(host) || host === 'bing.com' || /\.msn\./.test(host)) return 'Bing'
  if (/\.yahoo\./.test(host) || host.endsWith('yahoo.com')) return 'Yahoo'
  if (/duckduckgo\./.test(host)) return 'DuckDuckGo'
  if (/\.baidu\./.test(host) || host === 'baidu.com') return 'Baidu'
  return null
}
