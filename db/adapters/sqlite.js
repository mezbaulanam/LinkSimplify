const { Sequelize, DataTypes } = require('sequelize');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

class SqliteAdapter {
  constructor() {
    const dbPath = process.env.SQLITE_PATH || './data/linksimplify.db';
    
    // Ensure the directory exists
    const dirPath = path.dirname(dbPath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    this.sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: dbPath,
      logging: false
    });

    this.models = {};
    this.initModels();
  }

  async connect() {
    try {
      await this.sequelize.authenticate();
      console.log('Connected to SQLite database');
      
      // Sync models with database (create tables if they don't exist)
      await this.sequelize.sync();
      console.log('Database synchronized');
      
      return this.sequelize;
    } catch (err) {
      console.error('SQLite connection error:', err);
      throw err;
    }
  }

  initModels() {
    // Initialize User model
    this.models.User = this.sequelize.define('User', {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      }
    }, {
      hooks: {
        beforeCreate: async (user) => {
          user.password = await bcrypt.hash(user.password, 10);
        }
      }
    });

    // Initialize Url model
    this.models.Url = this.sequelize.define('Url', {
      originalUrl: {
        type: DataTypes.STRING,
        allowNull: false
      },
      shortUrl: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      clicks: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      }
    });

    // Define relationships
    this.models.User.hasMany(this.models.Url, { foreignKey: 'userId' });
    this.models.Url.belongsTo(this.models.User, { foreignKey: 'userId' });
  }

  getModel(name) {
    if (name === 'User') {
      return this.models.User;
    } else if (name === 'Url') {
      return this.models.Url;
    }
    return null;
  }
}

module.exports = SqliteAdapter;