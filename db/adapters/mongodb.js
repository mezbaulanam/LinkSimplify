const mongoose = require('mongoose');

class MongoDBAdapter {
  constructor() {
    this.mongoose = mongoose;
    this.uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/linksimplify';
  }

  async connect() {
    try {
      await this.mongoose.connect(this.uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      console.log('Connected to MongoDB');
      
      // Load models
      require('../../models/User');
      require('../../models/Url');
      
      return this.mongoose;
    } catch (err) {
      console.error('MongoDB connection error:', err);
      throw err;
    }
  }

  getModel(name) {
    return this.mongoose.model(name);
  }
}

module.exports = MongoDBAdapter;