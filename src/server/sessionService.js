const express = require('express');
const app = express();
const port = 3001;

let sessions = [];

app.use(express.json());

app.post('/start-session', (req, res) => {
  const { sessionId, customerInfo, endTime } = req.body;
  sessions.push({ sessionId, customerInfo, endTime, notified: false });
  res.status(200).send('Session started');
});

app.get('/check-sessions', (req, res) => {
  const now = new Date();
  const notifications = [];
  sessions = sessions.map(session => {
    if (!session.notified && new Date(session.endTime) - now <= 5 * 60 * 1000) {
      notifications.push(session);
      session.notified = true;
    }
    return session;
  });
  res.status(200).json(notifications);
});

app.get('/ended-sessions', (req, res) => {
  const now = new Date();
  const endedSessions = sessions.filter(session => new Date(session.endTime) <= now);
  res.status(200).json(endedSessions);
});

app.listen(port, () => {
  console.log(`Session service running at http://localhost:${port}`);
});
