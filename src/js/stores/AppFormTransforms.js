const AppFormTransforms = {
  appId: (id) => id + "/transformed",
  env: (obj) => { return {[obj.key]: obj.value}; }
};

module.exports = AppFormTransforms;
