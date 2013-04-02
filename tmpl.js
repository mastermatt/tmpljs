/*
 * tmpljs 0.6
 * A DOM element based templating engine with
 *  a logic-less Zen Coding-like markup, object caching, partials and variables
 *
 * Requires jQuery 1.4+
 */
(function($) {

    "use strict";

    var
    rparse = /^(\s*)([a-z0-9]*)(\(\))?(.*)$/i,
    rattrs = /\[([a-z\-]+)=?([^\]]*)\]/ig,
    rmods = /([.#$])([a-z0-9\-_]+)/ig,
    rvariables = /(^|[^\\])\{(.*?[^\\])\}/g,
    setValuesFor = ["input", "textarea"], // set value instead of innerhtml for these tags
    isFunction = $.isFunction, // just for compression

    tmpl = function(template, data)
    {
        if (!$.isArray(template))
            template = [];

        data = data || {};

        var
        ret = $(),
        itemIndex,
        parent,
        lastEl,
        lastDepth = 0,
        objCache = {},

        // turn dot notation in the string into object reference
        dotToRef = function(notation, object)
        {
            return notation.split(".").reduce(function(obj, i) {
                return obj[i];
            }, object);
        },

        // replace variables in strings
        varReplacer = function(match, lead, key)
        {
            var val = dotToRef(key, data);

            if (isFunction(val))
                val = val.call(data);

            // In order to have escapeable opening curly brackets,
            //  we have to capture the character before the bracket
            //  then append it back in.
            //  Without lookbehinds in js, is there a better way to do this?
            return lead + ( val  || "" );
        };

        for (itemIndex in template)
        {
            var
            matches = rparse.exec(template[itemIndex]),
            tag = matches[2],
            postTag = matches[4],
            el = 0,
            $el = 0,
            indexOfSpace, textVal, modVal,
            classes = [],

            // The amount of white space that starts the string
            // defines its depth in the DOM tree
            // Four spaces to a level, add one to compensate for
            // the quote character then floor the value
            depth = ((matches[1].length + 1) / 4) | 0;

            // console.log( matches );

            // Make sure there is atleast a tag or postTag declared
            // basically, skip empty lines
            if (!tag && !postTag)
                continue;

            // matches[3] is truthy if parenthiese were provided after the tag name
            // so we consider it a fn call
            if (matches[3] && isFunction(data[tag]))
            {
                el = data[tag].call(data);

                // If a jQuery object is returned with mulitipule items,
                // the whole object can be cached, but only the first
                // item is used in the object that is returned from this plugin
                if (el instanceof $)
                {
                    $el = el;
                    el = el[0];
                }
            }

            // ensure we have a proper ELEMENT_NODE in our el variable
            if (!el || el.nodeType !== 1)
            {
                // Create the element, default to div if not declared
                el = document.createElement(tag || "div");
            }

            if (depth && parent)
            {
                if (depth > lastDepth) // nest in last element
                    parent = lastEl;

                while (depth < lastDepth--) // traverse up
                    parent = parent.parentNode;

                parent.appendChild(el);
            }
            else
            {
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
            //[placeholder=Hello World] -> placeholder="Hello World"
            //[disabled]                -> disabled="disabled"
            postTag = postTag.replace(rattrs, function(match, attr, val){
                el.setAttribute(attr, val || attr);
                return "";
            });

            // look for text content after the mods via a space character
            indexOfSpace = postTag.indexOf(" ");

            if (indexOfSpace !== -1)
            {
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
            while ((matches = rmods.exec(postTag)) !== null)
            {
                modVal = matches[2];

                switch (matches[1])
                {
                    case ".": // Add class
                        classes.push(modVal);
                        break;

                    case "#": // Set id
                        el.id = modVal;
                        break;

                    case "$": // cache jQueryized element for later
                        objCache[ modVal ] = $el || $(el);
                }
            }

            // Attach all the classes at once
            if (classes.length)
            {
                classes.push(el.className);
                el.className = classes.join(" ");
            }
        }

        ret.c = ret.cache = objCache;

        return ret;
    };

    $.extend({tmpl: tmpl});

})(jQuery);
