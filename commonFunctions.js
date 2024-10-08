const { BSON } = require('bson');

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
  let milliseconds = date.getMilliseconds().toString().padStart(3, '0');

  return `${year}${month}${day}${hours}${minutes}${seconds}${milliseconds}`;
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

function preBSONSerialization(obj, preProcessByDefault=true) {
  if (
    obj.type === 'keepAlive' || 
    obj.type === 'error' ||
    (!obj.convertType && !preProcessByDefault)
  ) {
    return obj;
  }
  if (obj.convertType === 'not-convert') {
    return obj.value;
  }
  if (obj.convertType === 'convert') {
    return preBSONSerialization(obj.value, preProcessByDefault);
  }
  if (obj instanceof ArrayBuffer) {
    return {
      convertType: 'ArrayBuffer',
      value: new Uint8Array(obj)
    };
  } else if (obj instanceof Buffer) {
    return {
      convertType: 'Buffer',
      value: Uint8Array.from(obj)
    };
  } else if (Array.isArray(obj)) {
    return obj.map(_obj => preBSONSerialization(_obj, preProcessByDefault));
  } else if (typeof obj === 'object' && obj !== null) {
    const result = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result[key] = preBSONSerialization(obj[key]);
      }
    }
    return result;
  } else {
    return obj;
  }
}

function bufferToArrayBuffer(buffer) {
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
}

function postBSONDeserialization(obj, postProcessByDefault=true) {
  if (
    obj.type === 'keepAlive' || 
    obj.type === 'error' ||
    (!obj.convertType && !postProcessByDefault)
  ) {
    return obj;
  }
  if (obj.convertType === 'not-convert') {
    return obj.value;
  }
  if (obj.convertType === 'convert') {
    return postBSONDeserialization(obj.value, postProcessByDefault);
  }
  if (obj.convertType === 'Buffer') {
    return obj.value.buffer;
  }
  if (obj.convertType === 'ArrayBuffer') {
    return bufferToArrayBuffer(obj.value.buffer);
  }
  if (Array.isArray(obj)) {
    return obj.map(_obj => postBSONDeserialization(_obj, postProcessByDefault));
  }
  if (typeof obj === 'object' && obj != null) {
    const result = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result[key] = postBSONDeserialization(obj[key], postProcessByDefault);
      }
    }
    return result;
  }
  return obj;
}

function getMessageFromBlob(blob, postProcessByDefault=true) {
  return blob.arrayBuffer().then(
    arrayBuffer => postBSONDeserialization(
      BSON.deserialize(new Uint8Array(arrayBuffer)),
      postProcessByDefault
    )
  );
}

function getNotConvertWrapper(obj) {
  return {
    convertType: 'not-convert',
    value: obj
  }
}

function logMemoryUsage(logEntryHeader) {
  const mu = process.memoryUsage();
  console.log(`${logEntryHeader}\t${getTimestampString()}\t${mu.arrayBuffers}\t${mu.external}\t${mu.heapTotal}\t${mu.heapUsed}\t${mu.rss}`);
}

module.exports = {
  expandRegEx,
  getRegEx,
  applyRecursive,
  replaceById,
  dateToFilenameSuffix,
  getTimestampString,
  stringToFilenameSuffix,
  preBSONSerialization,
  postBSONDeserialization,
  getMessageFromBlob,
  getNotConvertWrapper,
  logMemoryUsage
}