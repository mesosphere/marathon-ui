import AppFormFieldToModelTransforms from "./AppFormFieldToModelTransforms";
import AppFormModelToFieldTransforms from "./AppFormModelToFieldTransforms";

const AppFormTransforms = {
  FieldToModel: AppFormFieldToModelTransforms,
  ModelToField: AppFormModelToFieldTransforms
};

export default Object.freeze(AppFormTransforms);
