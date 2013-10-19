;(function(win){
    var doc = document;

    var code = document.getElementById('code').value;

    var tokens = passme.tokenize(code);
<<<<<<< HEAD
    for(var i = 0;i<tokens.length;i++){
        console.log(tokens[i])
=======
    for(var i =0;i<tokens.length;i++){
        console.log(tokens[i]);
>>>>>>> 056d7b176ff0d09dff2ebae7aea085f176cc589b
    }
})(this);
