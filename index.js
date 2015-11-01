
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

function print(o) {
    console.log(JSON.stringify(o));
}

function pretty(prog_str) {
    return pretty_str_expr(shunting_yard(separate_tokens(prog_str)));
}

var x = 1;

function tests() {

    test(pretty('x x'), 'App(x, x)');
    test(pretty('\\x.x'), 'Abs(x, x)');
    test(pretty('(\\x.x)'), 'Abs(x, x)');

    test(pretty('(\\x.a b) (\\y.b)'), 'App(Abs(x, App(a, b)), Abs(y, b))');
    test(pretty('(\\s.a (b c))'), 'Abs(s, App(a, App(b, c)))');
    test(pretty('x x x'), 'App(App(x, x), x)');

    test(pretty('(\\x.x z) \\y.w \\w.w x y z'), 'App(Abs(x, App(x, z)), Abs(y, App(w, Abs(w, App(App(App(w, x), y), z)))))');
    test(pretty('(\\x.x z) (\\y.w \\w.w x y z)'), 'App(Abs(x, App(x, z)), Abs(y, App(w, Abs(w, App(App(App(w, x), y), z)))))');
    test(pretty('x x x x x'), 'App(App(App(App(x, x), x), x), x)');

    test(pretty('\\x.\\x.\\x.\\x.x'), 'Abs(x, Abs(x, Abs(x, Abs(x, x))))');
    test(new Var("x"), new Var("x"), eq_ast);
    test(new App(new Var('t'), new Var('p')), new App(new Var('t'), new Var('p')), eq_ast);

    test(new Abs(new Var('r'), new App(new Var('t'), new Var('p'))), new Abs(new Var('r'), new App(new Var('t'), new Var('p'))), eq_ast);
    test(new Var("y"), new Var("x"), neq_ast);
    test(new App(new Var('t'), new Var('p')), new App(new Var('p'), new Var('t')), neq_ast);

    test(new Abs(new Var("y"), new Var("x")), new App(new Var("y"), new Var("x")), neq_ast);
    test(new Abs(new Var("y"), new Var("x")), 5, neq_ast);
    test(eq_set({'x' : 1}, {'y' : 1}), false);

    test(eq_set({}, {}), true);
    test(eq_set({'x' : 1}, {'x' : 1}), true);
    test(eq_set({'x' : 1}, {'x' : 1, 'y':1}), false);

    test(free_variables(new Var('x')), { 'x' : true }, eq_set);
    test(free_variables(new Abs(new Var('x'), new Var('x'))), {}, eq_set);
    test(free_variables(new App(new Var('x'), new Abs(new Var('x'), new Var('x')))), { 'x' : true }, eq_set);

    test(variables(new Abs(new Var('x'), new Var('x'))), { 'x' : true }, eq_set);
    test(substitute(new Var('x'), new Var('y'), new Var('y')), new Var('x'), eq_ast);
    test(substitute(new Var('x'), new Var('y'), new Var('t')), new Var('t'), eq_ast);

    test(substitute(new Var('x'), new Var('y'), new App(new Var('y'), new Var('t'))), new App(new Var('x'), new Var('t')), eq_ast);
    test(substitute(new Var('e'), new Var('x'), new Abs(new Var('x'), new Var('e1'))), new Abs(new Var('x'), new Var('e1')), eq_ast);
    test(substitute(new Abs(new Var('y'), new Var('y')), new Var('x'), new Abs(new Var('y'), new Var('x'))), new Abs(new Var('y'), new Abs(new Var('y'), new Var('y'))), eq_ast);

    test(substitute(new Var('y'), new Var('x'), new Abs(new Var('y'), new Var('x'))), new Abs(new Var('y1'), new Var('y')), eq_ast);
}


function eq_set(a, b) {
    if(Object.keys(a).length != Object.keys(b).length) {
        return false;
    }
    for(var k in a) {
        if(!(k in b)) {
            return false;
        }
    }
    return true;
}




function test(a, b, cond) {
    try {
        cond = typeof cond !== 'undefined' ? cond : function (c, d) {
            return c == d
        };
        console.log(x + ': ' + (cond(a, b) ? 'pass' : 'failed: ' + a + ", " + b));
    }
    catch (e) {
        console.log(a);
        console.log(e);
    }
    x = x + 1;
}

function neq_ast(a, b) {
    return !eq_ast(a,b);
}

function eq_ast(a, b) {
   if(!('type' in a || 'type' in b)) {
       return a == b;
   }
   if(a.type == b.type) {
       switch(a.type) {
           case 'var': return a.id == b.id;
           case 'app': return eq_ast(a.func, b.func) && eq_ast(a.arg, b.arg);
           case 'abs': return eq_ast(a.var, b.var) && eq_ast(a.expr, b.expr);
       }
   }
   return false;
}


function variables(expr) {
    switch (expr.type) {
        case 'var' :
            var free_var = {};
            free_var[expr.id] = true;
            return free_var;

        case 'app' :
            var free_in_arg = free_variables(expr.arg);
            var free_app = free_variables(expr.func);
            for(var v in free_in_arg) {
                free_app[v] = true;
            }
            return free_app;
        case 'abs' :
            var free_abs = free_variables(expr.expr);
            free_abs[expr.var.id] = true;
            return free_abs;
    }
}

// x is a var
function substitute(e, x, expr) {
    switch (expr.type) {
        case 'var' :
            if(expr.id == x.id) { // e for x in x => e
                return e;
            }
            else { // e for x in y => y
                return expr;
            }
        case 'app' : // e for x in (f g) => (e for x in f) (e for x in g)
            return new App(substitute(e, x, expr.func), substitute(e, x, expr.arg));
        case 'abs' :
            if(expr.var.id == x.id) { // e for x in \x.e1 => \x.e1
                return expr;
            }
            else if(!(expr.var.id in free_variables(e))) {
                return new Abs(expr.var, substitute(e, x, expr.expr));
            }
            else { // rename
                var z = rename(expr.var.id);
                while(z in free_variables(e) || z in variables(expr.expr)) {
                    console.log(z);
                    z = rename(z);
                }
                return new Abs(new Var(z), substitute(e, x, substitute(new Var(z), expr.var, expr.expr)));
            }
    }
}

function rename(y) {
    var res = /^(.*?)([\d]*)$/.exec(y);
    var prefix = res[1];
    var num = res[2];
    return prefix + (num == '' ? 1 : parseInt(num) + 1);
}


// returns set of variables string ids
function free_variables(expr) {
    switch (expr.type) {
        case 'var' :
            var free_var = {};
            free_var[expr.id] = true;
            return free_var;

        case 'app' :
            var free_in_arg = free_variables(expr.arg);
            var free_app = free_variables(expr.func);
            for(var v in free_in_arg) {
                free_app[v] = true;
            }
            return free_app;
        case 'abs' :
            var free_abs = free_variables(expr.expr);
            delete free_abs[expr.var.id];
            return free_abs;
    }
}


function move_from_stack_to_output_while(stack, output, condition) {
    while(stack.length > 0 && condition()) {
        var top = stack.pop();
        if(top == ".") {
            var s = output.pop();
            var f = output.pop();
            output.push(new Abs(f, s));
        }
        else if(/\s+/.test(top)) {
            var s = output.pop();
            var f = output.pop();
            output.push(new App(f, s));
        }
        else {
            console.log("this should never happen");
        }
    }
}

function shunting_yard(tokens) {
    var output = [];
    var stack = [];
    while(tokens.length > 0) {
        var current = tokens.shift();

        if(current.match(/\w+/)) {
            output.push(new Var(current));
        }
        else if(current.match(/\s+/)) { // only swap if both o1 and o2 are application
            move_from_stack_to_output_while(stack, output, function() {return stack[stack.length-1].match(/\s+/)} );
            stack.push(current);
        }
        else if(current == "(" || current == '.') {
            stack.push(current);
        }
        else if(current == ")") {
            move_from_stack_to_output_while(stack, output, function() {return stack[stack.length-1] != '('} );
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
        move_from_stack_to_output_while(stack, output, function() {return true} );
    }
    return output.pop();
}

// all spaces are lambda application => whitespace matters
function separate_tokens(prog_str) {
    return prog_str.split(/(\)|\(|\\|\.|\w+|\s+)/).filter(function (t) {return t != ''});
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

/*
function normal_evaluation(ast_node) {
     switch (ast_node.type) {
        case 'var': return ast_node;
        case 'app': {
            var func = ast_node.func;
            var arg = ast_node.arg;

            switch(func.type) {
                case 'var': return new App(func, normal_evaluation(arg)); // can't eval var func, so eval arg
                case 'app': return new App(normal_evaluation(func), arg);
                case 'abs': return new
            }
        }
        case 'abs': return "Abs(" + pretty_str_expr(expr.var) + ", " + pretty_str_expr(expr.expr) + ")";
        default:    console.log("somethings wrong: " + expr + " " + expr.type);
    }
}
*/



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
    var shunted = shunting_yard(tokens);
    console.log("ast: " + JSON.stringify(shunted));
    console.log("pretty: " + pretty_str_expr(shunted));
});

$("#step_button").click(function(){
    console.log(pretty_str_expr(shunting_yard_ast(separate_tokens("(\\x.(\\d.x) x)"))));
});
