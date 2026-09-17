const chains = new Map();

export function runSerial(key, task) {
  const previous = chains.get(key) || Promise.resolve();
  const next = previous.catch(() => {}).then(task);

  // لا ننشئ Promise مرفوضًا غير مُراقَب؛ هذا كان سبب سقوط Node
  // بعد أخطاء مثل YouTube HTTP 403.
  const tracked = next.then(
    () => {
      if (chains.get(key) === tracked) chains.delete(key);
    },
    () => {
      if (chains.get(key) === tracked) chains.delete(key);
    }
  );

  chains.set(key, tracked);
  return next;
}
