var fs = require("fs");
var origJs = require.extensions['.js'];
var ReactTools = require("react-tools");
var transformer = require('./jsx-stub-transform');

require.extensions[".jsx"] = function(module, filename) {
    var content;
    content = fs.readFileSync(filename, "utf8");
    var compiled = ReactTools.transform(content, {
        harmony: true
    });
    return module._compile(compiled, filename);
};

require.extensions['.js'] = function(module, filename) {
  // optimization: code in a distribution should never go through JSX compiler.
  if (filename.indexOf('node_modules/') >= 0) {
    return (origJs || require.extensions['.js'])(module, filename);
  }

  return module._compile(transformer.transform(filename), filename);
};
