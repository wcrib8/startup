import React, { useEffect, useState } from 'react';
import './key_indicators.css';

export function Key_indicators() {
    const [indicators, setIndicators] = useState([]);

    useEffect(() => {
        const savedIndicators = JSON.parse(localStorage.getItem('keyIndicators')) || [
            { label: 'New Contact', count: 0 },
            { label: 'Meaningful Conversation', count: 0 },
            { label: 'Date', count: 0 },
            { label: 'Kiss', count: 0 },
            { label: 'Vulnerable Moment', count: 0 },
            { label: 'New Partner', count: 0 },
        ];
        setIndicators(savedIndicators);
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