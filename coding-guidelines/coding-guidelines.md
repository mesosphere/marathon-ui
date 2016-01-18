# Coding Guidelines

## Line length
One Line in JavaScript should have a maximal length of 80 characters.

## Indentation and Line-Breaks
Rules:
- Indentation is done with 2 spaces in most cases.
- Line breaks are only done if needed, try to use the 80 character limit.
- Strings are splitted at the latest possible position.
  - At the latest whitespace character.
  - The second line is indented with 2 spaces.
- Object Literals are kept on one line if possible.
  - If the line gets to long put each attribute on a single line.
  - Multi level object literals should be splitted in to multiple lines. Each level in the object should have 2 spaces as indentation.

Examples:
```JS
switch (a) {
  case "a":
    break;
  case "b":
    break;
}

var a,
  b,
  c;

function test() {
  var a,
    b,
    c;
}

test(
  "A Very long string which is longer then one line, which is 80 characters " +
    "in this case. This demonstrates how the second line is indented",
  "Another string parameter.",
  {and: "a Literal Object", as: "a parameter", type: "short"},
  {
    yet: "another long parameter Object",
    which: "needs to be split in multiple",
    lines: 3
  }
);

test({
  a: {
    b: 10
  },
  c: 20,
  d: 30,
  e: 40,
  f: 50,
  g: 60,
  h: {
    i: 70
  }
});
```

## Whitespace
Rules:
- No Trailing spaces should be used at the end of a line.
- No multiple Blank lines.

## Functions
Rules:
  - Function blocks should have a space before the definition.
  - Function should have a space before the opening parentheses.
  - Named Functions should not have a space before the opening function parentheses.
  - Functions can be on a single line.
  - Anonymous Functions need to have a space before the opening function parentheses.
  - Arrow functions do have the same constraints

Examples:
```JS
function test() {
  return;
}

function test() { var a = 10; return a; }

var test = function () {var b = 10; return b;}

var es6 = parameter => parameter();

var es6 = parameter => {
  parameter();
  return false;
}

var es6 = (parameter, index) => parameter(index);

var es6 = (parameter, index) => {
  parameter(index);
  return false;
}
```

## Comments
Rules:
  - Comments should be prefixed with a space sign.
  - The `*` sign is a exception to the rule.

Examples:
```JS
// Single line Comment

//* A Exception to the space rule

/*
  Comment Block with no space
*/

/**
 * Block Comment
 */
```

## If, loops, switch blocks
Rules:
  - Space after the keyword
  - Space before opening parentheses
  - Strict equal (`===` or `!==`)

Examples:
```JS
if (a === b) {
  a();
}

if (true !== false) {
  // Statements
}

switch (a) {
  case 1:
    break;
  case 2:
    break;
  default:
    break;
}

for (var a = 10; a !== 0; a--) {
  // Statements
}
```

## Strings
Strings are defined with double quotes.

## Variables and Attribute names
Variables always use camelCase names.
May have a underscore dangle.
Examples:
```JS
var camelCase = "{value}",
  _camelCase = "{value}",
  CamelCase = "{test}",
  camelCase_ = "{test}";
```

## Object Literals
Object literals should have no space after the '{' or before the '}' signs.

Valid Example
```JS
var objectLiteral = {"key": "value", "key2": "value2"};

var objectLiteral = {
  "key": "value",
  "key2": "value2"
};
```

## JSDoc
If there is a return there should be a type and description.
If there is one or multiple parameter/s there should be a name, type and description for each one.

Example:
```JS
/**
 * Description of what the function does
 *
 * @param {Function} a A function containing a callback.
 */
function b(a) {
  a();
}

/**
 * Description of what the function does.
 *
 * @param {Function} a A function containing a callback.
 * @return {String} Returns a String containing "done".
 */
function test(a) {
  a();
  return "done";
}

/**
 * Description of what the function does.
 *
 * @param {Number} a A Number on how often the b should be called.
 * @param {Function} callback A function containing a callback function.
 * @return {String} Returns a String containing "done".
 */
function test(number, callback) {
  var counter;
  for (counter = 0; counter <= number; counter++) {
    a();
  }
  return "done";
}
```

## JSX

### Self contained elements
On self contained elements attributes should be indented with 2 spaces.

Example:
```JS
<PromptDialogComponent data={dialogData}
  onAccept={this.handleAcceptDialog}
  onDismiss={this.handleDismissDialog} />
```

### Non self contained elements
On elements which are not self contained the indentation of attributes should be 4 spaces. And the childNodes should have a indentation of 2 spaces to the element and -2 spaces to the attributes.

Example:
```JS
<PromptDialogComponent data={dialogData}
    onAccept={this.handleAcceptDialog}
    onDismiss={this.handleDismissDialog}>
  <ChildNode />
</PromptDialogComponent>
```
