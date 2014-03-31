"use strict";
var fs = require('fs');

var passme = require('../bin/passme');

describe('BooleanLiteral', function(){
    var code = 'var a = !true,false;';
    it('should return array when the value is BooleanLiteral', function(){
        passme.tokenize(code).length.should.equal(8);
    })
})
describe('RegularExpression', function(){
    var reg = '/^(?:(?:or|and|like)\s*)+|\s*(?:(?:or|and|like)\s*)+$/mi;';
    var code = 'a = '+reg;
    it('should return array when the value is RegularExpression', function(){
        passme.tokenize(code)[2].value.should.equal('/^(?:(?:or|and|like)s*)+|s*(?:(?:or|and|like)s*)+$/mi');
    })
})
describe('Punctuator', function(){
    var code ='a /=(b/(c/(d/(e*f))))';
    it('should return array when the value is Punctuator', function(){
        passme.tokenize(code)[1].value.should.equal('/=');
    })
    it('should return array when the value is Punctuator', function(){
        passme.tokenize(code).length.should.equal(19);
    })
    it('should return array when the value is Punctuator', function(){
        passme.tokenize(code)[13].type.should.equal('Punctuator');
    })
})
describe('jQuery', function(){
    var jQuery = fs.readFileSync('test/3rdparty/jquery-1.10.2.js','utf8');
    it('should return array when the value is jQuery', function(){
        passme.tokenize(jQuery).length.should.equal(48187);
    })
})
describe('kissy', function(){
    var kissy = fs.readFileSync('test/3rdparty/kissy-1.4.0.js','utf8');
    it('should return array when the value is kissy', function(){
        passme.tokenize(kissy)[22921].value.should.equal('nodejs');
    })
})
describe('base', function(){
    var base = fs.readFileSync('test/3rdparty/base.js','utf8');
    it('should return array when the value is base', function(){
        passme.tokenize(base)[passme.tokenize(base).length-10].value.should.equal('d');
    })
})
describe('vendor-edit', function(){
    var base = fs.readFileSync('test/3rdparty/vendor-edit.js','utf8');
    it('should return array when the value is base', function(){
        var l = passme.tokenize(base)[passme.tokenize(base).length-3].value.should.equal('window');
    })
})
