var ContainerConstants = require("../constants/ContainerConstants");

var containerScheme = {
  "container": {
    "type": ContainerConstants.type.DOCKER,
    "docker": {
      "image": null,
      "network": null,
      "portMappings": [
        {
          "containerPort": 0,
          "hostPort": 0,
          "servicePort": 0,
          "protocol": ContainerConstants.portMappings.protocol.TCP
        }
      ]
    },
    "privileged": false,
    "parameters": [],
    "forcePullImage": false,
    "volumes": []
  }
};

module.exports = containerScheme;
