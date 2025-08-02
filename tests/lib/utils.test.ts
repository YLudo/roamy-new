import {
  cn,
  formatCurrency,
  formatDate,
  formatDateTime,
  getGeneralMenuList,
  getTravelMenuList,
} from '@/lib/utils';

describe('cn', () => {
    test('devrait fusionner les classes correctement', () => {
        expect(cn('bg-red-500', 'p-4')).toBe('bg-red-500 p-4');
    });

    test('devrait gérer les classes conditionnelles', () => {
        expect(cn('bg-red-500', { 'p-4': true, 'm-2': false })).toBe('bg-red-500 p-4');
    });

    test('devrait ignorer les valeurs null ou undefined', () => {
        expect(cn('bg-red-500', null, undefined, 'p-4')).toBe('bg-red-500 p-4');
    });

    test('devrait surcharger les classes conflictuelles de tailwind', () => {
        expect(cn('p-2', 'p-4')).toBe('p-4');
        expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
    });
});

describe('getGeneralMenuList', () => {
    const travelId = 'voyage-a-paris';
    
    test('devrait marquer le tableau de bord comme actif sur la page de base du voyage', () => {
        const pathname = `/travels/${travelId}`;
        const menu = getGeneralMenuList(pathname);
        
        expect(menu[0].active).toBe(true);
        expect(menu[1].active).toBe(false);
        expect(menu[0].href).toBe(pathname);
    });

    test('devrait marquer les tâches comme actives sur la page des tâches', () => {
        const pathname = `/travels/${travelId}/tasks`;
        const menu = getGeneralMenuList(pathname);
        
        expect(menu[0].active).toBe(false);
        expect(menu[1].active).toBe(true);
        expect(menu[1].href).toBe(pathname);
    });
});

describe('getTravelMenuList', () => {
    const travelId = 'voyage-a-rome';
    
    test('devrait marquer les activités comme actives sur la page des activités', () => {
        const pathname = `/travels/${travelId}/activities`;
        const menu = getTravelMenuList(pathname);
        
        expect(menu[0].active).toBe(true);
        expect(menu[1].active).toBe(false);
        expect(menu[0].href).toBe(pathname);
    });
  
    test('devrait marquer les dépenses comme actives sur la page des dépenses', () => {
        const pathname = `/travels/${travelId}/expenses/new`;
        const menu = getTravelMenuList(pathname);
        
        expect(menu[0].active).toBe(false);
        expect(menu[1].active).toBe(true);
        expect(menu[1].href).toBe(`/travels/${travelId}/expenses`);
    });
});

describe('formatCurrency', () => {
    test('devrait formater un montant en euros', () => {
        expect(formatCurrency(1234.56, 'EUR')).toBe('1 234,56 €');
    });

    test('devrait formater un montant en dollars américains', () => {
        expect(formatCurrency(50.99, 'USD')).toBe('50,99 $US');
    });

    test('devrait gérer le montant zéro', () => {
        expect(formatCurrency(0, 'JPY')).toBe('0 JPY');
    });
});

describe('formatDate', () => {
    test('devrait formater une date valide', () => {
        const date = new Date('2025-12-25T00:00:00.000Z');
        expect(formatDate(date)).toBe('25 déc. 2025');
    });

    test('devrait retourner null si la date est undefined', () => {
        expect(formatDate(undefined)).toBeNull();
    });
});

describe('formatDateTime', () => {
    test('devrait formater une date et une heure valides', () => {
        const date = new Date('2025-08-03T18:30:00.000Z');
        
        const expectedInFrance = '03/08/2025 20:30'; 
        const expectedInUTC = '03/08/2025 18:30';

        expect([expectedInFrance, expectedInUTC]).toContain(formatDateTime(date));
    });
});