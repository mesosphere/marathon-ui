# Coding Guidelines
## Table of Contents

- [General](#general)
- [Comments](#comments)
- [Strings](#strings)
- [Variables and Attribute Names](#variables-and-attribute-names)
- [Object Literals](#object-literals)
- [Indentation and Line Breaks](#indentation-and-line-breaks)
- [Functions](#functions)
- [Control Statements](#control-statements)
- [JSDoc](#jsdoc)
- [JSX](#jsx)
	- [Self Contained Elements](#self-contained-elements)
	- [Non Self Contained Elements](#non-self-contained-elements)


## General
We are using the eslintrc to lint our code. All basic rules are defined there, some important rules are:
  - Max line length is 80 characters.
  - Indentation is 2 spaces.
  - No multiple empty lines.

We prefer a functional approach and try to use the abstractions over
normal control statements. Functions and code must be
self-descriptive, use JSDoc blocks only if necessary.

## Comments
Rules:
- Comments must be prefixed with a space sign.
- The `*` sign is a exception to the rule.

Examples:
```JS
// Single line Comment

//* A Exception to the space rule

/**
* Block Comment
*/
```

## Strings
 - Strings are defined with double quotes.
 - Use template strings if variables are used.

Example:
```JS
var string = `Hello ${world}!`;
```

## Variables and Attribute Names
Variable names always use camelCase names, except Constants which use UPPER_CASE.
One var, let or const per variable and line.

Examples:
```JS
var camelCase = "{value}";
let CamelCase = new Object();
const SOME_CONSTANT = "constant value";
```

## Object Literals
Object literals must have no space after the '{' or before the '}' signs.

Valid Example
```JS
var objectLiteral = {"key": "value", "key2": "value2"};

var objectLiteral = {
  "key": "value",
  "key2": "value2",
  "key3": "value3",
  "key4": "value4"
};
```


## Indentation and Line Breaks
Rules:
- Line breaks are only done if needed.
- Strings are split at the latest possible position.
  - At the latest whitespace character.
  - The second line is indented with 2 spaces.
  ```JS
    var longString = "A Very long string which is longer then one line, which is 80 characters " +
      "in this case. This demonstrates how the second line is indented";
  ```
- Object literals are kept on one line if possible.
  - If the line gets to long put each attribute on a single line.
  - Multi level object literals must be split in to multiple lines.
    - Each level in the object must have 2 spaces as indentation.

Examples:
```JS
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

## Functions
Rules:
  - Function blocks must have a space before the definition.
  - Function must have a space before the opening parenthesis.
  - Named functions must not have a space before the opening function brackets.
  - Functions can be on a single line.
    - If they are there must be a whitespace inside the curly brackets.
  - Anonymous functions need to have a space before the opening function bracket.
  - Arrow functions
    - can be on a single line.
    - must omit the parameter brackets if only one parameter is present.
    - must omit curly brackets if only one statement is given.
    - must have whitespace around the parameter definition

Examples:
```JS
function test() {
  return;
}

function test() { var a = 10; return a; }

var test = function () { var b = 10; return b; };

var es6 = parameter => parameter();

var es6 = parameter => {
  parameter();
  return false;
};

var es6 = (parameter, index) => parameter(index);

var es6 = (parameter, index) => {
  parameter(index);
  return false;
};
```

## Control Statements
Rules:
  - Space after the keyword
  - Space before opening parentheses
  - Strict equal (`===` or `!==`)
    - exception to this rule is null checking

Examples:
```JS
if (a === b) {
  a();
}

if (true !== false) {
  // Statements
}

if (a == null) {
  // Statements
} else {
  // Statements
}

if (true !== false) {
  // Statements
} else if(false === true) {
  // Statements
} else {
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

## JSDoc
JSDoc block should not be needed if they are needed to these rules apply:
  - If there is a return there must be a type and description.
  - If there is one or multiple parameter/s there must be a name, type and description for each one.

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

### Self Contained Elements
On self contained element attributes must be indented with 2 spaces.

Example:
```JS
<PromptDialogComponent data={dialogData}
  onAccept={this.handleAcceptDialog}
  onDismiss={this.handleDismissDialog} />
```

### Non Self Contained Elements
On elements which are not self contained the indentation of attributes must be 4 spaces. And the childNodes must have a indentation of 2 spaces to the element and -2 spaces to the attributes.

Example:
```JS
<PromptDialogComponent data={dialogData}
    onAccept={this.handleAcceptDialog}
    onDismiss={this.handleDismissDialog}>
  <ChildNode />
</PromptDialogComponent>
```
