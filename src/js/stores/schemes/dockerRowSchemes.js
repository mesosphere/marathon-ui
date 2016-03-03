import Util from "../../helpers/Util";

const dockerRowSchemes = {
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
