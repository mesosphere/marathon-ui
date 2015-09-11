const AppFormModelToFieldTransforms = {
  constraints: (constraints) => constraints
    .map((constraint) => constraint.join(":"))
    .join(", "),
  env: (rows) => Object.keys(rows)
    .map((rowKey, i) => {
      return {
        key: rowKey,
        value: rows[rowKey],
        consecutiveKey: i
      };
    }),
  ports: (ports) => ports
    .join(", "),
  uris: (uris) => uris
    .join(", ")
};

module.exports = Object.freeze(AppFormModelToFieldTransforms);
