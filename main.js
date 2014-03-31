if(!window.appLoad){
    var appconfig = require("./package.json");
    window.appLoad = function(gui) {
        
        var APP_NAME = "nw-ace-kc";
        
        var ace = window.ace;
        
        var detectedMode;
        
        var Range = ace.require("ace/range").Range;
        var jsbeautify = require("./jsbeautify/jsbeautify.js");
        
        var win = gui.Window.get();
        win.show();
        var fs = require("fs");
        var Path = require("path");
        // var DEBUG_util = require("util");
    
        if(!window.global.OpenerLoaded){
            window.global.OpenerLoaded = true;
            gui.App.on("open",function(filename){
                OpenFileWindow("Untitled");
                console.log("App started");
            });
        }
        
        function OpenFileWindow(filename){
            console.log("OpenFileWindow called: filename = " + filename);
            var win = gui.Window.open('index.html', appconfig.window);
            win.currentFile = filename;
        }
        
        var editor = ace.edit("editor");
        
        // Changes as of Jan 11, 2014 - Use local storage for persistence
        // Kevin Caccamo - Added support for showing invisible characters
        var showingInvisibles = localStorage.getItem("showingInvisibles") == "true" || false;
        editor.setShowInvisibles(showingInvisibles);
        // Kevin Caccamo - Allow multiple windows
        var useMultiWindows = localStorage.getItem("useMultiWindows") == "true" || false;
        // Kevin Caccamo - Print margin
        var printMargin = parseInt(localStorage.getItem("printMargin")) || 80;
        editor.setPrintMarginColumn(printMargin);
        // Kevin Caccamo - Soft tabs
        var useSoftTabs = localStorage.getItem("useSoftTabs") == "true" && true;
        editor.getSession().setUseSoftTabs(useSoftTabs);
        // Kevin Caccamo - Tab width
        var tabWidth = parseInt(localStorage.getItem("tabWidth")) || 4;
        editor.getSession().setTabSize(tabWidth);
        
        // KC - Refactor to make beautify a separate function
        editor.commands.addCommand({
            name: 'beautify',
            bindKey: {mac: "Command-Shift-B", win: "Shift-Ctrl-B"},
            exec: function(){beautify();},
            readOnly: false // false if this command should not apply in readOnly mode
        });
        editor.commands.addCommand({
            name: 'devtools',
            bindKey: {mac: "F12", win: "F12"},
            exec: function(){openDevTools();},
            readOnly: true
        });
        // Available under commands menu
        
        function beautify() {
                
                var sel = editor.selection;
                var session = editor.session;
                var range = sel.getRange();
                var options = {};
                    options.space_before_conditional = true;
                    options.keep_array_indentation =  false;
                    options.preserve_newlines =  true;
                    options.unescape_strings =  true;
                    options.jslint_happy =  false;
                    options.brace_style =  "end-expand";
            
                    if (session.getUseSoftTabs()) {
                        options.indent_char = " ";
                        options.indent_size = session.getTabSize();
                    } else {
                        options.indent_char = "\t";
                        options.indent_size = 1;
                    }
                
                var line = session.getLine(range.start.row);
                var indent = line.match(/^\s*/)[0];
                var trim = false;
        
                if (range.start.column < indent.length)
                    range.start.column = 0;
                else
                    trim = true;
        
        
                var value = session.getTextRange(range);
                $("[data-mode]").parent().removeClass("active");
                //var syntax = session.syntax;
                var type = null;
        
                if (detectedMode == "javascript") {
                    type = "js";
                } else if (detectedMode == "css") {
                    type = "css";
                } if (/^\s*<!?\w/.test(value)) {
                    type = "html";
                } else if (detectedMode == "xml") {
                    type = "html";
                } else if (detectedMode == "html") {
                    if (/[^<]+?\{[\s\-\w]+:[^}]+;/.test(value))
                        type = "css";
                    else if (/<\w+[ \/>]/.test(value))
                        type = "html";
                    else
                        type = "js";
                }
        
                try {
                    value = jsbeautify[type + "_beautify"](value, options);
                    if (trim)
                        value = value.replace(/^/gm, indent).trim();
                    if (range.end.column === 0)
                        value += "\n" + indent;
                }
                catch (e) {
                    window.alert("Error: This code could not be beautified " + syntax + " is not supported yet");
                    return;
                }
        
                var end = session.replace(range, value);
                sel.setSelectionRange(Range.fromPoints(range.start, end));
                
            }
        
        function openDevTools() {
            win.showDevTools();
        }
        
        var theme = window.localStorage.aceTheme || "twilight";
        editor.setTheme("ace/theme/"+theme);
        var editorSession = editor.getSession();
        // name: ["Menu caption", "extensions", "content-type", "hidden|other"]
        var SupportedModes = {
            abap: ["ABAP", "abap", "text/x-abap", "other"],
            asciidoc: ["AsciiDoc", "asciidoc", "text/x-asciidoc", "other"],
            c9search: ["C9Search", "c9search", "text/x-c9search", "hidden"],
            c_cpp: ["C, C++", "c|cc|cpp|cxx|h|hh|hpp", "text/x-c"],
            clojure: ["Clojure", "clj", "text/x-script.clojure"],
            coffee: ["CoffeeScript", "*Cakefile|coffee|cf", "text/x-script.coffeescript"],
            coldfusion: ["ColdFusion", "cfm", "text/x-coldfusion", "other"],
            csharp: ["C#", "cs", "text/x-csharp"],
            css: ["CSS", "css", "text/css"],
            dart: ["Dart", "dart", "text/x-dart"],
            diff: ["Diff", "diff|patch", "text/x-diff", "other"],
            glsl: ["Glsl", "glsl|frag|vert", "text/x-glsl", "other"],
            golang: ["Go", "go", "text/x-go"],
            groovy: ["Groovy", "groovy", "text/x-groovy", "other"],
            haml: ["Haml", "haml", "text/haml", "other"],
            haxe: ["haXe", "hx", "text/haxe", "other"],
            html: ["HTML", "htm|html|xhtml", "text/html"],
            jade: ["Jade", "jade", "text/x-jade"],
            java: ["Java", "java", "text/x-java-source"],
            jsp: ["JSP", "jsp", "text/x-jsp", "other"],
            javascript: ["JavaScript", "js", "application/javascript"],
            json: ["JSON", "json", "application/json"],
            jsx: ["JSX", "jsx", "text/x-jsx", "other"],
            latex: ["LaTeX", "latex|tex|ltx|bib", "application/x-latex", "other"],
            less: ["LESS", "less", "text/x-less"],
            lisp: ["Lisp", "lisp|scm|rkt", "text/x-lisp", "other"],
            liquid: ["Liquid", "liquid", "text/x-liquid", "other"],
            lua: ["Lua", "lua", "text/x-lua"],
            luapage: ["LuaPage", "lp", "text/x-luapage", "other"],
            makefile: ["Makefile", "*GNUmakefile|*makefile|*Makefile|*OCamlMakefile|make", "text/x-makefile", "other"],
            markdown: ["Markdown", "md|markdown", "text/x-markdown", "other"],
            objectivec: ["Objective-C", "m", "text/objective-c", "other"],
            ocaml: ["OCaml", "ml|mli", "text/x-script.ocaml", "other"],
            perl: ["Perl", "pl|pm", "text/x-script.perl"],
            pgsql: ["pgSQL", "pgsql", "text/x-pgsql", "other"],
            php: ["PHP", "php|phtml", "application/x-httpd-php"],
            powershell: ["Powershell", "ps1", "text/x-script.powershell", "other"],
            python: ["Python", "py", "text/x-script.python"],
            r: ["R", "r", "text/x-r", "other"],
            rdoc: ["RDoc", "Rd", "text/x-rdoc", "other"],
            rhtml: ["RHTML", "Rhtml", "text/x-rhtml", "other"],
            ruby: ["Ruby", "ru|gemspec|rake|rb", "text/x-script.ruby"],
            scad: ["OpenSCAD", "scad", "text/x-scad", "other"],
            scala: ["Scala", "scala", "text/x-scala"],
            scss: ["SCSS", "scss|sass", "text/x-scss"],
            sh: ["SH", "sh|bash|bat", "application/x-sh"],
            stylus: ["Stylus", "styl|stylus", "text/x-stylus"],
            sql: ["SQL", "sql", "text/x-sql"],
            svg: ["SVG", "svg", "image/svg+xml", "other"],
            tcl: ["Tcl", "tcl", "text/x-tcl", "other"],
            text: ["Text", "txt", "text/plain", "hidden"],
            textile: ["Textile", "textile", "text/x-web-textile", "other"],
            typescript: ["Typescript", "ts|str", "text/x-typescript"],
            xml: ["XML", "xml|rdf|rss|wsdl|xslt|atom|mathml|mml|xul|xbl", "application/xml"],
            xquery: ["XQuery", "xq", "text/x-xquery"],
            yaml: ["YAML", "yaml", "text/x-yaml"]
        };
        var fileModes = {}, ModesCaption = {}, contentTypes = {}, hiddenMode = {}, otherMode = {};
        var syntaxMenuHtml = "";
        Object.keys(SupportedModes).forEach(function(name) {
            var mode = SupportedModes[name];
            mode.caption = mode[0];
            mode.mime = mode[2];
            mode.hidden = mode[3] == "hidden";
            mode.other = mode[3] == "other";
            mode.ext = mode[1];
            mode.ext.split("|").forEach(function(ext) {
                // KC - Don't enforce case sensitivity
                fileModes[ext.toLowerCase()] = name;
            });
            ModesCaption[mode.caption] = name;
            hiddenMode[mode.caption] = mode.hidden;
            otherMode[mode.caption] = mode.other;
            contentTypes[mode.mime] = name;
            
            syntaxMenuHtml += '<li><a href="#" data-mode="'+name+'">'+mode.caption+'</a></li>';
        });
        
        $("#syntaxMenu").html(syntaxMenuHtml);
        
    
        var hasChanged = false;
        var currentFile = 
                win.currentFile ? 
                win.currentFile :
                process && 
                process._nw_app && 
                fs.existsSync(process._nw_app.argv[0]) ?
                process._nw_app.argv[0] : 
                null ;
                /*
                // Use a more readable self-invoking anonymous
                // function that returns the value we want
                (function(currentFile){
                    
                })(currentFile);
                */
        
        if (win.currentFile) {
            openFile(currentFile);
        } else if (process._nw_app.argv.length
                && fs.existsSync(process._nw_app.argv[0])) {
            try {
                openFile(process._nw_app.argv[0]);
            } catch(e) {
                console.log(e);
            }
        } else {
            openFile();
        }
    
    
        editorSession.on("change", function() {
            if (currentFile) {
                hasChanged = true;
                $("title").text("*" + currentFile + " - " + APP_NAME);
            }
        });
    
        $(window).keypress(function(event) {
            if (!(event.which == 115 && event.ctrlKey) && event.which !== 19) return true;
            event.preventDefault();
            if (!currentFile) return false;
            saveFileFN();
            return false;
        });
        
        function openFile(path) {
            if (hasChanged && window.confirm("Save your changes?")) saveFileFN();
            currentFile = "Untitled";
            if (path) {
                console.log("openFile: path = " + path);
                if (fs.existsSync(path)) {
                    currentFile = path;
                    // fs.appendFileSync("debug.txt", "currentFile: "); // Debug
                    // fs.appendFileSync("debug.txt", DEBUG_util.inspect(currentFile)); // Debug
                    // fs.appendFileSync("debug.txt", "\n"); // Debug
                    var currentFileList = new FileList();
                    currentFileList.append(new File(
                            currentFile,
                            Path.basename(currentFile)
                        )
                    );
                    // fs.appendFileSync("debug.txt", "currentFileList: "); // Debug
                    // fs.appendFileSync("debug.txt", DEBUG_util.inspect(currentFileList)); // Debug
                    // fs.appendFileSync("debug.txt", "\n"); // Debug
                    // fs.appendFileSync("debug.txt", "Document object available: "); // Debug
                    // fs.appendFileSync("debug.txt", document ? "Yes\n" : "No\n"); // Debug
                    document.getElementById("saveasDialog").files = currentFileList;
                    var fileExt = Path.basename(path).split(".")[1];
                    if (fileExt) {
                        // KC - Don't enforce case sensitivity
                        detectedMode = fileModes[fileExt.toLowerCase()];
                    } else {
                        // Assume files without extensions or unknown extensions are text files
                        detectedMode = "text";
                    }
                    editor.getSession().setMode("ace/mode/" + detectedMode);
                    editor.getSession().setValue(fs.readFileSync(path, "utf8"));
                    hasChanged = false;
                }
            }
            $("title").text(currentFile + " - " + APP_NAME);
        }
        
        // We do not want to attach event handlers multiple times,
        // lest the code become unnecessarily inefficient
        var isSaveAsListenerOn = false;
        var isFileOpenListenerOn = false;
        // Prevent triggering of a change event on file input/output dialogs
        var fileDialogClicked;
        
        /**
         * This function triggers a click event on a given file input element to allow the user to save a file with a given name
         * @param {str} a jQuery selector that gets a file input element
         */
        function saveasDialog(name) {
            var chooser = $(name);
            chooser.trigger('click');
            fileDialogClicked = true;
            if (!isSaveAsListenerOn)
            chooser.change(function(evt) {
                if (fileDialogClicked) {
                    fileDialogClicked = false;
                    var saveFilename = $(this).val();
                    currentFile = saveFilename;
                    var currentFileList = new FileList();
                    currentFileList.append(new File(
                            currentFile,
                            currentFile.slice(
                                currentFile.lastIndexOf("/"),
                                currentFile.length
                            )
                        )
                    );
                    document.getElementById("openfileDialog").files = currentFileList;
                    hasChanged = true;
                    isSaveAsListenerOn = true;
                    saveFileFN();
                }
            });
        }
        
        function saveFileFN() {
            if (/*hasChanged &&*/ currentFile !== "Untitled") {
                var data = editor.getSession().getValue(); //.replace(/\n/g,"\r\n");
                if(currentFile == "Untitled"){
                    saveasDialog('#saveasDialog');
                } else if (currentFile === "") {
                    false;
                } else {
                    fs.writeFileSync(currentFile, data, "utf8");
                    $("title").text(currentFile + " - " + APP_NAME);
                    hasChanged = false;
                }
            }else{
                saveasDialog('#saveasDialog');
            }
        }
    
        $("#newFile").click(function() {
            function newFile() {
                console.log("newFile");
                path = "Untitled";
                editor.getSession().setValue("");
                currentFile = path;
                hasChanged = false;
                // Required to allow editor to open same file after making new file
                document.getElementById("openfileDialog").value = "";
                document.getElementById("saveasDialog").value = "";
                $("title").text(currentFile + " - " + APP_NAME);
            }
            if (hasChanged && confirm("Your changes will be lost. Are you sure?")) {
                newFile();
            } else if (!hasChanged) {
                newFile();
            }
        });
        
        $("#openFile").click(function() {
            function chooseFile(name) {
                var chooser = $(name);
                chooser.trigger('click');
                fileDialogClicked = true;
                if (!isFileOpenListenerOn)
                chooser.change(function(evt) {
                    if (fileDialogClicked) {
                        fileDialogClicked = false;
                        var openFilename = $(this).val();
                        console.log("chooseFile(change): openFilename = " + openFilename);
                        // Not sure if I want to have several windows open anymore
                        if (openFilename !== "") {
                          if (useMultiWindows) {
                            if (!currentFile ||
                                 currentFile == "Untitled")
                                 openFile(openFilename);
                            else OpenFileWindow(openFilename);
                          } else openFile(openFilename);
                        }
                        isFileOpenListenerOn = true;
                    }
                });
            }
            chooseFile('#openfileDialog');
        });
        $("#saveFile").click(function() {
            saveFileFN();
        });
        $("#saveasFile").click(function() {
            saveasDialog('#saveasDialog');
        });
        
        //Theme
        
        $("[data-theme]").click(function(e) {
            theme = e.target.attributes["data-theme"].value;
            window.localStorage.aceTheme = theme;
            editor.setTheme("ace/theme/"+theme);
            
            $("[data-theme]").parent().removeClass("active");
            $("[data-theme='"+theme+"']").parent().addClass("active");
        });
        
        var darkThemes = [
            'ambiance',
            'chaos',
            'clouds_midnight',
            'cobalt',
            'idle_fingers',
            'kr_theme',
            'kaysee',
            'merbivore',
            'merbivore_soft',
            'mono_industrial',
            'monokai',
            'pastel_on_dark',
            'solarized_dark',
            'tomorrow_night',
            'tomorrow_night_blue',
            'tomorrow_night_bright',
            'tomorrow_night_eighties',
            'twilight',
            'vibrant_ink'
        ];
        
        function isDarkTheme(theme){
            for(var i in darkThemes){
                if(darkThemes[i] == theme) return true;
            }
            return false;
        }
        
        $("[data-theme]").hover(function(e){
            var ttheme = e.target.attributes["data-theme"].value;
            editor.setTheme("ace/theme/"+ttheme);
            if(isDarkTheme(ttheme)){
                $(".navbar-static-top").addClass("navbar-inverse");
            }else{
                $(".navbar-static-top").removeClass("navbar-inverse");
            }
        },function(){
            var ttheme = window.localStorage.aceTheme;
            editor.setTheme("ace/theme/"+ttheme);
            if(isDarkTheme(ttheme)){
                $(".navbar-static-top").addClass("navbar-inverse");
            }else{
                $(".navbar-static-top").removeClass("navbar-inverse");
            }
        });
        
        $("[data-theme]").parent().removeClass("active");
        $("[data-theme='"+theme+"']").parent().addClass("active");
        if(isDarkTheme(theme)){
            $(".navbar-static-top").addClass("navbar-inverse");
        }else{
            $(".navbar-static-top").removeClass("navbar-inverse");
        }
        
        //Set syntax mode on click
        $("[data-mode]").click(function(e) {
            var mode = e.target.attributes["data-mode"].value;
            editor.getSession().setMode("ace/mode/" + mode);
            detectedMode = mode;
            $("[data-mode]").parent().removeClass("active");
            $("[data-mode='"+mode+"']").parent().addClass("active");
        });
        
        // Set syntax mode on hover
        $("[data-mode]").hover(function(e){
            var mode = e.target.attributes["data-mode"].value;
            editor.getSession().setMode("ace/mode/" + mode);
        },function(){
            editor.getSession().setMode("ace/mode/" + detectedMode);
        });
        
        $("[data-mode]").parent().removeClass("active");
        $("[data-mode='"+detectedMode+"']").parent().addClass("active");
            
        win.on('close', function() {
            function disp_confirm() {
                var r = confirm("Press a button!");
                if (r === true) {
                    alert("You pressed OK!");
                }
                else {
                    this.close(true);
                }
            }
            win.close(true);
        });
    
        $("#windowClose").click(function() {
            win.close();
        });
        
        // Kevin Caccamo's additions
        
        // Commands accessible from menu
        $("#cmd-beautify").click(function(){beautify();});
        $("#cmd-devtools").click(function(){openDevTools();});
        
        // Options
        // Show invisible characters
        if (showingInvisibles) $("#opt-showInvisibles>.icon-ok").show();
        $("#opt-showInvisibles").on("click", function(){
            showingInvisibles = !showingInvisibles;
            $(this).children(".icon-ok").toggle();
            localStorage.setItem("showingInvisibles", showingInvisibles);
            editor.setShowInvisibles(showingInvisibles);
        });
        
        // Use multiple windows
        if (useMultiWindows) $("#opt-multiWindows>.icon-ok").show();
        $("#opt-multiWindows").on("click", function(){
            useMultiWindows = !useMultiWindows;
            $(this).children(".icon-ok").toggle();
            localStorage.setItem("useMultiWindows", useMultiWindows);
        });
        
        // Set print margin
        $("#opt-setPrintMargin").on("click", function(){
            var sNewPrintMargin = prompt("Enter new print margin", editor.getPrintMarginColumn());
            if (!isNaN(sNewPrintMargin)) {
                if (sNewPrintMargin.search(/\./g) == -1) {
                    var nNewPrintMargin = parseInt(sNewPrintMargin, 10);
                    localStorage.setItem("printMargin", sNewPrintMargin);
                    editor.setPrintMarginColumn(nNewPrintMargin);
                } else alert("Print margin column must be a whole number.");
            } else alert("Please enter a numeric value for print margin.");
        });
        
        // Use soft tabs
        if (!useSoftTabs) $("#opt-useSoftTabs>.icon-ok").hide();
        $("#opt-useSoftTabs").on("click", function(){
            useSoftTabs = !useSoftTabs;
            $(this).children(".icon-ok").toggle();
            localStorage.setItem("useSoftTabs", useSoftTabs);
            editor.getSession().setUseSoftTabs(useSoftTabs);
        });
        
        // Set tab width
        $(".opt-tabWidthPreset").on("click", function(){
            var newTabWidth = $(this).text();
            console.log(newTabWidth);
            editor.getSession().setTabSize(parseInt(newTabWidth, 10));
        });
        
        // User-defined tab width
        $("#opt-userTabWidth").on("click", function(){
            var sNewTabWidth = prompt("Enter new tab width", editor.getSession().getTabSize());
            if (!isNaN(sNewTabWidth)) {
                if (sNewTabWidth.search(/\./g) == -1) {
                    var nNewTabWidth = parseInt(sNewTabWidth, 10);
                    localStorage.setItem("tabWidth", sNewTabWidth);
                    editor.getSession().setTabSize(nNewTabWidth);
                } else alert("Tab width must be a whole number.");
            } else alert("Please enter a numeric value for tab width.");
        });
    };
}
