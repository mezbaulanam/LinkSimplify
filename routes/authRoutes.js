const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const sanitize = require('sanitize')();
const dbManager = require('../db');

router.post('/register', 
  body('username').trim().escape(),
  body('password').trim().escape(),
  async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, password } = req.body;
        const db = dbManager.getAdapter();
        const User = db.getModel('User');

        // Check if user already exists
        let user;
        if (dbManager.dbType === 'mongodb') {
            user = await User.findOne({ username });
        } else {
            user = await User.findOne({ where: { username } });
        }

        if (user) {
            return res.status(400).json({ error: 'Username already taken' });
        }

        // Create new user
        if (dbManager.dbType === 'mongodb') {
            user = new User({ username, password });
            // Hash password
            user.password = await bcrypt.hash(password, 10);
            await user.save();
        } else {
            user = await User.create({ username, password }); // Sequelize will hash it via hooks
        }

        // Create and return JWT token
        const payload = {
            id: user.id || user._id
        };

        const jwtSecret = process.env.JWT_SECRET || 'linkSimplifyDefaultSecret';
        const expiresIn = process.env.JWT_EXPIRES_IN || '1h';

        jwt.sign(
            payload,
            jwtSecret,
            { expiresIn },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

// Login
router.post('/login', 
  body('username').trim().escape(),
  body('password').trim().escape(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
      }

      const { username, password } = req.body;
      const db = dbManager.getAdapter();
      const User = db.getModel('User');
      
      let user;
      if (dbManager.dbType === 'mongodb') {
          user = await User.findOne({ username });
      } else {
          user = await User.findOne({ where: { username } });
      }

      if (!user) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      const jwtSecret = process.env.JWT_SECRET || 'linkSimplifyDefaultSecret';
      const expiresIn = process.env.JWT_EXPIRES_IN || '1h';
      
      const token = jwt.sign(
        { id: user.id || user._id }, 
        jwtSecret, 
        { expiresIn }
      );
      res.json({ token });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
});

router.get('/username', async (req, res) => {
  try {
    const token = req.header('x-auth-token');
    if (!token) {
      return res.status(401).json({ error: 'No token, authorization denied' });
    }

    const jwtSecret = process.env.JWT_SECRET || 'linkSimplifyDefaultSecret';
    const decoded = jwt.verify(token, jwtSecret);
    
    const db = dbManager.getAdapter();
    const User = db.getModel('User');
    
    let user;
    if (dbManager.dbType === 'mongodb') {
        user = await User.findById(decoded.id);
    } else {
        user = await User.findByPk(decoded.id);
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ username: user.username });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
