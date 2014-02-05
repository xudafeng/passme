/* ================================================================
 * passme.js v1.0.7
 *
 * parse me!
 * Latest build : 2014-02-05 20:54:30
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
            var t;
            if(that.isWhiteSpace()){
                t = Token['WhiteSpace'];
            }else if(that.isIdentifier()){
                t = Token['Identifier'];
            }else if(that.isRegularExpression()){
                t = Token['RegularExpression'];
            }else if(that.isPunctuator()){
                t = Token['Punctuator'];
            }else if(that.isNumericLiteral()){
                t = Token['NumericLiteral'];
            }else if(that.isStringLiteral()){
                t = Token['StringLiteral'];
            }
            that.type = t;
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
            return _.isIn(c,[33, 37, 38, 40, 41, 42, 43, 44, 45, 46, 47, 58, 59, 60, 61, 62, 63, 91, 93,94, 123, 124, 125, 126]);
        },
        isStringLiteral:function(){
            var c = this.c;
            var t = this.token;
            function isEndOfString(){
                var _t = t[0];
                if(t[t.length-1] !== _t){
                    return true;
                }else if(t[t.length-1] === _t){
                    if(t[t.length-2].charCodeAt() === 92){
                        var offset = 0;
                        var num = 0;
                        var can = true;
                        while(can){
                            offset ++;
                            if(t[t.length-(2+offset)].charCodeAt() !== 92){
                                can = false;
                            }else{
                                num ++;
                            }
                        }
                        return num %2 ==0;
                    }else{
                        return false;
                    }
                }else if(c === _t.charCodeAt() && t[t.length-1].charCodeAt() === 92){//next turn
                    return true;
                }else{
                    return false;
                }
            }
            switch (t.length){
                case 0:
                    return c === 39 || c === 34;
                    break;
                case 1:
                    var _t = t[0];
                    return true;
                    break;
                case 2:
                    var _t = t[0];
                    return _t !== t[t.length-1];
                    break;
                default :
                    return isEndOfString();
                    break;
            }
        },
        isRegularExpression:function(){
            // /pattern/attribute
            var that = this;
            var c = that.c;
            var t = that.token;
            function retrospective(){
                var isReg = true;
                for(var i=that.tokens.length;i>=0;i--){
                    if(that.tokens[i] && that.tokens[i].type!=='WhiteSpace'){
                        if(that.tokens[i].type =='Punctuator' && _.isIn(that.tokens[i].value,['{','}',';','+',',','||','&&','=','==','===','!','[','(',':','?']) ||that.tokens[i].type =='Keyword'){
                            isReg = true;
                        }else {
                            isReg = false;
                        }
                        break;
                    }
                }
                return isReg;
            }
            function getSlashNum(t){
                var n = 1;
                var o = false;
                for(var i = 0;i<t.length;i++){
                    if(t[i]=='[' &&(t[i-1] !=='\\' || t[i-1] =='\\' && t[i-2] =='\\')){
                        o =true;
                    }else if(t[i]==']'&&(t[i-1] !=='\\' || t[i-1] =='\\' && t[i-2] =='\\')){
                        o = false;
                    }
                    if(i>0 && t[i] == '/' && t[i-1]!=='\\' && !o){
                        n++;
                    }
                }
                return n;
            }
            switch (t.length){
                case 0:
                    return c === 47;// /
                    break;
                case 1:
                    return c !== 47 && c !== 42 && c !==61 &&retrospective();// / * =
                    break;
                default:
                    if(getSlashNum(t) == 2){
                        return !_.isIn(c,[33, 37, 38, 40, 41, 42, 43, 44, 45, 46, 47, 58, 59, 60, 61, 62, 63, 91, 93, 123, 124, 125, 126]);
                    }else if(getSlashNum(t) == 1){
                        if(/\\\\\//.test(t)&&!/\\\\\\\//.test(t)){
                            return !_.isIn(c,[33, 37, 38, 40, 41, 42, 43, 44, 45, 46, 47, 58, 59, 60, 61, 62, 63, 91, 93, 123, 124, 125, 126]);
                        }else if(_.isIn(c,[10]) && t[t.length-1] !== '\\'){
                            return false;
                        }else {
                            return true;
                        }
                    }
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
            return that.isWrap() || _.isIn(c,[9,11,12,13,32]);
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
                        if(_.isIn(t,['&&','||'])){
                            that.validate();
                        }else if(_.isIn(t[t.length-1],['+','-','*','/','!','=']) && that.c != 61){
                            that.validate();
                        }else {
                            that.token += char;
                        }
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
                    if(that.c == 61){
                        that.type = Token['Punctuator'];
                        that.token +=char;
                    }else if(that.isComment()){
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
    /**
     * 实现散列哈希
     */
    function Hash() {
        this.hash = new Object();
        this.set = function (key, value) {
            if (typeof (key) != "undefined") {
                if (this.has(key) == false) {
                    this.hash[key] = typeof (value) == "undefined" ? null : value;
                    return this;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        }
        this.remove = function (key) {
            delete this.hash[key];
        }
        this.count = function () {
            var i = 0;
            for (var k in this.hash) {
                i++;
            }
            return i;
        }
        this.get = function (key) {
            return this.hash[key];
        }
        this.has = function (key) {
            return typeof (this.hash[key]) != "undefined";
        }
        this.clear = function () {
            for (var k in this.hash) {
                delete this.hash[k];
            }
        }
        return this;
    }    /* build tree class AST
     *
     * based on https://developer.mozilla.org/en-US/docs/SpiderMonkey/Parser_API
     *
     * http://www.ecma-international.org/publications/files/ECMA-ST/Ecma-262.pdf
     *
     * FSM
     *
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

    // Throw error

    function throwError(token, msg) {
        var error = {};
        error.xdf = 1;
        throw error;
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
            that.syntaxTree = {};
            that.initIndex();
            that.initFlags();
            that.scanner();
            that.syntaxTree = that.root.hash;
            return that.syntaxTree;
        },
        initIndex:function(){
            var that = this;
            that.length = that.tokens.length;
            that.index = 0;
        },
        initFlags:function(){
            var that = this;
            that.clearFlags();
        },
        clearFlags:function(){
            var that = this;
            that.syntaxTree = null;
            that.root = null;
            that.stack = [];
            that.swap = null;
            that.tempStack = [];
            that.type = null;
            that.current = null;
        },
        scanner:function(){
            var that = this;
            _.each(that.tokens,function(){
                that.getToken();
                that.router();
            });
        },
        getToken:function(){
            var that = this;
            that.current = that.tokens[that.index];
            that.pre = that.tokens[that.index-1];
            that.next = that.tokens[that.index+1];
            that.index ++;
        },
        stackIn:function(c){
            this.stack.push(c);
        },
        stackOut:function(n){
            if(!n){
                n = 1;
            }
            for (var i =0;i<n;i++){
                this.stack.pop();
            }
        },
        stackTopIn:function(c){
            this.stack[this.stack.length-1].push(c);
        },
        router:function(){
            var that = this;
            //console.log(that.current)
            //console.log(that.type)
            //console.log(that.swap)
            //console.log(that.stack)
            switch(that.type){
                case null:
                    parseProgram();
                break;
                case Syntax['EmptyStatement']:
                    break;
                case Syntax['BlockStatement']:
                    break;
                case Syntax['ExpressionStatement']:
                    break;
                case Syntax['IfStatement']:
                    break;
                case Syntax['LabeledStatement']:
                    break;
                case Syntax['BreakStatement']:
                    break;
                case Syntax['ContinueStatement']:
                    break;
                case Syntax['WithStatement']:
                    break;
                case Syntax['SwitchStatement']:
                    break;
                case Syntax['ReturnStatement']:
                    break;
                case Syntax['ThrowStatement']:
                    break;
                case Syntax['TryStatement']:
                    break;
                case Syntax['WhileStatement']:
                    break;
                case Syntax['DoWhileStatement']:
                    break;
                case Syntax['ForStatement']:
                    break;
                case Syntax['ForInStatement']:
                    break;
                case Syntax['LetStatement']:
                    break;
                case Syntax['DebuggerStatement']:
                    break;
                case Syntax['FunctionDeclaration']:
                    break;
                case Syntax['VariableDeclaration']:
                    parseVariableDeclaration();
                    break;
                case Syntax['VariableDeclarator']:
                    parseVariableDeclarator();
                    break;
                case Syntax['ThisExpression']:
                    break;
                case Syntax['ArrayExpression']:
                    break;
                case Syntax['ObjectExpression']:
                    break;
                case Syntax['FunctionExpression']:
                    parseFunctionExpression();
                    break;
                case Syntax['ArrowExpression']:
                    break;
                case Syntax['SequenceExpression']:
                    break;
                case Syntax['UnaryExpression']:
                    break;
                case Syntax['BinaryExpression']:
                    break;
                case Syntax['AssignmentExpression']:
                    break;
                case Syntax['UpdateExpression']:
                    break;
                case Syntax['LogicalExpression']:
                    break;
                case Syntax['ConditionalExpression']:
                    break;
                case Syntax['NewExpression']:
                    break;
                case Syntax['CallExpression']:
                    break;
                case Syntax['MemberExpression']:
                    break;
                case Syntax['ObjectPattern']:
                    break;
                case Syntax['ArrayPattern']:
                    break;
                case Syntax['SwitchCase']:
                    break;
                case Syntax['CatchClause']:
                    break;
                case Syntax['Identifier']:
                    break;
                case Syntax['Literal']:
                    break;
                case Syntax['Program']:
                    if(that.isKeyWord()){
                        var type;
                        switch (that.current.value) {
                            case 'if':
                                type = Syntax['IfStatement'];
                                break;
                            case 'in':
                                break;
                            case 'do':
                                break;
                            case 'var':
                                type = Syntax['VariableDeclaration'];
                                break;
                            case 'for':
                                break;
                            case 'new':
                                break;
                            case 'try':
                                break;
                            case 'let':
                                type = Syntax['VariableDeclaration'];
                                break;
                            case 'this':
                                break;
                            case 'else':
                                break;
                            case 'case':
                                break;
                            case 'void':
                                break;
                            case 'with':
                                break;
                            case 'enum':
                                break;
                            case 'while':
                                break;
                            case 'break':
                                type = Syntax['BreakStatement'];
                                break;
                            case 'catch':
                                break;
                            case 'throw':
                                break;
                            case 'const':
                                type = Syntax['VariableDeclaration'];
                                break;
                            case 'yield':
                                break;
                            case 'class':
                                break;
                            case 'super':
                                break;
                            case 'return':
                                break;
                            case 'typeof':
                                break;
                            case 'delete':
                                break;
                            case 'switch':
                                break;
                            case 'export':
                                break;
                            case 'import':
                                break;
                            case 'default':
                                break;
                            case 'finally':
                                break;
                            case 'extends':
                                break;
                            case 'function':
                                type = Syntax['FunctionDeclaration'];
                                break;
                            case 'continue':
                                break;
                            case 'debugger':
                                break;
                            case 'instanceof':
                                break;
                        }
                        that.type = type;
                    }else if(that.isPunctuator()){

                    }else if(that.isStringLiteral()){
                    
                    }else if(that.isIdentifier()){
                    
                    }else if(that.isNumericLiteral()){
                    
                    }else if(that.isRegularExpression()){
                    
                    }
                    that.router();
                    break;
            }
            //Programs

            /**
            * Programs
            *
            * A complete program source tree.
            *
            * interface Program <: Node {
            *   type: "Program";
            *   body: [ Statement ];
            *   comments: [ Comments ];
            *   tokens: [ Tokens ];
            * }
            */
            function parseProgram(){
                /**
                 * build root node
                 */
                that.type = Syntax['Program'];
                that.root = new Hash().set('type',Syntax['Program']).set('body',[]).set('comments',[]).set('tokens',that.tokens);
                /**
                 * stack in body list
                 */
                that.stackIn(that.root.get('body'));
                /**
                 * router again
                 */
                that.router();
            }
            //Statements
                   /**
            * interface EmptyStatement <: Statement {
            *   type: "EmptyStatement";
            * }
            */
            function parseEmptyStatement(){
            
            }
            /**
            * interface BlockStatement <: Statement {
            *   type: "BlockStatement";
            *   body: [ Statement ];
            * }
            */
            function parseBlockStatement(){
            
            }
            /**
            * interface ExpressionStatement <: Statement {
            *   type: "ExpressionStatement";
            *   expression: Expression;
            * }
            */
            function parseExpressionStatement(){
            
            }
            /**
             * interface BinaryExpression <: Expression {
             * type: "BinaryExpression";
             * operator: BinaryOperator;
             * left: Expression;
             * right: Expression;
             * }
             */
            function parseBinaryExpression(){
            
            }
            /**
             * interface UnaryExpression <: Expression {
             * type: "UnaryExpression";
             * operator: UnaryOperator;
             * prefix: boolean;
             * argument: Expression;
             * }
             */
            function parseUnaryExpression(){
            
            }
            /**
             * interface SequenceExpression <: Expression {
             * type: "SequenceExpression";
             * expressions: [ Expression ];
             * }
             */
            function parseSequenceExpression(){
            
            }
            /**
             * interface IfStatement <: Statement {
             * type: "IfStatement";
             * test: Expression;
             * consequent: Statement;
             * alternate: Statement | null;
             * }
             */
            function parseIfStatement(){
            
            } 
            //Declarations
            /**
             * interface VariableDeclaration <: Declaration {
             *  type: "VariableDeclaration";
             *  declarations: [ VariableDeclarator ];
             *  kind: "var" | "let" | "const";
             * }
             */
            function parseVariableDeclaration(){
                that.swap = new Hash().set('type',that.type).set('declarations',[]).set('kind',that.current.value);
                that.stackTopIn(that.swap.hash);
                that.stackIn(that.swap.get('declarations'));
                that.tempStack = ['init','id','type'];
                parseVariableDeclarator();
            }
            /**
             * interface VariableDeclarator <: Node {
             *  type: "VariableDeclarator";
             *  id: Pattern;
             *  init: Expression | null;
             * }
             */
            function parseVariableDeclarator(){
                switch(that.tempStack[that.tempStack.length-1]){
                    case 'type':
                        that.swap = new Hash().set('type',Syntax['VariableDeclarator']);
                        that.type = Syntax['VariableDeclarator'];
                        that.tempStack.pop();
                        break;
                    case 'id':
                        if(that.isIdentifier()){
                            that.swap.set('id',that.current.value);
                        }else if(that.isPunctuator()){
                            if(that.current.value === ','){
                                that.swap.set('init',null).set('type',Syntax['VariableDeclarator']);
                                that.stackTopIn(that.swap.hash);
                                that.swap = new Hash();
                            }else if(that.current.value === ';'){
                                that.swap.set('init',null).set('type',Syntax['VariableDeclarator']);
                                that.stackTopIn(that.swap.hash);
                                that.stackOut();
                                that.type = Syntax['Program'];
                            }else if(that.current.value === '='){
                                that.swap.set('type',Syntax['VariableDeclarator']);
                                that.tempStack.pop();
                            }else{
                                console.log('error');
                            }
                        }else {
                            console.log('error');
                        }
                        break;
                    case 'init':
                        if(that.isStringLiteral()||that.isNumericLiteral()||that.isRegularExpression()){
                            that.swap.set('init',{
                                'value':that.current.value,
                                'type':that.current.type
                            });
                            that.stackTopIn(that.swap.hash);
                        }else if(that.isKeyWord()){
                            switch(that.current.value){
                                case 'function':
                                    that.swap.set('init',{
                                        'type':Syntax['FunctionExpression'],
                                        'id':null,
                                        'defaults':[],
                                        'params':[],
                                        'body':[],
                                        'rest':null,
                                        'generator':false,
                                        'expression':false
                                    });
                                    that.tempStack = ['body','params'];
                                    that.type = Syntax['FunctionExpression'];
                                    that.stackIn(that.swap.get('init')['params']);
                                    that.stackTopIn(that.swap.hash);
                                    break;
                            }
                        }else if(that.isPunctuator()){
                            if(that.current.value === ','){
                                that.swap = new Hash();
                                that.swap.set('type',Syntax['VariableDeclarator']);
                            }else if(that.current.value === ';'){
                                that.stackOut();
                                that.type = Syntax['Program'];
                            }else{
                                console.log('error');
                            }
                        }else {
                            console.log('error');
                        }
                        break;
                }
            }
            /**
             * interface FunctionDeclaration <: Function, Declaration {
             * type: "FunctionDeclaration";
             * id: Identifier;
             * params: [ Pattern ];
             * defaults: [ Expression ];
             * rest: Identifier | null;
             * body: BlockStatement | Expression;
             * generator: boolean;
             * expression: boolean;
             * }
             */
            function parseFunctionDeclaration(){
            
            }
            /**
             * interface ObjectExpression <: Expression {
             * type: "ObjectExpression";
             * properties: [ { key: Literal | Identifier,
             *       value: Expression,
             *       kind: "init" | "get" | "set" } ];
             * }
             */
            function parseObjectExpression(){
            
            }
            /**
             * interface ArrayExpression <: Expression {
             * type: "ArrayExpression";
             * elements: [ Expression | null ];
             * }
             */
            function parseArrayExpression(){
            
            }
            /**
             * interface ArrowExpression <: Function, Expression {
             * type: "ArrowExpression";
             * params: [ Pattern ];
             * defaults: [ Expression ];
             * rest: Identifier | null;
             * body: BlockStatement | Expression;
             * generator: boolean;
             * expression: boolean;
             * }
             */
            function parseArrowExpression(){
            
            }
            /**
             * interface SequenceExpression <: Expression {
             * type: "SequenceExpression";
             * expressions: [ Expression ];
             * }
             */
            function parseSequenceExpression(){
            
            }
            /**
             * interface FunctionExpression <: Function, Expression {
             * type: "FunctionExpression";
             * id: Identifier | null;
             * params: [ Pattern ];
             * defaults: [ Expression ];
             * rest: Identifier | null;
             * body: BlockStatement | Expression;
             * generator: boolean;
             * expression: boolean;
             * }
             */
            function parseFunctionExpression(){
                switch(that.tempStack[that.tempStack.length-1]){
                    case 'params':
                        if(that.isIdentifier()){
                            that.stackIn({
                                'type':that.current.type,
                                'name':that.current.value
                            });
                        }else if(that.isPunctuator()){
                            if(that.current.value ===')'){
                                that.stackOut();
                                that.tempStack.pop();
                            }
                        }
                        break;
                    case 'body':
                        console.log(that.current)
                        break;
                }
            }
        },
        isKeyWord:function(){
            return this.current.type === 'Keyword';
        },
        isPunctuator:function(){
            return this.current.type === 'Punctuator';
        },
        isStringLiteral:function(){
            return this.current.type === 'StringLiteral';
        },
        isIdentifier:function(){
            return this.current.type === 'Identifier';
        },
        isNumericLiteral:function(){
            return this.current.type === 'NumericLiteral';
        },
        isRegularExpression:function(){
            return this.current.type === 'RegularExpression';
        }
    };
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
