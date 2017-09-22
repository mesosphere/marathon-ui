
import config from "../../../config/config";
import ajaxWrapper from "../../../helpers/ajaxWrapper";

export default class MarathonService {

  request(opts = {}) {
    let method = "GET";

    if (opts.method) {
      method = opts.method;
    }

    return ajaxWrapper({
      /* ${opts.resource} must include the leading '/' */
      url: `${config.apiURL}${opts.resource}`,
      method: method,
      data: opts.data
    });
  }

};
