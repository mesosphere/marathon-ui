import Util from "../helpers/Util";

const AppDefaultFieldValues = {
  id: "",
  cmd: "",
  cpus: 1,
  mem: 128,
  disk: 0,
  instances: 1
};

export default Util.deepFreeze(AppDefaultFieldValues);
