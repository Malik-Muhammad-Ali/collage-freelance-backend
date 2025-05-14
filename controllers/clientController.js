const db = require("../config/db");

// Sign Up
exports.addClient = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "name, email, and password are required" });
  }

  try {
    // Insert the client
    const [result] = await db.query(
      `INSERT INTO clients (name, email, password, created_at) VALUES (?, ?, ?, ?)`,
      [name, email, password, new Date()]
    );

    // Retrieve the newly inserted client
    const [newClient] = await db.query(
      `SELECT * FROM clients WHERE client_id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      message: "Client added successfully",
      client: newClient[0],
    });
  } catch (error) {
    console.error("Error inserting client:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Login
exports.loginClient = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email and password are required" });

  try {
    const [rows] = await db.query(
      `SELECT * FROM clients WHERE email = ? AND password = ?`,
      [email, password]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.status(200).json({
      message: "Login successful",
      user: rows[0],
      userType: "client",
    });
  } catch (error) {
    console.error("Client login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
