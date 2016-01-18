import jsdom from "jsdom";

const html = "<!doctype html><html><head></head><body></body></html>";

global.document = jsdom.jsdom(html, {
  globalize: true,
  console: true,
  useEach: false,
  skipWindowCheck: false
});
global.window = document.defaultView;
global.navigator = window.navigator;
