import Util from "../helpers/Util";

const ContainerConstants = {
  NETWORK: {
    BRIDGE: "container/bridge",
    USER: "container",
    HOST: "host",
    MANY: null
  },
  PORTMAPPINGS: {
    PROTOCOL: {
      TCP: "tcp",
      UDP: "udp"
    }
  },
  TYPE: {
    DOCKER: "DOCKER",
    MESOS: "MESOS"
  },
  VOLUMES: {
    MODE: {
      RO: "RO",
      RW: "RW"
    }
  }
};

export default Util.deepFreeze(ContainerConstants);
