const AppFormTransforms = {
  cpus: (value) => parseFloat(value),
  disk: (value) => parseFloat(value),
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
