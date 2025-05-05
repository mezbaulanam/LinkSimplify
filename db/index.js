const mongoose = require('mongoose');
const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');
const MongoAdapter = require('./adapters/mongodb');
const SqliteAdapter = require('./adapters/sqlite');

class DatabaseManager {
  constructor() {
    this.adapter = null;
    
    // Get DB type from environment variable
    this.dbType = process.env.DB_TYPE;
    
    if (!this.dbType) {
      console.error('Error: DB_TYPE environment variable is not set');
      console.error('Please set DB_TYPE to either "mongodb" or "sqlite" in your .env file');
      process.exit(1);
    }
    
    if (this.dbType !== 'mongodb' && this.dbType !== 'sqlite') {
      console.error(`Error: Unsupported database type: ${this.dbType}`);
      console.error('DB_TYPE must be either "mongodb" or "sqlite"');
      process.exit(1);
    }
  }

  async connect() {
    try {
      console.log(`Using ${this.dbType} database`);
      
      if (this.dbType === 'mongodb') {
        this.adapter = new MongoAdapter();
      } else if (this.dbType === 'sqlite') {
        this.adapter = new SqliteAdapter();
      }
      
      await this.adapter.connect();
      return this.adapter;
    } catch (error) {
      console.error('Database connection error:', error);
      throw error;
    }
  }

  getAdapter() {
    return this.adapter;
  }
}

module.exports = new DatabaseManager();