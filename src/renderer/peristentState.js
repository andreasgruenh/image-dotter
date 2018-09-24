export function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function load(key) {
  const item = localStorage.getItem(key);
  if (!item) return null;
  return JSON.parse(item);
}
