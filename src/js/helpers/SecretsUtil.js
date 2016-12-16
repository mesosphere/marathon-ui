var SecretsUtil = {
  environmentVariableValueWithSecret: function (value, allFields) {
    if (typeof value !== "object") {
      return value;
    }

    let placeholder;
    const {secret} = value;
    const secretSource = allFields[`secrets.${secret}.source`] ||
      (allFields.secrets && allFields.secrets[secret] &&
        allFields.secrets[secret].source);

    if (!secretSource) {
      placeholder = `[Invalid Secret Reference]`;
      if (!secret) {
        placeholder = `[Invalid Value]`;
      }
    } else {
      placeholder = `[Secret "${secretSource}"]`;
    }

    return placeholder;
  }
};

export default SecretsUtil;
