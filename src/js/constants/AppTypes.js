var ContainerConstants = require("../constants/ContainerConstants");

const AppTypes = ["DEFAULT"].concat(
  Object.keys(ContainerConstants.TYPE)
    .map((typeKey) => ContainerConstants.TYPE[typeKey])
  );

module.exports = AppTypes;
