var HealthCheckProtocols = require("../../constants/HealthCheckProtocols");
var Util = require("../../helpers/Util");

const AppFormModelToFieldTransforms = {
  acceptedResourceRoles: (acceptedResourceRoles) => {
    return acceptedResourceRoles != null
      ? acceptedResourceRoles.join(", ")
      : acceptedResourceRoles;
  },
  constraints: (constraints) => {
    return constraints
      .map((constraint) => constraint.join(":"))
      .join(", ");
  },
  dockerPortMappings: (mappings) => {
    return mappings
      .map((row, i) => {
        row.consecutiveKey = i;
        return row;
      });
  },
  dockerParameters: (parameters) => {
    return parameters
      .map((row, i) => {
        row.consecutiveKey = i;
        return row;
      });
  },
  containerVolumes: (volumes) => {
    return volumes
      .map((row, i) => {
        row.consecutiveKey = i;
        return row;
      });
  },
  env: (rows) => {
    return Object.keys(rows)
      .map((rowKey, i) => {
        return {
          key: rowKey,
          value: rows[rowKey],
          consecutiveKey: i
        };
      });
  },
  labels: (rows) => {
    return Object.keys(rows)
      .map((rowKey, i) => {
        return {
          key: rowKey,
          value: rows[rowKey],
          consecutiveKey: i
        };
      });
  },
  healthChecks: (healthChecks) => {
    return healthChecks
      .map((row, i) => {
        row.consecutiveKey = i;

        if (row.protocol === HealthCheckProtocols.COMMAND) {
          if (Util.isObject(row.command)) {
            row.command = row.command.value;
          }
        }

        return row;
      });
  },
  ports: (ports) => ports
    .join(", "),
  uris: (uris) => uris
    .join(", ")
};

module.exports = Object.freeze(AppFormModelToFieldTransforms);
