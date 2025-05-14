const db = require("../config/db");

// Sign Up
exports.addStudent = async (req, res) => {
  const { name, email, password, bio } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "name, email, and password are required" });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO students (name, email, password, bio) VALUES (?, ?, ?, ?)`,
      [name, email, password, bio || ""]
    );

    const [newStudent] = await db.query(
      `SELECT * FROM students WHERE student_id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      message: "Student added successfully",
      student: newStudent[0],
    });
  } catch (error) {
    console.error("Error inserting student:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Login
exports.loginStudent = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email and password are required" });

  try {
    const [rows] = await db.query(
      `SELECT * FROM students WHERE email = ? AND password = ?`,
      [email, password]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.status(200).json({
      message: "Login successful",
      user: rows[0],
      userType: "student",
    });
  } catch (error) {
    console.error("Student login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
