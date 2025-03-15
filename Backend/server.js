// updated_server.js
import express from "express";
import cors from "cors";
import pkg from "sqlite3";
const { verbose } = pkg;
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Import controllers
import userController from "./Controllers/user.controller.js";
import trainerController from "./Controllers/trainer.controller.js";
import labController from "./Controllers/lab.controller.js";

dotenv.config();

const sqlite3 = verbose();
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Create SQLite in-memory database
const db = new sqlite3.Database(":memory:", (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to SQLite in-memory database.");
    
    // Create users table
    db.run(
      `CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT NOT NULL,
        password TEXT NOT NULL,
        userType TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      (err) => {
        if (err) {
          console.error("Error creating users table:", err.message);
        } else {
          console.log("Users table created successfully.");
          
          // Insert a default user record
          db.run(
            `INSERT INTO users (name, email, phone, password, userType) VALUES (?, ?, ?, ?, ?)`,
            ["Dhruv", "dhruv@gmail.com", "1234567890", "123334", "fitness_enthusiast"],
            function (err) {
              if (err) {
                console.error("Error inserting default user:", err.message);
              } else {
                console.log("Default user record inserted");
                
                // Insert default user's fitness data
                db.run(
                  `INSERT INTO fitness_enthusiasts (user_id, goals, fitness_level) VALUES (?, ?, ?)`,
                  [this.lastID, "Get fit and healthy", "Beginner"],
                  (err) => {
                    if (err) {
                      console.error("Error inserting default fitness data:", err.message);
                    } else {
                      console.log("Default fitness data inserted");
                    }
                  }
                );
              }
            }
          );
        }
      }
    );
    
    // Create fitness_enthusiasts table
    db.run(
      `CREATE TABLE fitness_enthusiasts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE,
        goals TEXT,
        fitness_level TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`,
      (err) => {
        if (err) {
          console.error("Error creating fitness_enthusiasts table:", err.message);
        } else {
          console.log("Fitness enthusiasts table created successfully.");
        }
      }
    );
    
    // Create trainers table
    db.run(
      `CREATE TABLE trainers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE,
        specialization TEXT,
        certifications TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`,
      (err) => {
        if (err) {
          console.error("Error creating trainers table:", err.message);
        } else {
          console.log("Trainers table created successfully.");
        }
      }
    );
    
    // Create lab_partners table
    db.run(
      `CREATE TABLE lab_partners (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE,
        lab_name TEXT NOT NULL,
        lab_address TEXT NOT NULL,
        license_number TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`,
      (err) => {
        if (err) {
          console.error("Error creating lab_partners table:", err.message);
        } else {
          console.log("Lab partners table created successfully.");
        }
      }
    );
    
    // Create sessions table for workout sessions
    db.run(
      `CREATE TABLE sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        trainer_id INTEGER,
        session_date DATETIME,
        duration INTEGER, -- in minutes
        capacity INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (trainer_id) REFERENCES users(id) ON DELETE SET NULL
      )`,
      (err) => {
        if (err) {
          console.error("Error creating sessions table:", err.message);
        } else {
          console.log("Sessions table created successfully.");
        }
      }
    );
    
    // Create bookings table for session enrollments
    db.run(
      `CREATE TABLE bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id INTEGER,
        user_id INTEGER,
        status TEXT DEFAULT 'confirmed',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`,
      (err) => {
        if (err) {
          console.error("Error creating bookings table:", err.message);
        } else {
          console.log("Bookings table created successfully.");
        }
      }
    );
    
    // Create tests table for lab tests
    db.run(
      `CREATE TABLE tests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        lab_partner_id INTEGER,
        price DECIMAL(10,2),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (lab_partner_id) REFERENCES users(id) ON DELETE CASCADE
      )`,
      (err) => {
        if (err) {
          console.error("Error creating tests table:", err.message);
        } else {
          console.log("Tests table created successfully.");
        }
      }
    );
    
    // Create test_bookings table for lab test bookings
    db.run(
      `CREATE TABLE test_bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        test_id INTEGER,
        user_id INTEGER,
        booking_date DATETIME,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`,
      (err) => {
        if (err) {
          console.error("Error creating test_bookings table:", err.message);
        } else {
          console.log("Test bookings table created successfully.");
        }
      }
    );
    
    // Create requests table as in your original code
    db.run(
      `CREATE TABLE IF NOT EXISTS requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        listing_id INTEGER,
        item_name TEXT,
        category TEXT,
        item_image TEXT,
        status TEXT DEFAULT 'Pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (listing_id) REFERENCES listings(id)
      )`,
      (err) => {
        if (err) {
          console.error("Error creating requests table:", err.message);
        } else {
          console.log("Requests table created successfully.");
        }
      }
    );
  }
});

// Register controllers
userController(app, db);
trainerController(app, db);
labController(app, db);

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ message: "Fitness API running" });
});

// Frontend form processing endpoint
app.post("/api/signup", (req, res) => {
  const { fullname, email, phone, password, userType } = req.body;
  
  // Redirect to appropriate controller based on user type
  if (userType === "fitness") {
    const { goals, level } = req.body;
    
    // Forward request to user controller
    req.body = { fullname, email, phone, password, goals, level };
    app._router.handle(req, res, () => {
      console.log("Request forwarded to /signup/user endpoint");
    });
    
  } else if (userType === "trainer") {
    const { specialization, certifications } = req.body;
    
    // Forward request to trainer controller
    req.body = { fullname, email, phone, password, specialization, certifications };
    app._router.handle(req, res, () => {
      console.log("Request forwarded to /signup/trainer endpoint");
    });
    
  } else if (userType === "labpartner") {
    const { labName, labAddress, licenseNumber } = req.body;
    
    // Forward request to lab controller
    req.body = { fullname, email, phone, password, labName, labAddress, licenseNumber };
    req.url = "/signup/lab";
    app._router.handle(req, res, () => {
      console.log("Request forwarded to /signup/lab endpoint");
    });
    
  } else {
    res.status(400).json({ error: "Invalid user type" });
  }
});

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Close the database connection when the server shuts down
process.on("SIGINT", () => {
  db.close((err) => {
    if (err) {
      console.error("Error closing database:", err.message);
    } else {
      console.log("Database connection closed");
    }
    process.exit(0);
  });
});

export default app;