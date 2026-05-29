const pdfParseLib = require("pdf-parse");
const interviewQueue = require("../queues/interview.queue");
const interviewReportModel = require("../models/interviewReport.model");

/* =========================
   GENERATE INTERVIEW REPORT (ASYNC)
========================= */
async function generateInterviewReportController(req, res) {
  try {
    console.log("📥 Incoming request");

    // ✅ Validate file
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        message: "Resume file is required",
      });
    }

    const { selfDescription, jobDescription } = req.body;

    // ✅ Validate input
    if (!selfDescription || !jobDescription) {
      return res.status(400).json({
        message: "Self description and job description are required",
      });
    }

    // ✅ Handle pdf-parse (CJS + ESM safe)
    const pdfParse =
      typeof pdfParseLib === "function"
        ? pdfParseLib
        : pdfParseLib?.default;

    if (!pdfParse) {
      throw new Error("pdf-parse import failed");
    }

    // ✅ Parse PDF
    const pdfData = await pdfParse(req.file.buffer);

    if (!pdfData || !pdfData.text) {
      throw new Error("Failed to extract text from PDF");
    }

    const resumeText = pdfData.text;

    console.log("📄 Resume parsed length:", resumeText.length);

    // ✅ Add job to queue
    const job = await interviewQueue.add("generate-report", {
      resumeText,
      selfDescription,
      jobDescription,
      userId: req.user?.id,
    });

    console.log("🚀 Job added to queue:", job.id);

    return res.status(202).json({
      message: "Interview report is being generated",
      jobId: job.id,
    });

  } catch (error) {
    console.error("❌ Queue Error:", error.message);

    return res.status(500).json({
      message: "Failed to start report generation",
    });
  }
}

/* =========================
   JOB STATUS CHECK
========================= */
async function getJobStatusController(req, res) {
  try {
    const { jobId } = req.params;

    if (!jobId) {
      return res.status(400).json({
        message: "Job ID is required",
      });
    }

    const job = await interviewQueue.getJob(jobId);

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    const state = await job.getState();

    console.log(`📊 Job ${jobId} status:`, state);

    return res.status(200).json({
      state,
      result: job.returnvalue || null,
    });

  } catch (error) {
    console.error("❌ Job Status Error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch job status",
    });
  }
}

/* =========================
   GET REPORT BY ID
========================= */
async function getInterviewReportByIdController(req, res) {
  try {
    const { id } = req.params;

    const interviewReport = await interviewReportModel.findOne({
      _id: id,
      user: req.user.id,
    });

    if (!interviewReport) {
      return res.status(404).json({
        message: "Interview report not found",
      });
    }

    return res.status(200).json({
      message: "Interview report fetched successfully",
      interviewReport,
    });

  } catch (error) {
    console.error("❌ Fetch Report Error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch interview report",
    });
  }
}

/* =========================
   GET ALL REPORTS
========================= */
async function getAllInterviewReportsController(req, res) {
  try {
    const reports = await interviewReportModel
      .find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .select(
        "-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan"
      );

    return res.status(200).json({
      message: "Interview reports fetched successfully",
      reports,
    });

  } catch (error) {
    console.error("❌ Fetch All Reports Error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch interview reports",
    });
  }
}

/* =========================
   GENERATE RESUME PDF
========================= */
async function generateResumePdfController(req, res) {
  try {
    const { id } = req.params;

    const interviewReport = await interviewReportModel.findById(id);

    if (!interviewReport) {
      return res.status(404).json({
        message: "Interview report not found",
      });
    }

    const { resume, jobDescription, selfDescription } = interviewReport;

    const { generateResumePdf } = require("../services/ai.service");

    const pdfBuffer = await generateResumePdf({
      resume,
      jobDescription,
      selfDescription,
    });

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=resume_${id}.pdf`,
    });

    return res.send(pdfBuffer);

  } catch (error) {
    console.error("❌ PDF Generation Error:", error.message);

    return res.status(500).json({
      message: "Failed to generate resume PDF",
    });
  }
}

/* =========================
   EXPORTS
========================= */
module.exports = {
  generateInterviewReportController,
  getJobStatusController,
  getInterviewReportByIdController,
  getAllInterviewReportsController,
  generateResumePdfController,
};