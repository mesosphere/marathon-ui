import {expect} from "chai";
import * as ShallowUtils from "./../helpers/ShallowUtils";

import React from "react/addons";
import BreadcrumbComponent from "../../js/components/BreadcrumbComponent";

describe("BreadcrumbComponent", function () {

  /*
   * TODO https://github.com/mesosphere/marathon/issues/2710
   *
   * ReactRouter.Link pre-1.0 still depends on the childContext
   * https://github.com/rackt/react-router/blob/57543eb41ce45b994a29792d77c86cc10b51eac9/docs/guides/testing.md
   *
   * The stubRouterContext approach is incompatible with enzyme, so let's revisit
   * the BreadcrumbComponent testing once we upgrade to ReactRouter 1.x
   */

  before(function () {
    this.renderComponent = (group, app, task) => {
      var renderer = React.addons.TestUtils.createRenderer();
      renderer.render(
        <BreadcrumbComponent groupId={group} appId={app} taskId={task} />
      );
      var component = renderer.getRenderOutput();
      renderer.unmount();
      return component;
    };
  });

  it("shows root path by default", function () {
    var component = this.renderComponent();
    var rootLink = component.props.children[0].props.children;
    expect(rootLink.props.to).to.equal("apps");
    expect(ShallowUtils.getText(rootLink)).to.equal("Applications");
  });

  it("renders group names correctly", function () {
    var component = this.renderComponent("/group-a/group-b/group-c/");
    var groupItems = component.props.children[1];
    var linkText = groupItems
      .filter((li) => !!li)
      .map((li) => ShallowUtils.getText(li.props.children));

    expect(linkText).to.deep.equal([
                                     "group-a", "group-b", "group-c"
                                   ]);
  });

  it("renders group links correctly", function () {
    var component = this.renderComponent("/group-a/group-b/group-c/");
    var groupItems = component.props.children[1];
    var linkTargets = groupItems
      .filter((li) => !!li)
      .map((li) => li.props.children.props.params.groupId);

    // routes must be URIEncoded
    expect(linkTargets).to.deep.equal([
      "%2Fgroup-a",
      "%2Fgroup-a%2Fgroup-b",
      "%2Fgroup-a%2Fgroup-b%2Fgroup-c"
    ]);
  });

  it("shows the application, if supplied", function () {
    var component = this.renderComponent("/group-a/", "/group-a/app-1");
    var appLink = component.props.children[2].props.children;
    expect(appLink.props.to).to.equal("app");
    expect(appLink.props.params.appId).to.equal("%2Fgroup-a%2Fapp-1");
    expect(ShallowUtils.getText(appLink.props.children)).to.equal("app-1");
  });

  it("shows the task, if supplied", function () {
    var component =
      this.renderComponent("/group-a/", "/group-a/app-1", "task-1");
    var taskLink = component.props.children[3].props.children;
    expect(taskLink.props.to).to.equal("appView");
    expect(taskLink.props.params.appId).to.equal("%2Fgroup-a%2Fapp-1");
    expect(taskLink.props.params.view).to.equal("task-1");
    expect(ShallowUtils.getText(taskLink)).to.equal("task-1");
  });

});
