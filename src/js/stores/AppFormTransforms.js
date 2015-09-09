const AppFormTransforms = {
  appId: (id) => id + "/transformed",
  disk: (value) => parseInt(value),
  env: (rows) => {
    return rows.reduce((memo, row) => {
      memo[row.key] = row.value;
      return memo;
    }, {});
  }
};

module.exports = AppFormTransforms;
