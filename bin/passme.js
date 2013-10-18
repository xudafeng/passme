/* ================================================================
 * passme.js v0.0.0
 *
 * parse me!
 * Latest build : 2013-10-18 14:18:56
 *
 * ================================================================
 * * Copyright (C) 2012-2013 xudafeng <xudafeng@126.com>
 * Improved from civet https://github.com/xudafeng/civet
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 * ================================================================ */
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
    _ = new _();
    exports._ = _;
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
            while (that.index <= that.length -1){
                that.getChar();
                that.getToken();
                that.validate();
                that.goToNextToken();
            }
        },
        getChar:function(){
            var that = this;
            that.char = that.source[that.index];
            //that.char = that.source.charCodeAt(that.index);
        },
        getToken:function(){
            var that = this;
            /* Keyword */
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

            function expectKeyWord(c){
                if(_.isIn(c,'bcdefinstvw')){

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
                        that.expect = null;
                    }
                }
            }
            /* Identifier */
            function parseIdentifier(){
                var c = that.char;
                console.log(c);
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
                        parseKeyword();
                        break;
                    case 'Identifier':
                        parseIdentifier();
                        break;
                    default:
                        error();
                        break;
                }
            }else {
                expectKeyWord(that.char);
            }
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
