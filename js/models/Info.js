var config = require("../config/config");
var Backbone = require("backbone");

var Info = Backbone.Model.extend({
  url: function () {
    return config.apiURL + "v2/info";
  }
});

module.exports = Info;
