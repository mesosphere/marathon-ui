
// This file is loaded by mocha directly and does not support any of
// the shiny new ES6 features.

function getFiles(dir, files_) {
  var fs = require("fs");
  files_ = files_ || [];
  var files = fs.readdirSync(dir);
  for (var i in files) {
    var name = dir + "/" + files[i];
    if (fs.statSync(name).isDirectory()){
      getFiles(name, files_);
    } else {
      files_.push(name);
    }
  }
  return files_;
}

var reporter;
if (process.env.TEAMCITY_VERSION == null) {
  reporter = require("../../../node_modules/mocha/lib/reporters/spec");
} else {
  reporter = require("mocha-teamcity-reporter");
}

exports = module.exports = reporter;
