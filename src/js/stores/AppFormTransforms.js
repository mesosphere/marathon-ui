const AppFormTransforms = {
  env: (rows) => {
    return rows.reduce((memo, row) => {
      memo[row.key] = row.value;
      return memo;
    }, {});
  },
  mem: (value) => parseFloat(value)
};

module.exports = AppFormTransforms;
