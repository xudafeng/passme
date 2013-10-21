;(function(win){
    var doc = document;

    var code = document.getElementById('code').value;

    var tokens = passme.tokenize(code,{
        //whiteSpace:true
    });

    for(var i = 0;i<tokens.length;i++){
        //console.log(tokens[i])

    }
    var tree = passme.parse(code,{
        whiteSpace:true
    });
    console.log(tree)
})(this);
