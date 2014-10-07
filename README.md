tmpljs [![Build Status](https://travis-ci.org/mastermatt/tmpljs.png?branch=master)](https://travis-ci.org/mastermatt/tmpljs)
=======

A DOM element based templating engine, as a jQuery plugin, with a logic-less Zen Coding-like markup, object caching, partials and variables.

I wrote this because it seemed silly to create a string of markup, make the DOM parse it, then query it to do any manipulation; when it's faster to create elements in js, save a reference if desired, then pass objects to the DOM.

* The plugin requires only one parameter, an array of strings, where each string is to become a single DOM element.
* Optionally, data can be supplied for partials and variables.
* A jQuery object is returned.

###Usage###
A [Zen Coding](http://code.google.com/p/zen-coding/) like abbreviation engine is used that resembles CSS selectors for tag name, ID, class and explicit attributes.

```javascript
var template = [
    "h1.center Hello world!",
    "p#content Cat in the hat."
];

$("body").tmpl(template);
```
```html
<html>
<body>
  <h1 class="center">Hello World!</h1>
  <p id="content">Cat in the hat.</p>
</body>
</html>
```
This will get you pretty far, but what fun are templates without variables.
```javascript
var template = [
    "h1.center Hello world!",
    "p#content {animal} in the {covering}."
];

var data = {
    animal: "Cat",
    covering: function() {
        return "hat";
    }
};

$("body").tmpl(template, data);
```
Each string in the template array renders into a DOM element. Start with the tag name, defaults to a div if not specified, followed by any attributes for the node and any text at the end after a space. 
`#page.section.main Lorem Ipsum`
```html
<div id="page" class="section main">Lorem Ipsum</div>
```
If the element is an input or textarea, the _value_ will be set instead of the _innerHTML_.
`input.small[placeholder=123 Main St.][disabled] 1600 Pennsylvania Ave`
```html 
<input class="small" placeholder="123 Main St." disabled value="1600 Pennsylvania Ave" />
```

###Hierarchy###
The hierarchy of the returned elements is based on the empty space that starts the string.
The standard 4 spaces becomes a new indent.

```js
var template = [
    "div",
    "   .hello This div has a class of 'hello'",
    "   p.world oh yeah",
    "   form#mainForm",
    "       input$myInput Default text",
    "div",
    "   p$wrapper",
    "       span Some Text!"
  ];
  
var compiled = $.tmpl( template );
$("body").append( compiled );
```
```html
<body>
  <div>
    <div class="hello">This div has a class of 'hello'</div>
    <p class="world">oh yeah</p>
    <form id="mainForm">
      <input value="Default text" />
    </form>
  </div>
  <div>
    <p>
      <span>Some Text!</span>
    </p>
  </div>
</body>
```
###Caching Objects###
Elements can be cached as jQuery objects using the `$` indicator. Notice in the last example the input has `$myInput`,
that object can now be accessed via:
```js
compiled.cache.myInput.focus();
```
*Alias:* `compiled.c.myInput.focus();`

**Note:** The order of `#ID`, `$cache`, `.class`, or `[attribute]` does not matter. They just need to be after the optional tag name and before the space that signifies the beginning of any content text.


###Partials and Variables###
The plugin takes an optional second parameter that can be used for partials in place of the tag and variable replacement inside of the HTML content.

Instead of providing a tag name, a function reference for the optional data object can be used to integrate partials,
by ending the tag name with open and close parentheses `()`. Parameters can be passed to the method in the standard comma separated syntax.

The function should return either a DOM element or a jQuery object. `false` can also be used to 
skip the line, useful for partials the execute conditional logic.

The function will be called using the data object as the `this` value.

The code below illustrates a pointless version of this feature in its minimalist form.

Curly brackets `{}` can be wrapped around key identifiers in the text for variable substitution.
If the key references a function in the data object, that function will be called using the data object as the `this` value.
The function should return a string or something that equates to one.

**Note:** Dot notation can be used inside the curly brackets or for partials to traverse 
the data object.

```js
var template = [
    "div",
    "   .hello This div has a class of 'hello'",
    "   getTag(p).world {myNar} yeah",
    "   form#mainForm",
    "       input$theInput Default text",
    "div",
    "   p$wrapper",
    "       span {person.getGreeting}"
];

var data = {
    myNar: "oh",
    getTag: function(tag) {
        return document.createElement(tag)
    },
    greeting: "hello",
    person: {
        name: "James Bond",
        getGreeting: function() {
            return this.greeting + " " + this.person.name;
        }
    }
};

$("body").tmpl(template, data);
```
```html
<html>
<body>
  <div>
    <div class="hello">This div has a class of 'hello'</div>
    <p class="world">oh yeah</p>
    <form id="mainForm">
      <input value="Default text" />
    </form>
  </div>
  <div>
    <p>
      <span>hello James Bond</span>
    </p>
  </div>
</body>
</html>
```

By default, all variables are HTML escaped. A `&` can be placed just inside opening braces to 
render the variable without escaping or a `!` to ignore the bracket for variable substitution 
altogether. 

```javascript
var data = {
    "name": "James Bond",
    "agency": "<b>MI6</b>"
}
 
var template = [
    "li { name }",
    "li { spouse }",
    "li { agency }",
    "li {& agency }",
    "li {! agency }"
];

$("ul").tmpl(template, data);
```
```html
<ul>
    <li>James Bond</li>
    <li></li>
    <li>&lt;b&gt;MI6&lt;/b&gt;</li>
    <li>
        <b>MI6</b>
    </li>
    <li>{ agency }</li>
</ul>
```
