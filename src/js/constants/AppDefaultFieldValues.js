import Util from "../helpers/Util";

const AppDefaultFieldValues = {
  id: "",
  cmd: "",
  cpus: 1,
  mem: 128,
  disk: 0,
  instances: 1,
  // TODO: distinguish input default values from model defaults like ports: []
  ports: ""
};

export default Util.deepFreeze(AppDefaultFieldValues);
