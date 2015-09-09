const AppFormTransforms = {
  cpus: (value) => parseFloat(value),
  disk: (value) => parseFloat(value),
  env: (rows) => {
    return rows.reduce((memo, row) => {
      memo[row.key] = row.value;
      return memo;
    }, {});
  },
  instances: (value) => parseInt(value),
  mem: (value) => parseFloat(value)
};

module.exports = AppFormTransforms;
