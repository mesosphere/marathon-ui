var AppDispatcher = require("../AppDispatcher");
var FormsEvents = require("../events/FormEvents");

var FormActions = {
  insert: function (fieldId, value, index = null) {
    AppDispatcher.dispatch({
      actionType: FormsEvents.INSERT,
      fieldId: fieldId,
      value: value,
      index: index
    });
  },
  update: function (fieldId, value, index = null) {
    AppDispatcher.dispatch({
      actionType: FormsEvents.UPDATE,
      fieldId: fieldId,
      value: value,
      index: index
    });
  },
  delete: function (fieldId, value, index = null) {
    AppDispatcher.dispatch({
      actionType: FormsEvents.DELETE,
      fieldId: fieldId,
      value: value,
      index: index
    });
  }
};

module.exports = FormActions;
