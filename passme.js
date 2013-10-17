;(function(root,factory){
    'use strict';
    /* amd like aml https://github.com/xudafeng/aml.git */
    if(typeof define === 'function' && define.amd) {
        return define(['exports'], factory);
    }else if(typeof exports !== 'undefined') {
        return factory(exports);
    }else{
    /* browser */
        factory(root['passme'] || (root['passme'] = {}));
    }
})(this,function(exports){

    var Sytax,
        Regex,
        Token,
        Message;
    
    var EMPTY = '';
    
    /* default options */
    var options = {
        ecmascript:5,
        comment:true
    }

    Syntax = {
        AssignmentExpression: 'AssignmentExpression',
        ArrayExpression: 'ArrayExpression',
        ArrayPattern: 'ArrayPattern',
        ArrowFunctionExpression: 'ArrowFunctionExpression',
        BlockStatement: 'BlockStatement',
        BinaryExpression: 'BinaryExpression',
        BreakStatement: 'BreakStatement',
        CallExpression: 'CallExpression',
        CatchClause: 'CatchClause',
        ComprehensionBlock: 'ComprehensionBlock',
        ComprehensionExpression: 'ComprehensionExpression',
        ConditionalExpression: 'ConditionalExpression',
        ContinueStatement: 'ContinueStatement',
        DirectiveStatement: 'DirectiveStatement',
        DoWhileStatement: 'DoWhileStatement',
        DebuggerStatement: 'DebuggerStatement',
        EmptyStatement: 'EmptyStatement',
        ExpressionStatement: 'ExpressionStatement',
        ForStatement: 'ForStatement',
        ForInStatement: 'ForInStatement',
        FunctionDeclaration: 'FunctionDeclaration',
        FunctionExpression: 'FunctionExpression',
        Identifier: 'Identifier',
        IfStatement: 'IfStatement',
        Literal: 'Literal',
        LabeledStatement: 'LabeledStatement',
        LogicalExpression: 'LogicalExpression',
        MemberExpression: 'MemberExpression',
        NewExpression: 'NewExpression',
        ObjectExpression: 'ObjectExpression',
        ObjectPattern: 'ObjectPattern',
        Program: 'Program',
        Property: 'Property',
        ReturnStatement: 'ReturnStatement',
        SequenceExpression: 'SequenceExpression',
        SwitchStatement: 'SwitchStatement',
        SwitchCase: 'SwitchCase',
        ThisExpression: 'ThisExpression',
        ThrowStatement: 'ThrowStatement',
        TryStatement: 'TryStatement',
        UnaryExpression: 'UnaryExpression',
        UpdateExpression: 'UpdateExpression',
        VariableDeclaration: 'VariableDeclaration',
        VariableDeclarator: 'VariableDeclarator',
        WhileStatement: 'WhileStatement',
        WithStatement: 'WithStatement',
        YieldExpression: 'YieldExpression'
    };

    Token = {
        BooleanLiteral: 1,
        Identifier: 2,
        Keyword: 3,
        NullLiteral: 4,
        NumericLiteral: 5,
        Punctuator: 6,
        StringLiteral: 7,
        RegularExpression: 8,
        Comment:9,
        WhiteSpace:10
    };
    /* map for type */

    Token['BooleanLiteral'] = 'BooleanLiteral';
    Token['Identifier'] = 'Identifier';
    Token['Keyword'] = 'Keyword';
    Token['NullLiteral'] = 'NullLiteral';
    Token['NumericLiteral'] = 'NumericLiteral';
    Token['Punctuator'] = 'Punctuator';
    Token['StringLiteral'] = 'StringLiteral';
    Token['RegularExpression'] = 'RegularExpression';
    Token['Comment'] = 'Comment';
    Token['WhiteSpace'] = 'WhiteSpace';

    Message = {};

    /**
     * util
     */
    function indexOf(item, arr) {
        for (var i = 0, len = arr.length; i < len; ++i) {
            if (arr[i] === item) {
                return i;
            }
        }
        return -1;
    }
    function inArray(item, arr) {
        return indexOf(item, arr) > -1;
    }

    function each (object, fn) {
        if(object){
            for(var i in object){
                if(i !== 'length' && i !== 'item'){
                    fn.call(this,object[i],i);
                }
            }
        }
        return object;
    };

    function _typeof(type){
        return function(obj){
            return Object.prototype.toString.call(obj) === '[object ' + type + ']';
        };
    };
    var isString = _typeof('String');
    var isArray = _typeof('Array');
    var isObject = _typeof('Object');
    var isFunction = _typeof('Function');
    var isUndefined = _typeof('Undefined');

    /* lexicalParse class */
    function LexAnalyzer(cfg){
        this.source = cfg.code;
        this.init();
        return this.tokens;
    }
    LexAnalyzer.prototype = {
        init:function(){
            var that = this;
            that.initIndex();
            that.initFlags();
            that.scanner();
        },
        initIndex:function(){
            var that = this;
            that.length = that.source.length;
            that.index = 0;
        },
        initFlags:function(){
            var that = this;
            that.tokens = [];
            that.clearFlags();
        },
        scanner:function(){
            var that = this;
            function getChar(){
                return that.source[that.index];
                return that.source.charCodeAt(that.index);
            }
            while (that.index <= that.length -1){
                var curChar = getChar();
                that.getToken(curChar);
                //that.validate();
                that.goToNextToken();
            }
        },
        getToken:function(char){
            var that = this;
            function isKeyWordState(){
                return that.type === Token['Keyword'];
            }
            function expectWord(w){
                if(w.length >1){
                    expectWords(w);
                }else{
                    that.expect = w[0];
                }
            }
            function expectWords(a){
                that.expect = a;
            }
            /** 
             * javascript es5 Keywords:
             * break 
             * case catch continue 
             * default delete do 
             * else 
             * finally for function 
             * if in instanceof 
             * new 
             * return 
             * switch 
             * this throw try typeof 
             * var void 
             * while with     
             */

            function parseKeyWord(c){
                if(!!~'bcdefinstvw'.indexOf(c)){

                    that.type = Token['Keyword'];
                    that.token += c;

                    switch(c){
                        case 'b':
                            expectWord(['break']);
                            break;
                        case 'c':
                            expectWord(['case','catch','continue']);
                            break;
                        case 'd':
                            expectWord(['default','delete','do']);
                            break;
                        case 'e':
                            expectWord(['else']);
                            break;
                        case 'f':
                            expectWord(['finally','for','function']);
                            break;
                        case 'i':
                            expectWord(['if','in','instanceof']);
                            break;
                        case 'n':
                            expectWord(['new']);
                            break;
                        case 's':
                            expectWord(['switch']);
                            break;
                        case 't':
                            expectWord(['this','throw','try','typeof']);
                            break;
                        case 'v':
                            expectWord(['var','void']);
                            break;
                        case 'w':
                            expectWord(['while','with']);
                            break;
                    }
                }
            }
            /* break */
            function expectBreak(){
                
            }
            function error(){
                
            }

            /* validata keyword for the first */

            if(that.type){
                
                switch (that.type){
                    case 'Keyword':
                        console.log(that)
                        if(isArray(that.expect)){
                            each(that.expect,function(i){
                                console.log(i)
                            });
                        }else{
                            
                        }
                        break;
                    default:
                        error();
                        break;
                }
            }else {
                parseKeyWord(char);
            }
        },
        validate:function(){
            var that = this;
            that.tokens.push(that.token);
            that.clearFlags();
        },
        clearFlags:function(){
            var that = this;
            that.token = EMPTY;
            that.expect = null;
            that.type = null;
        },
        goToNextToken:function(){
            this.index ++;
        }
    };

    function throwError(){
    
    }

    /* build tree class */
    function Parser(){
        this.init();
    }
    Parser.prototype = {
        init:function(){
        
        }
    };
    /* set options */
    function setOptions(o){
        
    }
    /* exports */
    function parse(code,options){
    }
    function tokenize(code,options){
        setOptions(options);
        var cfg = {
            code:code
        };
        return new LexAnalyzer(cfg);
    }
    exports.version = '1.0.0';
    exports.parse = parse;
    exports.tokenize = tokenize;
});
/* vim: set sw=4 ts=4 et tw=80 : */
