import { expectOk, expectFail } from './helpers';
import { ActivitySchema } from '@/schemas/activities';

describe('Zod/ActivitySchema', () => {
    const base = {
        title: "Visite des Uffizi",
        description: "Musée incontournable",
        type: "sightseeing" as const,
        startDate: "2025-08-12T10:00:00Z",
        location: "Florence, IT",
        latitude: 43.7687,
        longitude: 11.2556,
        estimatedCost: "19.90",
        isConfirmed: true,
    };

    it('✅ accepte un payload valide', () => {
        const ok = ActivitySchema.safeParse(base);
        expectOk(ok);
        expect(ok.data.startDate).toBeInstanceOf(Date);
        expect(typeof ok.data.estimatedCost).toBe('string');
    });

    it('❌ refuse un title vide', () => {
        const ko = ActivitySchema.safeParse({ ...base, title: '' });
        expectFail(ko, [{ path: ['title'], code: 'too_small' }]);
    });

    it('❌ refuse un type invalide', () => {
        const ko = ActivitySchema.safeParse({ ...base, type: 'visit' as any });
        expectFail(ko, [{ path: ['type'], code: 'invalid_enum_value' }]);
    });

    it('❌ refuse une date invalide (coercion)', () => {
        const ko = ActivitySchema.safeParse({ ...base, startDate: 'not-a-date' });
        expectFail(ko, [{ path: ['startDate'], code: 'invalid_date' }]);
    });

    it('✅ accepte latitude/longitude absents (optionnels)', () => {
        const ok = ActivitySchema.safeParse({
            ...base,
            latitude: undefined,
            longitude: undefined,
        });
        expectOk(ok);
    });

    it('❌ refuse latitude au mauvais type', () => {
        const ko = ActivitySchema.safeParse({ ...base, latitude: '43.7' as any });
        expectFail(ko, [{ path: ['latitude'], code: 'invalid_type' }]);
    });

    it('❌ refuse longitude au mauvais type', () => {
        const ko = ActivitySchema.safeParse({ ...base, longitude: '11.25' as any });
        expectFail(ko, [{ path: ['longitude'], code: 'invalid_type' }]);
    });

    it('✅ estimatedCost vide → transformé en undefined', () => {
        const ok = ActivitySchema.safeParse({ ...base, estimatedCost: '' });
        expectOk(ok);
        expect(ok.data.estimatedCost).toBeUndefined();
    });

    it('✅ estimatedCost numérique positif (string) passe', () => {
        const ok = ActivitySchema.safeParse({ ...base, estimatedCost: '0.01' });
        expectOk(ok);
    });

    it('❌ estimatedCost non numérique', () => {
        const ko = ActivitySchema.safeParse({ ...base, estimatedCost: 'abc' });
        expectFail(ko, [{ path: ['estimatedCost'], code: 'custom' }]);
    });

    it('❌ estimatedCost négatif', () => {
        const ko = ActivitySchema.safeParse({ ...base, estimatedCost: '-5' });
        expectFail(ko, [{ path: ['estimatedCost'], code: 'custom' }]);
    });

    it('❌ estimatedCost égal à 0', () => {
        const ko = ActivitySchema.safeParse({ ...base, estimatedCost: '0' });
        expectFail(ko, [{ path: ['estimatedCost'], code: 'custom' }]);
    });

    it('❌ isConfirmed manquant (obligatoire)', () => {
        const { isConfirmed, ...rest } = base;
        const ko = ActivitySchema.safeParse(rest);
        expectFail(ko, [{ path: ['isConfirmed'] }]);
    });

    it('✅ location optionnelle', () => {
        const ok = ActivitySchema.safeParse({ ...base, location: undefined });
        expectOk(ok);
    });
});
