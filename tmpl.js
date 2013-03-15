/*
 * tmpljs 0.4
 * A DOM element based templating engine with
 *  a logic-less Zen Coding-like markup, object caching, partials and variables
 *
 * Requires jQuery 1.4+
 */
(function($) {

    "use strict";

    var
    document = window.document,
    rparse = /(\s*)([a-z0-9]*)(\(\))?([.#$\s].*)?/i,
    rattrs = /\[([a-z\-]+)=?([^\]]*)\]/ig,
    rmods = /([.#$])([a-z0-9\-_]+)/ig,
    rhandleBars = /(^|[^\\])\{(.*?[^\\])\}/g,
    setValuesFor = ["input", "textarea"], // set value instead of innerhtml for these tags

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

        replacer = function(match, lead, key)
        {
            var val = data[key] || "";

            if ($.isFunction(val))
                val = val.call(data);

            // In order to have escapeable opening curly brackets,
            //  we have to capture the character before the bracket
            //  then append it back in.
            //  Without lookbehinds in js, is there a better way to do this?
            return lead + val;
        };

        for (itemIndex in template)
        {
            var
            matches = rparse.exec(template[itemIndex]),
            tag = matches[2],
            mods = matches[4],
            el,
            $el = 0,
            indexOfText, textVal,
            modVal,
            classes = [],

            // The amount of white space that starts the string
            // defines its depth in the DOM tree
            // Four spaces to a level, add one to compensate for
            // the quote character then floor the value
            depth = ((matches[1].length + 1) / 4) | 0;

            // console.log( matches );

            // Make sure there is atleast a tag or mod declared
            // basically, skip empty lines
            if (!tag && !mods)
                continue;

            // matches[3] is truthy if parenthiese were provided after the tag name
            // so we consider it a fn call
            if (matches[3])
            {
                // Use a try because we cant guarantee the method is in the object
                try
                {
                    el = data[tag].call(data);

                    // If a jQuery object is returned with mulitipule items,
                    // the whole object can be cached, but only the first
                    // item is used in the object that is retuned from this plugin
                    if (el instanceof $)
                    {
                        $el = el;
                        el = el[0];
                    }
                    else if (el.nodeType !== 1)
                        throw 1;
                }
                catch (e)
                {
                    el = document.createElement("div");
                }
            }
            else
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

            // Don't bother with the rest if there's no mods
            if (!mods)
                continue;

            // look for text content after the mods
            indexOfText = mods.indexOf(" ");

            if (indexOfText !== -1)
            {
                textVal = mods.substr(indexOfText + 1)
                            .replace(rhandleBars, replacer);

                mods = mods.substr(0, indexOfText);

                // Set the value for the tags we want to,
                // otherwise set innerHTML
                if ($.inArray(el.tagName.toLowerCase(), setValuesFor) < 0)
                    el.innerHTML = textVal;
                else
                    el.value = textVal;
            }

            // Loop the attributes
            while ((matches = rattrs.exec(mods)) !== null)
            {
                el.setAttribute(matches[1], matches[2] || matches[1]);
            }

            // Loop the mods
            while ((matches = rmods.exec(mods)) !== null)
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

            // Attach the classes at once
            if (classes.length)
                el.className += " " + classes.join(" ");
        }

        ret.c = ret.cache = objCache;

        return ret;
    };

    $.extend({tmpl: tmpl});

})(jQuery);
