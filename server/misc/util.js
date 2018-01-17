
function pad (str, len) {
  if (str == null) {
    str = ''
  }
  while (str.length < len) {
    str = str + ' '
  }
  return str.substring(0, len)
}

function capitalize (str) {
  return str.substring(0, 1).toUpperCase() + str.substring(1)
}

module.exports.pad = pad
module.exports.capitalize = capitalize
