


function regex_lex() {
    /*
        (\x. x y1)

         (  ) / . "\w+"


    var tokens = [];

    var res;
    var regex = /^\(|\)|\\|\.|\w+|\s+/g;
    while((res = regex.exec(program)) !== null) {
        if (!/\s+/.test(res[0])) {
            tokens.push(res[0]);
        }
    }

    tokens = [];


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



    to_ast(tokens);


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
    $("#strategies").html(strategy + '&nbsp;&nbsp;<span class="caret"></span>');
    $("#strategies").val(strategy);
}


$(function() {

    set_strategy(Object.keys(evaluation_stategies)[0]);

    $(".dropdown-menu li a").click(function () {
        set_strategy($(this).val());
    });
});



$.each(evaluation_stategies, function(name, func) {
    $("#strategies_dropdown").append("<li><a href=\"#\">" + name+ "</a></li>");
})

$("#eval_button").click(function(){
    alert("evaled");
})

$("#step_button").click(function(){
    alert("stepped");
})
