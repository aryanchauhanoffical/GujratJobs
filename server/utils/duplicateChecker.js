const Job = require('../models/Job');

// Check if a scraped job is a duplicate
const isDuplicateJob = async (jobData) => {
  const { title, company, sourceUrl, location } = jobData;

  // Check by source URL first (most reliable)
  if (sourceUrl) {
    const existingByUrl = await Job.findOne({ sourceUrl });
    if (existingByUrl) {
      return { isDuplicate: true, existingJob: existingByUrl, reason: 'Same source URL' };
    }
  }

  // Check by title + company + city combination
  if (title && company && location?.city) {
    const existingByTitleCompany = await Job.findOne({
      title: { $regex: new RegExp(`^${escapeRegex(title)}$`, 'i') },
      company: { $regex: new RegExp(`^${escapeRegex(company)}$`, 'i') },
      'location.city': { $regex: new RegExp(`^${escapeRegex(location.city)}$`, 'i') },
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // Within last 7 days
    });

    if (existingByTitleCompany) {
      return {
        isDuplicate: true,
        existingJob: existingByTitleCompany,
        reason: 'Same title, company, and city within 7 days',
      };
    }
  }

  return { isDuplicate: false };
};

// Filter out duplicates from a batch of scraped jobs
const filterDuplicates = async (jobs) => {
  const uniqueJobs = [];
  const duplicates = [];

  for (const job of jobs) {
    const { isDuplicate, existingJob, reason } = await isDuplicateJob(job);

    if (isDuplicate) {
      duplicates.push({ job, existingJob, reason });
    } else {
      uniqueJobs.push(job);
    }
  }

  return { uniqueJobs, duplicates, totalFiltered: duplicates.length };
};

// Escape special regex characters
const escapeRegex = (str) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// Calculate similarity between two job descriptions (simple word overlap)
const calculateSimilarity = (text1, text2) => {
  if (!text1 || !text2) return 0;

  const words1 = new Set(text1.toLowerCase().split(/\s+/));
  const words2 = new Set(text2.toLowerCase().split(/\s+/));

  const intersection = new Set([...words1].filter((w) => words2.has(w)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size; // Jaccard similarity
};

module.exports = { isDuplicateJob, filterDuplicates, calculateSimilarity };
