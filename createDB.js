const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('job.sqlite', (err) => {
    if (err) {
        return console.error('Could not open database', err.message);
    }
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        company TEXT NOT NULL,
        location TEXT,
        description TEXT,
        posted_date TEXT NOT NULL,
        salary TEXT
    )`, (err) => {
        if (err) {
            return console.error('Could not create jobs table', err.message);
        }
        console.log('Jobs table created or already exists.');
    });
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        userType TEXT NOT NULL,
        firstName TEXT,
        lastName TEXT
    )`, (err) => {
        if (err) {
            return console.error('Could not create users table', err.message);
        }
        console.log('Users table created or already exists.');
    });
    db.run(`CREATE TABLE IF NOT EXISTS contact_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT,
        phone TEXT,
        address TEXT,
        postcode TEXT,
        company TEXT,
        message TEXT,
        submitted_at TEXT
    )`, (err) => {
        if (err) {
            return console.error('Could not create contact_messages table', err.message);
        }
        console.log('Contact messages table created or already exists.');
    });
});

db.close((err) => {
    if (err) {
        return console.error('Error closing database', err.message);
    }
    console.log('Closed the database connection.');
});