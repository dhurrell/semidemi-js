const bestMatch = require('./src/bestmatch');

describe('BestMatch', function() {

    it('doesnt match empty array', function() {
        expect(bestMatch('def')([])).toBe(null);
    });

    it(`doesnt match when invariant isn't present`, function() {
        expect(bestMatch('def')([{invariant: 'abc'}])).toBe(null);
    });

    describe('returns one result when one matcher matches', function () {

        var inv = function (str) {
            return [{invariant: str}];
        };

        it('one exact', function() {
            expect(bestMatch('abc')([inv('abc')])).toEqual(inv('abc'));
        });

        it('first exact', function() {
            expect(bestMatch('abc')([inv('abc'), inv('def')])).toEqual(inv('abc'));
        });

        it('second exact', function() {
            expect(bestMatch('abc')([inv('def'), inv('abc')])).toEqual(inv('abc'));
        });

    });

    describe('returns the best result when multiple matchers match', function () {

        var m = function (str) {
            return [ { fuzzy: str }, { invariant: 'WooHoo' } ];
        };

        it('first matcher is best', function() {
            expect(bestMatch('abcWooHoo')([m('abc'), m('def')])).toEqual(m('abc'));
        });

        it('second matcher is best', function() {
            expect(bestMatch('defWooHoo')([m('abc'), m('def')])).toEqual(m('def'));
        });

        it('longer matcher is best', function() {
            expect(bestMatch('defdefWooHoo')([m('def'), m('defdef')])).toEqual(m('defdef'));
        });

    });

    describe('returns the best result with version normalisation', function () {

        var m = function (str) {
            return [ { fuzzy: str }, { version: 'c' } ];
        };

        it('first matcher is best', function() {
            expect(bestMatch('abc123')([m('abc'), m('ab c')])).toEqual(m('abc'));
        });

        it('version aware matcher is best', function() {
            expect(bestMatch('abc123')([m('abc123'), m('abc')])).toEqual(m('abc'));
        });

    });

    describe('example', function () {

        var m1 = [ { brand: 'sony', model: 'playstation' }, { version: 'Mozilla/' }, { fuzzy: ' (' }, { invariant: 'PLAYSTATION 3' }, { fuzzy: '; 1.00' }, { disallowed: 'feet' } ];
        var m2 = [ { brand: 'sony', model: 'playstation' }, { version: 'Mozilla/' }, { fuzzy: ' (' }, { invariant: 'PLAYSTATION 3' }, { fuzzy: '; 2.00' }, { disallowed: 'feet' } ];

        it('picks the best match', function() {
            expect(bestMatch('Mozilla/5.0 (PLAYSTATION 3; 2.00)')([m1, m2])).toEqual(m2);
        });

    });

});
