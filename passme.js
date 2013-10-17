/*
  Copyright (C) 2012-2013 xudafeng <xudafeng@126.com>

  Improved from civet https://github.com/xudafeng/civet

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
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

    /* lexicalParse class */
    function LexAnalyzer(cfg){
        this.source = cfg.code;
        this.init();
        return this.tokens;
    }
    LexAnalyzer.prototype = {
        init:function(){
            var that = this;
            that.tokens = [];
            that.length = that.source.length;
            that.index = 0;
            that.token = EMPTY;
            that.type = null;
            that.expect = null;
            that.scanner();
        },
        scanner:function(){
            var that = this;
            function getChar(){
                return that.source[that.index];
                return that.source.charCodeAt(that.index);
            }
            while (that.index <= that.length -1){
                var currentChar = getChar();
                var token = that.getToken(currentChar);
                that.validateToken(token);
                that.index ++;
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

            function expectKeyWord(c){
                var keyWordInitial = 'bcdefinstvw';
                if(!!~keyWordInitial.indexOf(c)){
                    that.type = Token['Keyword'];
                    switch(that.token){
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

            if(isKeyWordState()){
                
                switch (char){
                    case 'b':
                        break;
                    default:
                        error();
                        break;
                }
            }else {
                expectKeyWord(char);
            }

            that.token += char;

        },
        validateToken:function(token){
            var that = this;
            console.log(that)
            if(token){
                var _t = that.token;
                that.tokens.push(_t);
                that.token = EMPTY;
            }
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
