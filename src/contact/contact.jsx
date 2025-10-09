import React from 'react';
import './contact.css';

export function Contact() {
  return (
    <main className="contact-main">
      <div className="contact-container">
        <h2>I'd love to hear from you!</h2>
        <p>If you have any questions, feedback, or need assistance, please reach out at:</p>
        <ul>
            <li>Email: <a href="mailto:wolfcribbs8@gmail.com">wolfcribbs8@gmail.com</a></li>
        </ul>
        <p>Or you can fill out the form below:</p>
        <form method="post" action="submit_contact.html">
          <input type="text" name="name" placeholder="Your Name" required />
          <input type="email" name="email" placeholder="Your Email" required />
          <textarea name="message" placeholder="Your Message" required></textarea>
          <button type="submit" className="btn btn-primary">Send Message</button>
        </form>
      </div>
    </main>
  );
}