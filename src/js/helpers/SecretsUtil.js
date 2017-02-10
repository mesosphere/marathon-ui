var SecretsUtil = {
  /**
   * This function checks if the environment value is a reference to a secret
   * and if yes, it cross-references the secret with the `secrets` property
   * in `allFields` and it returns the secret reference name.
   *
   * @param {Object|String} value - The environment variable value
   * @param {Object} allFields - The full object definition or all form fields
   * @returns {String} Returns the string for the environment value
   */
  getSecretReferenceOfEnvValue: function (value, allFields) {
    if (typeof value !== "object") {
      return value;
    }

    let placeholder;
    const {secret} = value;
    const secretSource = allFields[`secrets.${secret}.source`] ||
      (allFields.secrets && allFields.secrets[secret] &&
        allFields.secrets[secret].source);

    if (!secretSource) {
      placeholder = "Invalid Secret Reference";
      if (!secret) {
        placeholder = "Invalid Value";
      }
    } else {
      placeholder = `Secret "${secretSource}"`;
    }

    return placeholder;
  }
};

export default SecretsUtil;
