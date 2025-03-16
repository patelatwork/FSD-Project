// lab.controller.js
export default function labController(app, db) {
    // Endpoint: Sign Up for Lab Partners
    app.post("/signup/lab", (req, res) => {
      const { fullname, email, phone, password, labName, labAddress, licenseNumber } = req.body;
      
      if (!fullname || !email || !phone || !password || !labName || !labAddress || !licenseNumber) {
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
      
      // License number validation
      if (licenseNumber.length < 5) {
        return res.status(400).json({ error: "License number is too short." });
      }
      
      // First check if user exists
      db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (row) return res.status(400).json({ error: "Email already registered." });
        
        // Insert user into users table
        db.run(
          `INSERT INTO users (name, email, phone, password, userType) VALUES (?, ?, ?, ?, ?)`,
          [fullname, email, phone, password, "lab_partner"],
          function (err) {
            if (err) return res.status(500).json({ error: err.message });
            
            const userId = this.lastID;
            
            // Insert lab partner data
            db.run(
              `INSERT INTO lab_partners (user_id, lab_name, lab_address, license_number) VALUES (?, ?, ?, ?)`,
              [userId, labName, labAddress, licenseNumber],
              function (err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ success: true, id: userId });
              }
            );
          }
        );
      });
    });
  
    // Get all lab partners
    app.get("/lab-partners", (req, res) => {
      db.all(
        `SELECT u.id, u.name, u.email, u.phone, lp.lab_name, lp.lab_address, lp.license_number 
         FROM users u
         JOIN lab_partners lp ON u.id = lp.user_id
         WHERE u.userType = 'lab_partner'`,
        [],
        (err, rows) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json(rows);
        }
      );
    });
  
    // Get lab partner by ID
    app.get("/lab-partners/:id", (req, res) => {
      const labPartnerId = req.params.id;
      
      db.get(
        `SELECT u.id, u.name, u.email, u.phone, lp.lab_name, lp.lab_address, lp.license_number 
         FROM users u
         JOIN lab_partners lp ON u.id = lp.user_id
         WHERE u.id = ? AND u.userType = 'lab_partner'`,
        [labPartnerId],
        (err, row) => {
          if (err) return res.status(500).json({ error: err.message });
          if (!row) return res.status(404).json({ error: "Lab partner not found." });
          
          res.json(row);
        }
      );
    });
  
    // Update lab partner profile
    app.put("/lab-partners/:id", (req, res) => {
      const labPartnerId = req.params.id;
      const { fullname, phone, labName, labAddress, licenseNumber } = req.body;
      
      // Start a transaction
      db.serialize(() => {
        db.run("BEGIN TRANSACTION");
        
        // Update user information
        db.run(
          `UPDATE users SET name = ?, phone = ? WHERE id = ?`,
          [fullname, phone, labPartnerId],
          function (err) {
            if (err) {
              db.run("ROLLBACK");
              return res.status(500).json({ error: err.message });
            }
            
            // Update lab partner specific information
            db.run(
              `UPDATE lab_partners SET lab_name = ?, lab_address = ?, license_number = ? WHERE user_id = ?`,
              [labName, labAddress, licenseNumber, labPartnerId],
              function (err) {
                if (err) {
                  db.run("ROLLBACK");
                  return res.status(500).json({ error: err.message });
                }
                
                db.run("COMMIT");
                res.json({ success: true, message: "Lab partner profile updated successfully." });
              }
            );
          }
        );
      });
    });
  
    // Delete lab partner account
    app.delete("/lab-partners/:id", (req, res) => {
      const labPartnerId = req.params.id;
      
      // Check if the user exists and is a lab partner
      db.get(
        `SELECT u.id FROM users u 
         JOIN lab_partners lp ON u.id = lp.user_id 
         WHERE u.id = ? AND u.userType = 'lab_partner'`,
        [labPartnerId],
        (err, row) => {
          if (err) return res.status(500).json({ error: err.message });
          if (!row) return res.status(404).json({ error: "Lab partner not found." });
          
          // Delete the user (cascade will delete lab_partner record)
          db.run(`DELETE FROM users WHERE id = ?`, [labPartnerId], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, message: "Lab partner account deleted successfully." });
          });
        }
      );
    });
  }