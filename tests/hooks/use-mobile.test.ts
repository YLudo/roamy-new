import { renderHook, act } from '@testing-library/react';
import { useIsMobile } from '@/hooks/use-mobile';

const mockAddEventListener = jest.fn();
const mockRemoveEventListener = jest.fn();

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: window.innerWidth < 768,
        media: query,
        onchange: null,
        addEventListener: mockAddEventListener,
        removeEventListener: mockRemoveEventListener,
        dispatchEvent: jest.fn(),
    })),
});

Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true });

describe('useIsMobile', () => {
    beforeEach(() => {
        mockAddEventListener.mockClear();
        mockRemoveEventListener.mockClear();
    });

    test('devrait retourner true sur un écran de taille mobile', () => {
        window.innerWidth = 500;
        const { result } = renderHook(() => useIsMobile());
        expect(result.current).toBe(true);
    });

    test('devrait retourner false sur un écran de taille bureau', () => {
        window.innerWidth = 1024;
        const { result } = renderHook(() => useIsMobile());
        expect(result.current).toBe(false);
    });

    test('devrait se mettre à jour lors d\'un redimensionnement de l\'écran', () => {
        window.innerWidth = 1024;
        const { result } = renderHook(() => useIsMobile());
        expect(result.current).toBe(false);

        const onChangeCallback = mockAddEventListener.mock.calls[0][1];

        act(() => {
        window.innerWidth = 600;
        onChangeCallback();
        });

        expect(result.current).toBe(true);
    });

    test('devrait nettoyer l\'event listener lors du démontage du composant', () => {
        const { unmount } = renderHook(() => useIsMobile());
        
        unmount();
        
        expect(mockRemoveEventListener).toHaveBeenCalledTimes(1);
        expect(mockRemoveEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });
});