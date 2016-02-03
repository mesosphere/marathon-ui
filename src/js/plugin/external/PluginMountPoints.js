import Util from "../../helpers/Util";

const PluginMountPoints = Util.objectCreateWithAdder("PLUGIN_MOUNT_POINTS_");

["SIDEBAR_BOTTOM"].forEach(PluginMountPoints.add);

export default PluginMountPoints;
