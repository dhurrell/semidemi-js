const scorer = require('./src/scorer');

describe('Scorer', function() {


    it('scores 1 per char with empty matcher', function() {
        expect(scorer('abc')([ ])).toBe(3);
    });

    it('scores 0 when whole string is fuzzy', function() {
        expect(scorer('abc')([ { fuzzy: 'abc' } ])).toBe(0);
    });

    it('disallowed does not affect the score', function() {
        expect(scorer('abc')([ { fuzzy: 'abc' }, { disallowd: 'def' } ])).toBe(0);
    });

    it('scores 0 when whole string is matched by two fuzzy items', function() {
        expect(scorer('abc')([ { fuzzy: 'ab' }, { fuzzy: 'c' } ])).toBe(0);
    });

    it('scores 0 when whole string is matched fuzzy and invariant items', function() {
        expect(scorer('abc')([ { fuzzy: 'a' }, { invariant: 'b' }, { fuzzy: 'c' } ])).toBe(0);
    });

    it('scores 1 when one fuzzy char is different', function() {
        expect(scorer('abc')([ { fuzzy: 'a_c' } ])).toBe(1);
    });

    it('scores 1 when one fuzzy char is missing', function() {
        expect(scorer('ac')([ { fuzzy: 'abc' } ])).toBe(1);
    });

    it('scores 1 when one fuzzy char is extra', function() {
        expect(scorer('abc')([ { fuzzy: 'ac' } ])).toBe(1);
    });


    it('basic version scoring', function() {
        expect(scorer('abc1.00def')([ { version: 'abc' }, { fuzzy: 'def' } ])).toBe(0);
    });

    it('version scoring with special chars in version prefix', function() {
        expect(scorer('a+-[]{}./?\\*()!£$%^&*())bc1.00def')([ { version: 'a+-[]{}./?\\*()!£$%^&*())bc' }, { fuzzy: 'def' } ])).toBe(0);
    });

    it('version normalising handles multiple part versions', function() {
        expect(scorer('abc1.0.0def')([ { version: 'abc' }, { fuzzy: 'def' } ])).toBe(0);
    });

    it('version normalising handles long multiple part versions', function() {
        expect(scorer('abc999.9999.99999.999999def')([ { version: 'abc' }, { fuzzy: 'def' } ])).toBe(0);
    });

    it('version normalising handles underscores', function() {
        expect(scorer('abc1.0_0def')([ { version: 'abc' }, { fuzzy: 'def' } ])).toBe(0);
    });

    it('version normalising with ; prefix', function() {
        expect(scorer('; 1.0_0def')([ { version: '; ' }, { fuzzy: 'def' } ])).toBe(0);
    });


    describe('examples', function () {
        var ps1 = [ { version: 'Mozilla/' }, { fuzzy: ' (' }, { invariant: 'PLAYSTATION 3' }, { fuzzy: '; 1.00)' } ];
        var ps2 = [ { version: 'Mozilla/' }, { fuzzy: ' (' }, { invariant: 'PLAYSTATION 3' }, { fuzzy: '; 2.00)' } ];
        var ps4 = [ { version: 'Mozilla/' }, { fuzzy: ' (' }, { invariant: 'PLAYSTATION 3' }, { fuzzy: '; 4.77)' } ];

        it('specific version is scored', function () {
            expect(scorer('Mozilla/5.0 (PLAYSTATION 3; 2.00)')(ps1)).toBe(1);
        });

        it('exact score', function () {
            expect(scorer('Mozilla/5.0 (PLAYSTATION 3; 2.00)')(ps2)).toBe(0);
        });

        it('1.00 vs 4.70', function () {
            expect(scorer('Mozilla/2.0 (PLAYSTATION 3; 4.70)')(ps1)).toBe(2);
        });

        it('4.77 vs 4.70', function () {
            expect(scorer('Mozilla/2.0 (PLAYSTATION 3; 4.70)')(ps4)).toBe(1);
        });

    });

    describe('ignore brand and model metadata', function () {
        var ps1 = [ { brand: 'panasonic', model: 'pro4' }, { version: 'Mozilla/' }, { fuzzy: ' (' }, { invariant: 'PLAYSTATION 3' }, { fuzzy: '; 1.00)' } ];

        it('ignores metadata', function () {
            expect(scorer('Mozilla/5.0 (PLAYSTATION 3; 2.00)')(ps1)).toBe(1);
        });

    });

});
