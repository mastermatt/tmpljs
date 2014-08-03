tmpljs [![Build Status](https://travis-ci.org/mastermatt/tmpljs.png?branch=master)](https://travis-ci.org/mastermatt/tmpljs)
=======

A DOM element based templating engine, as a jQuery plugin, with a logic-less Zen Coding-like markup, object caching, partials and variables.

I wrote this because it seemed silly to create a string of markup, make the DOM parse it, then query it to do any manipulation; when it's faster to create elements in js, save a reference if desired, then pass objects to the DOM.

* The plugin requires only one parameter, an array of strings, where each string is to become a single DOM element.
* Optionally a second object parameter can be supplied for partials and variables.
* A jQuery object is returned.

###Abbreviations###
A [Zen Coding](http://code.google.com/p/zen-coding/) like abbreviation engine is used that resembles CSS selector for tag name, ID, class and explicit attributes.
`div#page.section.main[data-main=cat in the hat]`
becomes
```html
<div id="page" class="section main" data-main="cat in the hat"></div>
```

A div tag name can be omitted when writing elements that have attributes declared.

The HTML of an element can be set by placing a space between the tag or any attributes and the text itself.
`.section Lorem Ipsum`
becomes
```html
<div class="section">Lorem Ipsum</div>
```

**Note:** If the element is an input or textarea, the value will be set instead of the innerHTML.

###Hierarchy###
The hierarchy of the returned elements is based on the empty space that starts the string.
The standard 4 spaces becomes a new indent.

```js
var
  template =
  [
    "div",
    "   .hello This div has a class of 'hello'",
    "   p.world oh yeah",
    "   form#mainForm",
    "       input$myinput Default text",
    "div",
    "   p$wrapper",
    "       span Some Text!"
  ],
  compiled = $.tmpl( template );

  $("body").append( compiled );
```
becomes
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
Elements can be cached as jQuery objects using the `$` indicator. Notice in the last example the input has `$myinput`,
that object can now be accessed via:
```js
compiled.cache.myinput.focus();
```
*Alias:* `compiled.c.myinput.focus();`

**Note:** The order of `#ID`, `$cache`, `.class`, or `[attribute]` does not matter. They just need to be after the optional tag name and before the space that signifies the beginning of any content text.


###Partials and Variables###
The plugin takes an optional second parameter that can be used for partials in place of the tag and variable replacement inside of the HTML content.

Instead of providing a tag name, a function reference for the optional data object can be used to integrate partials,
by ending the tag name with open and close parenthese `()`. Parameters can be passed to the method in the standard comma separated syntax.

The function should return either a DOM element or a jQuery object. If it doesn't or the function can not be found in the data object, a div will be used instead.

The function will be called using the data object as the `this` value.

The code below illustrates a pointless version of this feature in its minimalist form.

Curly brackets `{}` can be wrapped around key identifiers in the text for variable substitution.
If the key references a function in the data object, that function will be called using the data object as the `this` value.
The function should return a string or something that equates to one.

**Note:** Dot notation can be used inside the curly brackets to traverse the data object, 
but *can not* be used for partials because the engine will think you're declaring a class.

```js
var
  template =
  [
    "div",
    "   .hello This div has a class of 'hello'",
    "   getTag(p).world {myvar} yeah",
    "   form#mainForm",
    "       input$theinput Default text",
    "div",
    "   p$wrapper",
    "       span {x.getSomeText}"
  ],

  data =
  {
      myvar: "oh",
      getTag: function(tag){return document.createElement(tag)},
      text: "Some Text!",
      x: {
          getSomeText: function(){return this.text; }
      }
  };

  $("body").append( $.tmpl( template, data ) );
```
becomes
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
**NOTE:** Literal curly brackets can be displayed by adding a bang (!) directly after the 
opening bracket. `{!cat}` -> `{cat}`