import Util from "../helpers/Util";

// Dictates which fields should be shown by default. Note that these fields are
// not necessarily required, merely displayed. Used in the AppConfigJSONEditor.

const AppDefaultFields = {
  id: ""
};

export default Util.deepFreeze(AppDefaultFields);
