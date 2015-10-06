const matcher = require('./src/matcher');


describe('Matcher', function() {


    it('matches empty matcher', function() {
        expect(matcher('abc')([ ])).toBe(true);
    });


    it('matches an exact invariant', function() {
        expect(matcher('abc' )([ { invariant: 'abc' } ])).toBe(true);
    });

    it(`doesn't match an incorrect invariant`, function() {
        expect(matcher('abd')([ { invariant: 'abc' } ])).toBe(false);
    });

    it('matches a prefix subset invariant', function() {
        expect(matcher('abc')([ { invariant: 'ab' } ])).toBe(true);
    });

    it('matches a postfix subset invariant', function() {
        expect(matcher('abc')([ { invariant: 'bc' } ])).toBe(true);
    });

    it('matches an infix subset invariant', function() {
        expect(matcher('abc')([ { invariant: 'b' } ])).toBe(true);
    });

    it('matches two invariants', function() {
        expect(matcher('abc')([ { invariant: 'a' }, { invariant: 'c' } ])).toBe(true);
    });

    it(`doesn't match two invariants when one is incorrect`, function() {
        expect(matcher('abc')([ { invariant: 'ab' }, { invariant: 'cd' } ])).toBe(false);
    });

    it('matches two invariants even if they overlap', function() {
        expect(matcher('abc')([ { invariant: 'ab' }, { invariant: 'bc' } ])).toBe(true);
    });


    it('matches disallowed when not present', function() {
        expect(matcher('abc')([ { disallowed: 'd' } ])).toBe(true);
    });

    it(`doesn't match disallowed when present`, function() {
        expect(matcher('abcd')([ { disallowed: 'd' } ])).toBe(false);
    });

    it(`doesn't match second disallowed when present`, function() {
        expect(matcher('abc')([ { disallowed: 'd' }, { disallowed: 'a' } ])).toBe(false);
    });

    describe('examples', function () {

        var matching = [ { invariant: 'Panasonic.bd.pro4r.2014' }, { disallowed: 'Opera' } ];

        it('matches', function() {
            expect(matcher('Mozilla/5.0(compatible; U; InfiNet 0.1; Diga) AppleWebKit/420+ (KHTML, like Gecko)(avdn/Panasonic.bd.pro4r.2014)')(matching)).toBe(true);
        });

        it('matches when versions change', function() {
            expect(matcher('Mozilla/15.02(compatible; U; InfiNet 30.51; Diga) AppleWebKit/42076+ (KHTML, like Gecko)(avdn/Panasonic.bd.pro4r.2014)')(matching)).toBe(true);
        });

        it(`doesn't match when version changes in invariant`, function() {
            expect(matcher('Mozilla/5.0(compatible; U; InfiNet 0.1; Diga) AppleWebKit/420+ (KHTML, like Gecko)(avdn/Panasonic.bd.pro5r.2014)')(matching)).toBe(false);
        });

        it(`doesn't match when disallowed is present`, function() {
            expect(matcher( 'Opera/5.0(compatible; U; InfiNet 0.1; Diga) AppleWebKit/420+ (KHTML, like Gecko)(avdn/Panasonic.bd.pro4r.2014)')(matching)).toBe(false);
        });

    });

    describe('ignores brand and model metadata', function () {

        var m1 = [ { brand: 'panasonic', model: 'pro4' }, { invariant: 'Panasonic.bd.pro4r.2014' }, { disallowed: 'Opera' } ];
        var m2 = [ { brand: 'sony', model: 'playstation' }, { invariant: 'Panasonic.bd.pro4r.2014' }, { disallowed: 'Opera' } ];

        it('matches panasonic', function() {
            expect(matcher('Mozilla/5.0(compatible; U; InfiNet 0.1; Diga) AppleWebKit/420+ (KHTML, like Gecko)(avdn/Panasonic.bd.pro4r.2014)')( m1)).toBe(true);
        });

        it('matches sony', function() {
            expect(matcher('Mozilla/5.0(compatible; U; InfiNet 0.1; Diga) AppleWebKit/420+ (KHTML, like Gecko)(avdn/Panasonic.bd.pro4r.2014)')(m2)).toBe(true);
        });

    });

});
