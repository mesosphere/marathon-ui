var ContainerConstants = require("../constants/ContainerConstants");

var containerScheme = {
  "container": {
    "type": ContainerConstants.TYPE.DOCKER,
    "docker": {
      "image": null,
      "network": null,
      "portMappings": [
        {
          "containerPort": 0,
          "hostPort": 0,
          "servicePort": 0,
          "protocol": ContainerConstants.PORTMAPPINGS.PROTOCOL.TCP
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
