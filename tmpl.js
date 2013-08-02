/*
 * tmpljs 0.8
 * A DOM element based templating engine with
 *  a logic-less Zen Coding-like markup, object caching, partials and variables
 *
 *  https://github.com/mastermatt/tmpljs
 *
 * Requires jQuery 1.4+
 */

(function ($) {

    "use strict";

    var

    // regex to break the main string into parts
    // example "   getTag(p, 6).world[placeholder=some text] {myvar} yeah"
    // matches
    //      1: leading spaces   "   "
    //      2: tag name         "getTag"
    //      3: parenthese       "(p, 6)"
    //      4: method args      "p, 6"
    //      5: everthing else   ".world[placeholder=some text] {myvar} yeah"
    rparse = /^(\s*)([\w-]*)(\((.*)\))?(.*)$/,

    // regex for explicitly stated attributes ( the stuff in square brackets )
    // matches
    //      1: attribute name   "placeholder"
    //      2: value            "some text"
    rattrs = /\[([\w-]+)=?([^\]]*)\]/g,

    // regex for the modifiers ( class, id, cache )
    // matches
    //      1: type flag        ".", "#", "$"
    //      2: value            from the example above "world"
    rmods = /([.#$])([\w-]+)/g,

    // regex for the handlbar type variable syntax in text
    // matches
    //      1: start or leading character, chech comments in varReplacer() for why
    //      2: variable key
    rvariables = /(^|[^\\])\{(.*?[^\\])\}/g,

    // set the value property instead of innerhtml for these tags
    setValuesFor = ["input", "textarea"],

    // just for compression
    isFunction = $.isFunction,

    // Turn dot notation in a string into object reference
    // example "a.b.c" on a = {b:{c:variable}} will return variable
    dotToRef = function (notation, object) {
        return notation.split(".")
            .reduce(function (current, i) {
                return current[i];
            }, object);
    },

    // The actual plugin function
    tmpl = function (template, data) {

        if (!$.isArray(template))
            template = [];

        data = data || {};

        var ret = $(),
            itemIndex,
            parent,
            lastEl,
            lastDepth = 0,
            objCache = {},

            // replace variables in strings
            varReplacer = function (match, lead, key) {
                var val = dotToRef(key, data);

                if (isFunction(val))
                    val = val.call(data);

                if (null == val)
                    val = "";

                // In order to have escapeable opening curly brackets,
                //  we have to capture the character before the bracket
                //  then append it back in.
                //  Without lookbehinds in js, is there a better way to do this?
                return lead + val;
            };

        for (itemIndex in template) {

            var matches = rparse.exec(template[itemIndex]),
                tag = matches[2],
                postTag = matches[5],
                el = 0,
                $el = 0,
                indexOfSpace, textVal, modVal,
                classes = [],

                // The amount of white space that starts the string
                // defines its depth in the DOM tree
                // Four spaces to a level, add one to compensate for
                // the quote character then floor the value
                // examples
                //  "tag"        : 0 spaces = 0
                //  "   tag"     : 3 spaces = 1
                //  "       tag" : 7 spaces = 2
                depth = ((matches[1].length + 1) / 4) | 0;

            // Make sure there is atleast a tag or postTag declared
            // basically, skip empty lines
            if (!tag && !postTag)
                continue;

            // matches[3] is truthy if parenthese were provided after the tag name
            // so we consider it a fn call
            if (matches[3] && isFunction(data[tag])) {
                el = data[tag].apply(data, matches[4].split(","));

                // If a jQuery object is returned with mulitipule items,
                // the whole object can be cached, but only the first
                // item is used in the object that is returned from this plugin
                if (el instanceof $) {
                    $el = el;
                    el = el[0];
                }
            }

            // Ensure we have a proper ELEMENT_NODE in our el variable
            if (!el || el.nodeType !== 1) {
                // Create the element, default to div if not declared
                el = document.createElement(tag || "div");
            }

            if (depth && parent) {
                if (depth > lastDepth) // nest in last element
                    parent = lastEl;

                while (depth < lastDepth--) // traverse up
                    parent = parent.parentNode;

                parent.appendChild(el);
            } else {
                ret.push(parent = el);
            }

            lastDepth = depth;
            lastEl = el;

            // Don't bother with the rest if there's no mods or text
            if (!postTag)
                continue;

            // Search for attributes
            // attach them to the element and remove the characters
            // from the postTag string, this allows us to have spaces in the attr values
            //
            // [placeholder=Hello World] -> placeholder="Hello World"
            // [disabled]                -> disabled="disabled"
            postTag = postTag.replace(rattrs, function (match, attr, val) {
                el.setAttribute(attr, val || attr);
                return "";
            });

            // look for text content after the mods via a space character
            indexOfSpace = postTag.indexOf(" ");

            if (indexOfSpace !== -1) {
                // strip everything after the first space to use it as the text
                // value and run it through the replace func to replace variables
                textVal = postTag.substr(indexOfSpace + 1)
                    .replace(rvariables, varReplacer);

                // remove the text from the postTag so that only mods remain
                postTag = postTag.substr(0, indexOfSpace);

                // Set the value for the tags we want to,
                // otherwise set innerHTML
                if ($.inArray(el.tagName.toLowerCase(), setValuesFor) < 0)
                    el.innerHTML = textVal;
                else
                    el.value = textVal;
            }

            // Loop the mods
            while (matches = rmods.exec(postTag)) {
                modVal = matches[2];

                switch (matches[1]) {
                    case ".": // Add class
                        classes.push(modVal);
                        break;

                    case "#": // Set id
                        el.id = modVal;
                        break;

                    case "$": // cache jQueryized element for later
                        objCache[modVal] = $el || $(el);
                }
            }

            // add any classes a partal may have added to the classes list
            if (el.className) {
                classes.push(el.className);
            }

            // Attach all the classes at once
            if (classes.length) {
                el.className = classes.join(" ");
            }
        }

        // Alias the object cache as "cache" and "c"
        ret.c = ret.cache = objCache;

        return ret;
    };

    // Add as a jQuery plugin
    $.extend({ tmpl: tmpl });

})(jQuery);
