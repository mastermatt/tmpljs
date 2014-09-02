describe('Basic templating', function() {

    it('should create basic DOM elements', function() {

        var template = [
            "p#paragraph",
            ".a-class",
            "span$handle Hello World"
        ];

        var compiled = $.tmpl(template);

        expect(compiled instanceof jQuery).toBe(true);
        expect(compiled.length).toBe(3);

        expect(compiled[0].tagName).toBe("P");
        expect(compiled[1].tagName).toBe("DIV");
        expect(compiled[2].tagName).toBe("SPAN");

        expect(compiled[0].id).toBe("paragraph");
        expect(compiled[1].className).toBe("a-class");
        expect(compiled[2].innerHTML).toBe("Hello World");

        expect(compiled.cache.handle instanceof jQuery).toBe(true);
    });

    it('should nest DOM elements', function() {

        var template = [
            "div",
            "   div",
            "       div",
            "       div",
            "   div",
            "       div",
            "div",
            "   div"
        ];

        var compiled = $.tmpl(template);

        expect(compiled.length).toBe(2);
        expect(compiled[0].childNodes.length).toBe(2);
        expect(compiled[0].childNodes[0].childNodes.length).toBe(2);
        expect(compiled[0].childNodes[1].childNodes.length).toBe(1);
        expect(compiled[1].childNodes.length).toBe(1);
    });

    it('should set values for input fields', function() {

        var template = [
            "input one fish",
            "textarea two fish",
            "span red fish",
            "p blue fish"
        ];

        var compiled = $.tmpl(template);

        expect(compiled[0].value).toBe("one fish");
        expect(compiled[1].value).toBe("two fish");
        expect(compiled[2].innerHTML).toBe("red fish");
        expect(compiled[3].innerHTML).toBe("blue fish");
    });

    it('should set attributes on nodes', function() {

        var template = [
            "div[disabled][data-ga-click=Big Boy]"
        ];

        var compiled = $.tmpl(template);

        expect(compiled.attr("disabled")).toBe("disabled");
        expect(compiled.data("ga-click")).toBe("Big Boy");
    });

    it('should replace variables', function() {

        var template = [
            "div {dark} fish, {sad} fish, { age.elderly  } fish, {age.recent} fish.",
            "div Don't {verb} {!my} braces. {!}"
        ];

        var data = {
            "dark": "Black",
            "sad": "Blue",
            "age": {
                "elderly": "Old",
                "recent": function() {
                    return "New";
                }
            },
            "verb": "touch"
        };

        var compiled = $.tmpl(template, data);

        expect(compiled[0].innerHTML).toBe("Black fish, Blue fish, Old fish, New fish.");
        expect(compiled[1].innerHTML).toBe("Don't touch {my} braces. {}");
    });

    it('should escape HTML entities in variables', function() {

        var template = [
            "div {one}",
            "div {two}",
            "div {&three}"
        ];

        var data = {
            "one": "<input value=\"How's life?\" />",
            "two": "<div>Ben & Jerry's</div>",
            "three": "<p>raw HTML</p>"
        };

        var compiled = $.tmpl(template, data);

        // Testing escaped characters from the DOM is a bit tricky.
        // The issue is that node.innerHTML will return a string with quotes and slashes
        // un-escaped even when it's set properly with an escaped string.
        // So instead we attach the expected string to the DOM as well and compare the results.
        // It's possible for false positives to pass this test. Will need to fix at some point.
        var node = $("div").appendTo("body");

        node.html("&lt;input value=&quot;How&#x27;s life?&quot; &#x2F&gt;");
        expect(compiled[0].innerHTML).toBe(node[0].innerHTML);

        node.html("&lt;div&gt;Ben &amp; Jerry&#x27;s&lt;&#x2F;div&gt;");
        expect(compiled[1].innerHTML).toBe(node[0].innerHTML);

        expect(compiled[2].innerHTML).toBe("<p>raw HTML</p>");
    });

    it('should execute partials', function() {

        var template = [
            "red()",
            "blue(sad, glad)",
            "green.purple()"
        ];

        var data = {
            "red": function() {
            },
            "blue": function() {
            },
            "green": {
                "purple": function() {
                }
            }
        };

        spyOn(data, "red");
        spyOn(data, "blue");
        spyOn(data.green, "purple");

        $.tmpl(template, data);

        expect(data.red).toHaveBeenCalled();
        expect(data.blue).toHaveBeenCalledWith("sad", "glad");
        expect(data.green.purple).toHaveBeenCalled();
    });
});