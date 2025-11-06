import React, { useRef } from 'react';
import './contact.css';
import emailjs from '@emailjs/browser';

export function Contact() {
  const formRef = useRef();

  const sendEmail = (e) => {
    e.preventDefault();

    emailjs.sendForm(
      'service_8iaiapb',   
      'template_64di75q',  
      formRef.current,
      '03kcEO0pZxurzvsVR'
    )
    .then((result) => {
    console.log('Message sent!', result.text);

    // Send email to user
    emailjs.send(
      'service_8iaiapb',   
      'template_r4sf4xo',  
      {
        user_name: formRef.current.user_name.value,
        user_email: formRef.current.user_email.value,
        message: formRef.current.message.value
      },
      '03kcEO0pZxurzvsVR'
    )
    .then((res) => console.log('Thank you sent to user', res.text))
    .catch((err) => console.error('Failed thank you email', err));

    alert('Message sent successfully!');
    e.target.reset();
  })
    .catch((error) => {
      alert('Failed to send message. Please try again.');
      console.error(error);
    });
  };

  return (
    <main className="contact-main">
      <div className="contact-container">
        <h2>I'd love to hear from you!</h2>
        <p>If you have any questions, feedback, or need assistance, please reach out at:</p>
        <ul>
            <li>Email: <a href="mailto:wolfcribbs8@gmail.com">wolfcribbs8@gmail.com</a></li>
        </ul>
        <p>Or you can fill out the form below:</p>

        <form ref={formRef} onSubmit={sendEmail} >
          <input type="text" name="user_name" placeholder="Your Name" required />
          <input type="email" name="user_email" placeholder="Your Email" required />
          <textarea name="message" placeholder="Your Message" required></textarea>
          <button type="submit" className="btn btn-danger">Send Message</button>
        </form>
      </div>
    </main>
  );
}