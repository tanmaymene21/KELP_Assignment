const fs = require('fs');
const readline = require('readline');

const parse = async (filePath) => {
  const fileStream = fs.createReadStream(filePath);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  const records = [];
  let headers = null;

  for await (const line of rl) {
    if (!line.trim()) continue;

    if (!headers) {
      headers = parseLine(line);
    } else {
      const values = parseLine(line);
      if (values.length === headers.length) {
        const record = createNestedObject(headers, values);
        records.push(record);
      }
    }
  }

  return records;
};

const parseLine = (text) => {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (char === '"') {
      if (inQuotes && text[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
};

const createNestedObject = (headers, values) => {
  const obj = {};

  for (let i = 0; i < headers.length; i++) {
    const path = headers[i].split('.');
    const value = values[i];

    let current = obj;

    for (let j = 0; j < path.length - 1; j++) {
      const key = path[j];
      if (!current[key]) current[key] = {};
      current = current[key];
    }

    const lastKey = path[path.length - 1];
    current[lastKey] = parseValue(value);
  }

  return obj;
};

const parseValue = (val) => {
  if (!val || val === '') return null;
  const cleanVal = val.replace(/^"|"$/g, '');

  if (cleanVal !== '' && !isNaN(cleanVal)) return Number(cleanVal);
  return cleanVal;
};

module.exports = { parse };
