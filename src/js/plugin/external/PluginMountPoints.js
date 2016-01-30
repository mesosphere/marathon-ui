const PluginMountPoints = {};

// Make the properties of the object read-only, but the object extensible.
Object.defineProperty(PluginMountPoints, "add", {
  enumerable: false,
  configurable: false,
  writable: false,
  value: function (key) {
    Object.defineProperty(PluginMountPoints, key, {
      enumerable: false,
      configurable: false,
      writable: false,
      value: "MOUNT_POINT_" + key
    });
  }
});

var add = PluginMountPoints.add;

add("SIDEBAR_BOTTOM");

export default PluginMountPoints;
