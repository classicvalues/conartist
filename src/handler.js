const fs = require('fs');
const outdent = require('outdent');
const path = require('path');

const { formatCode, formatJson } = require('./format');
const { load, raw, resolve } = require('./load');
const { merge } = require('./merge');

function array(opts) {
  opts = merge(
    {
      delimiter: '\n',
      filter: (val, idx, arr) => arr.indexOf(val) === idx,
      map: val => val
    },
    opts
  );
  return function array(data, file) {
    return data
      .concat((raw(file) || '').split(opts.delimiter))
      .filter(opts.filter)
      .map(opts.map)
      .join(opts.delimiter);
  };
}

function js() {
  return function js(data, file) {
    const resolved = resolve('conartist.js', path.dirname(file));
    return formatCode(
      outdent`
        // This file is autogenerated to retain the scope the JS is defined in.
        module.exports = require('./${resolved}')['${file}'].data();
      `
    );
  };
}

function json() {
  return function json(data, file) {
    return formatJson(merge(data, load(file)));
  };
}

function string() {
  return function string(data, file) {
    return `${raw(file) || data}`;
  };
}

module.exports = {
  array,
  js,
  json,
  string
};
