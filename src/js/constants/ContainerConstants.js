var Util = require("../helpers/Util");

const ContainerConstants = {
  NETWORK: {
    BRIDGE: "BRIDGE",
    HOST: "HOST"
  },
  PORTMAPPINGS: {
    PROTOCOL: {
      TCP: "tcp",
      UDP: "udp"
    }
  },
  TYPE: {
    DOCKER: "DOCKER"
  },
  VOLUMES: {
    MODE: {
      RO: "RO",
      RW: "RW"
    }
  }
};

module.exports = Util.deepFreeze(ContainerConstants);
