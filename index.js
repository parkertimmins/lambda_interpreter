
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
    }
}

// pretty print
// unnecessary parenthesises uses in some abstractions
function pp(expr) {
     switch (expr.type) {
        case 'var': return expr.id;
        case 'abs': return '(\\' + expr.var.id + '.' + pp(expr.expr) + ')';
        case 'app':
            return pp(expr.func) + ' ' + (expr.arg.type == 'app' ? '('+pp(expr.arg)+')' : pp(expr.arg));
    }
}

function print(o) {
    console.log(JSON.stringify(o));
}

function pretty(prog_str) {
    return pretty_str_expr(shunting_yard(separate_tokens(prog_str)));
}

function fixpoint(stepper) {
    return function (expr) {
        var expr_evaled = stepper(expr);
        while(expr_evaled.stepped) {
            expr_evaled = stepper(expr_evaled.node);
        }
        return expr_evaled;
    };
}

function normal_step(node) {
    switch (node.type) {
        case 'var': return { stepped: false, node: node };
        case 'app':
            switch(node.func.type) {
                case 'var':
                case 'app':
                    var func_evaled = normal_step(node.func);
                    if (func_evaled.stepped) {
                        return {stepped: true, node: new App(func_evaled.node, node.arg)};
                    }
                    var arg_evaled = normal_step(node.arg);
                    return { stepped: arg_evaled.stepped, node: new App(node.func, arg_evaled.node) };
                case 'abs': // redex
                    return {stepped: true, node: substitute(node.arg, node.func.var, node.func.expr)}
            }
        case 'abs':
            var expr_evaled = normal_step(node.expr);
            return { stepped : expr_evaled.stepped, node : new Abs(node.var, expr_evaled.node) };
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

function variables(expr) {
    switch (expr.type) {
        case 'var' :
            var var_vars = {};
            var_vars[expr.id] = true;
            return var_vars;
        case 'app' :
            return _.extend(variables(expr.func), variables(expr.arg));
        case 'abs' :
            var abs_vars = variables(expr.expr);
            abs_vars[expr.var.id] = true;
            return abs_vars;
    }
}

function free_variables(expr) {
    switch (expr.type) {
        case 'var' :
            var free_var = {};
            free_var[expr.id] = true;
            return free_var;
        case 'app' :
            return _.extend(free_variables(expr.func), free_variables(expr.arg));
        case 'abs' :
            return _.omit(free_variables(expr.expr), expr.var.id);
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

var evaluation_stategies = {
    "Normal" : normal_step
};

$(function() {
    $("#strategies").text(Object.keys(evaluation_stategies)[0]);

    $(".dropdown-menu li a").click(function () {
        $("#strategies").text($(this).text());
    });

    $("#eval_button").mouseup(function(){
        $(this).blur();
    })
    $("#step_button").mouseup(function(){
        $(this).blur();
    })
});

$.each(evaluation_stategies, function(name, func) {
    $("#strategies_dropdown").append("<li><a href=\"#\">" + name+ "</a></li>");
});

function run(evaluator, expr) {
    if (expr != '') {
        var tokens = separate_tokens(expr);
        var parsed = shunting_yard(tokens);
        console.log('before: ' + pretty_str_expr(parsed));
        var evaled = evaluator(parsed).node;
        console.log('after:  ' + pretty_str_expr(evaled));
        $("#expression").val(pp(evaled));
        $("#expression").text(pp(evaled));
    }
}

$("#eval_button").click(function(){
    var stepper = evaluation_stategies[$("#strategies").text()];
    run(fixpoint(stepper), $("#expression").val());
});


$("#step_button").click(function(){
    var stepper = evaluation_stategies[$("#strategies").text()];
    run(stepper, $("#expression").val());
});

