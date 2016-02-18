import {expect} from "chai";
import URLUtil from "../../js/helpers/URLUtil";

describe("URLUtil", function () {

  describe("getAbsoluteURL", function () {

    it("Adds base url to relative url", function () {
      // We can't test this properly as jsdom doesn't behave
      // like real browsers wo do...
      // Correct jsdom behavior is not adding something to the URL.
      expect(URLUtil.getAbsoluteURL("foo/bar")).to.equal("foo/bar");
    });

    it("Adds nothing to absolute urls", function () {
      expect(URLUtil.getAbsoluteURL("http://exmaple.com/foo/bar"))
        .to.equal("http://exmaple.com/foo/bar");
    });

  });

});
