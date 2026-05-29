import React, { useState, useRef } from "react";
import "../style/home.scss";
import { useInterview } from "../hooks/useInterview.js";
import { useNavigate } from "react-router";

const Home = () => {

    const {
        loading,
        generateReport,
        reports = [],
    } = useInterview();

    const [jobDescription, setJobDescription] = useState("");
    const [selfDescription, setSelfDescription] = useState("");

    const [generating, setGenerating] = useState(false);

    const resumeInputRef = useRef();

    const navigate = useNavigate();

    /* =========================
       GENERATE REPORT
    ========================= */

    const handleGenerateReport = async () => {

        try {

            const resumeFile =
                resumeInputRef.current?.files?.[0];

            if (
                !resumeFile &&
                !selfDescription.trim()
            ) {
                alert(
                    "Please upload resume or add self description"
                );
                return;
            }

            if (!jobDescription.trim()) {
                alert("Job description is required");
                return;
            }

            setGenerating(true);

            console.log("🚀 Starting report generation...");

            const data = await generateReport({
                jobDescription,
                selfDescription,
                resumeFile,
            });

            console.log("🔥 GENERATE RESPONSE:", data);

            if (!data?.jobId) {
                alert("Failed to create job");
                setGenerating(false);
                return;
            }

            const jobId = data.jobId;

            /* =========================
               POLLING
            ========================= */

            const pollInterval = setInterval(
                async () => {

                    try {

                        console.log(
                            "📡 Checking job:",
                            jobId
                        );

                        const response = await fetch(
                            `http://localhost:3000/api/interview/job/${jobId}`,
                            {
                                credentials: "include",
                            }
                        );

                        const result =
                            await response.json();

                        console.log(
                            "📊 JOB STATUS:",
                            result
                        );

                        if (
                            result.state === "completed"
                        ) {

                            clearInterval(
                                pollInterval
                            );

                            setGenerating(false);

                            const reportId =
                                result.result?._id;

                            if (!reportId) {

                                alert(
                                    "Report generated but ID missing"
                                );

                                return;
                            }

                            console.log(
                                "✅ Navigating to:",
                                reportId
                            );

                            navigate(
                                `/interview/${reportId}`
                            );
                        }

                        if (
                            result.state === "failed"
                        ) {

                            clearInterval(
                                pollInterval
                            );

                            setGenerating(false);

                            alert(
                                "Interview report generation failed"
                            );
                        }

                    } catch (err) {

                        clearInterval(
                            pollInterval
                        );

                        setGenerating(false);

                        console.error(
                            "Polling error:",
                            err
                        );

                        alert(
                            "Failed while checking report status"
                        );
                    }

                },

                3000
            );

        } catch (err) {

            setGenerating(false);

            console.error(
                "Generate Report Error:",
                err
            );

            alert("Failed to generate report");
        }
    };

    /* =========================
       LOADING SCREEN
    ========================= */

    if (loading) {
        return (
            <main className="loading-screen">
                <h1>
                    Loading your interview plan...
                </h1>
            </main>
        );
    }

    return (

        <div className="home-page">

            {/* HEADER */}

            <header className="page-header">

                <h1>
                    Create Your Custom{" "}
                    <span className="highlight">
                        Interview Plan
                    </span>
                </h1>

                <p>
                    Let AI analyze your resume
                    and job requirements to build
                    a winning interview strategy.
                </p>

            </header>

            {/* MAIN CARD */}

            <div className="interview-card">

                <div className="interview-card__body">

                    {/* LEFT PANEL */}

                    <div className="panel panel--left">

                        <div className="panel__header">

                            <h2>
                                Target Job Description
                            </h2>

                            <span className="badge badge--required">
                                Required
                            </span>

                        </div>

                        <textarea
                            value={jobDescription}
                            onChange={(e) =>
                                setJobDescription(
                                    e.target.value
                                )
                            }
                            className="panel__textarea"
                            placeholder="Paste full job description..."
                            maxLength={5000}
                        />

                        <div className="char-counter">
                            {jobDescription.length} / 5000
                        </div>

                    </div>

                    {/* DIVIDER */}

                    <div className="panel-divider" />

                    {/* RIGHT PANEL */}

                    <div className="panel panel--right">

                        <div className="panel__header">
                            <h2>Your Profile</h2>
                        </div>

                        {/* RESUME */}

                        <div className="upload-section">

                            <label
                                className="section-label"
                            >
                                Upload Resume
                            </label>

                            <label
                                className="dropzone"
                                htmlFor="resume"
                            >

                                <p className="dropzone__title">
                                    Click to upload resume
                                </p>

                                <p className="dropzone__subtitle">
                                    PDF or DOCX
                                </p>

                                <input
                                    ref={resumeInputRef}
                                    hidden
                                    type="file"
                                    id="resume"
                                    accept=".pdf,.docx"
                                />

                            </label>

                        </div>

                        {/* OR */}

                        <div className="or-divider">
                            <span>OR</span>
                        </div>

                        {/* SELF DESCRIPTION */}

                        <div className="self-description">

                            <label
                                className="section-label"
                            >
                                Self Description
                            </label>

                            <textarea
                                value={selfDescription}
                                onChange={(e) =>
                                    setSelfDescription(
                                        e.target.value
                                    )
                                }
                                className="panel__textarea panel__textarea--short"
                                placeholder="Describe your skills..."
                            />

                        </div>

                    </div>

                </div>

                {/* FOOTER */}

                <div className="interview-card__footer">

                    <span className="footer-info">

                        {generating
                            ? "Generating interview strategy..."
                            : "AI-Powered Strategy Generation"}

                    </span>

                    <button
                        onClick={handleGenerateReport}
                        className="generate-btn"
                        disabled={generating}
                    >

                        {generating
                            ? "Generating..."
                            : "Generate Interview Strategy"}

                    </button>

                </div>

            </div>

            {/* REPORTS */}

            {reports?.length > 0 && (

                <section className="recent-reports">

                    <h2>
                        My Recent Interview Plans
                    </h2>

                    <ul className="reports-list">

                        {reports.map((report) => (

                            <li
                                key={report?._id}
                                className="report-item"
                                onClick={() =>
                                    navigate(
                                        `/interview/${report?._id}`
                                    )
                                }
                            >

                                <h3>
                                    {report?.title ||
                                        "Untitled Position"}
                                </h3>

                                <p className="report-meta">

                                    Generated on{" "}

                                    {report?.createdAt
                                        ? new Date(
                                            report.createdAt
                                        ).toLocaleDateString()
                                        : "Unknown"}

                                </p>

                                <p
                                    className={`match-score ${
                                        report?.matchScore >= 80
                                            ? "score--high"
                                            : report?.matchScore >= 60
                                            ? "score--mid"
                                            : "score--low"
                                    }`}
                                >

                                    Match Score:{" "}
                                    {report?.matchScore || 0}%

                                </p>

                            </li>

                        ))}

                    </ul>

                </section>
            )}

            {/* FOOTER */}

            <footer className="page-footer">

                <a href="#">
                    Privacy Policy
                </a>

                <a href="#">
                    Terms of Service
                </a>

                <a href="#">
                    Help Center
                </a>

            </footer>

        </div>
    );
};

export default Home;