const AppFormErrorMessages = {
  appId: [
    "ID must not be empty",
    "ID cannot contain whitespaces"
  ],
  env: [
    "Key cannot be blank"
  ],
  getMessage: function (fieldId, index = 0) {
    if (this[fieldId] != null && this[fieldId][index] != null) {
      return this[fieldId][index];
    }
    return "General error";
  }
};

module.exports = Object.freeze(AppFormErrorMessages);
