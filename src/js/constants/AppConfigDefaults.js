import Util from "../helpers/Util";

// Default values for the config form editor
export const AppConfigFormDefaultValues = Util.deepFreeze({
  id: "",
  cmd: "",
  cpus: 0.1,
  mem: 16,
  disk: 0,
  instances: 1,
  ports: "0"
});

// Default values for an 'empty' app config, or the JSON editor
export const AppConfigDefaultValues = Util.deepFreeze({
  id: null,
  cmd: null,
  cpus: 0.1,
  mem: 16,
  disk: 0,
  instances: 1,
  ports: [ 0 ]
});
