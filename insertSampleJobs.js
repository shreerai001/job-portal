const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('job.sqlite');

db.serialize(() => {
  const stmt = db.prepare(`INSERT INTO jobs (title, company, location, description, posted_date, salary) VALUES (?, ?, ?, ?, ?, ?)`);
  stmt.run(
    'Software Engineer',
    'TechCorp',
    'New York, NY',
    'Develop and maintain web applications using modern frameworks.',
    '2025-05-20',
    '$120,000'
  );
  stmt.run(
    'Marketing Specialist',
    'Marketify',
    'San Francisco, CA',
    'Plan and execute marketing campaigns for tech products.',
    '2025-05-18',
    '$85,000'
  );
  stmt.run(
    'Data Analyst',
    'DataWorks',
    'Austin, TX',
    'Analyze large datasets to provide business insights.',
    '2025-05-15',
    '$95,000'
  );
  stmt.finalize();
  console.log('Sample jobs inserted.');
});

db.close();
