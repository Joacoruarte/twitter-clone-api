const express = require('express');
const router = express();
const Users = require('../modules/users');
const bcrypt = require('bcrypt');
const util = require('util');
const compareAsync = util.promisify(bcrypt.compare);
const jwt = require('jsonwebtoken');
const authenticateToken = require('../middlewares/authenticateToken');

router.get('/', async (req, res) => {
  const { offset, limit } = req.query;
  Users.getUsers({ req, res, offset, limit });
});

router.get('/context', authenticateToken, async (req, res) => {
  const { user_id } = req.context
  if(!user_id) return res.status(400).json({ message: 'User does not match' });

  const user = await Users.getUserById({ id: user_id, req, res });
  res.status(200).json({ user: user });
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const user = await Users.getUserById({ id, req, res });
  res.status(200).json({ user: user });
});

router.post('/checks', async (req, res) => {
  const { identifier } = req.body;
  console.log('INDENTIFIER: ', identifier);
  const user = await Users.getUserByIdentifier({ identifier, req, res });
  console.log('USER', user);
  if(!user) return res.status(400).json({ message: 'User does not match' });

  if (user.email_address === identifier || user.user_handle === identifier || user.phone_number === identifier) {
    const types = {
      email_address: 'Correo electrónico',
      user_handle: 'Usuario',
      phone_number: 'Teléfono'
    }
    const type = types[Object.keys(user).find(key => user[key] === identifier)];
    console.log('TYPE: ', type);
    return res.status(200).json({ identified: true, type });
  }
  res.status(400).json({ message: 'User does not match' });
});

router.post('/login', async (req, res) => {
  const { identifier, password } = req.body;
  const user = await Users.getUserByIdentifier({ identifier, req, res });

  if(!user) return res.status(400).json({ message: 'User does not match' });

  if (user.email_address === identifier || user.user_handle === identifier || user.phone_number === identifier) {
    const match = await compareAsync(password, user.password_hash)

    const userForToken = {
      user_id: user.user_id,
      email: user.email_address,
      user_handle: user.user_handle,
    }

    const token = jwt.sign(userForToken, process.env.JWT_SECRET, { expiresIn: 30 * 24 * 60 * 60 * 1000 });
    
    if(match) {
      res.cookie('set-cookie', token, {
        httpOnly: false,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 días
      });

      return res.status(200).json({ message: 'You are logged in' })
    }

    return res.status(400).json({ message: 'Password does not match' });
  }
  res.status(400).json({ message: 'User does not match' });
})

router.post('/register', async (req, res) => {
  const { first_name, last_name, email, password, birthday } = req.body

  const userStatusCreated = await Users.createUser({ first_name, last_name, email, password, birthday, req, res });

  if(userStatusCreated.status === 1) {

    const userForToken = {
      user_id: userStatusCreated.user.user_id,
      email: userStatusCreated.user.email_address,
      user_handle: userStatusCreated.user.user_handle,
    }

    const token = jwt.sign(userForToken, process.env.JWT_SECRET, { expiresIn: 30 * 24 * 60 * 60 * 1000 });
    
    res.cookie('set-cookie', token, {
      httpOnly: false,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 días
    });

    res.status(200).json({ message: 'User created successfully' });
  } else {
    res.status(400).json({ message: 'Something some wrong' });
  }
})

router.get('/:id/followers', async (req, res) => {
  const { id } = req.params;
  const { offset, limit } = req.query;
  Users.getUserFollowers({ id, res, offset, limit });
});

module.exports = router;
