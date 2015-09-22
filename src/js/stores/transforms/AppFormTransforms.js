var AppFormFieldToModelTransforms = require("./AppFormFieldToModelTransforms");
var AppFormModelToFieldTransforms = require("./AppFormModelToFieldTransforms");

const AppFormTransforms = {
  FieldToModel: AppFormFieldToModelTransforms,
  ModelToField: AppFormModelToFieldTransforms
};

module.exports = Object.freeze(AppFormTransforms);
