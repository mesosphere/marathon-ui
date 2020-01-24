import {expect} from "chai";
import ServiceSchemeUtil from "../../js/helpers/ServiceSchemeUtil";

function verifyPortSchemeWithDefault(serviceScheme, serviceScheme0,
  expectedSchemePort0, expectedSchemePort1) {
  describe("MARATHON_SCHEME_PORT is set to " + serviceScheme, function() {
    describe("MARATHON_SCHEME_PORT0 is set to " + serviceScheme0, function() {
      it("detect scheme of port 0", function() {
        expect(ServiceSchemeUtil.getServiceSchemeFromLabels({
          "MARATHON_SCHEME_PORT": serviceScheme,
          "MARATHON_SCHEME_PORT0": serviceScheme0,
        }, 0)).to.eq(expectedSchemePort0);
      });

      it("detect scheme of port 1", function() {
        expect(ServiceSchemeUtil.getServiceSchemeFromLabels({
          "MARATHON_SCHEME_PORT": serviceScheme,
          "MARATHON_SCHEME_PORT0": serviceScheme0,
        }, 1)).to.eq(expectedSchemePort1);
      });
    });
  });
}

function verifyPortSchemeWithoutDefault(serviceScheme0,
  expectedSchemePort0, expectedSchemePort1) {
  describe("MARATHON_SCHEME_PORT is not set", function() {
    describe("MARATHON_SCHEME_PORT0 is set to " + serviceScheme0, function() {
      it("detect scheme of port 0", function() {
        expect(ServiceSchemeUtil.getServiceSchemeFromLabels({
          "MARATHON_SCHEME_PORT0": serviceScheme0,
        }, 0)).to.eq(expectedSchemePort0);
      });

      it("detect scheme of port 1", function() {
        expect(ServiceSchemeUtil.getServiceSchemeFromLabels({
          "MARATHON_SCHEME_PORT0": serviceScheme0,
        }, 1)).to.eq(expectedSchemePort1);
      });
    });
  });
}

describe("ServiceSchemeUtil", function () {
  //                           default scheme        scheme port 0       expected port 0             expected port 1
  verifyPortSchemeWithDefault("http",               "http",             "http",                     "http");
  verifyPortSchemeWithDefault("http",               "https",            "https",                    "http");
  verifyPortSchemeWithDefault("https",              "http",             "http",                     "https");
  verifyPortSchemeWithDefault("https",              "https",            "https",                    "https");

  //                             scheme port 0       expected port 0             expected port 1
  verifyPortSchemeWithoutDefault("http",             "http",                     "");
  verifyPortSchemeWithoutDefault("https",            "https",                    "");
  verifyPortSchemeWithoutDefault("http",             "http",                     "");
  verifyPortSchemeWithoutDefault("https",            "https",                    "");
});
