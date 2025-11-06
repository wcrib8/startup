import React, { useEffect, useState } from 'react';
import './key_indicators.css';

export function Key_indicators() {
    const defaultIndicators = [
        { label: 'New Contact', count: 0 },
        { label: 'Meaningful Conversation', count: 0 },
        { label: 'Date', count: 0 },
        { label: 'Kiss', count: 0 },
        { label: 'Vulnerable Moment', count: 0 },
        { label: 'New Partner', count: 0 },
    ];

    const [indicators, setIndicators] = useState([]);

    // reset indicators to default for Sunday
    const resetIndicators = () => {
        localStorage.setItem('keyIndicators', JSON.stringify(defaultIndicators));
        localStorage.setItem('lastResetDate', new Date().toISOString());
        setIndicators(defaultIndicators);
        console.log('%c[KeyIndicators] Weekly reset applied!', 'color: green');
    };

    // load current indicators
    const loadIndicators = () => {
        const savedIndicators = JSON.parse(localStorage.getItem('keyIndicators')) || defaultIndicators;
        setIndicators(savedIndicators);
    };

    // check if today is past Sunday
    const checkForWeeklyReset = () => {
        const now = new Date();
        const lastReset = localStorage.getItem('lastResetDate');
        const lastSunday = new Date(now);
        lastSunday.setDate(now.getDate() - now.getDay()); 
        lastSunday.setHours(0, 0, 0, 0);

        if (!lastReset || new Date(lastReset) < lastSunday) {
            resetIndicators();
        } else {
            loadIndicators();
        }
    };

    useEffect(() => {
        checkForWeeklyReset();

        // Update if storage changes
        window.addEventListener('storage', loadIndicators);
        window.addEventListener('keyIndicatorsUpdated', loadIndicators);

        return () => {
            window.removeEventListener('storage', loadIndicators);
            window.removeEventListener('keyIndicatorsUpdated', loadIndicators);
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