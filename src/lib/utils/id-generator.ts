let seed = 0;

export function nextId(prefix = 'id') {
  seed += 1;
  return `${prefix}-${seed}`;
}
