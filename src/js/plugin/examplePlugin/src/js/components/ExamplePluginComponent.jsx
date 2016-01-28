import React from "react/addons";

var ExamplePluginComponent = React.createClass({

  componentWillMount: function () {
    console.log("I will mount now!");
  },

  render: function () {
    return (
      <div className="flex-row">
        <h3 className="small-caps">Plugin</h3>
      </div>
    );
  }

});

export default ExamplePluginComponent;
