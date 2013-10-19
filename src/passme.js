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
})(this,function(exports,undefined){
    var Sytax,
        Regex,
        Token,
        Message;

    /* static */
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

    var _ = function(){
    
    };
    function __typeof(type){
        return function(obj){
            return Object.prototype.toString.call(obj) === '[object ' + type + ']';
        };
    }
    _.prototype = {
        indexOf:function(item, arr) {
            for (var i = 0, len = arr.length; i < len; ++i) {
                if (arr[i] === item) {
                    return i;
                }
            }
            return -1;
        },
        inArray:function(item, arr) {
            return this.indexOf(item, arr) > -1;
        },
        isIn:function(i,s){
            return !!~s.indexOf(i);
        },
        each:function(object, fn) {
            if(object){
                for(var i in object){
                    if(i !== 'length' && i !== 'item'){
                        fn.call(this,object[i],i);
                    }
                }
            }
            return object;
        },
        isString:function(){
            return __typeof('String');
        },
        isArray:function(){
            return __typeof('Array');
        },
        isObject:function(){
            return __typeof('Object');
        },
        isFunction:function(){
            return __typeof('Function');
        },
        isUndefined:function(){
            return __typeof('Undefined');
        }
    };
    exports._ = _ = new _();
    /* lexicalParse class */
    function LexAnalyzer(cfg){
        this.source = cfg.code;
        return this.init(cfg);
    }
    LexAnalyzer.prototype = {
        init:function(cfg){
            var that = this;
            that.initIndex();
            that.initFlags();
            that.scanner();
            return this.tokens;
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
        initType:function(){
            var that = this;
            if(that.isWhiteSpace()){
                that.type = Token['WhiteSpace'];
            }else if(that.isIdentifier()){
                that.type = Token['Identifier'];
            }
            that.token += that.char;
        },
        clearFlags:function(){
            var that = this;
            that.token = EMPTY;
            that.type = null;
        },
        scanner:function(){
            var that = this;
            while (that.index <= that.length -1){
                that.getChar();
                that.getToken();
            }
        },
        getChar:function(){
            var that = this;
<<<<<<< HEAD
            that.char = that.source[that.index];
            that.index ++;
=======
            return that.char = that.source[that.index];
>>>>>>> 056d7b176ff0d09dff2ebae7aea085f176cc589b
            //that.char = that.source.charCodeAt(that.index);
        },
        isBooleanLiteral:function(){
        
        },
        isIdentifier:function(){
            var that = this;
            var c = that.char;
            var hasInitialWord = !!that.token;
            return hasInitialWord ? (c >= 'a' && c <= 'z' || c >= 'A' && c <= 'Z' || c === '_' || c === '$') : (c >= 'a' && c <= 'z' || c >= 'A' && c <= 'Z' || c === '_' || c === '$' || c >=0 && c <=9);
        },
        isKeyword:function(){
        
        },
        isNullLiteral:function(){
            var c = this.char;
            
        },
        isNumericLiteral:function(){

        },
        isPunctuator:function(){
        },
        isStringLiteral:function(){
        },
        isRegularExpression:function(){
        },
        isComment:function(){
        },
        isWhiteSpace:function(){
            var c = this.char;
            return c ==='\n' || c === ' '||c === '\t';
        },
        validate:function(){
            var that = this;
            that.tokens.push({
                type:that.type,
                value:that.token
            });
            that.clearFlags();
            that.initType();
        },
        getToken:function(){
            var that = this;
            var char = that.char;
            /* BooleanLiteral */
            /* Identifier */
            function parseIdentifier(){
                if(that.isIdentifier()){
                    that.token += char;
                }else {
                    that.validate();
                }
            }
            /* Keyword */
<<<<<<< HEAD
            function parseKeyword(){
            
            }
            /* NullLiteral */
            /* NumericLiteral */
            /* Punctuator */
            /* StringLiteral */
            /* RegularExpression */
            /* Comment */
            /* WhiteSpace */
            function parseWhiteSpace(){
                if(that.isWhiteSpace()){
                    that.token += char;
                }else{
                    that.validate();
                }
            }
            /* type router */
            switch(that.type){
                case null:
                    that.initType();
                    break;
                case 'BooleanLiteral':
                    break;
                case 'Identifier':
                    break;
                case 'Keyword':
                    parseKeyword();
                    break;
                case 'NullLiteral':
                    break;
                case 'NumericLiteral':
                    break;
                case 'Punctuator':
                    break;
                case 'StringLiteral':
                    break;
                case 'RegularExpression':
                    break;
                case 'Comment':
                    break;
                case 'WhiteSpace':
                    parseWhiteSpace();
                    break;
=======
            function isKeyWord(){
                
>>>>>>> 056d7b176ff0d09dff2ebae7aea085f176cc589b
            }

            return;
            /* Keyword */
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

            function expectKeyWord(){
                var c = that.char;
                that.token += c;
                if(_.isIn(c,'bcdefinstvw')){
                    that.type = Token['Keyword'];
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
                        case 'r':
                            expectWord(['return']);
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
                }else{
                    that.type = Token['Identifier'];
                }
            }
            function checkKeyWordExpect(c){
                var _t ,_e = false;
                that.token += c;
                if(_.isArray(that.expect)){
                    _.each(that.expect,function(i){
                        if(i===that.token){
                            _t = that.token;
                        }else{
                            if(_.isIn(that.token,i)){
                                _e = true;
                            }
                        }
                    });
                }else{
                    if(that.token === that.expect){
                        _t = that.expect;
                    }else{
                        if(_.isIn(that.token,that.expect)){
                            _e = true;
                        }
                    }
                }
                return {
                    token:_t,
                    isExpect:_e
                };
            }

            function parseKeyword(){
                var c = that.char;
                var r = checkKeyWordExpect(c);
                if(r['token']){
                    that.token = r['token'];
                    that.expect = null;
                }else{
                    if(!r['isExpect']){
                        that.type = Token['Identifier'];
                        that.expect = true;
                    }
                }
            }
            /* Identifier */
            function parseIdentifier(){
                var c = that.char;
                if(isisWhiteSpace(that.token)){
                    that.type = Token['WhiteSpace'];
                }else{
                    that.token +=c;
                }
            }

            /* WhiteSpace */
            function isWhiteSpace(c){
                return c ==='\n' || c === ' '||c === '\t';
            }

            function parseWhiteSpace(){
                var c = that.char;
                if(isWhiteSpace(c)){
                    that.token += c;
                }else{
                    that.type = Token['Keyword'];
                    that.expect = null;
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
                    case 'BooleanLiteral':
                        parseBooleanLiteral();
                        break;
                    case 'Identifier':
                        parseIdentifier();
                        break;
                    case 'Keyword':
                        parseKeyword();
                        break;
                    case 'NullLiteral':
                        parseNullLiteral();
                        break;
                    case 'NumericLiteral':
                        parseNumericLiteral();
                        break;
                    case 'Punctuator':
                        parsePunctuator();
                        break;
                    case 'StringLiteral':
                        parseStringLiteral();
                        break;
                    case 'RegularExpression':
                        parseRegularExpression();
                        break;
                    case 'Comment':
                        parseComment();
                        break;
                    case 'WhiteSpace':
                        parseWhiteSpace();
                        break;
                    default:
                        error();
                        break;
                }
            }else {
                expectKeyWord();
            }
<<<<<<< HEAD
=======
        },
        validate:function(){
            var that = this;
            if(that.token && that.type && !that.expect){
                that.tokens.push({
                    type:that.type,
                    value:that.token
                });
                that.clearFlags();
            }
        },
        clearFlags:function(){
            var that = this;
            that.token = EMPTY;
            that.expect = null;
            that.type = null;
        },
        goToNextToken:function(){
            this.index ++;
>>>>>>> 056d7b176ff0d09dff2ebae7aea085f176cc589b
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
