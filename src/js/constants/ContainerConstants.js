import Util from "../helpers/Util";

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

export default Util.deepFreeze(ContainerConstants);
