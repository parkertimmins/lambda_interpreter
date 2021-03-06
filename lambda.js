
function Var(id) {
    this.type = 'var';
    this.id = id;
    this.free_vars = new Set([id]);
}

function App(func, arg) {
    this.type = 'app';
    this.func = func;
    this.arg = arg;
    this.free_vars = new Set([...func.free_vars, ...arg.free_vars]);
}

function Abs(v, expr) {
    this.type = 'abs';
    this.var = v;
    this.expr = expr;
    this.free_vars = new Set([...expr.free_vars]);
    this.free_vars.delete(this.var.id);
}

// pretty print
// unnecessary parenthesises uses in some abstractions
function pp(expr) {
    switch (expr.type) {
        case 'var': return expr.id;
        case 'abs': return `(\\${expr.var.id}.${pp(expr.expr)})`;
        case 'app':
            return pp(expr.func) + ' ' + (expr.arg.type == 'app' ? '('+pp(expr.arg)+')' : pp(expr.arg));
    }
}

function fixpoint(stepper) {
    return (expr) => {
        var expr_evaled = stepper(expr);
        while(expr_evaled.stepped) {
            expr_evaled = stepper(expr_evaled.node);
        }
        return expr_evaled;
    };
}

var redexes = 0;
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
                    redexes++;
                    return {stepped: true, node: substitute(node.arg, node.func.var, node.func.expr)}
            }
            break;
        case 'abs':
            var expr_evaled = normal_step(node.expr);
            return { stepped : expr_evaled.stepped, node : new Abs(node.var, expr_evaled.node) };
    }
}

// sub e for x (variable) in expr
function substitute(e, x, expr) {
    switch (expr.type) {
        case 'var' :    return expr.id == x.id ? e : expr;
        case 'app' :    return new App(substitute(e, x, expr.func), substitute(e, x, expr.arg));
        case 'abs' :
            if(expr.var.id == x.id) {
                return expr;
            }
            else if(!e.free_vars.has(expr.var.id)) {
                return new Abs(expr.var, substitute(e, x, expr.expr));
            }
            else {
                do {
                    var z = rename(expr.var.id);
                } while(e.free_vars.has(z) || variables(expr.expr).has(z));
                return new Abs(new Var(z), substitute(e, x, substitute(new Var(z), expr.var, expr.expr)));
            }
    }
}

function rename(variable) {
    var [match, prefix, num] = /^(.*?)([\d]*)$/.exec(variable);
    return prefix + (num == '' ? 1 : parseInt(num) + 1);
}

function variables(expr) {
    switch (expr.type) {
        case 'var' : return new Set([expr.id]);
        case 'app' : return new Set([...variables(expr.func), ...variables(expr.arg)]);
        case 'abs' : return new Set([...variables(expr.expr), expr.var.id]);
    }
}

function move_from_stack_to_output_while(stack, output, condition) {
    while(stack.length > 0 && condition()) {
        var top = stack.pop();
        var s = output.pop();
        var f = output.pop();
        output.push(top == '.' ? new Abs(f, s) : new App(f, s));
    }
}

// shunting yard algorithm
function parse(tokens) {
    var output = [];
    var stack = [];
    while(tokens.length > 0) {
        var current = tokens.shift();

        if(current.match(/\w+/)) {
            output.push(new Var(current));
        }
        else if(current.match(/\s+/)) { // only swap if both o1 and o2 are application
            move_from_stack_to_output_while(stack, output, () => stack[stack.length-1].match(/\s+/));
            stack.push(current);
        }
        else if(current == "(" || current == '.') {
            stack.push(current);
        }
        else if(current == ")") {
            move_from_stack_to_output_while(stack, output, () => stack[stack.length-1] != '(');
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
        move_from_stack_to_output_while(stack, output, () => true);
    }
    return output.pop();
}

function lex(program) {
    return split_tokens(remove_extra_spaces(program.trim()));
}

// all spaces are lambda application => whitespace matters
function split_tokens(prog_str) {
    return prog_str.split(/(\)|\(|\\|\.|\w+|\s+)/).filter(t => t != '');
}

// remove any space that isn't in one of the following spots: )_(, x_(, )_x, x_x, x_\, )_\
function remove_extra_spaces(program) {
    return program
        .replace(/([^\)\w])\s+/g, '$1')
        .replace(/\s+([^\(\w\\])/g, '$1')
}


