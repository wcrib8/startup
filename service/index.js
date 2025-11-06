const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const uuid = require('uuid');
const express = require('express');
const app = express();

const authCookieName = 'token';

let users = [];
let scores = [];

const port = process.argv.length > 2 ? process.argv[2] : 3000;

app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));

let apiRouter = express.Router();
app.use(`/api`, apiRouter);

// CreateAuth a new user
apiRouter.post('/auth/create', async (req, res) => {
  if (await findUser('email', req.body.email)) {
    res.status(409).send({ msg: 'Existing user' });
  } else {
    const user = await createUser(req.body.email, req.body.password);

    setAuthCookie(res, user.token);
    res.send({ email: user.email });
  }
});

// GetAuth login an existing user
apiRouter.post('/auth/login', async (req, res) => {
  const user = await findUser('email', req.body.email);
  if (user) {
    if (await bcrypt.compare(req.body.password, user.password)) {
      user.token = uuid.v4();
      setAuthCookie(res, user.token);
      res.send({ email: user.email });
      return;
    }
  }
  res.status(401).send({ msg: 'Unauthorized' });
});

// DeleteAuth logout a user
apiRouter.delete('/auth/logout', async (req, res) => {
  const user = await findUser('token', req.cookies[authCookieName]);
  if (user) {
    delete user.token;
  }
  res.clearCookie(authCookieName);
  res.status(204).end();
});

// Middleware to verify that the user is authorized to call an endpoint
const verifyAuth = async (req, res, next) => {
  const user = await findUser('token', req.cookies[authCookieName]);
  if (user) {
    next();
  } else {
    res.status(401).send({ msg: 'Unauthorized' });
  }
};

// Get KeyIndicators
apiRouter.get('/key_indicators', verifyAuth, (_req, res) => {
  res.send(keyIndicators);
});

// Update KeyIndicators
apiRouter.post('/key_indicators', verifyAuth, (req, res) => {
  keyIndicators = updateKeyIndicators(req.body);
  res.send(keyIndicators);
});

// Get Friends
apiRouter.get('/friends', verifyAuth, (_req, res) => {
  res.send(friends);
});

// Update Friends
apiRouter.post('/friends', verifyAuth, (req, res) => {
  friends = updateFriends(req.body);
  res.send(friends);
});

// friends info
apiRouter.get('/friends_info/:id', verifyAuth, (req, res) => {
  const friend = friends[req.params.id];
    res.send(friend);
});

// Update Friend Info
apiRouter.post('/friends_info/:id', verifyAuth, (req, res) => {
  friends[req.params.id] = req.body;
  res.send(friends[req.params.id]);
});

// update last reset date
apiRouter.post('/key_indicators/reset_date', verifyAuth, (req, res) => {
  lastResetDate = req.body.lastResetDate;
  res.send({ lastResetDate });
});

// get last reset date
apiRouter.get('/key_indicators/reset_date', verifyAuth, (_req, res) => {
  res.send({ lastResetDate });
});

// Default error handler
app.use(function (err, req, res, next) {
  res.status(500).send({ type: err.name, message: err.message });
});

// Return the application's default page if the path is unknown
app.use((_req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

async function createUser(email, password) {
    const passwordHash = await bcrypt.hash(password, 10);

    const user = { email: email, password: passwordHash, token: uuid.v4() };
    users.push(user);

    return user;
}

async function findUser(field, value) {
    if  (!value) return null;

    return users.find((user) => user[field] === value);
}

function setAuthCookie(res, authToken) {
    res.cookie(authCookieName, authToken, {
        maxAge: 1000 * 60 * 60 * 24 * 365, 
        secure: true,
        httpOnly: true,
        sameSite: 'strict',
    });
}

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});