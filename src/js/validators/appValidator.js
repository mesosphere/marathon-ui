var _ = require("underscore");
var ValidationError = require("./ValidationError");

// Matches the command executor, like "//cmd", and custom executors starting
// with or without a "/" but never two "//", like "/custom/exec". Double slash
// is only permitted as a prefix to the cmd executor, "/custom//exec" is
// invalid for example.
var VALID_EXECUTOR_PATTERN = "^(|\\/\\/cmd|\\/?[^\\/]+(\\/[^\\/]+)*)$";
var VALID_EXECUTOR_REGEX = new RegExp(VALID_EXECUTOR_PATTERN);

var VALID_CONSTRAINTS = ["unique", "like", "unlike", "cluster", "group_by"];

function isValidConstraint(p) {
  if (p.length < 2 || p.length > 3) {
    return false;
  }

  /* TODO: should be dynamic. It should be in Scala, but it's impossible to
   * return an error on a specific field.
   */
  var operator = p[1];
  return (_.indexOf(VALID_CONSTRAINTS, operator.toLowerCase()) !== -1);
}

var appValidator = {
  validate: function (attrs) {
    var errors = [];

    if (_.isNaN(attrs.mem) || !_.isNumber(attrs.mem) || attrs.mem < 0) {
      errors.push(
        new ValidationError("mem", "Memory must be a non-negative Number"));
    }

    if (_.isNaN(attrs.cpus) || !_.isNumber(attrs.cpus) || attrs.cpus < 0) {
      errors.push(
        new ValidationError("cpus", "CPUs must be a non-negative Number"));
    }

    if (_.isNaN(attrs.disk) || !_.isNumber(attrs.disk) || attrs.disk < 0) {
      errors.push(
        new ValidationError(
          "disk",
          "Disk Space must be a non-negative Number"
        )
      );
    }

    if (_.isNaN(attrs.instances) || !_.isNumber(attrs.instances) ||
        attrs.instances < 0) {
      errors.push(
        new ValidationError(
          "instances",
          "Instances must be a non-negative Number"
        )
      );
    }

    if (!_.isString(attrs.id) || attrs.id.length < 1) {
      errors.push(new ValidationError("id", "ID must not be empty"));
    }

    if (_.isString(attrs.executor) &&
        !VALID_EXECUTOR_REGEX.test(attrs.executor)) {
      errors.push(
        new ValidationError(
          "executor",
          "Executor must be the string '//cmd', a string containing only " +
          "single slashes ('/'), or blank."
        )
      );
    }

    if (!_.every(attrs.ports, function (p) { return _.isNumber(p); })) {
      errors.push(
        new ValidationError("ports", "Ports must be a list of Numbers"));
    }

    if (!attrs.constraints.every(isValidConstraint)) {
      errors.push(
        new ValidationError("constraints",
          "Invalid constraints format or operator. Supported operators are " +
          VALID_CONSTRAINTS.map(function (c) {
            return "`" + c + "`";
          }).join(", ") +
          ". See https://mesosphere.github.io/marathon/docs/constraints.html."
        )
      );
    }

    if (errors.length > 0) { return errors; }
  },
  "VALID_EXECUTOR_PATTERN": VALID_EXECUTOR_PATTERN
};

module.exports = appValidator;
