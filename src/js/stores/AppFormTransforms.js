var Util = require("../helpers/Util");

function trimDuplicableRows(rows) {
  var trimmedRows = rows.map((row) => {
    return Object.keys(row).reduce((memo, key) => {
      if (row[key] != null
        && key !== "consecutiveKey"
        && !Util.isEmptyString(row[key])) {
        memo[key] = row[key];
      }
      return memo;
    }, {});
  }).filter((row) => Object.keys(row).length);

  if (trimmedRows.length) {
    return trimmedRows;
  }
  return null;
}

const AppFormTransforms = {
  cpus: (value) => parseFloat(value),
  disk: (value) => parseFloat(value),
  constraints: (constraints) => constraints
    .split(",")
    .map((constraint) => constraint.split(":").map((value) => value.trim())),
  containerVolumes: (rows) => trimDuplicableRows(rows),
  dockerParameters: (rows) => trimDuplicableRows(rows),
  dockerPortMappings: (rows) => trimDuplicableRows(rows),
  env: (rows) => {
    return rows.reduce((memo, row) => {
      memo[row.key] = row.value;
      return memo;
    }, {});
  },
  instances: (value) => parseInt(value, 10),
  mem: (value) => parseFloat(value),
  ports: (ports) => ports
    .split(",")
    .map((port) => parseInt(port, 10))
    .filter(Number),
  uris: (uris) => uris
    .split(",")
    .map((uri) => uri.trim())
    .filter((uri) => uri != null && uri !== "")
};

module.exports = AppFormTransforms;
