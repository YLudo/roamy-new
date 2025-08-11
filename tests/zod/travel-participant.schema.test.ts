import { expectOk, expectFail } from './helpers';
import { TravelSchema, ParticipantSchema } from '@/schemas/travels';

describe('Zod/TravelSchema', () => {
    const baseTravel = {
        title: 'Voyage en Toscane',
        description: 'Un beau voyage à Florence et Sienne',
        destination_country: 'Italie',
        destination_city: 'Florence',
        start_date: '2025-08-12',
        end_date: '2025-08-20',
        visibility: 'private' as const,
    };

    it('✅ accepte un voyage valide', () => {
        const ok = TravelSchema.safeParse(baseTravel);
        expectOk(ok);
    });

    it('❌ refuse un titre vide', () => {
        const ko = TravelSchema.safeParse({
            ...baseTravel,
            title: '',
        });
        expectFail(ko, [{ path: ['title'], code: 'too_small' }]);
    });

    it('❌ refuse end_date antérieure à start_date', () => {
        const ko = TravelSchema.safeParse({
            ...baseTravel,
            start_date: '2025-08-20',
            end_date: '2025-08-12',
        });
        expectFail(ko, [{ path: ['end_date'], messageIncludes: 'postérieure' }]);
    });

    it('✅ accepte start_date sans end_date', () => {
        const ok = TravelSchema.safeParse({
            ...baseTravel,
            end_date: undefined,
        });
        expectOk(ok);
    });

    it('✅ accepte end_date sans start_date', () => {
        const ok = TravelSchema.safeParse({
            ...baseTravel,
            start_date: undefined,
        });
        expectOk(ok);
    });

    it('✅ accepte sans description ni destination', () => {
        const ok = TravelSchema.safeParse({
            title: 'Voyage mystère',
            visibility: 'public',
        });
        expectOk(ok);
    });

    it('❌ refuse une visibilité invalide', () => {
        const ko = TravelSchema.safeParse({
            ...baseTravel,
            visibility: 'friends' as any,
        });
        expectFail(ko, [{ path: ['visibility'], code: 'invalid_enum_value' }]);
    });

    it('✅ parse automatiquement les dates en Date', () => {
        const ok = TravelSchema.safeParse({
            ...baseTravel,
            start_date: '2025-08-12',
            end_date: '2025-08-20',
        });
        expectOk(ok);
        expect(ok.data.start_date).toBeInstanceOf(Date);
        expect(ok.data.end_date).toBeInstanceOf(Date);
    });
});

describe('Zod/ParticipantSchema', () => {
    const baseParticipant = {
        email: 'alice@example.com',
    };

    it('✅ accepte un participant avec email valide', () => {
        const ok = ParticipantSchema.safeParse(baseParticipant);
        expectOk(ok);
    });

    it('❌ refuse email vide', () => {
        const ko = ParticipantSchema.safeParse({ email: '' });
        expectFail(ko, [{ path: ['email'], code: 'too_small' }]);
    });

    it('❌ refuse email invalide', () => {
        const ko = ParticipantSchema.safeParse({ email: 'pas-un-email' });
        expectFail(ko, [{ path: ['email'], code: 'invalid_string' }]);
    });

    it("❌ refuse email avec espaces autour (pas de trim par défaut)", () => {
        const ko = ParticipantSchema.safeParse({ email: '  ALICE@EXAMPLE.COM  ' });
        expectFail(ko, [{ path: ['email'], code: 'invalid_string' }]);
    });
});
