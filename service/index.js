const path = require('path');

const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const uuid = require('uuid');
const express = require('express');
const app = express();

const authCookieName = 'token';
const rootDir = path.join(__dirname, '..');

let users = [];
let userData = {}; 
let keyIndicators = [
        { label: 'New Contact', count: 0 },
        { label: 'Meaningful Conversation', count: 0 },
        { label: 'Date', count: 0 },
        { label: 'Kiss', count: 0 },
        { label: 'Vulnerable Moment', count: 0 },
        { label: 'New Partner', count: 0 },
    ];


const port = process.argv.length > 2 ? process.argv[2] : 4000;

app.use(express.json());
app.use(cookieParser());
// app.use(express.static(rootDir));
app.use(express.static('public'));

var apiRouter = express.Router();
app.use(`/api`, apiRouter);

// CreateAuth a new user
apiRouter.post('/auth/signup', async (req, res) => {
  try {
    if (await findUser('email', req.body.email)) {
      res.status(409).send({ msg: 'Existing user' });
    } else {
      const user = await createUser(req.body.email, req.body.password);

      setAuthCookie(res, user.token);
      res.send({ email: user.email });
  }
} catch (error) {
  console.error('Error during signup:', error); // Log the error detail
  res.status(500).send({ msg: 'Internal server error occurred during signup.' });
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
apiRouter.get('/key_indicators', verifyAuth, async (req, res) => {
  const data = await getUserData(req);
  res.send(data.keyIndicators);
});

// Update KeyIndicators
apiRouter.post('/key_indicators', verifyAuth, async (req, res) => {
  const data = await getUserData(req);
  data.keyIndicators = req.body;
  await saveUserData(req, data);  // added to save KIs to user
  res.send(data.keyIndicators);
});

// Get Friends
apiRouter.get('/friends', verifyAuth, async (req, res) => {
  const data = await getUserData(req);
  res.send(data.friends || []);
});

// Update Friends, append instead of rewrite
apiRouter.post('/friends', verifyAuth, async (req, res) => {
  try {
    const data = await getUserData(req);
    const newFriend = req.body;
    if (!newFriend.id) {
      newFriend.id = crypto.randomUUID();
    }
    if (!data.friends) data.friends = [];

    // check if friend already exists
    const index = data.friends.findIndex(f => f.id === newFriend.id);
    if (index >= 0 ) {
      data.friends[index] = newFriend //update existing friend
    } else {
      data.friends.push(newFriend);
    }

    // data.friends.push(newFriend);
    await saveUserData(req, data);
    // res.send(data.friends);
    res.json(data.friends);

  } catch (err) {
    console.error("Error while saving friend:", err);
    res.status(500).send({ msg: "Could not save friend" });
  }
});

// friends info, get one friend by id
apiRouter.get('/friends/:id', verifyAuth, async (req, res) => {
  const data = await getUserData(req);
  const friend = (data.friends || []).find(f => f.id === req.params.id);
  if (!friend) {
    return res.status(404).send({ msg: 'Friend not found' });
  }
  res.send(friend);
});

// Update Friend Info
apiRouter.post('/friends/:id', verifyAuth, async (req, res) => {
  const data = await getUserData(req);
  const index = data.friends.findIndex(f => f.id === req.params.id);
  if (index === -1) {
    return res.status(404).send({ msg: 'Friend not found' });
  }
  data.friends[index] = { ...data.friends[index], ...req.body };
  await saveUserData(req, data);
  res.send(data.friends[index]);
});

// get last reset date
apiRouter.get('/key_indicators/reset_date', verifyAuth, async (req, res) => {
  const data = await getUserData(req);
  res.send({ lastResetDate: data.lastResetDate });
});

// update last reset date
apiRouter.post('/key_indicators/reset_date', verifyAuth, async (req, res) => {
  const data = await getUserData(req);
  data.lastResetDate = req.body.lastResetDate;
  res.send({ lastResetDate: data.lastResetDate });
});

// Default error handler
app.use(function (err, req, res, next) {
  res.status(500).send({ type: err.name, message: err.message });
});

// Return the application's default page if the path is unknown
app.use((_req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

async function getUserData(req) {
  const user = await findUser('token', req.cookies[authCookieName]);
  if (!user) return null;

  const email = user.email;
  if (!userData[email]) {
    userData[email] = {
      keyIndicators: JSON.parse(JSON.stringify(keyIndicators)),
      friends: [],
      lastResetDate: new Date().toISOString()
    };
  }
  return userData[email];
}

async function saveUserData(req, data) {
  const user = await findUser('token', req.cookies[authCookieName]);
  if (!user) return null;

  const email = user.email;
  userData[email] = data
  return userData[email];
}

async function createUser(email, password) {
  const passwordHash = await bcrypt.hash(password, 10);

  const user = { 
    email: email, 
    password: passwordHash, 
    token: uuid.v4(), 
    keyIndicators: JSON.parse(JSON.stringify(keyIndicators)), 
    friends: [],
    lastResetDate: new Date().toISOString()
  };
  users.push(user);
  return user;
}

async function findUser(field, value) {
  if  (!value) return null;

  return users.find((user) => user[field] === value);
}

function setAuthCookie(res, authToken) {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie(authCookieName, authToken, {
    maxAge: 1000 * 60 * 60 * 24 * 365, 
    secure: isProduction,
    httpOnly: true,
    sameSite: 'strict',
  });
}


app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});