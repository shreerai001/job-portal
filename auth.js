const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('job.sqlite');

function authenticateUser(email, password, userType, callback) {
    db.get(
        `SELECT * FROM users WHERE email = ? AND password = ? AND userType = ?`,
        [email, password, userType],
        (err, row) => {
            if (err) return callback(err);
            if (row) return callback(null, row);
            return callback(null, null);
        }
    );
}

module.exports = { authenticateUser };
