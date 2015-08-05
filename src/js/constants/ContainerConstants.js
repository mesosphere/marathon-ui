const ContainerConstants = {
  network: Object.freeze({
    BRIDGE: "BRIDGE",
    HOST: "HOST"
  }),
  portMappings: {
    protocol: Object.freeze({
      TCP: "tcp",
      UDP: "udp"
    })
  },
  type: Object.freeze({
    DOCKER: "DOCKER"
  }),
  volumes: {
    mode: Object.freeze({
      RO: "RO",
      RW: "RW"
    })
  }
};

module.exports = Object.freeze(ContainerConstants);
