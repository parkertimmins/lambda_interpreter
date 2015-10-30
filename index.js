

function Var(id) {
    this.type = 'var';
    this.id = id;
}

function App(func, arg) {
    this.type = 'app';
    this.func = func;
    this.arg = arg;
}

function Abs(v, expr) {
    this.type = 'abs';
    this.var = v;
    this.expr = expr;
}

function pretty_str_expr(expr) {
    switch (expr.type) {
        case 'var': return expr.id;
        case 'app': return "App(" + pretty_str_expr(expr.func) + ", " + pretty_str_expr(expr.arg) + ")";
        case 'abs': return "Abs(" + pretty_str_expr(expr.var) + ", " + pretty_str_expr(expr.expr) + ")";
        default:    console.log("somethings wrong: " + expr + " " + expr.type);
    }
}

function pretty(prog_str) {
    return pretty_str_expr(shunting_yard_ast(separate_tokens(prog_str)));
}

function tests() {
    test(pretty('x x'), 'App(x, x)');
    test(pretty('\\x.x'), 'Abs(x, x)');
    test(pretty('(\\x.x)'), 'Abs(x, x)');
    test(pretty('(\\x.a b) (\\y.b)'), 'App(Abs(x, App(a, b)), Abs(y, b))');
    test(pretty('(\\s.a (b c))'), 'Abs(s, App(a, App(b, c)))');
}

function test(a, b) {
    console.log(a != b ? 'failed: ' + a + " != " + b : 'pass');


function shunting_yard_ast(tokens) {
    var output = [];
    var stack = [];
    while(tokens.length > 0) {
        var current = tokens.shift();

        if(current.match(/\w+/)) {
            output.push(new Var(current));
            //console.log("1: " + current);
        }
        else if(current == "." || current.match(/\s+/)) {
            while(stack.length > 0  && stack[stack.length-1].match(/\s+/)) {
                stack.pop();
                var f = output.pop();
                var s = output.pop();
                //console.log("2: " + JSON.stringify(f) + "  " + JSON.stringify(s))
                output.push(new App(s, f));
            }
           stack.push(current);
        }
        else if(current == "(") {
            stack.push(current);
        }
        else if(current == ")") {
            while(stack.length > 0 && stack[stack.length-1] != "(") {
                var t = stack.pop();
                if(t == ".") {
                    var f = output.pop();
                    var s = output.pop();
                    //console.log("3: " + JSON.stringify(f) + "  " + JSON.stringify(s))
                    output.push(new Abs(s, f));
                }
                else if(t.match(/\s+/)) {
                    var f = output.pop();
                    var s = output.pop();
                    //console.log("4: " + JSON.stringify(f) + "  " + JSON.stringify(s))
                    output.push(new App(s, f));
                }
                else {
                    //console.log(t);
                    output.push(new Var(t));
                }
            }
            if(stack.length == 0) {
                console.log("mismatched parenthesis");
            }
            stack.pop(); // pop off left paren
        }
    }

    if(stack.indexOf('(') != -1 || stack.indexOf(')') != -1) {
        console.log("mismatched parenthesis");
    }
    else {
        while(stack.length > 0) {
            var top = stack.pop();
            if(top == ".") {
                var f = output.pop();
                var s = output.pop();
                //console.log("6: " + JSON.stringify(f) + "  " + JSON.stringify(s))
                output.push(new Abs(s, f));
            }
            else if(top.match(/\s+/)) {
                var f = output.pop();
                var s = output.pop();
                //console.log("7: " + JSON.stringify(f) + "  " + JSON.stringify(s))
                output.push(new App(s, f));
            }
            else {
                //console.log("8: " + JSON.stringify(top)); /////////////////
                output.push(new Var(top));
            }
        }
    }
    return output[0];
}



function shunting_yard(tokens) {
    var output = [];
    var stack = [];
    while(tokens.length > 0) {
        var current = tokens.shift();
        console.log("current: " + current);
        console.log("stack: " + stack);
        console.log("output: " + output) ;

        if(current.match(/\w+/)) {
            output.push(current);
        }
        else if(current == "." || current.match(/\s+/)) { //abstraction
            while(stack.length > 0  && stack[stack.length-1].match(/\s+/)) {
                output.push(stack.pop());
            }
           stack.push(current);
        }
        else if(current == "(") {
            stack.push(current);
        }
        else if(current == ")") {
            while(stack.length > 0 && stack[stack.length-1] != "(") {
                output.push(stack.pop());
            }
            if(stack.length == 0) {
                console.log("mismatched parenthesis");
            }
            stack.pop(); // pop off left paren
        }
    }

    if(stack.indexOf('(') != -1 || stack.indexOf(')') != -1) {
        console.log("mismatched parenthesis");
    }
    else {
        output.concat(stack.reverse())
    }
    return output
}


// all spaces are lambda application => whitespace matters
function separate_tokens(prog_str) {
    return prog_str.split(/(\(|\)|\\|\.|\w+|\s+)/).filter(function (t) {return t != ''});
}


// all spaces are lambda application => whitespace matters
function lex_assume_correct(program) {
    var tokens = [];
    var res;
    var regex = /\(|\)|\\|\.|\w+|\s+/g;
    while ((res = regex.exec(program)) !== null) {
        tokens.push(res[0]);
    }
    return tokens;
}

function regex_lex() {
    var program = "(\\x. (\\d.x) x)";
    var tokens = [];

    var remaining = program.replace(/\(|\)|\\|\.|\w+/g, function (tok) {
        tokens.push(tok);
        return ''
    });


    console.log(tokens);
    console.log('"' + remaining + '"');
    if(!/^\s*$/.test(remaining)) {
        console.log("invalid input");
    }
}

var evaluation_stategies = {
    "Normal" : function () {},
    "Pass by Value" : function () {},
    "Pass by Reference" : function () {}
};

function set_strategy(strategy) {
    $("#strategies").text(strategy);
}

$(function() {

    set_strategy(Object.keys(evaluation_stategies)[0]);

    $(".dropdown-menu li a").click(function () {
        set_strategy($(this).text());
    });
});

$.each(evaluation_stategies, function(name, func) {
    $("#strategies_dropdown").append("<li><a href=\"#\">" + name+ "</a></li>");
});

$("#eval_button").click(function(){
    var expr = $("#expression").val();
    var tokens = separate_tokens(expr);
    var shunted = shunting_yard_ast(tokens);
    console.log("ast: " + JSON.stringify(shunted));
    console.log("pretty: " + pretty_str_expr(shunted));
});

$("#step_button").click(function(){
    console.log(pretty_str_expr(shunting_yard_ast(separate_tokens("(\\x.(\\d.x) x)"))));
});
