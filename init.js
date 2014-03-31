/**
 * 中文测试
 *
 */
aml.config({
    path: (!~location.hostname.indexOf('github') ? 'demo/editor/':'demo/editor/')
});
;define(function(){
    var passme = require('passme');
    var doc = document;
    var reserve = 'abstract|boolean|byte|char|class|const|debugger|double|enum|export|extends|fimal|float|goto|implements|import|int|interface|long|mative|package|private|protected|public|short|static|super|synchronized|throws|transient|volatile|window|undefined'.split('|');
    var dest = 'bin/passme.js';

    var highlight = doc.getElementById('highlight');

    function escapeHtml(s){
        return s.replace(/&/g,'&amp;').replace(/>/g,'&gt;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
    }
    function exec(d){
        var code = d;
        var tokens = passme.tokenize(code,{
            ecmascript:5,
            whiteSpace:true,
            ranges:true,
            locations:true
        });
        var h = '';
        function renderLine(n){
            var r = '';
            for(var i =0;i<n-1;i++){
                r += '<div>' + (parseInt(i) + 1)+ '</div>';
            }
            doc.getElementById('line').innerHTML = r;
        }
        passme._.each(tokens,function(i,key){
            if(tokens.length-1 == key){
                renderLine(i.locations.end.line);
            }
            if(i.type == 'Identifier'){
                if(passme._.isIn(i.value,reserve)){
                    h += '<span class="reserve">' + i.value + '</span>';
                }else {
                    h += '<span class="'+ i.type+'">' + i.value + '</span>';
                }
            }else if(i.type == 'StringLiteral' || i.type == 'Comment'){
                h += '<span class="'+ i.type+'">' + escapeHtml(i.value) + '</span>';
            }else{
                h += '<span class="'+ i.type+'">' + i.value + '</span>';
            }
        });
        highlight.innerHTML = h;
        highlight.contentEditable='true';
        highlight.designMode='on';
    }
    var __defaulConfig = {
        method:'POST',//默认post方式
        url:'/',
        async:false,
        data:null,
        success:function(e){}
    }
    function io(__config){
        var method = __config['method']||__defaulConfig['method'],
            url =  __config['url']||__defaulConfig['url'],
            successHandle = __config['success']||__defaulConfig['success'],
            async = __config['async']||__defaulConfig['async'],
            data = __config['data']||__defaulConfig['data'],
            xmlHttp;
        if (window.XMLHttpRequest){
            xmlHttp=new XMLHttpRequest();
        }
        else{           //for IE6, IE5
            xmlHttp=new ActiveXObject("Microsoft.XMLHTTP");
        }
        xmlHttp.onreadystatechange=function(){
            if (xmlHttp.readyState==4 && xmlHttp.status==200){
                successHandle(xmlHttp.responseText);
            }
        }
        xmlHttp.open(method,url,async);
        xmlHttp.setRequestHeader('Content-type','application/x-www-form-urlencoded');
        xmlHttp.setRequestHeader('data',data);
        xmlHttp.send();
    }
    io({
        url:dest,
        method:'get',
        success:function(d){
            exec(d);
        }
    });
});
