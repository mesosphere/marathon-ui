import {expect} from "chai";
import {shallow} from "enzyme";

import React from "react/addons";

import AutolinkComponent from "../../js/components/AutolinkComponent";

describe("AutolinkComponent", function () {

  it("detects URLs in strings", function () {
    var url = "http://www.test.com/page";
    var text = `Example test that has a hidden ${url} URL.`;
    this.component = shallow(<AutolinkComponent text={text}/>);
    expect(this.component.find("a").props().href).to.equal(url);
  });

  it("does not create anchors when no URL is found", function () {
    var url = "not a url";
    var text = `Example test that has a hidden ${url} URL.`;
    this.component = shallow(<AutolinkComponent text={text}/>);
    expect(this.component.find("a")).length.to.be(0);
  });

  it("handles tricky URLs", function () {
    var url = "https://test.com/ütf8/röcks/";
    var text = `Example test that has a hidden ${url} URL.`;
    this.component = shallow(<AutolinkComponent text={text}/>);
    expect(this.component.find("a").props().href).to.equal(url);
  });


});
