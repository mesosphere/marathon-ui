import {expect} from "chai";
import {shallow} from "enzyme";

import React from "react/addons";
import AppVolumesListComponent
  from "../../js/components/AppVolumesListComponent";
import AppVolumesListItemComponent
  from "../../js/components/AppVolumesListItemComponent";

describe("AppVolumesListComponent", () => {
  var volumes = [
    {
      appId: "stu",
      host: "127.0.0.1",
      persistenceId: "x.y.z",
      containerPath: "path",
      persistent: {
        size: "1536"
      },
      mode: "XX",
      status: "attached"
    },
    {
      appId: "stu",
      host: "127.0.0.1",
      persistenceId: "x.y.z",
      containerPath: "path",
      hostPath: "Hpath",
      mode: "XX",
      status: "detached"
    }
  ];
  var component = shallow(
    <AppVolumesListComponent
      volumes={volumes} />
  );

  var sortKeys = [
    "id",
    "host",
    "type",
    "containerPath",
    "size",
    "mode",
    "status"
  ];

  it("contains the right LOCAL volume list item", () => {
    expect(component.contains(
      <AppVolumesListItemComponent
        key={0}
        volume={volumes[0]}
        sortKey="id" />)).to.be.true;
  });

  it("contains the right DOCKER volume list item", () => {
    expect(component.contains(
      <AppVolumesListItemComponent
        key={1}
        volume={volumes[1]}
        sortKey="id" />)).to.be.true;
  });

  it("Should contain 2 volumes", () => {
    expect(component.find(AppVolumesListItemComponent)).to.have.length(2);
  });

  describe("changes sort state", () => {
    it("should change sort direction if same sortKey is provided twice", () => {
      component.setState({
        sortKey: "id",
        sortDescending: false
      });
      component.instance().sortBy("id");
      expect(component.state("sortDescending")).to.be.true;
    });

    it("should change sort key to provided key", () => {
      component.setState({
        sortKey: "id",
        sortDescending: false
      });
      component.instance().sortBy("type");
      expect(component.state("sortKey")).to.equal("type");
    });
  });

  describe("sorting is highlighting the right column", () => {
    var component = shallow(
      <AppVolumesListComponent
        volumes={volumes} />
    );
    sortKeys.forEach((sortKey, index) => {
      it(`Sorting by ${sortKey}`, () => {
        component.setState({
          sortKey: sortKey,
          sortDescending: false
        });
        expect(component.find("th").at(index).hasClass("cell-highlighted"))
          .to.be.true;
      });
    });
  });

  describe("if no volumes are provided", () => {
    var component = shallow(
      <AppVolumesListComponent />
    );

    it("should contain no AppVolumesListItemComponent", () => {
      expect(component.find(AppVolumesListItemComponent)).to.have.length(0);
    });
  });
});
