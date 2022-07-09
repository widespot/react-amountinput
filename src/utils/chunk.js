export default function chunk(str, size) {
  if (typeof str !== 'string' && !(str instanceof String)) str = `${str}`;
  if (size === 0) throw new Error('size must be greater or smaller than zero but not equal');
  const out = [];
  const appendFn = size > 0 ? 'push' : 'unshift';
  let position = size > 0 ? 0 : str.length + size;
  while (position >= Math.min(0, size + 1) && position < str.length) {
    out[appendFn](str.substr(
      Math.max(0, position),
      Math.abs(position < 0 ? size - position : size),
    ));
    position += size;
  }
  return out;
}
