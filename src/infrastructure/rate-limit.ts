/**
 * Limite simples em memória: no máximo `limit` ações por chave dentro de
 * `windowMs`. Basta para um único processo; nada é gravado em disco.
 */
export function createRateLimiter({ limit, windowMs }: { limit: number; windowMs: number }) {
  const hits = new Map<string, number[]>();

  return function allow(key: string, now = Date.now()): boolean {
    const recent = (hits.get(key) ?? []).filter((at) => now - at < windowMs);
    if (recent.length >= limit) {
      hits.set(key, recent);
      return false;
    }
    recent.push(now);
    hits.set(key, recent);

    // Não deixa o mapa crescer para sempre com chaves antigas.
    if (hits.size > 10_000) {
      for (const [k, times] of hits) if (times.every((at) => now - at >= windowMs)) hits.delete(k);
    }
    return true;
  };
}
