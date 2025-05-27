// Require the express web application framework (https://expressjs.com)
const express = require('express')
const bodyParser = require('body-parser');
const { authenticateUser } = require('./auth');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('job.sqlite');

// Create a new web application by calling the express function
const app = express()
const port = 3000

// Tell our application to serve all the files under the `public_html` directory
app.use(express.static('public_html'))
app.use(bodyParser.json());

// Login handler
app.post('/api/login', (req, res) => {
  const { email, password, userType } = req.body;
  if (!email || !password || !userType) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }
  authenticateUser(email, password, userType, (err, user) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Server error.' });
    }
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }
    // For demo: no session, just success
    res.json({ success: true, message: 'Login successful.' });
  });
});

// Signup handler
app.post('/api/signup', (req, res) => {
  const { name, email, password, userType } = req.body;
  if (!name || !email || !password || !userType) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }
  // Split name into firstName and lastName (simple split)
  const [firstName, ...rest] = name.trim().split(' ');
  const lastName = rest.join(' ');
  db.run(
    `INSERT INTO users (email, password, userType, firstName, lastName) VALUES (?, ?, ?, ?, ?)`,
    [email, password, userType, firstName, lastName],
    function(err) {
      if (err) {
        if (err.message && err.message.includes('UNIQUE constraint failed')) {
          return res.status(409).json({ success: false, message: 'Email already registered.' });
        }
        return res.status(500).json({ success: false, message: 'Server error.' });
      }
      res.json({ success: true, message: 'Signup successful!' });
    }
  );
});

// List jobs handler
app.get('/api/jobs', (req, res) => {
  db.all('SELECT * FROM jobs ORDER BY posted_date DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Server error.' });
    }
    res.json({ success: true, jobs: rows });
  });
});

// Get job by id
app.get('/api/jobs/:id', (req, res) => {
  const jobId = req.params.id;
  db.get('SELECT * FROM jobs WHERE id = ?', [jobId], (err, row) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Server error.' });
    }
    if (!row) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }
    res.json({ success: true, job: row });
  });
});

// Post a new job
app.post('/api/jobs', (req, res) => {
  const { title, company, location, salary, description } = req.body;
  if (!title || !company || !description) {
    return res.status(400).json({ success: false, message: 'Title, company, and description are required.' });
  }
  const posted_date = new Date().toISOString();
  db.run(
    `INSERT INTO jobs (title, company, location, salary, description, posted_date) VALUES (?, ?, ?, ?, ?, ?)`,
    [title, company, location, salary, description, posted_date],
    function(err) {
      if (err) {
        return res.status(500).json({ success: false, message: 'Server error.' });
      }
      res.json({ success: true, message: 'Job posted successfully!' });
    }
  );
});

// Search jobs by title
app.get('/api/jobs/search', (req, res) => {
  const query = req.query.query || '';
  db.all(
    'SELECT * FROM jobs WHERE LOWER(title) LIKE ? ORDER BY posted_date DESC',
    [`%${query.toLowerCase()}%`],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Server error.' });
      }
      res.json({ success: true, jobs: rows });
    }
  );
});

// Sidebar companies with job count
app.get('/api/sidebar/companies', (req, res) => {
  db.all(
    'SELECT company, COUNT(*) as jobCount FROM jobs GROUP BY company ORDER BY jobCount DESC',
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Server error.' });
      }
      res.json({ success: true, companies: rows });
    }
  );
});

// Save contact message
app.post('/api/contact', (req, res) => {
  const { name, email, phone, address, postcode, company, message } = req.body;
  if (!name || !email || !phone || !message) {
    return res.status(400).json({ success: false, message: 'Please fill in all required fields.' });
  }
  const submitted_at = new Date().toISOString();
  db.run(
    `INSERT INTO contact_messages (name, email, phone, address, postcode, company, message, submitted_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, email, phone, address, postcode, company, message, submitted_at],
    function(err) {
      if (err) {
        return res.status(500).json({ success: false, message: 'Server error.' });
      }
      res.json({ success: true, message: 'Your message has been sent!' });
    }
  );
});

// Tell our application to listen to requests at port 3000 on the localhost
app.listen(port, ()=> {
  // When the application starts, print to the console that our app is
  // running at http://localhost:3000. Print another message indicating
  // how to shut the server down.
  console.log(`Web server running at: http://localhost:${port}`)
  console.log(`Type Ctrl+C to shut down the web server`)
})