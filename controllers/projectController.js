const e = require("express");
const db = require("../config/db");

// Add new project
exports.addProject = async (req, res) => {
  const { client_id, title, description, budget, deadline, skills_required } =
    req.body;

  // Ensure client_id, title, description, and skills are provided
  if (
    !client_id ||
    !title ||
    !description ||
    !Array.isArray(skills_required) ||
    skills_required.length === 0
  ) {
    return res.status(400).json({
      message: "client_id, title, description, and skills are required",
    });
  }
  const budgetData = budget || 0.0;

  const deadlineData = deadline || null;

  const sql = `
    INSERT INTO projects 
    (client_id, title, description, budget, deadline, skills_required, assigned_to, is_completed) 
    VALUES (?, ?, ?, ?, ?, ?, NULL, FALSE)
  `;

  const values = [
    client_id,
    title,
    description,
    budgetData,
    deadlineData,
    JSON.stringify(skills_required),
  ];

  try {
    const [result] = await db.query(sql, values);
    res.status(201).json({
      message: "Project added successfully",
      project_id: result.insertId,
    });
  } catch (err) {
    console.error("MySQL error:", err);
    res.status(500).json({ message: "Database error", error: err });
  }
};

// Get all unassigned and incomplete projects
exports.getAllProjects = async (req, res) => {
  try {
    const sql = `
      SELECT * FROM projects 
      WHERE assigned_to IS NULL AND is_completed = FALSE
      ORDER BY created_at DESC
    `;
    const [results] = await db.query(sql);

    // Parse the 'skills_required' field from JSON string to array for each project
    const projects = results.map((project) => {
      if (project.skills_required) {
        try {
          project.skills = JSON.parse(project.skills_required); // Parse stringified JSON to array
        } catch (e) {
          console.error("Error parsing skills:", e);
          project.skills = []; // In case of an error, set skills as empty array
        }
      } else {
        project.skills = []; // If no skills_required, set it as empty array
      }
      return project;
    });

    res.json(projects); // Send the projects with parsed skills array to the frontend
  } catch (err) {
    console.error("MySQL error:", err);
    res.status(500).json({ message: "Database error", error: err });
  }
};

exports.getClientData = async (req, res) => {
  const { clientId } = req.params;

  try {
    // Step 1: Fetch projects where assigned_to or is_completed is not set
    const [projects] = await db.execute(
      "SELECT * FROM projects WHERE client_id = ? AND (assigned_to IS NULL OR is_completed = 0)",
      [clientId]
    );

    // Step 2: Fetch applications for the above projects
    const projectIds = projects.map((project) => project.project_id);
    console.log("Project IDs:", projectIds);
    const query = `
  SELECT 
    a.application_id, 
    a.project_id, 
    a.student_id, 
    a.applied_at, 
    s.name AS student_name, 
    s.email AS student_email,
    p.title AS project_title,
    p.description AS project_description,
    p.budget AS project_budget
  FROM applications a
  JOIN students s ON a.student_id = s.student_id
  JOIN projects p ON a.project_id = p.project_id
  WHERE a.project_id IN (${projectIds.map(() => "?").join(", ")})`;

    const [applications] = await db.execute(query, projectIds);

    // Step 5: Fetch projects where assigned_to and is_completed are set
    const [assignedProjects] = await db.execute(
      "SELECT * FROM projects WHERE client_id = ? AND assigned_to IS NOT NULL OR is_completed = 1",
      [clientId]
    );

    // Step 6: Send all data in the response
    res.status(200).json({
      projects, // Projects where assigned_to and is_completed are not set
      applications: applications, // Applications with student details
      assignedProjects, // Projects that are assigned and completed
    });
  } catch (error) {
    console.error("Error fetching client data:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Update project status
exports.updateProjectStatus = async (req, res) => {};
