import React from 'react';
import './key_indicators.css';

export function Key_indicators() {
  return (
    <main className="container">
        <table className="indicators-table">
            <tbody>
                <tr>
                    <td><img className="rounded" width="80px" src="new_contact_w.png" alt="New Contact"/></td>
                    <td>New Contact</td>
                    <td>32</td>
                </tr>
                <tr>
                    <td><img className="rounded" width="80px" src="meaningful_convo_w.png" alt="Meaningful Conversation"/></td>
                    <td>Meaningful Conversation</td>
                    <td>15</td>
                </tr>
                <tr>
                    <td><img className="rounded" width="80px" src="date_w.png" alt="Date"/></td>
                    <td>Date</td>
                    <td>8</td>
                </tr>
                <tr>
                    <td><img className="rounded" width="80px" src="kiss_w.png" alt="Kiss"/></td>
                    <td>Kiss</td>
                    <td>3</td>
                </tr>
                <tr>
                    <td><img className="rounded" width="80px" src="vulnerable_moment_w.png" alt="Vulnerable Moment"/></td>
                    <td>Vulnerable Moment</td>
                    <td>2</td>
                </tr>
                <tr>
                    <td><img className="rounded" width="80px" src="new_partner_w.png" alt="New Partner"/></td>
                    <td>New Partner</td>
                    <td>1</td>
                </tr>
            </tbody>
        </table>
    </main>
  );
}