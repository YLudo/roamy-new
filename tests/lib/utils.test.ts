import { describe, it, expect, jest } from '@jest/globals';

jest.mock('lucide-react', () => ({
  LayoutGrid: 'LayoutGridIcon',
  ScrollText: 'ScrollTextIcon',
  PenBox: 'PenBoxIcon',
  DollarSign: 'DollarSignIcon',
  Map: 'MapIcon',
  Euro: 'EuroIcon',
}));

import {
  cn,
  getGeneralMenuList,
  getTravelMenuList,
  formatCurrency,
  expenseCategoryLabels,
  activityTypeLabels,
  formatDate,
  formatDateTime,
} from '@/lib/utils';

describe('Utils › cn', () => {
    it('✅ fusionne classes et ignore les falsy', () => {
        const out = cn('p-2', null as any, undefined as any, false as any, ['text-sm', { hidden: false, block: true }]);
        expect(out.split(/\s+/)).toEqual(expect.arrayContaining(['p-2', 'text-sm', 'block']));
        expect(out.includes('hidden')).toBe(false);
    });

    it('✅ résout les conflits tailwind (garde la dernière)', () => {
        const out = cn('p-2 p-4', 'mt-2', 'p-6');
        expect(out.includes('p-6')).toBe(true);
        expect(out.includes('p-4')).toBe(false);
        expect(out.includes('p-2')).toBe(false);
        expect(out.includes('mt-2')).toBe(true);
    });
});

describe('Utils › getGeneralMenuList', () => {
    it('✅ /travels/:id → href corrects et active sur la racine', () => {
        const pathname = '/travels/abc123';
        const items = getGeneralMenuList(pathname);

        expect(items).toHaveLength(4);
        expect(items[0]).toMatchObject({ href: '/travels/abc123', label: 'Tableau de bord', active: true, icon: 'LayoutGridIcon' } as any);
        expect(items[1]).toMatchObject({ href: '/travels/abc123/polls', label: 'Sondages', active: false, icon: 'ScrollTextIcon' } as any);
        expect(items[2]).toMatchObject({ href: '/travels/abc123/tasks', label: 'Tâches', active: false, icon: 'PenBoxIcon' } as any);
        expect(items[3]).toMatchObject({ href: '/travels/abc123/banks', label: 'Comptes bancaires', active: false, icon: 'DollarSignIcon' } as any);
    });

    it('✅ /travels/:id/polls → active sur Sondages', () => {
        const pathname = '/travels/abc123/polls';
        const items = getGeneralMenuList(pathname);
        expect(items[1].active).toBe(true);
        expect(items[0].active).toBe(false);
    });

    it('❌ hors /travels/:id → base null (comportement actuel documenté)', () => {
        const pathname = '/dashboard';
        const items = getGeneralMenuList(pathname);
        expect(items[0].href).toBeNull();
        expect(items[1].href).toBe('null/polls');
        expect(items[2].href).toBe('null/tasks');
        expect(items[3].href).toBe('null/banks');
    });
});

describe('Utils › getTravelMenuList', () => {
    it('✅ /travels/:id/activities → active Activités', () => {
        const pathname = '/travels/abc123/activities';
        const items = getTravelMenuList(pathname);
        expect(items).toHaveLength(2);
        expect(items[0]).toMatchObject({ href: '/travels/abc123/activities', label: 'Activités', active: true, icon: 'MapIcon' } as any);
        expect(items[1]).toMatchObject({ href: '/travels/abc123/expenses', label: 'Dépenses', active: false, icon: 'EuroIcon' } as any);
    });

    it('✅ /travels/:id/expenses → active Dépenses', () => {
        const pathname = '/travels/abc123/expenses';
        const items = getTravelMenuList(pathname);
        expect(items[0].active).toBe(false);
        expect(items[1].active).toBe(true);
    });

    it('❌ hors /travels/:id → base null (comportement actuel documenté)', () => {
        const pathname = '/home';
        const items = getTravelMenuList(pathname);
        expect(items[0].href).toBe('null/activities');
        expect(items[1].href).toBe('null/expenses');
    });
});

describe('Utils › formatCurrency', () => {
    it('✅ formate en EUR (fr-FR)', () => {
        const out = formatCurrency(1234.56, 'EUR');
        expect(typeof out).toBe('string');
        expect(out.includes('€')).toBe(true);
    });

    it('✅ respecte la devise (USD ≠ €)', () => {
        const out = formatCurrency(99.9, 'USD');
        expect(out.includes('€')).toBe(false);
    });
});

describe('Utils › labels', () => {
    it('✅ expenseCategoryLabels contient les clés attendues', () => {
        expect(expenseCategoryLabels.accomodation).toBe('Hébergement');
        expect(expenseCategoryLabels.transportation).toBe('Transport');
        expect(expenseCategoryLabels.food).toBe('Nourriture');
        expect(expenseCategoryLabels.drinks).toBe('Boissons');
        expect(expenseCategoryLabels.activities).toBe('Activités');
        expect(expenseCategoryLabels.shopping).toBe('Shopping');
        expect(expenseCategoryLabels.other).toBe('Autres');
    });

    it('✅ activityTypeLabels contient les clés attendues', () => {
        expect(activityTypeLabels.transport).toBe('Transport');
        expect(activityTypeLabels.accommodation).toBe('Hébergement');
        expect(activityTypeLabels.restaurant).toBe('Restaurant');
        expect(activityTypeLabels.sightseeing).toBe('Tourisme');
        expect(activityTypeLabels.entertainment).toBe('Divertissement');
        expect(activityTypeLabels.meeting).toBe('Réunion');
        expect(activityTypeLabels.other).toBe('Autre');
    });
});

describe('Utils › formatDate', () => {
    it('✅ retourne null si date absente', () => {
        expect(formatDate(undefined)).toBeNull();
    });

    it('✅ formate une date (fr-FR)', () => {
        const d = new Date('2025-08-11T00:00:00Z');
        const out = formatDate(d);
        expect(typeof out).toBe('string');
        expect(out).toMatch(/2025/);
    });
});

describe('Utils › formatDateTime', () => {
    it('✅ formate date+heure (fr-FR)', () => {
        const d = new Date('2025-08-11T14:05:00Z');
        const out = formatDateTime(d);
        expect(typeof out).toBe('string');
        expect(out).toMatch(/\d{2}\/\d{2}\/\d{4}/);
        expect(out).toMatch(/\d{2}:\d{2}/);
    });
});
