/* ================================================================
 * passme.js v1.0.3
 *
 * parse me!
 * Latest build : 2013-10-29 15:55:41
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
    var _,
        Sytax,
        Regex,
        Token,
        Message;

    /* static */
    var EMPTY = '';

    var KEY_WORDS_AND_BOOlEAN_LITERALS_AND_NULLLITERAL = 'break|case|catch|continue|default|delete|do|else|finally|for|function|if|in|instanceof|new|return|switch|this|throw|try|typeof|var|void|while|with|true|false|null'.split('|');

    var FUTURE_RESERVED_WORDS = 'class|enum|export|extends|import|super'.split('|');

    var STRICT_MODE_RESERVED_WORDS = 'implements|interface|package|private|protected|public|static|yield|let'.split('|');

    var BOOlEAN_LITERALS = ['true','false'];
    
    var NULLLITERAL = ['null'];

    /* default options */
    var options = {
        ecmascript:5,
        comment:true,
        whiteSpace:false,
        ranges:false,
        locations:false
    }

    var userConfig = {};

    /* map for type */

    Token = {
        BooleanLiteral: 'BooleanLiteral',
        Identifier: 'Identifier',
        Keyword: 'Keyword',
        NullLiteral: 'NullLiteral',
        NumericLiteral: 'NumericLiteral',
        Punctuator: 'Punctuator',
        StringLiteral: 'StringLiteral',
        RegularExpression: 'RegularExpression',
        Comment:'Comment',
        WhiteSpace:'WhiteSpace'
    };
    /**
     * util
     */

    function __(){};
    function __typeof(type){
        return function(obj){
            return Object.prototype.toString.call(obj) === '[object ' + type + ']';
        };
    }
    __.prototype = {
        log:function (l){
            console && this.isObject(console.log) && console.log(l);
        },
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
        mix:function(r,s){
            for(var i in s){
                r[i] = s[i];
            };
            return r;
        },
        each:function(object, fn) {
            if(object){
                for(var i in object){
                    if(i !== 'length' && i !== 'item' && object.hasOwnProperty(i)){
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
    //export util
    exports._ = _ = new __();
    /* lexicalParse class */
    function LexAnalyzer(cfg){
        this.source = cfg.code;
        return this.init();
    }
    LexAnalyzer.prototype = {
        init:function(){
            var that = this;
            that.initIndex();
            that.initLocations();
            that.initFlags();
            that.scanner();
            return that.tokens;
        },
        initIndex:function(){
            var that = this;
            that.length = that.source.length;
            that.index = 0;
        },
        initLocations:function(){
            var that = this;
            that.line = 1;
            that.column = -1;
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
            }else if(that.isRegularExpression()){
                that.type = Token['RegularExpression'];
            }else if(that.isPunctuator()){
                that.type = Token['Punctuator'];
            }else if(that.isNumericLiteral()){
                that.type = Token['NumericLiteral'];
            }else if(that.isStringLiteral()){
                that.type = Token['StringLiteral'];
            }
            that.token += String.fromCharCode(that.c);
            that.setRanges();
            that.setLocations();
        },
        setLocations:function(){
            var that = this;
            var f = that.locations['start'] ? 'end' : 'start';
            that.locations[f] = {
                line:that.line,
                column:that.column
            };
        },
        setWrap:function(){
            var that = this;
            if(that.isWrap()){
                that.line ++;
                that.column = -1;
            };
        },
        clearFlags:function(){
            var that = this;
            that.token = EMPTY;
            that.type = null;
            that.ranges = [];
            that.locations = {};
        },
        scanner:function(){
            var that = this;
            _.each(that.source,function(){
                that.getChar();
                that.getToken();
            });
        },
        getChar:function(){
            var that = this;
            that.c = that.source.charCodeAt(that.index);
            that.index ++;
            that.column ++;
        },
        end:function(){
            var that = this;
            if(that.index === that.length){
                that.validate();
            }
        },
        isBooleanLiteral:function(){
            var t = this.token;
            return _.isIn(t,BOOlEAN_LITERALS);
        },
        isIdentifier:function(){
            var that = this;
            var c = that.c;
            var hasInitialWord = !!that.token;
            return hasInitialWord ? (c >= 97 && c <= 122 || c >= 65 && c <= 90 || c >= 48 && c <= 57 || c === 95 || c === 36) : (c >= 97 && c <= 122 || c >= 65 && c <= 90 || c === 95 || c === 36);
        },
        isKeyword:function(){
            var t = this.token;
            var r;
            if(_.isIn(t[0],'bcdefinrstvw')){
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
                if(_.isIn(t,KEY_WORDS_AND_BOOlEAN_LITERALS_AND_NULLLITERAL)){
                    r = !r;
                }else{
                    r = !!r;
                }
            }else {
                r = !!r;
            }
            return r;
        },
        isNullLiteral:function(){
            var t = this.token;
            return _.isIn(t,NULLLITERAL);
        },
        isNumericLiteral:function(){
            var c = this.c;
            return c >= 48 && c <= 57;
        },
        isPunctuator:function(){
            var that = this;
            var c = that.c;
            return _.isIn(c,[33, 37, 38, 40, 41, 42, 43, 44, 45, 46, 47, 58, 59, 60, 61, 62, 63, 91, 93, 123, 124, 125, 126]);
        },
        isStringLiteral:function(){
            var c = this.c;
            var t = this.token;
            switch (t.length){
                case 0:
                    return c === 39 || c === 34;
                    break;
                case 1:
                    var _t = t[0];
                    return c !== _t || c === _t && t[t.length -1] !==92;
                    break;
                default :
                    var _t = t[0];
                    return t[t.length-1] !== _t || c === _t && t[t.length-1] !==92;
                    break;
            }
        },
        isRegularExpression:function(){
            // /pattern/attribute
            var c = this.c;
            var t = this.token;
            switch (t.length){
                case 0:
                    return c === 47;
                    break;
                case 1:
                    return c !== 47 && c !== 42;
                    break;
                default:
                    return c !== 32 && c !== 44 && c !== 59;
                    break;
            }
        },
        isComment:function(){
            /** 
             * //     singel
             * /* *\/ multi
             */
            var c = this.c;
            var t = this.token;
            switch (t.length){
                case 0:
                    return c === 47;
                    break;
                case 1:
                    return c === 47 || c === 42;
                    break;
                default:
                    return t[1].charCodeAt() === 47 ? c !== 10: t[1].charCodeAt() === 42 && (t[t.length-1].charCodeAt() !== 47 || t[t.length-2].charCodeAt() !== 42);
                    break;
            }
        },
        isWhiteSpace:function(){
            var that = this;
            var c = this.c;
            return that.isWrap() || c === 32 || c === 9;
        },
        isWrap:function(){
            var c = this.c;
            return c === 10;
        },
        setRanges:function(){
            var that = this;
            that.ranges.push(that.index - 1);
        },
        validate:function(){
            var that = this;
            var whiteSpace = userConfig.whiteSpace;
            var comment = userConfig.comment;
            var ranges = userConfig.ranges;
            var locations = userConfig.locations;
            var filter;
            var meta = {};
            that.setRanges();
            that.setLocations();
            _.mix(meta,{
                type:that.type,
                value:that.token
            });
            ranges && _.mix(meta,{
                ranges:that.ranges
            });
            locations && _.mix(meta,{
                locations:that.locations
            });
            if(that.type === Token['WhiteSpace'] && !whiteSpace || that.type === Token['comment'] && !comment){
                filter = true;
            }
            !filter && that.tokens.push(meta);
            that.clearFlags();
            that.initType();
        },
        getToken:function(){
            var that = this;
            var char = String.fromCharCode(that.c);
            /* Identifier */
            function parseIdentifier(){
                if(that.isIdentifier()){
                    that.token += char;
                }else {
                    if(that.isKeyword()){
                        if(that.isBooleanLiteral()){
                            that.type = Token['BooleanLiteral'];
                        }else if(that.isNullLiteral()){
                            that.type = Token['NullLiteral'];
                        }else {
                            that.type = Token['Keyword'];
                        }
                    }
                    that.validate();
                }
            }
            /* NumericLiteral */
            function parseNumericLiteral(){
                if(that.isNumericLiteral()){
                    that.token += char;
                }else {
                    that.validate();
                }
            }
            /* Punctuator */
            function parsePunctuator(){
                var t = that.token;
                /*********************
                 * +  * ==  * && * , *
                 * -  * === * || * ; *
                 * *  * !=  * !  * ( *
                 * /  * >   * '  * ) *
                 * %  * <   * "  * [ *
                 * ++ * >=  *    * ] *
                 * -- * <=  *    * { *
                 * ~  *     *    * } *
                 ********************/
                if(_.isIn(t.charCodeAt(),[40, 41, 44, 58, 59, 63, 91, 93, 123, 125])){
                    that.validate();
                }else{
                    if(that.isPunctuator()){
                        that.token += char;
                    }else{
                        that.validate();
                    }
                }
            }
            /* StringLiteral */
            function parseStringLiteral(){
                if(that.isStringLiteral()){
                    that.token += char;
                }else {
                    that.validate();
                }
            }
            /* RegularExpression */
            function parseRegularExpression(){
                if(that.isRegularExpression()){
                    that.token += char;
                }else{
                    if(that.isComment()){
                        that.type = Token['Comment'];
                        that.token +=char;
                    }else{
                        that.validate();
                    }
                }
            }
            /* Comment */
            function parseComment(){
                if(that.isComment()){
                    that.token += char;
                }else{
                    that.validate();
                }
            }
            /* WhiteSpace */
            function parseWhiteSpace(){
                if(that.isWhiteSpace()){
                    that.token += char;
                }else{
                    that.validate();
                }
            }
            /* set wrap */
            that.setWrap();
            /* type router */
            switch(that.type){
                case null:
                    that.initType();
                    break;
                case 'Identifier':
                    parseIdentifier();
                    break;
                case 'Keyword':
                    parseKeyword();
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
            }
            that.end();
        }
    };
    /* build tree class 
     *
     * based on https://developer.mozilla.org/en-US/docs/SpiderMonkey/Parser_API
     *
     * http://www.ecma-international.org/publications/files/ECMA-ST/Ecma-262.pdf
     */
    Syntax = {
        //Programs
        Program:'Program',
        //Statements
        EmptyStatement:'EmptyStatement',
        BlockStatement:'BlockStatement',
        ExpressionStatement:'ExpressionStatement',
        IfStatement:'IfStatement',
        LabeledStatement:'LabeledStatement',
        BreakStatement:'BreakStatement',
        ContinueStatement:'ContinueStatement',
        WithStatement:'WithStatement',
        SwitchStatement: 'SwitchStatement',
        ReturnStatement: 'ReturnStatement',
        ThrowStatement: 'ThrowStatement',
        TryStatement: 'TryStatement',
        WhileStatement: 'WhileStatement',
        DoWhileStatement: 'DoWhileStatement',
        ForStatement: 'ForStatement',
        ForInStatement: 'ForInStatement',
        LetStatement:'LetStatement',
        DebuggerStatement: 'DebuggerStatement',
        //Declarations
        FunctionDeclaration: 'FunctionDeclaration',
        VariableDeclaration: 'VariableDeclaration',
        VariableDeclarator: 'VariableDeclarator',
        //Expressions
        ThisExpression: 'ThisExpression',
        ArrayExpression: 'ArrayExpression',
        ObjectExpression: 'ObjectExpression',
        FunctionExpression: 'FunctionExpression',
        ArrowExpression:'ArrowExpression',
        SequenceExpression: 'SequenceExpression',
        UnaryExpression: 'UnaryExpression',
        BinaryExpression: 'BinaryExpression',
        AssignmentExpression: 'AssignmentExpression',
        UpdateExpression: 'UpdateExpression',
        LogicalExpression: 'LogicalExpression',
        ConditionalExpression: 'ConditionalExpression',
        NewExpression: 'NewExpression',
        CallExpression: 'CallExpression',
        MemberExpression: 'MemberExpression',
        //Patterns
        ObjectPattern: 'ObjectPattern',
        ArrayPattern: 'ArrayPattern',
        //Clauses
        SwitchCase: 'SwitchCase',
        CatchClause: 'CatchClause',
        //Miscellaneous
        Identifier: 'Identifier',
        Literal: 'Literal'
    };

    Message = {};

    function throwError(){
    
    }

    function Parser(cfg){
        var that = this;
        that.source = cfg.code;
        that.tokens = new LexAnalyzer(userConfig);
        return that.init();
    }
    Parser.prototype = {
        init:function(){
            var that = this;
            for(var i =0;i<that.tokens.length;i++){
                console.log(that.tokens[i]);
            }
            that.syntaxTree = {};
            return that.syntaxTree;
        }
    };

    function parseBreakStatement(){
    
    }
    function parseContinueStatement(){
    
    }
    function parseDebuggerStatement(){
    
    }
    function parseDoWhileStatement(){
    
    }
    function parseForStatement(){
    
    }

    function parseFunctionDeclaration(){
    
    }
    function parseIfStatement(){
    
    }
    function parseReturnStatement(){
    
    }
    function parseSwitchStatement(){
    
    }

    function parseThrowStatement(){
    
    }
    function parseTryStatement(){
    
    }
    function parseVariableStatement(){
    
    }
    function parseWhileStatement(){
    
    }

    function parseWithStatement(){
    
    }
    /**
    * Programs
    * 
    * interface Program <: Node {
    *   type: "Program";
    *   body: [ Statement ];
    * }
    */

    /*
    * Function
    * interface Function <: Node {
    *   id: Identifier | null;
    *   params: [ Pattern ];
    *   defaults: [ Expression ];
    *   rest: Identifier | null;
    *   body: BlockStatement | Expression;
    *   generator: boolean;
    *   expression: boolean;
    * }
    */

    /**
     * Statements
     *
     * interface Statement <: Node { }
     */

    /* set options */
    function setOptions(code,o){
        userConfig = _.mix(options,o);
        _.mix(userConfig,{
            code:code
        });
    }
    /* exports */
    function parse(code,o){
        setOptions(code,o);
        try{
            return new Parser(userConfig);
        } catch (e){
            throw e;
        }
    }
    function tokenize(code,o){
        setOptions(code,o);
        try {
            return new LexAnalyzer(userConfig);
        } catch (e) {
            throw e;
        }
    }
    exports.version = '1.0.3';
    exports.parse = parse;
    exports.tokenize = tokenize;
});
/* vim: set sw=4 ts=4 et tw=80 : */
