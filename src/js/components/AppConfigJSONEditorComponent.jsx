import AceEditor from "react-ace";
import "brace/mode/json";
import "brace/theme/monokai";
import React from "react/addons";

import TooltipComponent from "../components/TooltipComponent";

import {AppConfigDefaultValues} from "../constants/AppConfigDefaults";
import ExternalLinks from "../constants/ExternalLinks";

var AppConfigJSONEditorComponent = React.createClass({
  displayName: "AppConfigJSONEditorComponent",

  propTypes: {
    app: React.PropTypes.object,
    onChange: React.PropTypes.func.isRequired,
    onError: React.PropTypes.func.isRequired
  },

  getDefaultProps: function () {
    return {
      app: null
    };
  },

  shouldComponentUpdate: function () {
    // avoid re-rendering the component as it causes the cursor to jump.
    return false;
  },

  handleUpdate: function (value) {
    var app = null;
    var jsonWasValid = false;

    try {
      app = JSON.parse(value);
      jsonWasValid = true;
    }
    catch (e) {
      this.props.onError({"JSON": "Invalid JSON"});
    }

    if (jsonWasValid) {
      this.props.onChange(app);
    }
  },

  getPrettyPrintedDefinition: function () {
    // without this check, we would just show 'null' when creating a new app
    var app = this.props.app == null
      ? AppConfigDefaultValues
      : Object.assign({}, AppConfigDefaultValues, this.props.app);
    return JSON.stringify(app, null, 2);
  },

  render: function () {
    var tooltipMessage = (
      <span>
        This is the JSON editor
        docs: <a href={ExternalLinks.JSON_EDITOR} target="_blank">Read more</a>.
      </span>
    );

    var toolTip = (
      <TooltipComponent className="left"
          message={tooltipMessage}>
        <i className="icon icon-xs help" />
      </TooltipComponent>
    );
    return (
      <div className="json-editor">
       {toolTip}
        <AceEditor
          editorProps={{$blockScrolling: true}}
          height="100%"
          mode="json"
          onChange={this.handleUpdate}
          showGutter={true}
          showPrintMargin={false}
          theme="monokai"
          value={this.getPrettyPrintedDefinition()}
          width="100%" />
      </div>
    );
  }

});

export default AppConfigJSONEditorComponent;
