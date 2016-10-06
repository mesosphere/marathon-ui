import React from "react/addons";

import AppFormErrorMessages from "../constants/AppFormErrorMessages";
import FormActions from "../actions/FormActions";

import Util from "../helpers/Util";

var DuplicableRowsMixin = {
  propTypes: {
    errorIndices: React.PropTypes.object.isRequired,
    fields: React.PropTypes.object.isRequired,
    getErrorMessage: React.PropTypes.func.isRequired
  },

  getInitialState: function () {
    if (this.duplicableRowsScheme == null) {
      throw new Error("Please specify an duplicableRowsScheme-object " +
        "in your component.");
    }

    return {
      rows: this.getPopulatedRows()
    };
  },

  componentWillReceiveProps: function (nextProps) {
    Object.keys(this.duplicableRowsScheme).forEach(key => {
      if (!nextProps.fields.hasOwnProperty(key)) {
        throw new Error(`Please ensure ${key} is defined in
          AppFormStore#duplicableRowFields.`);
      }
    });

    this.setState({
      rows: this.getPopulatedRows(nextProps.fields)
    }, this.enforceMinRows);
  },

  componentWillMount: function () {
    this.enforceMinRows();
  },

  enforceMinRows: function () {
    var state = this.state;
    var duplicableRowsScheme = this.duplicableRowsScheme;

    Object.keys(duplicableRowsScheme).forEach(function (fieldId) {
      if (state.rows[fieldId] == null || state.rows[fieldId].length === 0) {
        let rowScheme = Util.extendObject(duplicableRowsScheme[fieldId], {
          consecutiveKey: Util.getNewConsecutiveKey()
        });
        FormActions.insert(fieldId, rowScheme);
      }
    });
  },

  getPopulatedRows: function (fields = this.props.fields) {
    var duplicableRowsScheme = this.duplicableRowsScheme;
    var rows = Object.keys(duplicableRowsScheme).reduce((memo, rowFieldId) => {
      memo[rowFieldId] =
        this.populateInitialConsecutiveKeys(fields[rowFieldId]);
      return memo;
    }, {});
    return rows;
  },

  populateInitialConsecutiveKeys: function (rows) {
    if (rows == null) {
      return null;
    }

    return rows.map(function (row) {
      return Util.extendObject(row, {
        consecutiveKey: row.consecutiveKey != null
          ? row.consecutiveKey
          : Util.getNewConsecutiveKey()
      });
    });
  },

  getDuplicableRowValues: function (fieldId, i) {
    const findDOMNode = React.findDOMNode;
    const refs = this.refs;

    const row = Util.deepCopy(this.state.rows[fieldId][i]);

    return Object.keys(this.duplicableRowsScheme[fieldId])
      .reduce(function (memo, key) {
        var input = findDOMNode(refs[`${key}${i}`]);
        if (input == null) {
          return memo;
        }
        memo[key] = input.type !== "checkbox"
          ? input.value
          : input.checked;
        return memo;
      }, row);
  },

  addRow: function (fieldId, position) {
    FormActions.insert(fieldId,
      Util.extendObject(this.duplicableRowsScheme[fieldId], {
        consecutiveKey: Util.getNewConsecutiveKey()
      }),
      position
    );
  },

  updateRow: function (fieldId, position) {
    var row = this.getDuplicableRowValues(fieldId, position);
    FormActions.update(fieldId, row, position);
  },

  removeRow: function (fieldId, position) {
    var row = this.getDuplicableRowValues(fieldId, position);
    FormActions.delete(fieldId, row, position);
  },

  hasOnlyOneSingleEmptyRow: function (fieldId, excludeFieldIds = []) {
    var rows = this.state.rows[fieldId];

    if (rows.length !== 1) {
      return false;
    }

    return Object.keys(this.duplicableRowsScheme[fieldId]).every((key) => {
      return excludeFieldIds.includes(key) ||
        rows[0][key] == null ||
        Util.isStringAndEmpty(rows[0][key]);
    });
  },

  getError: function (fieldId, consecutiveKey) {
    var errorIndices = this.props.errorIndices[fieldId];
    if (errorIndices != null) {
      let errorIndex = errorIndices[consecutiveKey];
      if (errorIndex != null) {
        return (
          <div className="help-block">
            <strong>
              {AppFormErrorMessages.getFieldMessage(fieldId, errorIndex)}
            </strong>
          </div>
        );
      }
    }
    return null;
  },

  getGeneralErrorBlock: function (fieldId) {
    var error = this.props.getErrorMessage(fieldId);

    if (error == null) {
      return null;
    }

    return (
      <p className="text-danger">
        <strong>{error}</strong>
      </p>
    );
  }

};

export default DuplicableRowsMixin;
