import { expectOk, expectFail } from './helpers';
import { ExpenseSchema } from '@/schemas/expenses';

describe('Zod/ExpenseSchema', () => {
    const base = {
        title: 'Essence',
        description: 'Trajet A→B',
        amount: '80.50',
        category: 'transportation' as const,
        paidBy: 'user-1',
        location: 'Aire d’autoroute',
        expenseDate: '2025-08-12T09:00:00Z',
        isShared: true,
        participants: ['user-1', 'user-2'],
        participantAmounts: { 'user-1': '50.50', 'user-2': '30.00' },
    };

    it('✅ accepte un payload valide (dates coercées)', () => {
        const ok = ExpenseSchema.safeParse(base);
        expectOk(ok);
        expect(ok.data.expenseDate).toBeInstanceOf(Date);
    });

    it('❌ refuse un title vide', () => {
        const ko = ExpenseSchema.safeParse({ ...base, title: '' });
        expectFail(ko, [{ path: ['title'], code: 'too_small' }]);
    });

    it('❌ refuse amount vide (min(1))', () => {
        const ko = ExpenseSchema.safeParse({ ...base, amount: '' });
        expectFail(ko, [{ path: ['amount'], code: 'too_small' }]);
    });

    it('❌ refuse amount non numérique', () => {
        const ko = ExpenseSchema.safeParse({ ...base, amount: 'abc' });
        expectFail(ko, [{ path: ['amount'], code: 'custom' }]);
    });

    it('❌ refuse amount négatif', () => {
        const ko = ExpenseSchema.safeParse({ ...base, amount: '-10' });
        expectFail(ko, [{ path: ['amount'], code: 'custom' }]);
    });

    it('❌ refuse amount = 0', () => {
        const ko = ExpenseSchema.safeParse({ ...base, amount: '0' });
        expectFail(ko, [{ path: ['amount'], code: 'custom' }]);
    });

    it('❌ refuse catégorie invalide', () => {
        const ko = ExpenseSchema.safeParse({ ...base, category: 'food_and_drinks' as any });
        expectFail(ko, [{ path: ['category'], code: 'invalid_enum_value' }]);
    });

    it('✅ accepte les catégories prévues (orthographe telle que définie)', () => {
        const cats = [
        'accomodation',
        'transportation',
        'food',
        'drinks',
        'activities',
        'shopping',
        'other',
        ] as const;

        for (const c of cats) {
            const ok = ExpenseSchema.safeParse({ ...base, category: c });
            expectOk(ok);
        }
    });

    it('❌ refuse paidBy vide', () => {
        const ko = ExpenseSchema.safeParse({ ...base, paidBy: '' });
        expectFail(ko, [{ path: ['paidBy'], code: 'too_small' }]);
    });

    it('❌ refuse expenseDate invalide (coercion)', () => {
        const ko = ExpenseSchema.safeParse({ ...base, expenseDate: 'not-a-date' });
        expectFail(ko, [{ path: ['expenseDate'], code: 'invalid_date' }]);
    });

    it('✅ location optionnelle', () => {
        const ok = ExpenseSchema.safeParse({ ...base, location: undefined });
        expectOk(ok);
    });

    it('✅ participants peut être vide (aucune contrainte min)', () => {
        const ok = ExpenseSchema.safeParse({ ...base, participants: [] });
        expectOk(ok);
    });

    it('✅ participantAmounts peut contenir des valeurs non numériques (elles sont traitées comme 0 dans la somme)', () => {
        const ok = ExpenseSchema.safeParse({
            ...base,
            amount: '50',
            participantAmounts: { 'user-1': 'abc', 'user-2': '49' },
        });
        expectOk(ok);
    });

    it('✅ règle de somme: égal au total → OK', () => {
        const ok = ExpenseSchema.safeParse({
            ...base,
            amount: '100',
            participantAmounts: { 'u1': '60', 'u2': '40' },
        });
        expectOk(ok);
    });

    it('❌ règle de somme: dépasse le total → KO', () => {
        const ko = ExpenseSchema.safeParse({
            ...base,
            amount: '100',
            participantAmounts: { 'u1': '60', 'u2': '50' },
        });
        expectFail(ko, [{ path: ['participantAmounts'], code: 'custom' }]);
    });

    it('✅ isShared=false ignore la règle de somme', () => {
        const ok = ExpenseSchema.safeParse({
            ...base,
            isShared: false,
            amount: '100',
            participantAmounts: { 'u1': '300', 'u2': '500' },
        });
        expectOk(ok);
    });

    it('✅ amount avec espaces autour (parseFloat tolère) → OK si positif', () => {
        const ok = ExpenseSchema.safeParse({
            ...base,
            amount: '  10.25  ',
            participantAmounts: { u1: '5', u2: '5.25' },
        });
        expectOk(ok);
    });

    it('❌ participants mauvais type (doit être array de string)', () => {
        const ko = ExpenseSchema.safeParse({
            ...base,
            participants: 'user-1',
        });
        expectFail(ko, [{ path: ['participants'], code: 'invalid_type' }]);
    });

    it('❌ participantAmounts mauvais type', () => {
        const ko = ExpenseSchema.safeParse({
            ...base,
            participantAmounts: [],
        });
        expectFail(ko, [{ path: ['participantAmounts'], code: 'invalid_type' }]);
    });

    it('❌ participantAmounts: valeur non-string (schéma impose string)', () => {
        const ko = ExpenseSchema.safeParse({
            ...base,
            participantAmounts: { 'user-1': 10 as any },
        });
        expectFail(ko, [{ path: ['participantAmounts', 'user-1'], code: 'invalid_type' }]);
    });
});
