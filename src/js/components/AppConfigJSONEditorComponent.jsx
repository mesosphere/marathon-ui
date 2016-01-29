import AceEditor from "react-ace";
import "brace/mode/json";
import "brace/theme/monokai";
import React from "react/addons";
import Util from "../helpers/Util";

var AppConfigJSONEditorComponent = React.createClass({
  displayName: "AppConfigJSONEditorComponent",

  propTypes: {
    app: React.PropTypes.object,
    onChange: React.PropTypes.func,
    onError: React.PropTypes.func
  },

  getDefaultProps: function () {
    return {
      app: {id: ""},
      onChange: Util.noop,
      onError: Util.noop
    };
  },

  handleUpdate: function (value) {
    try {
      let app = JSON.parse(value);
      // we assume that any valid JSON object is a valid app config
      this.props.onChange(app);
    }
    catch (e) {
      // no-op avoids empty catch-block warnings. We don't want to raise errors
      // here because that causes a whole state refresh of the editor, losing
      // whatever the user was typing.
      Util.noop();
    }
  },

  getPrettyPrintedDefinition: function () {
    // without this check, we would just show 'null' when creating a new app
    let app = this.props.app == null
      ? AppConfigJSONEditorComponent.getDefaultProps().app
      : this.props.app;
    return JSON.stringify(app, null, 2);
  },

  render: function () {
    return (
      <AceEditor
        editorProps={{$blockScrolling: true}}
        height="495px"
        mode="json"
        onChange={this.handleUpdate}
        showGutter={false}
        showPrintMargin={false}
        theme="monokai"
        value={this.getPrettyPrintedDefinition()}
        width="100%" />
    );
  }

});

export default AppConfigJSONEditorComponent;
