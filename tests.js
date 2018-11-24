var x = 1;

function tests() {
    test(new Var("x"), new Var("x"), eq_ast);
    test(new App(new Var('t'), new Var('p')), new App(new Var('t'), new Var('p')), eq_ast);

    test(new Abs(new Var('r'), new App(new Var('t'), new Var('p'))), new Abs(new Var('r'), new App(new Var('t'), new Var('p'))), eq_ast);
    test(new Var("y"), new Var("x"), neq_ast);
    test(new App(new Var('t'), new Var('p')), new App(new Var('p'), new Var('t')), neq_ast);

    test(new Abs(new Var("y"), new Var("x")), new App(new Var("y"), new Var("x")), neq_ast);
    test(new Abs(new Var("y"), new Var("x")), 5, neq_ast);
    test(eq_set({'x' : 1}, {'y' : 1}), false);

    test(eq_set(new Set([]), new Set([])), true);
    test(eq_set(new Set(['x']), new Set(['x'])), true);
    test(eq_set(new Set(['x']), new Set(['x', 'y'])), false);

    test(new Var('x').free_vars, new Set(['x']), eq_set);
    test(new Abs(new Var('x'), new Var('x')).free_vars, new Set([]), eq_set);
    test(new App(new Var('x'), new Abs(new Var('x'), new Var('x'))).free_vars, new Set(['x']), eq_set);

    test(variables(new Abs(new Var('x'), new Var('x'))), new Set(['x']), eq_set);
    test(substitute(new Var('x'), new Var('y'), new Var('y')), new Var('x'), eq_ast);
    test(substitute(new Var('x'), new Var('y'), new Var('t')), new Var('t'), eq_ast);

    test(substitute(new Var('x'), new Var('y'), new App(new Var('y'), new Var('t'))), new App(new Var('x'), new Var('t')), eq_ast);
    test(substitute(new Var('e'), new Var('x'), new Abs(new Var('x'), new Var('e1'))), new Abs(new Var('x'), new Var('e1')), eq_ast);
    test(substitute(new Abs(new Var('y'), new Var('y')), new Var('x'), new Abs(new Var('y'), new Var('x'))), new Abs(new Var('y'), new Abs(new Var('y'), new Var('y'))), eq_ast);

    test(substitute(new Var('y'), new Var('x'), new Abs(new Var('y'), new Var('x'))), new Abs(new Var('y1'), new Var('y')), eq_ast);

    test(remove_extra_spaces('( \\'), '(\\');
    test(remove_extra_spaces('( x'), '(x');
    test(remove_extra_spaces('\\ x'), '\\x');
    test(remove_extra_spaces('x .'), 'x.');
    test(remove_extra_spaces('. x'), '.x');
    test(remove_extra_spaces('.\\'), '.\\');
    test(remove_extra_spaces('x )'), 'x)');
    test(remove_extra_spaces(') )'), '))');
    test(remove_extra_spaces('( ('), '((');

    test(rename("x22"), "x23");
    test(rename("cats"), "cats1");

}

function eq_obj(a, b) {
    if(Object.keys(a).length != Object.keys(b).length) {
        return false;
    }
    for(var k in a) {
        if(!(k in b) || a[k] != b[k]) {
            return false;
        }
    }
    return true;
}

function eq_set(a, b) {
    if(a.size != b.size) {
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
        if (!cond(a, b)) {
            console.log(x + ': ' + 'failed: \n' + JSON.stringify(a) + "\n" + JSON.stringify(b));
        }
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
