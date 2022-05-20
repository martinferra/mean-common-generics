const mongoose = require('mongoose');
const lodash = require('lodash');
const cloneDeep = lodash.cloneDeep;

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
  
function applyObjectIdRecursive(obj) {
  clonedObj = cloneDeep(obj);
  return applyRecursive(null, null, clonedObj, (po,pk,o,k)=>{
    /* Ej: "customer: {$oid:'aaaaa'}" se reemplaza por 
        "customer: ObjectId('aaaaa')" */
    if(k==='$oid' && typeof o[k] === 'string') {
      po[pk] = mongoose.Types.ObjectId(o[k]);
    }
  })
}

function replaceById(obj) {
  if(obj instanceof Array) {
    return obj.map(_obj=>replaceById(_obj))
  } else {
    return obj?.value?._id || obj?.value || obj?._id || obj;
  }
}

module.exports = {
  expandRegEx,
  getRegEx,
  applyRecursive,
  applyObjectIdRecursive,
  replaceById
}