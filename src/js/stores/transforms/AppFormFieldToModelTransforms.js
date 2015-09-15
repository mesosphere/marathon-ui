const dockerRowSchemes = require("../dockerRowSchemes");
var Util = require("../../helpers/Util");
var lazy = require("lazy.js");

function ensureObjectScheme(row, scheme) {
  return Object.keys(row).reduce((obj, key) => {
    if (scheme.hasOwnProperty(key)) {
      obj = obj || {};
      if (row[key] != null) {
        obj[key] = row[key];
      }
    }
    return obj;
  }, null);
}

const AppFormFieldToModelTransforms = {
  cpus: (value) => parseFloat(value),
  disk: (value) => parseFloat(value),
  constraints: (constraints) => constraints
    .split(",")
    .map((constraint) => constraint.split(":").map((value) => value.trim())),
  containerVolumes: (rows) => rows
    .map((row) => ensureObjectScheme(row, dockerRowSchemes.containerVolumes))
    .filter((row) => row),
  dockerParameters: (rows) => rows
    .map((row) => ensureObjectScheme(row, dockerRowSchemes.dockerParameters))
    .filter((row) => row),
  dockerPortMappings: (rows) => lazy(rows)
    .map((row) => ensureObjectScheme(row, dockerRowSchemes.dockerPortMappings))
    .compact()
    .map((row) => {
      var obj = {};

      ["containerPort", "hostPort", "servicePort"].forEach((key) => {
        if (row[key] != null &&
            !Util.isEmptyString(row[key].toString().trim())) {
          obj[key] = parseInt(row[key], 10);
        }
      });

      if (Object.keys(obj).length) {
        if (!Util.isEmptyString(row.protocol)) {
          obj.protocol = row.protocol;
        }
        return obj;
      }
    })
    .compact()
    .value(),
  dockerPrivileged: (isChecked) => !!isChecked,
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

module.exports = Object.freeze(AppFormFieldToModelTransforms);
