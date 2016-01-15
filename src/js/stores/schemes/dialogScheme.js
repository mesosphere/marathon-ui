import Util from "../../helpers/Util";
import DialogTypes from "../../constants/DialogTypes";
import DialogSeverity from "../../constants/DialogSeverity";

const dialogScheme = {
  actionButtonLabel: "OK",
  id: null,
  inputProperties: {
    defaultValue:"",
    type: "text"
  },
  message: "",
  severity: DialogSeverity.INFO,
  title: "",
  type: DialogTypes.ALERT
};

export default Util.deepFreeze(dialogScheme);
