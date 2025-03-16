// trainer.controller.js
export default function trainerController(app, db) {
    // Endpoint: Sign Up for Trainers
    app.post("/signup/trainer", (req, res) => {
      const { fullname, email, phone, password, specialization, certifications } = req.body;
      
      if (!fullname || !email || !phone || !password) {
        return res.status(400).json({ error: "Please fill all required fields." });
      }
      
      // Email validation
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        return res.status(400).json({ error: "Please enter a valid email address." });
      }
      
      // Phone validation
      const phonePattern = /^[0-9]{10}$/;
      if (!phonePattern.test(phone)) {
        return res.status(400).json({ error: "Please enter a valid 10-digit phone number." });
      }
      
      // Password validation
      if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters long." });
      }
      
      // First check if user exists
      db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (row) return res.status(400).json({ error: "Email already registered." });
        
        // Insert user into users table
        db.run(
          `INSERT INTO users (name, email, phone, password, userType) VALUES (?, ?, ?, ?, ?)`,
          [fullname, email, phone, password, "trainer"],
          function (err) {
            if (err) return res.status(500).json({ error: err.message });
            
            const userId = this.lastID;
            
            // Insert trainer data
            db.run(
              `INSERT INTO trainers (user_id, specialization, certifications) VALUES (?, ?, ?)`,
              [userId, specialization, certifications],
              function (err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ success: true, id: userId });
              }
            );
          }
        );
      });
    });
  
    // Get all trainers
    app.get("/trainers", (req, res) => {
      db.all(
        `SELECT u.id, u.name, u.email, u.phone, t.specialization, t.certifications
         FROM users u
         JOIN trainers t ON u.id = t.user_id
         WHERE u.userType = 'trainer'`,
        [],
        (err, rows) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json(rows);
        }
      );
    });
  
    // Get trainer by ID
    app.get("/trainers/:id", (req, res) => {
      const trainerId = req.params.id;
      
      db.get(
        `SELECT u.id, u.name, u.email, u.phone, t.specialization, t.certifications
         FROM users u
         JOIN trainers t ON u.id = t.user_id
         WHERE u.id = ? AND u.userType = 'trainer'`,
        [trainerId],
        (err, row) => {
          if (err) return res.status(500).json({ error: err.message });
          if (!row) return res.status(404).json({ error: "Trainer not found." });
          
          res.json(row);
        }
      );
    });
  
    // Update trainer profile
    app.put("/trainers/:id", (req, res) => {
      const trainerId = req.params.id;
      const { specialization, certifications } = req.body;
      
      db.run(
        `UPDATE trainers SET specialization = ?, certifications = ? WHERE user_id = ?`,
        [specialization, certifications, trainerId],
        function (err) {
          if (err) return res.status(500).json({ error: err.message });
          if (this.changes === 0) return res.status(404).json({ error: "Trainer not found." });
          
          res.json({ success: true, message: "Trainer profile updated successfully." });
        }
      );
    });
  
    // Search trainers by specialization
    app.get("/trainers/search/:specialization", (req, res) => {
      const specialization = `%${req.params.specialization}%`;
      
      db.all(
        `SELECT u.id, u.name, u.email, u.phone, t.specialization, t.certifications
         FROM users u
         JOIN trainers t ON u.id = t.user_id
         WHERE u.userType = 'trainer' AND t.specialization LIKE ?`,
        [specialization],
        (err, rows) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json(rows);
        }
      );
    });
  }