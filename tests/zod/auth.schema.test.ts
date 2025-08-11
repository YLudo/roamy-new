import { expectOk, expectFail } from './helpers';
import { RegisterSchema, LoginSchema } from '@/schemas/auth';

describe('Zod/Auth › RegisterSchema', () => {
    const base = {
        name: 'Alice Doe',
        email: 'alice@example.com',
        password: 'Aa1!aaaaaa',
    };

    it('✅ accepte un payload valide', () => {
        const ok = RegisterSchema.safeParse(base);
        expectOk(ok);
    });

    it('❌ refuse un nom vide', () => {
        const ko = RegisterSchema.safeParse({ ...base, name: '' });
        expectFail(ko, [{ path: ['name'], code: 'too_small' }]);
    });

    it('❌ refuse un email invalide', () => {
        const ko = RegisterSchema.safeParse({ ...base, email: 'pas-un-email' });
        expectFail(ko, [{ path: ['email'], code: 'invalid_string' }]);
    });

    it('❌ refuse un mot de passe trop faible', () => {
        const ko = RegisterSchema.safeParse({ ...base, password: 'azerty' });
        expectFail(ko, [
            { path: ['password'], code: 'too_small' },
            { path: ['password'], code: 'invalid_string' },
        ]);
    });

    it("❌ refuse des espaces autour de l'email (pas de trim par défaut)", () => {
        const ko = RegisterSchema.safeParse({ ...base, email: '  ALICE@EXAMPLE.COM  ' });
        expectFail(ko, [{ path: ['email'], code: 'invalid_string' }]);
    });
});

describe('Zod/Auth › LoginSchema', () => {
    const base = {
        email: 'user@example.com',
        password: 'Aa1!aaaaaa',
    };

    it('✅ accepte un payload valide', () => {
        const ok = LoginSchema.safeParse(base);
        expectOk(ok);
    });

    it('❌ refuse email manquant', () => {
        const ko = LoginSchema.safeParse({ password: base.password });
        expectFail(ko, [{ path: ['email'] }]);
    });

    it('❌ refuse password manquant', () => {
        const ko = LoginSchema.safeParse({ email: base.email });
        expectFail(ko, [{ path: ['password'] }]);
    });

    it('❌ refuse email invalide', () => {
        const ko = LoginSchema.safeParse({ ...base, email: 'nope' });
        expectFail(ko, [{ path: ['email'], code: 'invalid_string' }]);
    });

    it('❌ refuse password faible (pas la complexité demandée)', () => {
        const ko = LoginSchema.safeParse({ ...base, password: 'Password' });
        expectFail(ko, [{ path: ['password'], code: 'invalid_string' }]);
    });
});
