export default function incrementAmount(str, inc) {
  let out = null;
  for (let i = 0; i < str.length; i += 1) {
    if (!str[i].match(/[0-9]/)) out = (out || '') + str[i];
    else out = (out || '') + ((((parseInt(str[i], 10) + inc) % 10) + 10) % 10);
  }

  return out;
}
