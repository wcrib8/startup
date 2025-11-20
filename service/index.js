const path = require('path');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const uuid = require('uuid');
const express = require('express');
const app = express();
const DB = require('./database.js');

const authCookieName = 'token';
const rootDir = path.join(__dirname, '..');

const port = process.argv.length > 2 ? process.argv[2] : 4000;
const keyIndicators = [
  { label: 'New Contact', count: 0 },
  { label: 'Meaningful Conversation', count: 0 },
  { label: 'Date', count: 0 },
  { label: 'Kiss', count: 0 },
  { label: 'Vulnerable Moment', count: 0 },
  { label: 'New Partner', count: 0 },
];

app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));

const apiRouter = express.Router();
app.use(`/api`, apiRouter);

// CreateAuth a new user
apiRouter.post('/auth/signup', async (req, res) => {
  try {
    const { email, password } = req.body;  // added for DB

    if (await findUser('email', email)) {
      return res.status(409).send({ msg: 'Existing user' });
    }

    // build user and insert into database
    const user = await createUser({ email, password });

    // Auth cookie
    setAuthCookie(res, user.token);

    res.send({ email: user.email });
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
      await DB.updateUser(user);
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
    DB.updateUser(user);
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

  // Handle both array or { indicators: [...] } formats, DB update
  const updatedIndicators = Array.isArray(req.body)
    ? req.body
    : req.body.indicators || [];

  data.keyIndicators = updatedIndicators;
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

    const appendArrayField = (existing = [], incoming) => {
      if (!incoming) return existing;
      return existing.concat(Array.isArray(incoming) ? incoming : [incoming]);
    };

    if (index >= 0 ) {
      const existingFriend = data.friends[index]; // added with DB

      data.friends[index] = {
        ...existingFriend,
        ...newFriend,
        discussions: appendArrayField(existingFriend.discussions, newFriend.discussions),
        commitments: appendArrayField(existingFriend.commitments, newFriend.commitments),
        progress: appendArrayField(existingFriend.progress, newFriend.progress),
        timeline: appendArrayField(existingFriend.timeline, newFriend.timeline)
      }; //update existing friend
    } else {
      // make sure new friend array fields initialized
      newFriend.discussions = appendArrayField([], newFriend.discussions);
      newFriend.commitments = appendArrayField([], newFriend.commitments);
      newFriend.progress = appendArrayField([], newFriend.progress);
      newFriend.timeline = appendArrayField([], newFriend.timeline);
      newFriend.hasCountedAsNewContact = false;
      newFriend.hasCountedAsNewPartner = false;

      data.friends.push(newFriend);
    }

    const friend = data.friends[index >= 0 ? index : data.friends.length - 1];

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
  await saveUserData(req, data);
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

  if (!user.keyIndicators) {
    user.keyIndicators = [];
  }
  if (!user.friends) {
    user.friends = [];
  }
  if (!user.lastResetDate) {
    user.lastResetDate = new Date().toISOString();
  }

  // added to fix DB problem with contact value starting as true
  if (user.friends) {
    user.friends.forEach(f => {
      if (typeof f.hasCountedAsNewContact !== 'boolean') {
        f.hasCountedAsNewContact = false;
      }
      if (typeof f.hasCountedAsNewPartner !== 'boolean') {
        f.hasCountedAsNewPartner = false;
      }
    });
  }

  await DB.updateUser(user);

  return user;
}

async function saveUserData(req, data) {
  const user = await findUser('token', req.cookies[authCookieName]);
  if (!user) return null;

  const updatedUser = {
    email: user.email,
    password: user.password,
    token: user.token,
    keyIndicators: data.keyIndicators,
    friends: data.friends,
    lastResetDate: data.lastResetDate ?? user.lastResetDate
  }
  console.log(user);
  console.log("updated user:", updatedUser.friends);
  await DB.updateUser(updatedUser);
  return updatedUser;
}

// add userInput to work with DB, signup creates userInput
async function createUser(userInput) {
  const passwordHash = await bcrypt.hash(userInput.password, 10);

  const user = { 
    email: userInput.email, 
    password: passwordHash, 
    token: uuid.v4(), 
    keyIndicators: userInput.keyIndicators ?? keyIndicators,
    friends: userInput.friends ?? [],
    lastResetDate: userInput.lastResetDate ?? new Date().toISOString(),
  };
  await DB.addUser(user);
  return user;
}

async function findUser(field, value) {
  if  (!value) return null;

  if (field === 'token') {
    return DB.getUserByToken(value);
  }
  return DB.getUser(value);
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

const httpService = app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});