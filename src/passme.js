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
                        if(that.tokens[i].type =='Punctuator' && _.isIn(that.tokens[i].value,[';','+',',','||','&&','=','==','===','!','[','(',':','?']) ||that.tokens[i].type =='Keyword'){
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
    /* build tree class AST
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
            that.stack = [];
            that.swap = null;
            that.tempStack = [];
            that.type = null;
            that.current = null;
        },
        scanner:function(){
            var that = this;
            that.initProgram();
            _.each(that.tokens,function(){
                that.getToken();
                that.router();
            });
        },
        initProgram:function(){
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
            var that = this;
            that.type = Syntax['Program'];
            that.syntaxTree['type'] = Syntax['Program'];
            that.syntaxTree['body'] = [];
            that.syntaxTree['comments'] = [];
            that.syntaxTree['tokens'] = that.tokens;
            that.stackIn(that.syntaxTree['body']);
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
        stackOut:function(c){
            this.stack.pop();
        },
        stackTopIn:function(c){
            this.stack[this.stack.length-1].push(c);
        },
        router:function(){
            var that = this;
            //console.log(that.current)
            switch(that.type){
                case Syntax['VariableDeclaration']:
                    that.type = Syntax['VariableDeclarator'];
                    parseVariableDeclarator();
                    break;
                case Syntax['VariableDeclarator']:
                    parseVariableDeclarator()
                    break;
                case Syntax['BinaryExpression']:
                    parseBinaryExpression()
                    break;
                case null:
                    console.log(that.current);
                    break;
                default:
                    if(that.isKeyWord()){
                        if(that.isVariableDeclaration()){
                            that.type = Syntax['VariableDeclaration'];
                            parseVariableDeclaration();
                        }
                    }else{
                    
                    }
                    break;
            }            
            /**
             * interface VariableDeclaration <: Declaration {
             *  type: "VariableDeclaration";
             *  declarations: [ VariableDeclarator ];
             *  kind: "var" | "let" | "const";
             * }
             */
            function parseVariableDeclaration(){
                that.swap = {
                    type : that.type,
                    declarations : [],
                    kind : that.current.value
                };
                that.stackTopIn(that.swap);
                that.stackIn(that.swap['declarations']);
                that.swap = null;
            }
            /**
             * interface VariableDeclarator <: Node {
             *  type: "VariableDeclarator";
             *  id: Pattern;
             *  init: Expression | null;
             * }
             */
            function parseVariableDeclarator(){
                if(that.swap){
                    that.tempStack.push(that.current);
                    if(that.tempStack[0].value === '='){
                        if(that.tempStack[1]){
                            if(that.tempStack[1].value ==='function'){
                                /**
                                 *interface FunctionExpression <: Function, Expression {
                                 *  type: "FunctionExpression";
                                 *  id: Identifier | null;
                                 *  params: [ Pattern ];
                                 *  defaults: [ Expression ];
                                 *  rest: Identifier | null;
                                 *  body: BlockStatement | Expression;
                                 *  generator: boolean;
                                 *  expression: boolean;
                                 *}
                                 */
                                that.swap['init'] = {
                                    type: 'FunctionExpression',
                                    id:'',
                                    params:[]
                                };
                                that.stackTopIn(that.swap);
                                that.tempStack = [];
                                that.swap = null;
                                that.stackOut();
                                that.type = null;
                            }else if(that.tempStack[1].value ==='{'){
                                /**
                                 *interface ObjectExpression <: Expression {
                                 *  type: "ObjectExpression";
                                 *  properties: [ { key: Literal | Identifier,
                                 *  value: Expression,
                                 *  kind: "init" | "get" | "set" } ];
                                 *}
                                 */
                                that.swap['init'] = {
                                    type:'ObjectExpression',
                                    properties:[],
                                    value:'',
                                    kind:'init'
                                };
                                that.stackTopIn(that.swap);
                                that.tempStack = [];
                                that.swap = null;
                                that.stackOut();
                                that.type = true;
                            }else {
                                /**
                                 * interface Literal <: Node, Expression {
                                 * type: "Literal";
                                 * value: string | boolean | null | number | RegExp;
                                 * }
                                 */
                                that.swap['init'] = {
                                    type:'Literal',
                                    value:that.current.value
                                };
                                that.stackTopIn(that.swap);
                                that.tempStack = [];
                                that.swap = null;
                                that.stackOut();
                                that.type = true;
                            }
                        }
                    }else if(that.tempStack[0].value === ';'){
                        that.stackTopIn(that.swap);
                        that.tempStack = [];
                        that.swap = null;
                        that.stackOut();
                        that.type = null;
                    }else {
                        //console.log('SyntaxError: Unexpected identifier');
                    }
                }else{
                    that.swap = {
                        type : that.type,
                        id : {type:'Identifier',name:that.current.value},
                        init:null
                    };
                }
            }
            /*
            * Functions
            *
            * A function declaration or expression.
            * The body of the function may be a block statement, or in the case of an expression closure, an expression.
            *
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
        },
        isKeyWord:function(){
            return this.current.type === 'Keyword';
        },
        isVariableDeclaration:function(){
            var that = this;
            var variableDeclarationKinds = ['var','let','const'];
            return _.isIn(that.current.value,variableDeclarationKinds);
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
