import HealthCheckProtocols from "../../constants/HealthCheckProtocols";

import dockerRowSchemes from "../schemes/dockerRowSchemes";
import healthChecksRowScheme from "../schemes/healthChecksRowScheme";

import Util from "../../helpers/Util";
import lazy from "lazy.js";

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
    .filter((constraint) => constraint != null && constraint !== "")
    .map((constraint) =>
      constraint
        .split(":")
        .map((value) => value.trim())),
  containerVolumes: rows => {
    return lazy(rows)
      .map((row) => ensureObjectScheme(row, dockerRowSchemes.containerVolumes))
      .compact()
      .filter((row) => {
        return ["containerPath", "hostPath", "mode"].every((key) => {
          return (row[key] != null &&
            !Util.isStringAndEmpty(row[key].toString().trim()));
        });
      })
      .value();
  },
  localVolumes: rows => {
    rows = rows.filter(row => {
      return ["containerPath", "persistentSize"].every(key => {
        return row[key] != null && row[key] !== "";
      });
    })
      .map(row => {
        return {
          containerPath: row.containerPath,
          persistent: {
            size: parseInt(row.persistentSize, 10)
          },
          mode: "RW"
        };
      });
    return rows;
  },
  dockerForcePullImage: (isChecked) => !!isChecked,
  dockerParameters: (rows) => lazy(rows)
    .map((row) => ensureObjectScheme(row, dockerRowSchemes.dockerParameters))
    .compact()
    .filter((row) => {
      return row.key != null &&
        !Util.isStringAndEmpty(row.key.toString().trim());
    })
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
        delete row.port;

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
      "portIndex",
      "port"]
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
  portDefinitions: portDefinitions => {
    return portDefinitions
      .map(portDefinition => {
        var definition = Object.assign({}, portDefinition);
        definition.port = parseInt(definition.port, 10);
        if (definition.name === "") {
          definition.name = null;
        }
        if (definition.port == null ||
            isNaN(definition.port) ||
            definition.isRandomPort) {
          definition.port = 0;
        }
        delete definition.consecutiveKey;
        delete definition.isRandomPort;
        if (definition.vip != null) {
          if (definition.vip !== "") {
            let labels = definition.labels || {};
            labels["VIP_0"] = definition.vip;
            definition.labels = labels;
          }
          delete definition.vip;
        }
        return definition;
      })
      .filter(portDefinition => {
        var port = Number(portDefinition.port);
        return !isNaN(port) && port >= 0;
      });
  },
  uris: (uris) => lazy(uris.split(","))
    .map((uri) => uri.trim())
    .filter((uri) => uri != null && uri !== "")
    .value()
};

export default Object.freeze(AppFormFieldToModelTransforms);
