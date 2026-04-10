import mysql from "mysql2";
import dotenv from "dotenv";
import { AsyncLocalStorage } from 'async_hooks';

dotenv.config();

// console.log("👉 db.js loaded");

// Storage for the current request's database connection
export const dbStorage = new AsyncLocalStorage();

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: false
  } : null
};

// Master connection (always points to superadmin_db for user auth)
const masterDb = mysql.createPool({
  ...dbConfig,
  database: process.env.DB_NAME || "superadmin_db",
});

// Template connection (points to the DB we clone tables from)
export const templateDb = mysql.createPool({
  ...dbConfig,
  database: process.env.TEMPLATE_DB || "garment_db",
});

const tenantPools = {};

export const getTenantDb = (dbName) => {
  if (!dbName) return masterDb;
  
  if (!tenantPools[dbName]) {
    // console.log(`📡 Connecting to tenant database: ${dbName}`);
    tenantPools[dbName] = mysql.createPool({
      ...dbConfig,
      database: dbName,
    });
  }
  return tenantPools[dbName];
};

/**
 * Middleware to detect tenant and inject connection into AsyncLocalStorage
 */
export const tenantMiddleware = (req, res, next) => {
  // Central system routes hit the master database (superadmin_db)
  if (req.url.startsWith('/api/auth') || req.url.startsWith('/api/superadmin')) {
    dbStorage.run(masterDb, () => {
      next();
    });
    return;
  }

  // Get db_name from header (sent by frontend)
  const dbName = req.headers['x-db-name'];
  
  const connection = dbName ? getTenantDb(dbName) : masterDb;
  
  // Run subsequent middleware and routes within the context of this connection
  dbStorage.run(connection, () => {
    next();
  });
};

// Proxy that automatically uses the connection from AsyncLocalStorage
const dbProxy = new Proxy(masterDb, {
  get(target, prop) {
    // 1. Direct access to target for specific properties
    if (prop === 'constructor' || prop === 'prototype' || typeof prop === 'symbol') {
      return target[prop];
    }
    
    // 2. Identification of the active database
    const activeDb = dbStorage.getStore() || masterDb;
    
    // 3. Special handling for some common properties
    if (prop === 'promise') {
      if (typeof activeDb.promise === 'function') {
        return activeDb.promise.bind(activeDb);
      }
      return target.promise.bind(target);
    }

    try {
      const value = activeDb[prop];
      
      if (typeof value === 'function') {
        // Essential: bind the function to activeDb so 'this' is correct inside it
        return value.bind(activeDb);
      }
      
      // Fallback for missing property on activeDb
      if (value === undefined) {
        return target[prop];
      }
      
      return value;
    } catch (err) {
      // console.error(`❌ Proxy error accessing "${String(prop)}":`, err.message);
      return target[prop];
    }
  }
});

export default dbProxy;
