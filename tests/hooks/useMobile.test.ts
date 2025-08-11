/** @jest-environment jsdom */

import { renderHook, act } from '@testing-library/react';
import * as React from 'react';

import { useIsMobile } from '@/hooks/use-mobile';

const MOBILE_BREAKPOINT = 768;

describe('useIsMobile', () => {
    let lastMql: any;
    let lastListener: ((ev?: MediaQueryListEvent) => any) | null;

    beforeEach(() => {
        (window as any).innerWidth = 1024;

        lastListener = null;

        (window as any).matchMedia = (query: string) => {
            const matches = (window as any).innerWidth < MOBILE_BREAKPOINT;

            lastMql = {
                media: query,
                matches,
                onchange: null,
                addEventListener: jest.fn((event: string, cb: any) => {
                if (event === 'change') lastListener = cb;
                }),
                removeEventListener: jest.fn((event: string, cb: any) => {
                if (event === 'change' && lastListener === cb) {
                    lastListener = null;
                }
                }),
                addListener: jest.fn((cb: any) => { lastListener = cb; }),
                removeListener: jest.fn((cb: any) => { if (lastListener === cb) lastListener = null; }),
                dispatchEvent: jest.fn((ev: any) => {
                lastListener?.(ev);
                return true;
                }),
            };
            return lastMql;
        };
    });

    const triggerChange = () => {
        lastMql.matches = (window as any).innerWidth < MOBILE_BREAKPOINT;
        lastMql.dispatchEvent({ matches: lastMql.matches, media: lastMql.media });
    };

    it('✅ retourne false quand largeur ≥ 768px', () => {
        (window as any).innerWidth = 1024;
        const { result } = renderHook(() => useIsMobile());
        expect(result.current).toBe(false);
    });

    it('✅ retourne true quand largeur < 768px', () => {
        (window as any).innerWidth = 500;
        const { result } = renderHook(() => useIsMobile());
        expect(result.current).toBe(true);
    });

    it('✅ se met à jour sur changement de MQ (>=→<)', () => {
        (window as any).innerWidth = 1000;
        const { result } = renderHook(() => useIsMobile());
        expect(result.current).toBe(false);

        act(() => {
            (window as any).innerWidth = 600;
            triggerChange();
        });

        expect(result.current).toBe(true);
    });

    it('✅ se met à jour sur changement de MQ (<→>=)', () => {
        (window as any).innerWidth = 600;
        const { result } = renderHook(() => useIsMobile());
        expect(result.current).toBe(true);

        act(() => {
            (window as any).innerWidth = 900;
            triggerChange();
        });

        expect(result.current).toBe(false);
    });

    it('✅ nettoie le listener au unmount', () => {
        (window as any).innerWidth = 900;
        const { unmount } = renderHook(() => useIsMobile());

        expect(lastMql.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));

        unmount();

        expect(lastMql.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
        expect(lastListener).toBeNull();
    });
});
