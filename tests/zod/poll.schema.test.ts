import { expectOk, expectFail } from './helpers';
import { PollSchema } from '@/schemas/polls';

describe('Zod/PollSchema', () => {
    const base = {
        title: 'Sondage voyage',
        description: 'Choix de la destination',
        pollOptions: [{ text: 'Rome' }, { text: 'Lisbonne' }],
    };

    it('✅ accepte un payload valide (2 options minimum)', () => {
        const ok = PollSchema.safeParse(base);
        expectOk(ok);
    });

    it('❌ refuse un titre trop court (< 3)', () => {
        const ko = PollSchema.safeParse({ ...base, title: 'Hi' });
        expectFail(ko, [{ path: ['title'], code: 'too_small' }]);
    });

    it('✅ description optionnelle', () => {
        const ok = PollSchema.safeParse({ ...base, description: undefined });
        expectOk(ok);
    });

    it('❌ refuse moins de 2 options', () => {
        const ko = PollSchema.safeParse({ ...base, pollOptions: [{ text: 'Rome' }] });
        expectFail(ko, [{ path: ['pollOptions'], code: 'too_small' }]);
    });

    it("❌ refuse une option vide (text: '')", () => {
        const ko = PollSchema.safeParse({
            ...base,
            pollOptions: [{ text: '' }, { text: 'Lisbonne' }],
        });
        expectFail(ko, [{ path: ['pollOptions', 0, 'text'], code: 'too_small' }]);
    });

    it('❌ refuse une option text au mauvais type', () => {
        const ko = PollSchema.safeParse({
            ...base,
            pollOptions: [{ text: 123 }, { text: 'Lisbonne' }],
        });
        expectFail(ko, [{ path: ['pollOptions', 0, 'text'], code: 'invalid_type' }]);
    });

    it('❌ refuse pollOptions non-array', () => {
        const ko = PollSchema.safeParse({
            ...base,
            pollOptions: 'Rome, Lisbonne',
        });
        expectFail(ko, [{ path: ['pollOptions'], code: 'invalid_type' }]);
    });

    it('✅ accepte un grand nombre d’options', () => {
        const options = Array.from({ length: 10 }, (_, i) => ({ text: `Option ${i + 1}` }));
        const ok = PollSchema.safeParse({ ...base, pollOptions: options });
        expectOk(ok);
    });

    it('✅ (comportement actuel) "   " est accepté comme texte d’option (pas de trim)', () => {
        const ok = PollSchema.safeParse({
            ...base,
            pollOptions: [{ text: '   ' }, { text: 'Lisbonne' }],
        });
        expectOk(ok);
    });
});
