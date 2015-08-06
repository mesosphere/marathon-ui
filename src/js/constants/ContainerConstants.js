var Util = require("../helpers/Util");

const ContainerConstants = {
  network: {
    BRIDGE: "BRIDGE",
    HOST: "HOST"
  },
  portMappings: {
    protocol: {
      TCP: "tcp",
      UDP: "udp"
    }
  },
  type: {
    DOCKER: "DOCKER"
  },
  volumes: {
    mode: {
      RO: "RO",
      RW: "RW"
    }
  }
};

module.exports = Util.deepFreeze(ContainerConstants);
