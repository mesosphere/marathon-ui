var React = require("react");
//* test
const dialogId =
  DialogActions.prompt("Please provide a scaling factor for all " +
      "applications in this group.",
    "1.0", {
      type: "number",
      min: "0"
    }
  );

const dialogId = DialogActions.prompt(
  "Please provide a scaling factor for all applications in this group.",
  "1.0", {
    type: "number",
    min: "0"
  }
);

const dialogId = DialogActions.prompt(
  "Please provide a scaling factor for all applications in this group.Please " +
    "provide a scaling factor for all applications in this group.Please " +
    "provide a scaling factor for all applications in this group.",
  "1.0",
  {
    type: "number",
    min: "0"
  }
);

const dialogId = DialogActions.prompt("Please provide a scaling factor for " +
      "all applications in this group.", "1.0", {type: "number", min: "0"});

function test() {

  return (
    <li key={action.app} className="overflow-ellipsis">
      Hello World!
    </li>
  );
}

test(
  "A Very long string which is longer then one line, which is 80 characters " +
    "in this case. This demonstrates how the second line is indented",
  "Another string parameter",
  {and: "a Literal Object", as: "a parameter", type: "short"},
  {
    yet: "another long parameter Object",
    which: "needs to be split in multiple",
    lines: 3
  }
);

test({a: {b: 10}, c: 20, d: 30, e: 40, f:50, g: 60, h: {i: 70}});
