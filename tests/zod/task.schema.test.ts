import { expectOk, expectFail } from './helpers';
import { TaskSchema } from '@/schemas/tasks'; // ← ajuste le chemin selon ton projet

describe('Zod/TaskSchema', () => {
    const base = {
        title: 'Acheter les billets',
        description: 'Train pour Paris',
    };

    it('✅ accepte un payload valide', () => {
        const ok = TaskSchema.safeParse(base);
        expectOk(ok);
    });

    it('❌ refuse un titre vide', () => {
        const ko = TaskSchema.safeParse({ ...base, title: '' });
        expectFail(ko, [{ path: ['title'], code: 'too_small' }]);
    });

    it('✅ accepte description vide', () => {
        const ok = TaskSchema.safeParse({ ...base, description: '' });
        expectOk(ok);
    });

    it('✅ accepte description absente (optionnelle)', () => {
        const { description, ...noDesc } = base;
        const ok = TaskSchema.safeParse(noDesc);
        expectOk(ok);
    });

    it('❌ refuse titre non-string', () => {
        const ko = TaskSchema.safeParse({
            ...base,
            title: 123,
        });
        expectFail(ko, [{ path: ['title'], code: 'invalid_type' }]);
    });

    it('❌ refuse description non-string', () => {
        const ko = TaskSchema.safeParse({
            ...base,
            description: 456,
        });
        expectFail(ko, [{ path: ['description'], code: 'invalid_type' }]);
    });
});
