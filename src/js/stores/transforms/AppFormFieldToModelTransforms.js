var HealthCheckProtocols = require("../../constants/HealthCheckProtocols");

const dockerRowSchemes = require("../schemes/dockerRowSchemes");
const healthChecksRowScheme = require("../schemes/healthChecksRowScheme");

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
          !Util.isStringAndEmpty(row[key].toString().trim()));
      });
    })
    .value(),
  dockerParameters: (rows) => lazy(rows)
    .map((row) => ensureObjectScheme(row, dockerRowSchemes.dockerParameters))
    .compact()
    .filter((row) => {
      return row.key != null &&
        !Util.isStringAndEmpty(row.key.toString().trim());
    })
    .value(),
  dockerPortMappings: (rows) => lazy(rows)
    .map((row) => ensureObjectScheme(row, dockerRowSchemes.dockerPortMappings))
    .compact()
    .map((row) => {
      var obj = {};

      ["containerPort", "hostPort", "servicePort"].forEach((key) => {
        if (row[key] != null &&
            !Util.isStringAndEmpty(row[key].toString().trim())) {
          obj[key] = parseInt(row[key], 10);
        }
      });

      if (Object.keys(obj).length) {
        if (!Util.isStringAndEmpty(row.protocol)) {
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
      if (!Util.isStringAndEmpty(row.key) ||
          !Util.isStringAndEmpty(row.value)) {
        memo[row.key] = row.value;
      }
      return memo;
    }, {});
  },
  healthChecks: (rows) => { return lazy(rows)
    .map((row) => ensureObjectScheme(row, healthChecksRowScheme))
    .compact()
    .map((row) => {
      if (row.protocol === HealthCheckProtocols.COMMAND) {
        delete row.path;
        delete row.portIndex;

        row.command = {
          value: row.command
        };

      } else if (row.protocol === HealthCheckProtocols.HTTP) {
        delete row.command;
        delete row.ignoreHttp1xx;
      } else if (row.protocol === HealthCheckProtocols.TCP) {
        delete row.command;
        delete row.path;
        delete row.ignoreHttp1xx;
      }

      ["gracePeriodSeconds",
      "intervalSeconds",
      "maxConsecutiveFailures",
      "timeoutSeconds",
      "portIndex"]
        .forEach((key) => {
          if (row[key] != null &&
              !Util.isStringAndEmpty(row[key].toString().trim())) {
            row[key] = parseInt(row[key], 10);
          }
        });

      return row;
    })
    .value();
  },
  instances: (value) => parseInt(value, 10),
  labels: (rows) => {
    return rows.reduce((memo, row) => {
      if (!Util.isStringAndEmpty(row.key) ||
          !Util.isStringAndEmpty(row.value)) {
        memo[row.key] = row.value;
      }
      return memo;
    }, {});
  },
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
