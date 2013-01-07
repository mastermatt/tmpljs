/*
 * tmpljs 0.1
 * A DOM element based templating engine with
 *  a logic-less Zen Coding-like markup, object caching, partials and variables
 * 
 * Requires jQuery 1.4+
 */
(function( $ ){

    "use strict";

    var
    document = window.document,
    rparse =  /(\s*)([a-z]*)(\(\))?([.#$\s].*)?/i,
    rmods =  /([.#$])([a-z\-_]+)/ig,
    rhandleBars = /(^|[^\\])\{(.*?[^\\])\}/,

    tmpl = function( template, data )
    {
        if( !$.isArray( template ) )
            template = [];
            
        data = data || {};
    
        var
        ret = $(),
        parent,
        el, $el, lastEl,
        depth, lastDepth = 0,
        itemIndex,
        indexOfText, textVal,
        matches,
        tag,
        mods, modVal,
        classes,
        objCache = {},

        replacer = function( match, lead, key )
        {
            var val = data[key] || "";

            if( $.isFunction( val ) )
                val = val.call( data );

            // In order to have escapeable opening curly brackets,
            //  we have to capture the character before the bracket
            //  then append it back in.
            //  Without lookbehinds in js, is there a better way to do this?
            return lead + val;
        };

        for( itemIndex in template )
        {
            matches = rparse.exec( template[ itemIndex ] );
            tag = matches[2];
            mods = matches[4];
            
            // console.log( matches );

            // Make sure there is atleast a tag or mod declared
            // basically, skip empty lines
            if( !tag && !mods )
                continue;
                
            // matches[3] is truthy if parenthiese were provided after the tag name
            // so we consider it a fn call
            if( matches[3] )
            {
                // Use a try because we cant guarantee the method is in the object
                try
                {
                    el = data[ tag ].call( data );

                    // If a jQuery object is returned with mulitipule items,
                    // the whole object can be cached, but only the first
                    // item is used in the object that is retuned from this plugin
                    if( el instanceof $ )
                    {
                        $el = el;
                        el = el[0];
                    }
                }
                catch(e)
                {
                    el = document.createElement( "div" )
                }
            }
            else
            {
                // Create the element, default to div if not declared
                el = document.createElement( tag || "div" );
            }            

            // The amount of white space that starts the string
            // defines its depth in the DOM tree
            // Four spaces to a level, add one to compensate for
            // the quote character then floor the value
            depth = ( ( matches[1].length + 1 ) / 4 ) | 0;

            if( depth && parent )
            {
                if( depth > lastDepth ) // nest in last element
                    parent = lastEl;

                while( depth < lastDepth-- ) // traverse up
                    parent = parent.parentNode;

                parent.appendChild( el );
            }
            else
            {
                ret.push( parent = el );
            }

            lastDepth = depth;
            lastEl = el;

            // Don't bother with the rest if there's no mods
            if( !mods )
                continue;

            // look for text content after the mods
            indexOfText = mods.indexOf( " " );

            if( indexOfText != -1 )
            {
                textVal = mods.substr( indexOfText + 1 );
                mods = mods.substr( 0, indexOfText );

                // Set the value if the objects has one,
                // otherwise set innerHTML
                el[ "value" in el ? "value" : "innerHTML" ] = textVal.replace( rhandleBars, replacer );
            }

            // Reset the classes vars
            // Start with an empty string so if the element already
            // has a class the concat will put a space in 
            classes = [""];

            // Loop the mods
            while( ( matches = rmods.exec( mods ) ) !== null )
            {
                modVal = matches[2];

                switch( matches[1] )
                {
                    case ".": // Add class
                        classes.push( modVal );
                        break;

                    case "#": // Set id
                        el.id = modVal
                        break;

                    case "$": // cache jQueryized element for later
                        objCache[ modVal ] = $el || $( el );
                }
            }

            // Attach the classes at once
            el.className += classes.join( " " );
        }

        ret.c = ret.cache = objCache;
        
        return ret;
    }
    
    $.extend({ tmpl: tmpl });

})( jQuery )
