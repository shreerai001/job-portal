// Require the express web application framework (https://expressjs.com)
const express = require('express')
const bodyParser = require('body-parser');
const { authenticateUser } = require('./auth');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
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
  db.get('SELECT * FROM users WHERE email = ? AND userType = ?', [email, userType], async (err, user) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Server error.' });
    }
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }
    // Compare hashed password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }
    // For demo: no session, just success
    res.json({ success: true, message: 'Login successful.' });
  });
});

// Signup handler
app.post('/api/signup', async (req, res) => {
  const { firstName, lastName, email, password, userType } = req.body;
  if (!firstName || !lastName || !email || !password || !userType) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run(
      `INSERT INTO users (firstName, lastName, email, password, userType) VALUES (?, ?, ?, ?, ?)`,
      [firstName, lastName, email, hashedPassword, userType],
      function (err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed: users.email')) {
            return res.json({ success: false, message: 'Email already registered.' });
          }
          return res.json({ success: false, message: 'Signup failed.' });
        }
        res.json({ success: true });
      }
    );
  } catch (err) {
    res.json({ success: false, message: 'Server error.' });
  }
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

app.post('/api/jobs', (req, res) => {
  const { title, company, location, salary, description } = req.body;
  if (!title || !company || !description) {
    return res.status(400).json({ success: false, message: 'Title, company, and description are required.' });
  }
  const posted_date = new Date().toISOString();
  db.run(
    `INSERT INTO jobs (title, company, location, salary, description, posted_date) VALUES (?, ?, ?, ?, ?, ?)`,
    [title, company, location, salary, description, posted_date],
    function (err) {
      if (err) {
        return res.status(500).json({ success: false, message: 'Server error.' });
      }
      res.json({ success: true, message: 'Job posted successfully!' });
    }
  );
});

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

app.post('/api/contact', (req, res) => {
  const { name, email, phone, address, postcode, company, message } = req.body;
  if (!name || !email || !phone || !message) {
    return res.status(400).json({ success: false, message: 'Please fill in all required fields.' });
  }
  const submitted_at = new Date().toISOString();
  db.run(
    `INSERT INTO contact_messages (name, email, phone, address, postcode, company, message, submitted_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, email, phone, address, postcode, company, message, submitted_at],
    function (err) {
      if (err) {
        return res.status(500).json({ success: false, message: 'Server error.' });
      }
      res.json({ success: true, message: 'Your message has been sent!' });
    }
  );
});

// POST /api/apply - Save a job application
app.post('/api/apply', (req, res) => {
  const { jobId, userEmail } = req.body;
  if (!jobId || !userEmail) {
    return res.status(400).json({ success: false, message: 'Missing job or user info.' });
  }
  db.get('SELECT id FROM users WHERE email = ?', [userEmail], (err, user) => {
    if (err || !user) {
      return res.status(400).json({ success: false, message: 'User not found.' });
    }
    const userId = user.id;
    const appliedAt = new Date().toISOString();
    // Prevent duplicate applications
    db.get('SELECT id FROM job_applications WHERE user_id = ? AND job_id = ?', [userId, jobId], (err, row) => {
      if (row) {
        return res.json({ success: false, message: 'You have already applied for this job.' });
      }
      db.run(
        `INSERT INTO job_applications (user_id, job_id, applied_at) VALUES (?, ?, ?)`,
        [userId, jobId, appliedAt],
        function (err) {
          if (err) {
            return res.status(500).json({ success: false, message: 'Database error.' });
          }
          res.json({ success: true, message: 'Application submitted!' });
        }
      );
    });
  });
});

// Get jobs posted by employer
app.get('/api/employer/jobs', (req, res) => {
  const email = req.query.email;
  db.all('SELECT * FROM jobs WHERE company IN (SELECT company FROM users WHERE email = ?)', [email], (err, rows) => {
    if (err) return res.json({ success: false, jobs: [] });
    res.json({ success: true, jobs: rows });
  });
});

// Get jobs applied by a job seeker
app.get('/api/seeker/applications', (req, res) => {
  const email = req.query.email;
  db.get('SELECT id FROM users WHERE email = ?', [email], (err, user) => {
    if (err || !user) return res.json({ success: false, jobs: [] });
    db.all(
      `SELECT jobs.id, jobs.title, jobs.company, jobs.location, jobs.salary, jobs.posted_date, job_applications.status
             FROM job_applications
             JOIN jobs ON jobs.id = job_applications.job_id
             WHERE job_applications.user_id = ?`,
      [user.id],
      (err, rows) => {
        if (err) return res.json({ success: false, jobs: [] });
        res.json({ success: true, jobs: rows });
      }
    );
  });
});

// Get users who applied for a specific job
app.get('/api/job/:jobId/applicants', (req, res) => {
  const jobId = req.params.jobId;
  db.all(
    `SELECT users.firstName, users.lastName, users.email
         FROM job_applications
         JOIN users ON users.id = job_applications.user_id
         WHERE job_applications.job_id = ?`,
    [jobId],
    (err, rows) => {
      if (err) return res.json({ success: false, applicants: [] });
      res.json({ success: true, applicants: rows });
    }
  );
});

app.get('/api/job/:jobId/applied', (req, res) => {
  const jobId = req.params.jobId;
  const userEmail = req.query.userEmail;
  db.get('SELECT id FROM users WHERE email = ?', [userEmail], (err, user) => {
    if (err || !user) return res.json({ applied: false });
    db.get('SELECT id FROM job_applications WHERE user_id = ? AND job_id = ?', [user.id, jobId], (err, row) => {
      res.json({ applied: !!row });
    });
  });
});

// Tell our application to listen to requests at port 3000 on the localhost
app.listen(port, () => {
  // When the application starts, print to the console that our app is
  // running at http://localhost:3000. Print another message indicating
  // how to shut the server down.
  console.log(`Web server running at: http://localhost:${port}`)
  console.log(`Type Ctrl+C to shut down the web server`)
})