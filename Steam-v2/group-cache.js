const cache = new Map();
const TTL = 5 * 60 * 1000;

function valid(metadata) {
  return !!metadata?.id && Array.isArray(metadata?.participants);
}

export function getCachedGroupMetadata(jid) {
  const entry = cache.get(String(jid || ''));
  if (!entry) return undefined;
  if (Date.now() - entry.time > TTL) {
    cache.delete(String(jid || ''));
    return undefined;
  }
  return entry.metadata;
}

export function setGroupMetadata(metadata) {
  if (!valid(metadata)) return metadata;
  cache.set(String(metadata.id), { metadata, time: Date.now() });
  return metadata;
}

export function mergeGroupUpdate(update) {
  const id = String(update?.id || '');
  if (!id) return;
  const current = getCachedGroupMetadata(id);
  if (!current) return;
  setGroupMetadata({ ...current, ...update, id });
}

export function invalidateGroup(jid) {
  cache.delete(String(jid || ''));
}

export function clearGroupCache() {
  cache.clear();
}
