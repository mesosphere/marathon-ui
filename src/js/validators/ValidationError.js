function ValidationError(attribute, message) {
  this.attribute = attribute;
  this.message = message;
}

module.exports = ValidationError;
