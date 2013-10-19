;(function(win){
    var doc = document;

    var code = document.getElementById('code').value;

    var tokens = passme.tokenize(code);

    for(var i = 0;i<tokens.length;i++){
        console.log(tokens[i])

    }
})(this);
