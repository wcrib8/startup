import React from 'react';
import './key_indicators.css';

export function Key_indicators() {
  return (
    <main className="container">
        <table className="indicators-table">
            <tr>
                <td><img className="rounded" width="80px" src="NewContact.webp" alt="New Contact"/></td>
                <td>New Contact</td>
                <td>32</td>
            </tr>
            <tr>
                <td><img className="rounded" width="80px" src="MeaningfulConvo.jpeg" alt="Meaningful Conversation"/></td>
                <td>Meaningful Conversation</td>
                <td>15</td>
            </tr>
            <tr>
                <td><img className="rounded" width="80px" src="Date.jpeg" alt="Date"/></td>
                <td>Date</td>
                <td>8</td>
            </tr>
            <tr>
                <td><img className="rounded" width="80px" src="Kiss.webp" alt="Kiss"/></td>
                <td>Kiss</td>
                <td>3</td>
            </tr>
            <tr>
                <td><img className="rounded" width="80px" src="VulnerableMoment.jpeg" alt="Vulnerable Moment"/></td>
                <td>Vulnerable Moment</td>
                <td>2</td>
            </tr>
            <tr>
                <td><img className="rounded" width="80px" src="NewPartner.png" alt="New Partner"/></td>
                <td>New Partner</td>
                <td>1</td>
            </tr>
        </table>
    </main>
  );
}