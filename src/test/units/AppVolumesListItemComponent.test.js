import {expect} from "chai";
import {shallow} from "enzyme";

import React from "react/addons";
import AppVolumesListItemComponent
  from "../../js/components/AppVolumesListItemComponent";

describe("AppVolumesListItemComponent", () => {
  var volume = {
    appId: "stu",
    host: "127.0.0.1",
    persistenceId: "x.y.z",
    type: "TYPE",
    containerPath: "path",
    hostPath: "Hpath",
    size: "1536",
    mode: "XX"
  };
  var component = shallow(
    <AppVolumesListItemComponent
      sortKey={"id"}
      volume={volume} />
  );

  var sortKeys = [
    "id",
    "host",
    "type",
    "containerPath",
    "size",
    "mode"
  ];

  it("contains the right id", () => {
    expect(component.find("td").find("Link").first().props().children)
      .to.equal(volume.persistenceId);
  });

  it("contains the right host", () => {
    expect(component.find("td").at(1).text())
      .to.equal(volume.host);
  });

  it("contains the right type", () => {
    expect(component.find("td").at(2).text())
    .to.equal(volume.type);
  });

  it("contains the right containerPath", () => {
    expect(component.find("td").at(3).text())
      .to.equal(volume.containerPath);
  });

  it("contains the right size", () => {
    expect(component.find("td").at(4).text())
      .to.equal(volume.size);
  });

  it("contains the right mode", () => {
    expect(component.find("td").at(5).text())
      .to.equal(volume.mode);
  });

  describe("sorting is highlighting the right column", () => {
    sortKeys.forEach((sortKey, index) => {
      it(`Sorting by ${sortKey}`, () => {
        var component = shallow(
          <AppVolumesListItemComponent
            sortKey={sortKey}
            volume={volume} />
        );
        expect(component.find("td").at(index).hasClass("cell-highlighted"))
          .to.be.true;
      });
    });
  });
});
