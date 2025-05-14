const db = require("../config/db");

exports.addApplication = async (req, res) => {
  const { project_id, student_id } = await req.body;
  console.log("Received application data:", req.body);

  // Validate required fields
  if (!project_id || !student_id) {
    return res
      .status(400)
      .json({ message: "project_id and student_id are required" });
  }

  try {
    // Insert the application record into the applications table
    const [result] = await db.query(
      `INSERT INTO applications (project_id, student_id, applied_at) VALUES (?, ?, ?)`,
      [project_id, student_id, new Date()]
    );

    // Retrieve the application details after insertion
    const [newApplication] = await db.query(
      `SELECT * FROM applications WHERE application_id = ?`,
      [result.insertId]
    );

    // Respond with the application data
    res.status(201).json({
      message: "Application submitted successfully",
      application: newApplication[0],
    });
  } catch (error) {
    console.error("Error inserting application:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.acceptApplication = async (req, res) => {
  const { applicationId } = req.params; // Get applicationId from the request params

  try {
    // Step 1: Fetch the application details (specifically the student_id)
    const [application] = await db.execute(
      "SELECT student_id, project_id FROM applications WHERE application_id = ?",
      [applicationId]
    );

    // If no application is found
    if (application.length === 0) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Step 2: Extract the project_id and student_id
    const { student_id, project_id } = application[0];

    // Step 3: Update the assigned_to field in the projects table
    await db.execute(
      "UPDATE projects SET assigned_to = ? WHERE project_id = ?",
      [student_id, project_id]
    );

    // Step 4: Send a success response
    return res
      .status(200)
      .json({ message: "Application accepted and project assigned" });
  } catch (error) {
    console.error("Error accepting application:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

// This function retrieves applications for a specific student
exports.getApplicationsByStudentId = async (req, res) => {
  const { studentId } = req.params; // Get studentId from the URL parameter

  try {
    // Query the database to get applications for the student
    const [applications] = await db.execute(
      `SELECT a.application_id AS id,
              a.project_id AS projectId,
              p.title AS projectTitle,
              a.applied_at AS appliedDate,
              p.budget,
              p.deadline
       FROM applications a
       JOIN projects p ON a.project_id = p.project_id
       WHERE a.student_id = ?`,
      [studentId]
    );

    // If no applications are found for the student
    if (applications.length === 0) {
      return res.status(404).json({ message: "No applications found" });
    }

    // Return the applications as a response
    return res.status(200).json({ applications });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};