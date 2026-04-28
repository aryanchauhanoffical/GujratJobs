const axios = require("axios");

const APIFY_BASE_URL = "https://api.apify.com/v2";
const APIFY_TOKEN = process.env.APIFY_API_TOKEN;

// Apify Actor IDs - Updated to valid 2026 versions
const ACTORS = {
  LINKEDIN_JOBS: "jay_u~linkedin-jobs-scraper",
  INDEED_SCRAPER: "misceres~indeed-scraper",
  NAUKRI_SCRAPER: "epicscrapers~naukri-scraper",
};

const extractEmailFromText = (text) => {
  if (!text) return null;
  const match = text.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
  return match ? match[0] : null;
};

const GUJARAT_KEYWORDS = [
  "Gujarat",
  "Ahmedabad",
  "Surat",
  "Vadodara",
  "Rajkot",
  "Gandhinagar",
];

// Run an Apify actor and wait for results
const runApifyActor = async (actorId, input, timeoutMs = 120000) => {
  if (!APIFY_TOKEN) {
    console.warn("APIFY_API_TOKEN not set. Skipping scraping.");
    return [];
  }

  try {
    // Start the actor run
    const runResponse = await axios.post(
      `${APIFY_BASE_URL}/acts/${actorId}/runs?token=${APIFY_TOKEN}`,
      input,
      {
        headers: { "Content-Type": "application/json" },
        timeout: 30000,
      },
    );

    const runId = runResponse.data.data.id;
    console.log(`Apify actor ${actorId} started. Run ID: ${runId}`);

    // Poll for completion
    const startTime = Date.now();
    while (Date.now() - startTime < timeoutMs) {
      await new Promise((resolve) => setTimeout(resolve, 5000));

      const statusResponse = await axios.get(
        `${APIFY_BASE_URL}/actor-runs/${runId}?token=${APIFY_TOKEN}`,
      );

      const status = statusResponse.data.data.status;

      if (status === "SUCCEEDED") {
        const datasetId = statusResponse.data.data.defaultDatasetId;
        const resultsResponse = await axios.get(
          `${APIFY_BASE_URL}/datasets/${datasetId}/items?token=${APIFY_TOKEN}&format=json`,
        );
        return resultsResponse.data || [];
      }

      if (["FAILED", "ABORTED", "TIMED-OUT"].includes(status)) {
        throw new Error(`Apify actor run ${status}: ${runId}`);
      }
    }

    throw new Error(`Apify actor run timed out: ${runId}`);
  } catch (error) {
    console.error(`Apify actor error (${actorId}):`, error.message);
    return [];
  }
};

// Normalize LinkedIn job data
const normalizeLinkedInJob = (job) => {
  return {
    title: job.title || "",
    company: job.companyName || job.company || "",
    description: job.description || "",
    location: {
      city: extractGujaratCity(job.location || ""),
      state: "Gujarat",
      address: job.location || "",
    },
    type: normalizeJobType(job.employmentType || ""),
    experienceLevel: normalizeExperienceLevel(job.seniorityLevel || ""),
    source: "scraped",
    sourceUrl: job.jobUrl || job.url || "",
    salary: {
      min: 0,
      max: 0,
      currency: "INR",
    },
    skills: job.skills || [],
    scrapedAt: new Date(),
    requirements: [],
    isWalkIn: detectWalkIn(job.title || "", job.description || ""),
    walkInDetails: {
      contactEmail: extractEmailFromText(job.description || ""),
    },
  };
};

// Normalize Indeed job data
const normalizeIndeedJob = (job) => {
  const salary = parseSalary(job.salary || "");
  return {
    title: job.positionName || job.title || "",
    company: job.company || "",
    description: job.description || "",
    location: {
      city: extractGujaratCity(job.location || ""),
      state: "Gujarat",
      address: job.location || "",
    },
    type: normalizeJobType(job.jobType || ""),
    experienceLevel: "fresher",
    source: "scraped",
    sourceUrl: job.url || job.jobUrl || "",
    salary: {
      min: salary.min,
      max: salary.max,
      currency: "INR",
    },
    skills: [],
    scrapedAt: new Date(),
    requirements: [],
    isWalkIn: detectWalkIn(
      job.positionName || job.title || "",
      job.description || "",
    ),
    walkInDetails: {
      contactEmail: extractEmailFromText(job.description || ""),
    },
  };
};

// Normalize Naukri job data
const normalizeNaukriJob = (job) => {
  const salary = parseSalary(job.salary || "");
  return {
    title: job.title || job.jobTitle || "",
    company: job.companyName || job.company || "",
    description: job.jobDescription || job.description || "",
    location: {
      city: extractGujaratCity(job.location || ""),
      state: "Gujarat",
      address: job.location || "",
    },
    type: "full-time",
    experienceLevel: normalizeExperienceLevel(job.experience || ""),
    source: "scraped",
    sourceUrl: job.jdURL || job.url || "",
    salary: {
      min: salary.min,
      max: salary.max,
      currency: "INR",
    },
    skills: (job.keySkills || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    scrapedAt: new Date(),
    requirements: [],
    isWalkIn: detectWalkIn(
      job.title || job.jobTitle || "",
      job.jobDescription || job.description || "",
    ),
    walkInDetails: {
      contactEmail: extractEmailFromText(job.jobDescription || job.description || ""),
    },
  };
};

// Detect if a job is a walk-in drive
const detectWalkIn = (title, description) => {
  const keywords = [
    "walk-in",
    "walk in",
    "walkin",
    "interview drive",
    "hiring drive",
  ];
  const text = (title + " " + description).toLowerCase();
  return keywords.some((kw) => text.includes(kw));
};

// Extract Gujarat city from location string
const extractGujaratCity = (locationStr) => {
  const gujaratCities = [
    "Ahmedabad",
    "Surat",
    "Vadodara",
    "Rajkot",
    "Gandhinagar",
    "Bhavnagar",
    "Jamnagar",
    "Junagadh",
    "Anand",
    "Navsari",
    "Morbi",
    "Surendranagar",
    "Mehsana",
    "Bharuch",
    "Porbandar",
    "Amreli",
    "Bhuj",
    "Gondal",
    "Veraval",
    "Botad",
  ];

  for (const city of gujaratCities) {
    if (locationStr.toLowerCase().includes(city.toLowerCase())) {
      return city;
    }
  }

  return "Ahmedabad"; // Default to Ahmedabad if no city found
};

// Normalize job type
const normalizeJobType = (type) => {
  if (Array.isArray(type)) type = type.join(" ");
  if (!type) return "full-time";
  const t = type.toString().toLowerCase();
  if (t.includes("part")) return "part-time";
  if (t.includes("contract")) return "contract";
  if (t.includes("intern")) return "internship";
  if (t.includes("freelance")) return "freelance";
  return "full-time";
};

// Normalize experience level
const normalizeExperienceLevel = (level) => {
  if (Array.isArray(level)) level = level.join(" ");
  if (!level) return "fresher";
  const l = level.toString().toLowerCase();
  if (
    l.includes("fresh") ||
    l.includes("entry") ||
    l.includes("0") ||
    l.includes("intern")
  )
    return "fresher";
  if (l.includes("junior") || l.includes("1") || l.includes("2"))
    return "junior";
  if (
    l.includes("mid") ||
    l.includes("3") ||
    l.includes("4") ||
    l.includes("5")
  )
    return "mid";
  if (l.includes("senior") || l.includes("lead") || l.includes("6"))
    return "senior";
  return "fresher";
};

// Parse salary string to min/max
const parseSalary = (salaryStr) => {
  if (!salaryStr) return { min: 0, max: 0 };

  const strL = salaryStr.toLowerCase();
  const isLakh = /lakh|lpa|l\s|l$/.test(strL);
  const isCrore = /crore|cr\s|cr$/.test(strL);

  // Remove commas to treat numbers correctly
  const cleanStr = salaryStr.replace(/,/g, "");
  // Remove non-numeric characters except for ranges
  const numbers = cleanStr.replace(/[^\d\s\-\.]/g, "").trim();
  const parts = numbers.split(/[\-–to]+/).map((p) => parseFloat(p.trim()) || 0);

  const processPart = (val) => {
    if (isCrore && val < 100) return val * 10000000;
    if (isLakh && val < 1000) return val * 100000;
    if (val > 0 && val < 100) return val * 100000;
    return val;
  };

  if (parts.length >= 2) {
    return { min: processPart(parts[0]), max: processPart(parts[1]) };
  }

  if (parts.length === 1 && parts[0] > 0) {
    return { min: processPart(parts[0]), max: processPart(parts[0]) };
  }

  return { min: 0, max: 0 };
};

// Filter jobs to ensure they're in Gujarat
const filterGujaratJobs = (jobs) => {
  return jobs.filter((job) => {
    const location = (
      job.location?.city ||
      job.location?.address ||
      ""
    ).toLowerCase();
    return GUJARAT_KEYWORDS.some((kw) => location.includes(kw.toLowerCase()));
  });
};

// Main scraping function
const scrapeGujaratJobs = async (
  keywords = ["fresher jobs", "entry level", "jobs in Gujarat"],
  location = "Gujarat, India",
) => {
  console.log("Starting Gujarat jobs scraping...");
  const allJobs = [];

  // Scrape LinkedIn
  try {
    console.log("Scraping LinkedIn...");
    const linkedInRaw = await runApifyActor(ACTORS.LINKEDIN_JOBS, {
      searchQueries: keywords.map((k) => `${k} in ${location}`),
      maxItems: 20,
    });

    const linkedInJobs = (linkedInRaw || [])
      .filter((job) => {
        const loc = (job.location || "").toLowerCase();
        return GUJARAT_KEYWORDS.some((kw) => loc.includes(kw.toLowerCase()));
      })
      .map(normalizeLinkedInJob);

    allJobs.push(...linkedInJobs);
    console.log(`LinkedIn: ${linkedInJobs.length} Gujarat jobs found`);
  } catch (error) {
    console.error("LinkedIn scraping failed:", error.message);
  }

  // Scrape Indeed
  try {
    console.log("Scraping Indeed...");
    const indeedRaw = await runApifyActor(ACTORS.INDEED_SCRAPER, {
      position: keywords[0],
      location: location,
      country: "IN",
      maxItems: 20,
    });

    const indeedJobs = (indeedRaw || [])
      .filter((job) => {
        const loc = (job.location || "").toLowerCase();
        return GUJARAT_KEYWORDS.some((kw) => loc.includes(kw.toLowerCase()));
      })
      .map(normalizeIndeedJob);

    allJobs.push(...indeedJobs);
    console.log(`Indeed: ${indeedJobs.length} Gujarat jobs found`);
  } catch (error) {
    console.error("Indeed scraping failed:", error.message);
  }

  // Scrape Naukri
  try {
    console.log("Scraping Naukri...");
    const naukriRaw = await runApifyActor(ACTORS.NAUKRI_SCRAPER, {
      searchQueries: [keywords[0] + " " + location],
      maxItems: 20,
    });

    const naukriJobs = (naukriRaw || [])
      .filter((job) => {
        const loc = (job.location || "").toLowerCase();
        return (
          GUJARAT_KEYWORDS.some((kw) => loc.includes(kw.toLowerCase())) ||
          loc.includes("gujarat")
        );
      })
      .map(normalizeNaukriJob);

    allJobs.push(...naukriJobs);
    console.log(`Naukri: ${naukriJobs.length} Gujarat jobs found`);
  } catch (error) {
    console.error("Naukri scraping failed:", error.message);
  }

  // Filter out jobs without Gujarat city
  const gujaratJobs = allJobs.filter((job) => job.location.city);

  console.log(`Total Gujarat jobs scraped: ${gujaratJobs.length}`);
  return gujaratJobs;
};

// Get scraping status for a run
const getRunStatus = async (runId) => {
  if (!APIFY_TOKEN) return null;

  try {
    const response = await axios.get(
      `${APIFY_BASE_URL}/actor-runs/${runId}?token=${APIFY_TOKEN}`,
    );
    return response.data.data;
  } catch (error) {
    console.error("Error getting run status:", error.message);
    return null;
  }
};

module.exports = {
  scrapeGujaratJobs,
  getRunStatus,
  extractGujaratCity,
  normalizeJobType,
};
