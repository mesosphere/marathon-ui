const AppFormTransforms = {
  env: (rows) => {
    return rows.reduce((memo, row) => {
      memo[row.key] = row.value;
      return memo;
    }, {});
  }
};

module.exports = AppFormTransforms;
