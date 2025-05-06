require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dbManager = require('./db');
const urlRoutes = require('./routes/urlRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize and connect to database
const initDatabase = async () => {
  try {
    await dbManager.connect();
    
    // Routes
    app.use('/api/url', urlRoutes);
    app.use('/api/auth', authRoutes);
    app.use(express.static('public'));
    
    // Redirect route
    app.get('/:shortUrl', async (req, res) => {
      try {
        const db = dbManager.getAdapter();
        const Url = db.getModel('Url');
        
        const url = dbManager.dbType === 'mongodb' 
          ? await Url.findOne({ shortUrl: req.params.shortUrl })
          : await Url.findOne({ where: { shortUrl: req.params.shortUrl } });
        
        if (url) {
          if (dbManager.dbType === 'mongodb') {
            url.clicks++;
            await url.save();
          } else {
            url.clicks += 1;
            await url.save();
          }
          return res.redirect(url.originalUrl);
        } else {
          return res.status(404).json('No URL found');
        }
      } catch (err) {
        console.error(err);
        res.status(500).json('Server error');
      }
    });

    // Start the server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Failed to initialize application:', err);
    process.exit(1);
  }
};

initDatabase();
