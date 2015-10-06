const parser = require('./src/parser');

describe('Parser', function() {

    it('handles simple invariant matcher', function() {
        expect(parser('brand model: [+abc]')).toEqual([ [ {brand: 'brand', model: 'model'}, {invariant: 'abc'} ] ]);
    });

    it('produces no matchers for an empty file', function() {
        expect(parser('')).toEqual([ ]);
    });

    it('handles various whitespace between sections', function() {
        expect(parser('brand \tmodel  \t:\t [+abc]')).toEqual([ [ {brand: 'brand', model: 'model'}, {invariant: 'abc'} ] ]);
    });

    it('handles two simple matchers', function() {
        expect(parser('b m:[+abc]\nb m:[+def]')).toEqual([ [ {brand: 'b', model: 'm'}, {invariant: 'abc'} ], [ {brand: 'b', model: 'm'}, {invariant: 'def'} ] ]);
    });

    it('handles windows CRLF line breaks', function() {
        expect(parser('b m:[+abc]\r\nb m:[+def]')).toEqual([ [ {brand: 'b', model: 'm'}, {invariant: 'abc'} ], [ {brand: 'b', model: 'm'}, {invariant: 'def'} ] ]);
    });

    it('reports syntax error', function() {
        expect(function () { parser('bm:abc'); }).toThrow('Syntax Error at top level (brand model:matcher) on line 1');
    });

    it('allows comments', function() {
        expect(parser('# Rubadub\nb m:[+abc]\n #Bubble\nb m:[+def]')).toEqual([ [ {brand: 'b', model: 'm'}, {invariant: 'abc'} ], [ {brand: 'b', model: 'm'}, {invariant: 'def'} ] ]);
    });

    it('allows empty lines', function() {
        expect(parser('\n\n   \nb m:[+abc]\n\n\n\n\n#h\n\n\nb m:[+def]\n\n\n')).toEqual([ [ {brand: 'b', model: 'm'}, {invariant: 'abc'} ], [ {brand: 'b', model: 'm'}, {invariant: 'def'} ] ]);
    });

    it('handles fuzzy', function() {
        expect(parser('b m:abc[+def]ghi[+jkl][+mno]pqr')).toEqual([ [ {brand: 'b', model: 'm'}, {fuzzy: 'abc'}, {invariant: 'def'}, {fuzzy: 'ghi'}, {invariant: 'jkl'}, {invariant: 'mno'}, {fuzzy: 'pqr'} ] ]);
    });

    it('reports syntax error for unmatched bracket', function() {
        expect(function () { parser('b m:a[+bc'); }).toThrow(`Syntax Error: Unterminated '[' on line 1`);
    });

    it('reports error for matcher with no invariants', function() {
        expect(function () { parser('b m:abc'); }).toThrow('Error: Matcher has no invariants on line 1');
    });

    it('handles disallowed markup', function() {
        expect(parser('b m:abc[+def][-ghi]')).toEqual([ [ {brand: 'b', model: 'm'}, {fuzzy: 'abc'}, {invariant: 'def'}, {disallowed: 'ghi'} ] ]);
    });

    it('reports error for invalid markup type', function() {
        expect(function () { parser('b m:a[!bc]'); }).toThrow(`Syntax Error: Invalid markup '[!...]' on line 1`);
    });

    it('handles version markup', function() {
        expect(parser('b m:[+abc][vdef - 1.2-3_4]')).toEqual([ [ {brand: 'b', model: 'm'}, {invariant: 'abc'}, {version: 'def - '} ] ]);
    });

});
