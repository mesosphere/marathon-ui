var Util = require("../../helpers/Util");

const dockerRowSchemes = {
  dockerPortMappings: {
    containerPort: "",
    hostPort: "",
    servicePort: "",
    protocol: null
  },
  dockerParameters: {
    key: "",
    value: ""
  },
  containerVolumes: {
    containerPath: "",
    hostPath: "",
    mode: null
  }
};

module.exports = Util.deepFreeze(dockerRowSchemes);
