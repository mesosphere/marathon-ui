
import config from "../../../config/config";
import ajaxWrapper from "../../../helpers/ajaxWrapper";
import Utils from "../utils";

export default class MarathonService {

  static request(opts = {}) {
    let method = "GET";
    let resource = Utils.addLeadingSlashIfNedded(opts.resource);

    if (opts.method) {
      method = opts.method;
    }

    return ajaxWrapper({
      url: `${config.apiURL}${resource}`,
      method: method,
      data: opts.data
    });
  }

};
