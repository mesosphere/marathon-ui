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

module.exports = Object.freeze(dockerRowSchemes);
