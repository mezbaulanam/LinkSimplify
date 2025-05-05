const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const fs = require('fs');
const path = require('path');
const { body, validationResult } = require('express-validator');
const dbManager = require('../db');

// BL
const blacklistPath = path.join(__dirname, '..', 'middleware', 'blacklist.json');
const blacklistData = fs.readFileSync(blacklistPath, 'utf8');
const { blacklistedWords } = JSON.parse(blacklistData);

function generateRandomId(length = 6) {
  const urlLength = process.env.URL_LENGTH || length;
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < urlLength; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

router.post('/shorten', auth, 
  body('originalUrl').isURL().withMessage('Invalid URL format'),
  async (req, res) => {
  try {
    let { originalUrl, customShortUrl } = req.body;
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!originalUrl) {
      return res.status(400).json({ error: 'Original URL is required' });
    }

    const db = dbManager.getAdapter();
    const Url = db.getModel('Url');

    if (customShortUrl) {
      // Check if the custom URL is blacklisted
      if (blacklistedWords.some(word => customShortUrl.toLowerCase().includes(word))) {
        return res.status(400).json({ error: 'This custom URL is not allowed' });
      }

      // Check if the custom URL already exists
      let existingUrl;
      if (dbManager.dbType === 'mongodb') {
        existingUrl = await Url.findOne({ shortUrl: customShortUrl });
      } else {
        existingUrl = await Url.findOne({ where: { shortUrl: customShortUrl } });
      }

      if (existingUrl) {
        return res.status(400).json({ error: 'This custom URL is already in use' });
      }
    } else {
      // Generate a random short URL if no custom URL is provided
      let isUnique = false;
      while (!isUnique) {
        customShortUrl = generateRandomId();
        
        let existingUrl;
        if (dbManager.dbType === 'mongodb') {
          existingUrl = await Url.findOne({ shortUrl: customShortUrl });
        } else {
          existingUrl = await Url.findOne({ where: { shortUrl: customShortUrl } });
        }
        
        if (!existingUrl) {
          isUnique = true;
        }
      }
    }

    let url;
    if (dbManager.dbType === 'mongodb') {
      url = new Url({
        originalUrl,
        shortUrl: customShortUrl,
        user: req.user.id
      });
      await url.save();
    } else {
      url = await Url.create({
        originalUrl,
        shortUrl: customShortUrl,
        userId: req.user.id,
        clicks: 0
      });
    }

    res.json({
      id: url.id || url._id,
      originalUrl: url.originalUrl,
      shortUrl: url.shortUrl,
      clicks: url.clicks,
      createdAt: url.createdAt
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all URLs for a user
router.get('/myurls', auth, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const db = dbManager.getAdapter();
    const Url = db.getModel('Url');
    
    let urls;
    if (dbManager.dbType === 'mongodb') {
      urls = await Url.find({ user: req.user.id });
    } else {
      urls = await Url.findAll({ 
        where: { userId: req.user.id },
        raw: true
      });
      
      // Transform the Sequelize results to match the MongoDB format
      urls = urls.map(url => ({
        _id: url.id,
        originalUrl: url.originalUrl,
        shortUrl: url.shortUrl,
        clicks: url.clicks,
        createdAt: url.createdAt
      }));
    }
    
    res.json(urls);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a URL
router.delete('/:id', auth, async (req, res) => {
  try {
    const db = dbManager.getAdapter();
    const Url = db.getModel('Url');
    
    let url;
    if (dbManager.dbType === 'mongodb') {
      url = await Url.findById(req.params.id);
      if (!url) return res.status(404).json({ error: 'URL not found' });
      if (url.user.toString() !== req.user.id) return res.status(401).json({ error: 'Not authorized' });
      await url.deleteOne();
    } else {
      url = await Url.findByPk(req.params.id);
      if (!url) return res.status(404).json({ error: 'URL not found' });
      if (url.userId !== parseInt(req.user.id)) return res.status(401).json({ error: 'Not authorized' });
      await url.destroy();
    }
    
    res.json({ message: 'URL removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a URL
router.put('/:id', auth, async (req, res) => {
  try {
    const db = dbManager.getAdapter();
    const Url = db.getModel('Url');
    
    let url;
    if (dbManager.dbType === 'mongodb') {
      url = await Url.findById(req.params.id);
      if (!url) return res.status(404).json({ error: 'URL not found' });
      if (url.user.toString() !== req.user.id) return res.status(401).json({ error: 'Not authorized' });
      
      url.originalUrl = req.body.originalUrl || url.originalUrl;
      url = await url.save();
    } else {
      url = await Url.findByPk(req.params.id);
      if (!url) return res.status(404).json({ error: 'URL not found' });
      if (url.userId !== parseInt(req.user.id)) return res.status(401).json({ error: 'Not authorized' });
      
      url.originalUrl = req.body.originalUrl || url.originalUrl;
      await url.save();
    }
    
    res.json({
      id: url.id || url._id,
      originalUrl: url.originalUrl,
      shortUrl: url.shortUrl,
      clicks: url.clicks,
      createdAt: url.createdAt
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get analytics for a URL
router.get('/analytics/:id', auth, async (req, res) => {
  try {
    const db = dbManager.getAdapter();
    const Url = db.getModel('Url');
    
    let url;
    if (dbManager.dbType === 'mongodb') {
      url = await Url.findById(req.params.id);
      if (!url) return res.status(404).json({ error: 'URL not found' });
      if (url.user.toString() !== req.user.id) return res.status(401).json({ error: 'Not authorized' });
    } else {
      url = await Url.findByPk(req.params.id);
      if (!url) return res.status(404).json({ error: 'URL not found' });
      if (url.userId !== parseInt(req.user.id)) return res.status(401).json({ error: 'Not authorized' });
    }
    
    res.json({ 
      clicks: url.clicks, 
      createdAt: url.createdAt 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
