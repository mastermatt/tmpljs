tmpljs
=======

A DOM element based templating engine with a logic-less Zen Coding-like markup, object caching, partials and variables

* The plugin requires only one parameter, an array of strings, where each string is to become a single DOM element.
* Optionally a second object parameter can be supplied for partials and varialbes.
* A jQuery object is returned.

###Abbreviations###
A [Zen Coding](http://code.google.com/p/zen-coding/) like abbreviation engine is used that resembles CSS selecotor for tag name, ID, class and explicit attributes.
`div#page.section.main[data-main=cat]`
becomes
```html
<div id="page" class="section main" data-main="cat"></div>
```

A div tag name can be omitted when writing elements that have attributes declared.
Text can be added by placing a space between attributes or tag and the text itself.
`.section Lorem Ipsum`
becomes
```html
<div class="section">Lorem Ipsum</div>
```

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

**Note:** The order of `#ID`, `$cache`, `.class`, or `[attribute]` does not matter. They just need to be after the optional tag name and without any spaces. ( A space will signal the begining of text )


###Partials and Variables###
Instead of providing a tag name, a function reference for the optional data object can be used to integrate partials,
by ending the tag name with open and close parenthese `()`.

The function should return either a DOM element or a jQuery object. If if doesn't or the function can not be found in the data object, a div will be used instead.

The function will be called using the data object as the `this` value.

The code below illustrates a pointless version of this feature in its minimalist form.

Curly brackets `{}` can be wrapped around key identifiers in the text for variable substitution.
If the key references a function in the data object, that function will be called using the data object as the `this` value.
The function should return a string or something that equates to one. Dot notation can be used inside the curly brackets to traverse the data object.

```js
var
  template =
  [
    "div",
    "   .hello This div has a class of 'hello'",
    "   p().world {myvar} yeah",
    "   form#mainForm",
    "       input$theinput Default text",
    "div",
    "   p$wrapper",
    "       span {x.getSomeText}"
  ],

  data =
  {
      myvar: "oh",
      p: function(){return document.createElement("p")},
      x: {
          getSomeText: function(){return "Some Text!"; }
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
