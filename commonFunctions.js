function expandRegEx(regEx) {
  return regEx
    .replace(/a|á/ig, '[aá]')
    .replace(/e|é/ig, '[eé]')
    .replace(/i|í/ig, '[ií]')
    .replace(/o|ó/ig, '[oó]')
    .replace(/u|ú|ü/ig, '[uúü]')
    .replace(/n|ñ/ig, '[nñ]')
}

function getRegEx(queryStr, phrase=false) {

  let joinStr = phrase? '.*' : '|'

  return queryStr
    .split(' ')
    .filter(term=>term.length>0)
    .map(expandRegEx)
    .join(joinStr)
}

function applyRecursive(parentObj, parentKey, obj, cb) {
  for (var key in obj) {
    if (!obj.hasOwnProperty(key)) {
      continue;
    }
    if(typeof obj[key] == "object" && obj[key] !== null) {
      applyRecursive(obj, key, obj[key], cb);
    } else {
      cb(parentObj, parentKey, obj, key);
    }
  }
  return obj;
}
  
function replaceById(obj) {
  if(obj instanceof Array) {
    return obj.map(_obj=>replaceById(_obj))
  } else {
    return obj?.value?._id || obj?.value || obj?._id || obj;
  }
}

function dateToFilenameSuffix(date) {
  let year = date.getFullYear();
  let month = (date.getMonth() + 1).toString().padStart(2, '0');
  let day = date.getDate().toString().padStart(2, '0');
  let hours = date.getHours().toString().padStart(2, '0');
  let minutes = date.getMinutes().toString().padStart(2, '0');
  let seconds = date.getSeconds().toString().padStart(2, '0');

  return `${year}${month}${day}${hours}${minutes}${seconds}`;
};

function getTimestampString() {
  return dateToFilenameSuffix(new Date());
}

function stringToFilenameSuffix(inputString) {
  // Lowercase all characters
  let formattedString = inputString.toLowerCase();

  // Replace spaces or sequence of spaces with "_"
  formattedString = formattedString.replace(/\s+/g, '_');

  // Replace accent characters with non-accent versions
  formattedString = formattedString.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Exclude non-ASCII characters
  formattedString = formattedString.replace(/[^\x00-\x7F]/g, "");

  return formattedString;
}

module.exports = {
  expandRegEx,
  getRegEx,
  applyRecursive,
  replaceById,
  dateToFilenameSuffix,
  getTimestampString,
  stringToFilenameSuffix
}