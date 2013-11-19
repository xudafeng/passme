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
        passme.tokenize(jQuery).length.should.equal(48028);
    })
})
describe('kissy', function(){
    var kissy = fs.readFileSync('test/3rdparty/kissy-1.4.0.js','utf8');
    it('should return array when the value is kissy', function(){
        passme.tokenize(kissy)[22853].value.should.equal('nodejs');
    })
})
