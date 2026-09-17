const handlers = new Map();
export function on(name, fn) { if (!handlers.has(name)) handlers.set(name,new Set()); handlers.get(name).add(fn); return ()=>handlers.get(name)?.delete(fn); }
export async function emit(name, payload) { const list=[...(handlers.get(name)||[])]; for(const fn of list) await fn(payload); }
export function clear(name) { if(name) handlers.delete(name); else handlers.clear(); }
