import React from 'react';
import './friend_info.css';

export function Friend_info() {
  return (
    <main className="container">
        <section className="friend-section">
        <h2>Brighton</h2>

        <div className="info-block">
            <h3>Contact information:</h3>
            <button className="add-btn">+ Add Contact Info</button>
            <ul>
                <li>mobile: (123) 456-7890</li>
                <li>email: example@email.com</li>
                <li>social media: @example</li>
            </ul>
        </div>

        <div className="info-block">
            <h3>Availability</h3>
            <button className="add-btn">+ Add Availability</button>
            <ul>
                <li>Monday: 2pm - 5pm</li>
                <li>Wednesday: 1pm - 4pm</li>
                <li>Friday: 3pm - 6pm</li>
                <li>Saturday: 10am - 1pm</li>
            </ul>
        </div>

        <div className="info-block">
            <h3>Interests</h3>
            <button className="add-btn">+ Add Interests</button>
            <ul>
                <li>Hiking</li>
                <li>Cooking</li>
                <li>Traveling</li>
                <li>Reading</li>
                <li>Music</li>
            </ul>
        </div>

        <div className="info-block">
            <h3>Progress</h3>
            <ul>
                <li>Discussions: 15</li>
            </ul>
            <ul>
                <li>commitments</li>
                <li>30 not extended</li>
                <li>20 extended</li>
                <li>10 keeping</li>
                <li>5 not kept</li>
            </ul>
        </div>

        <div className="info-block">
            <h3>Timeline</h3>
            <ul>
                <li>date: 01/15/2024</li>
                <li>kiss: 02/10/2024</li>
            </ul>
        </div>

        <div className="add-event-wrapper">
          <button className="btn btn-primary">Add Event</button>
        </div>
      </section>
    </main>
  );
}