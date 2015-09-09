const AppFormTransforms = {
  appId: (id) => id + "/transformed",
  env: (rows) => {
    return rows.reduce((memo, row) => {
      memo[row.key] = row.value;
      return memo;
    }, {});
  },
  mem: (value) => parseInt(value)
};

module.exports = AppFormTransforms;
