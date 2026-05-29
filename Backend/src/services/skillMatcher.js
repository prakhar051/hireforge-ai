// backend/src/services/skillMatcher.js

const SKILL_MAP = {
  js: "javascript",
  javascript: "javascript",
  node: "node.js",
  nodejs: "node.js",
  reactjs: "react",
  react: "react",
  mongo: "mongodb",
  mongodb: "mongodb",
};

const KNOWN_SKILLS = [
  "javascript",
  "react",
  "node.js",
  "mongodb",
  "express",
  "docker",
  "html",
  "css",
];

/* =========================
   NORMALIZE SKILL
========================= */
const normalizeSkill = (skill) => {
  const lower = skill.toLowerCase().trim();
  return SKILL_MAP[lower] || lower;
};

/* =========================
   EXTRACT SKILLS FROM TEXT
========================= */
const extractSkills = (text = "") => {
  const lowerText = text.toLowerCase();

  return KNOWN_SKILLS.filter((skill) =>
    lowerText.includes(skill)
  );
};

/* =========================
   MATCH SKILLS
========================= */
const matchSkills = (resumeText = "", jobText = "") => {
  const resumeSkills = extractSkills(resumeText).map(normalizeSkill);
  const jobSkills = extractSkills(jobText).map(normalizeSkill);

  const matched = jobSkills.filter((skill) =>
    resumeSkills.includes(skill)
  );

  const missing = jobSkills.filter((skill) =>
    !resumeSkills.includes(skill)
  );

  const score =
    jobSkills.length === 0
      ? 0
      : Math.round((matched.length / jobSkills.length) * 100);

  return {
    score,
    matched,
    missing,
    resumeSkills,
    jobSkills,
  };
};

/* =========================
   EXPORTS (COMMONJS)
========================= */
module.exports = {
  extractSkills,
  matchSkills,
};