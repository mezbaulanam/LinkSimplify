const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Url = require('../models/Url');
const fs = require('fs');
const path = require('path');

// BL
const blacklistPath = path.join(__dirname, '..', 'middleware', 'blacklist.json');
const blacklistData = fs.readFileSync(blacklistPath, 'utf8');
const { blacklistedWords } = JSON.parse(blacklistData);

function generateRandomId(length = 6) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}
router.post('/shorten', auth, async (req, res) => {
  try {
    let { originalUrl, customShortUrl } = req.body;
    
    if (!originalUrl) {
      return res.status(400).json({ error: 'Original URL is required' });
    }

    if (customShortUrl) {
      // Check if the custom URL is blacklisted
      if (blacklistedWords.some(word => customShortUrl.toLowerCase().includes(word))) {
        return res.status(400).json({ error: 'This custom URL is not allowed' });
      }

      // Check if the custom URL already exists
      const existingUrl = await Url.findOne({ shortUrl: customShortUrl });
      if (existingUrl) {
        return res.status(400).json({ error: 'This custom URL is already in use' });
      }
    } else {
      // Generate a random short URL if no custom URL is provided
      do {
        customShortUrl = generateRandomId();
      } while (await Url.findOne({ shortUrl: customShortUrl }));
    }

    const url = new Url({
      originalUrl,
      shortUrl: customShortUrl,
      user: req.user.id
    });

    await url.save();
    res.json(url);
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
    const urls = await Url.find({ user: req.user.id });
    res.json(urls);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});
// Delete a URL
router.delete('/:id', auth, async (req, res) => {
  try {
    const url = await Url.findById(req.params.id);
    if (!url) return res.status(404).json({ error: 'URL not found' });
    if (url.user.toString() !== req.user.id) return res.status(401).json({ error: 'Not authorized' });
    await url.deleteOne()
    res.json({ message: 'URL removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a URL
router.put('/:id', auth, async (req, res) => {
  try {
    let url = await Url.findById(req.params.id);
    if (!url) return res.status(404).json({ error: 'URL not found' });
    if (url.user.toString() !== req.user.id) return res.status(401).json({ error: 'Not authorized' });
    url.originalUrl = req.body.originalUrl || url.originalUrl;
    url = await url.save();
    res.json(url);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get analytics for a URL
router.get('/analytics/:id', auth, async (req, res) => {
  try {
    const url = await Url.findById(req.params.id);
    if (!url) return res.status(404).json({ error: 'URL not found' });
    if (url.user.toString() !== req.user.id) return res.status(401).json({ error: 'Not authorized' });
    res.json({ clicks: url.clicks, createdAt: url.createdAt });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
