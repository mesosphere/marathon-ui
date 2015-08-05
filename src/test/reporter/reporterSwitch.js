var reporter;

if (process.env.TEAMCITY_VERSION == null) {
  reporter = require("../../../node_modules/mocha/lib/reporters/spec");
} else {
  reporter = require("../../../node_modules/mocha-teamcity-reporter");
}

exports = module.exports = reporter;
