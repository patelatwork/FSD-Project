// user.controller.js
export default function userController(app, db) {
  // Endpoint: Sign Up for Fitness Enthusiasts
  app.post("/signup/user", (req, res) => {
    const { fullname, email, phone, password, goals, level } = req.body;

    if (!fullname || !email || !phone || !password) {
      return res
        .status(400)
        .json({ error: "Please fill all required fields." });
    }

    // Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return res
        .status(400)
        .json({ error: "Please enter a valid email address." });
    }

    // Phone validation
    const phonePattern = /^[0-9]{10}$/;
    if (!phonePattern.test(phone)) {
      return res
        .status(400)
        .json({ error: "Please enter a valid 10-digit phone number." });
    }

    // Password validation
    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters long." });
    }

    // First check if user exists
    db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (row)
        return res.status(400).json({ error: "Email already registered." });

      // Insert user into users table
      db.run(
        `INSERT INTO users (name, email, phone, password, userType) VALUES (?, ?, ?, ?, ?)`,
        [fullname, email, phone, password, "fitness_enthusiast"],
        function (err) {
          if (err) return res.status(500).json({ error: err.message });

          const userId = this.lastID;

          // Insert fitness enthusiast data
          db.run(
            `INSERT INTO fitness_enthusiasts (user_id, goals, fitness_level) VALUES (?, ?, ?)`,
            [userId, goals, level],
            function (err) {
              if (err) return res.status(500).json({ error: err.message });
              res.json({ success: true, id: userId });
            }
          );
        }
      );
    });
  });

  // Endpoint: Sign In
  app.post("/signin", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Please fill in email and password." });
    }

    db.get(
      `SELECT u.*, fe.goals, fe.fitness_level, t.specialization, t.certifications 
         FROM users u
         LEFT JOIN fitness_enthusiasts fe ON u.id = fe.user_id
         LEFT JOIN trainers t ON u.id = t.user_id
         WHERE u.email = ? AND u.password = ?`,
      [email, password],
      (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row)
          return res.status(401).json({ error: "Invalid credentials." });

        // Remove password from response
        const { password, ...userWithoutPassword } = row;
        req.session.user = userWithoutPassword;

        res.json({ success: true, user: userWithoutPassword });
      }
    );
  });

  // Get user profile by ID
  app.get("/users/:id", (req, res) => {
    const userId = req.params.id;

    db.get(
      `SELECT u.id, u.name, u.email, u.phone, u.userType, 
                fe.goals, fe.fitness_level, 
                t.specialization, t.certifications
         FROM users u
         LEFT JOIN fitness_enthusiasts fe ON u.id = fe.user_id
         LEFT JOIN trainers t ON u.id = t.user_id
         WHERE u.id = ?`,
      [userId],
      (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: "User not found." });

        res.json(row);
      }
    );
  });

  // Get all users
  app.get("/users", (req, res) => {
    db.all(
      `SELECT u.id, u.name, u.email, u.phone, u.userType FROM users u`,
      [],
      (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
      }
    );
  });

  // Update user profile
  app.put("/users/:id", (req, res) => {
    const userId = req.params.id;
    const { fullname, phone } = req.body;

    db.run(
      `UPDATE users SET name = ?, phone = ? WHERE id = ?`,
      [fullname, phone, userId],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0)
          return res.status(404).json({ error: "User not found." });

        res.json({ success: true, message: "Profile updated successfully." });
      }
    );
  });

  // Delete user account
  app.delete("/users/:id", (req, res) => {
    const userId = req.params.id;

    db.run(`DELETE FROM users WHERE id = ?`, [userId], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0)
        return res.status(404).json({ error: "User not found." });

      res.json({ success: true, message: "Account deleted successfully." });
    });
  });
}
