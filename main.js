
var evaluation_stategies = {
    "Normal" : normal_step
};

var lambdaEditor;
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

    CodeMirror.defineSimpleMode("lambda", {
            start: [
                {regex: /\w+/, token: "variable"},
                {regex: /\(|\)/, token: "paren"},
                {regex: /\\|\./, token: "slash_dot"}
            ]
    });

    //lambdaEditor = CodeMirror.fromTextArea(document.getElementById("expression"), {

    lambdaEditor = CodeMirror(document.getElementById("code"), {
        lineWrapping: true,
        value: '(\\f.(\\x.f (x x)) (\\x.f (x x))) (\\fact.\\c.(\\n.n (\\x.\\a.\\b.b) (\\a.\\b.a)) c (\\f.\\x.f x) ((\\m.\\n.\\f.m (n f)) c (fact ((\\n.\\f.\\x.n (\\g.\\h.h (g f)) (\\u.x) (\\u.u)) c)))) (\\f.\\x.f (f (f (f (f x)))))',
        mode:  "lambda",
        theme: "expr",
        matchBrackets: true
    });
});

$.each(evaluation_stategies, function(name, func) {
    $("#strategies_dropdown").append("<li><a href=\"#\">" + name+ "</a></li>");
});

function run(evaluator, expr) {
    if (expr != '') {
        var t = new Date().getTime();
        var tokens = lex(expr);
        var parsed = parse(tokens);
        var evaled = evaluator(parsed).node;
        var delay = new Date().getTime() - t;
        console.log('delay: ' + delay);
        return pp(evaled);
    }
}

$("#eval_button").click(function(){
    var stepper = evaluation_stategies[$("#strategies").text()];
    lambdaEditor.setValue(run(fixpoint(stepper), lambdaEditor.getValue()));
    console.log('redexes: ' + redexes);
});


$("#step_button").click(function(){
    var stepper = evaluation_stategies[$("#strategies").text()];
    lambdaEditor.setValue(run(stepper, lambdaEditor.getValue()));
});


