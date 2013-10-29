;(function(win){
    var doc = document;

    var code = document.getElementById('code').value;

    var tokens = passme.tokenize(code,{
        //whiteSpace:true
    });

    var tree = passme.parse(code,{
        whiteSpace:true
    });
    console.log(tree)
})(this);

