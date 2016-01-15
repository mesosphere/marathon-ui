import Util from "../../helpers/Util";

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

export default Util.deepFreeze(dockerRowSchemes);
