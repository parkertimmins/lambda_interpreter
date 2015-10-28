


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
        else if(current == ".") { //abstraction
            while(stack.length > 0  && stack[stack.length-1].match(/s+/)) {
                output.push(stack.pop());
            }
           stack.push(current);
        }
        else if(current.match(/\s+/)) {
            while(stack.length > 0 && stack[stack.length-1].match(/s+/)) {
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

    while(stack.length > 0) {
        if(stack[stack.length-1] == '(' || stack[stack.length-1] == ')') {
            console.log("mismatched parenthesis");
        }
        output.push(stack.pop());
    }

    return output
}






// all spaces are lambda application => whitespace matters
function lex_assume_correct(program) {
    var tokens = [];
    var res;
    var regex = /^\(|\)|\\|\.|\w+|\s+/g;
    while ((res = regex.exec(program)) !== null) {
        tokens.push(res[0]);
    }
    return tokens;
}

function regex_lex() {
    /*
         (  ) / . "\w+"

    var tokens = [];
    var res;
    var regex = /^\(|\)|\\|\.|\w+|\s+/g;
    while((res = regex.exec(program)) !== null) {
        if (!/\s+/.test(res[0])) {
            tokens.push(res[0]);
        }
    }
     */

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

   //k to_ast(tokens);
}

function to_ast(tokens) {
    while(tokens.length > 0) {
       var current = tokens.shift();
    }
    return toks;
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
})

$("#eval_button").click(function(){

    var program = "(\\x. (\\d.x) x)";

    console.log(shunting_yard(lex_assume_correct("(\\x.(\\d.x) x)")))

    alert("evaled");
})

$("#step_button").click(function(){
    alert("stepped");
})
