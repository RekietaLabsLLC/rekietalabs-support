const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));

// Serve static files from the ticket folder (for the form HTML and assets)
app.use('/ticket', express.static(path.join(__dirname, 'ticket')));

// GET /ticket/create — serve the form located at /ticket/index.html
app.get('/ticket/create', (req, res) => {
  res.sendFile(path.join(__dirname, 'ticket', 'index.html'));
});

// POST /ticket/create — handle ticket submission
app.post('/ticket/create', async (req, res) => {
  const { name, reason, email, phone, refid } = req.body;

  if (!name || !reason || !email) {
    return res.status(400).send('Name, Ticket Reason, and Email are required.');
  }

  const message = `
New Ticket Submitted:

Name: ${name}
Ticket Reason: ${reason}
Email: ${email}
Phone: ${phone || 'N/A'}
Reference ID: ${refid || 'N/A'}
  `;

  try {
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: 'New Support Ticket',
      text: message
    });

    res.send('Ticket submitted successfully! We will get back to you soon.');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error submitting ticket.');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
