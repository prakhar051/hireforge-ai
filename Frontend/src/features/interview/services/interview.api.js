import axios from "axios";

const api = axios.create({

  baseURL: "http://localhost:3000/api",

  withCredentials: true,

});

/* =========================
   GENERATE INTERVIEW
========================= */

export const generateInterviewReport =
  async ({

    jobDescription,

    selfDescription,

    resumeFile,

  }) => {

    try {

      const formData = new FormData();

      /* =========================
         REQUIRED
      ========================= */

      formData.append(
        "jobDescription",
        jobDescription
      );

      /* =========================
         OPTIONAL
      ========================= */

      formData.append(
        "selfDescription",
        selfDescription || ""
      );

      if (resumeFile) {

        formData.append(
          "resume",
          resumeFile
        );
      }

      console.log(
        "🚀 Sending generate request..."
      );

      const response = await api.post(

        "/interview/generate",

        formData,

        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      console.log(
        "✅ Generate API response:",
        response.data
      );

      return response.data;

    } catch (err) {

      console.error(
        "❌ Generate Interview API Error:",
        err.response?.data || err.message
      );

      throw err;
    }
  };

/* =========================
   JOB STATUS
========================= */

export const getJobStatus =
  async (jobId) => {

    try {

      const response = await api.get(
        `/interview/job/${jobId}`
      );

      return response.data;

    } catch (err) {

      console.error(
        "❌ Job Status API Error:",
        err.response?.data || err.message
      );

      throw err;
    }
  };

/* =========================
   GET ALL REPORTS
========================= */

export const getAllInterviewReports =
  async () => {

    try {

      const response = await api.get(
        "/interview"
      );

      return response.data;

    } catch (err) {

      console.error(
        "❌ Get All Reports Error:",
        err.response?.data || err.message
      );

      throw err;
    }
  };

/* =========================
   GET REPORT BY ID
========================= */

export const getInterviewReportById =
  async (id) => {

    try {

      const response = await api.get(
        `/interview/${id}`
      );

      return response.data;

    } catch (err) {

      console.error(
        "❌ Get Report Error:",
        err.response?.data || err.message
      );

      throw err;
    }
  };

/* =========================
   GENERATE PDF
========================= */

export const generateResumePdf =
  async (id) => {

    try {

      const response = await api.post(

        `/interview/${id}/resume-pdf`,

        {},

        {
          responseType: "blob",
        }
      );

      return response.data;

    } catch (err) {

      console.error(
        "❌ Generate PDF Error:",
        err.response?.data || err.message
      );

      throw err;
    }
  };

export default api;