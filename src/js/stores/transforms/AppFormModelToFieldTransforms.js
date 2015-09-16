const AppFormModelToFieldTransforms = {
  constraints: (constraints) => { return constraints
    .map((constraint) => constraint.join(":"))
    .join(", ");
  },
  dockerPortMappings: (mappings) => { return mappings
    .map((row, i) => {
      row.consecutiveKey = i;
      return row;
    });
  },
  dockerParameters: (parameters) => { return parameters
    .map((row, i) => {
      row.consecutiveKey = i;
      return row;
    });
  },
  env: (rows) => { return Object.keys(rows)
    .map((rowKey, i) => {
      return {
        key: rowKey,
        value: rows[rowKey],
        consecutiveKey: i
      };
    });
  },
  ports: (ports) => ports
    .join(", "),
  uris: (uris) => uris
    .join(", ")
};

module.exports = Object.freeze(AppFormModelToFieldTransforms);
