export default function replaceAt(str, index, replacement) {
  return str.substr(0, index)
    + replacement
    + str.substr(index + `${replacement}`.length);
}
