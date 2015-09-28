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
  acceptedResourceRoles: (roles) => {
    if (roles == null) {
      return roles;
    }
    return lazy(roles.split(","))
      .map((role) => role.trim())
      .filter((role) => role != null && role !== "")
      .value();
  },
  cpus: (value) => parseFloat(value),
  disk: (value) => parseFloat(value),
  constraints: (constraints) => constraints
    .split(",")
    .map((constraint) => constraint.split(":").map((value) => value.trim())),
  containerVolumes: (rows) => lazy(rows)
    .map((row) => ensureObjectScheme(row, dockerRowSchemes.containerVolumes))
    .compact()
    .filter((row) => {
      return ["containerPath", "hostPath", "mode"].every((key) => {
        return (row[key] != null &&
          !Util.isEmptyString(row[key].toString().trim()));
      });
    })
    .value(),
  dockerParameters: (rows) => lazy(rows)
    .map((row) => ensureObjectScheme(row, dockerRowSchemes.dockerParameters))
    .compact()
    .filter((row) => {
      return row.key != null && !Util.isEmptyString(row.key.toString().trim());
    })
    .value(),
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
      if (!Util.isEmptyString(row.key) || !Util.isEmptyString(row.value)) {
        memo[row.key] = row.value;
      }
      return memo;
    }, {});
  },
  instances: (value) => parseInt(value, 10),
  mem: (value) => parseFloat(value),
  ports: (ports) => lazy(ports.split(","))
    .map((port) => parseInt(port, 10))
    .filter((port) => {
      port = Number(port);
      return !isNaN(port) && port >= 0;
    })
    .value(),
  uris: (uris) => lazy(uris.split(","))
    .map((uri) => uri.trim())
    .filter((uri) => uri != null && uri !== "")
    .value()
};

module.exports = Object.freeze(AppFormFieldToModelTransforms);
