import React, { useEffect, useState } from 'react';
import './key_indicators.css';
import { AuthState } from '../login/auth_state';

export function Key_indicators({ authState, userName }) {
    const [indicators, setIndicators] = useState([]);

    const defaultIndicators = [
    { label: 'New Contact', count: 0 },
    { label: 'Meaningful Conversation', count: 0 },
    { label: 'Date', count: 0 },
    { label: 'Kiss', count: 0 },
    { label: 'Vulnerable Moment', count: 0 },
    { label: 'New Partner', count: 0 },
    ];

    const loadIndicatorsFromBackend = async () => {
        try {
            const res = await fetch('/api/key_indicators', {
            credentials: 'include',
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();

            // changed data to data.indicators (or arr), adding check for object or map so indicators will still show
            const arr = Array.isArray(data) ? data : data.indicators || [];
            setIndicators(arr);
            localStorage.setItem('keyIndicators', JSON.stringify(arr));
            return arr;
        } catch (err) {
            console.warn('[KeyIndicators] Failed to load from backend, falling back to localStorage:', err);

            // const saved = JSON.parse(localStorage.getItem('keyIndicators')) || defaultIndicators;
            const savedRaw = localStorage.getItem('keyIndicators');
            let saved = [];
            if (savedRaw) {
                try {
                    const parsed = JSON.parse(savedRaw);
                    saved = Array.isArray(parsed) ? parsed : parsed.indicators || [];
                } catch {
                    saved = [];
                }
            }
            const finalSaved = saved.length ? saved : defaultIndicators;
            setIndicators(finalSaved);
            return finalSaved;
        }
    };

    const saveIndicatorsToBackend = async (updated) => {
        // similarly changed data to data.indicators, updated to {indicators: updated}
        try {
            const res = await fetch('/api/key_indicators', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({indicators: updated}),
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const data = await res.json();
            setIndicators(data.indicators);
            localStorage.setItem('keyIndicators', JSON.stringify(data.indicators));
            window.dispatchEvent(new Event('keyIndicatorsUpdated'));
            return data.indicators;

        } catch (err) {
            console.error('[KeyIndicators] Failed to save to backend:', err);
            // setIndicators(updated);
            localStorage.setItem('keyIndicators', JSON.stringify(updated));
            window.dispatchEvent(new Event('keyIndicatorsUpdated'));
            return updated;
        }
    };

    const getLastResetDateFromBackend = async () => {
    try {
        const res = await fetch('/api/key_indicators/reset_date', { credentials: 'include' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json(); 
        return data.lastResetDate;
    } catch (err) {
        console.warn('[KeyIndicators] Could not get lastResetDate from backend, falling back to localStorage', err);
        return localStorage.getItem('lastResetDate') || null;
    }
    };

    const setLastResetDateOnBackend = async (isoString) => {
    try {
        const res = await fetch('/api/key_indicators/reset_date', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ lastResetDate: isoString }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        localStorage.setItem('lastResetDate', data.lastResetDate);
        return data.lastResetDate;
    } catch (err) {
        console.warn('[KeyIndicators] Could not set lastResetDate on backend, saving locally', err);
        localStorage.setItem('lastResetDate', isoString);
        return isoString;
    }
    };

    const resetIndicators = async () => {
    const iso = new Date().toISOString();
    await saveIndicatorsToBackend(defaultIndicators);
    await setLastResetDateOnBackend(iso);
    console.log('%c[KeyIndicators] Weekly reset applied!', 'color: green');
    };

    // check if today is past Sunday
    const checkForWeeklyReset = async () => {
    const now = new Date();
    const lastSunday = new Date(now);
    lastSunday.setDate(now.getDate() - now.getDay());
    lastSunday.setHours(0, 0, 0, 0);

    const lastResetRaw = await getLastResetDateFromBackend();
    const lastReset = lastResetRaw ? new Date(lastResetRaw) : null;

    if (!lastReset || lastReset < lastSunday) {
        await resetIndicators();
    } else {
        await loadIndicatorsFromBackend();
    }
    };

    useEffect(() => {
        if (authState !== AuthState.Authenticated) {
            setIndicators([]);
            setFriends([]);
            setLoading(false);
            return;
        }
        checkForWeeklyReset();

        // keep UI updated when other parts update indicators
        const handleLoad = () => {
            loadIndicatorsFromBackend();
        };

        window.addEventListener('storage', handleLoad);
        window.addEventListener('keyIndicatorsUpdated', handleLoad);

        return () => {
            window.removeEventListener('storage', handleLoad);
            window.removeEventListener('keyIndicatorsUpdated', handleLoad);
        };
    }, []);


    return (
        <main className="container">
            <table className="indicators-table">
                <tbody>
                    {indicators.map((ind, i) => (
                        <tr key={i}>
                            <td><img className="rounded" width="80px" src={`${ind.label.toLowerCase().replace(/ /g, "_")}_w.png`} alt={ind.label}/></td>
                            <td>{ind.label}</td>
                            <td>{ind.count}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </main>
    );
}