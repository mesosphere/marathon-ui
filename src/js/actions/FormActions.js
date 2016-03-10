import AppDispatcher from "../AppDispatcher";
import FormEvents from "../events/FormEvents";

var FormActions = {
  insert: function (fieldId, value, index = null) {
    AppDispatcher.dispatch({
      actionType: FormEvents.INSERT,
      fieldId: fieldId,
      value: value,
      index: index
    });
  },
  update: function (fieldId, value, index = null) {
    AppDispatcher.dispatch({
      actionType: FormEvents.UPDATE,
      fieldId: fieldId,
      value: value,
      index: index
    });
  },
  delete: function (fieldId, value, index = null) {
    AppDispatcher.dispatch({
      actionType: FormEvents.DELETE,
      fieldId: fieldId,
      value: value,
      index: index
    });
  }
};

export default FormActions;
