const express = require("express");
const router = express.Router();
const {
  getAnalytics,
  getAllUsers,
  suspendUser,
  reactivateUser,
  getPendingRecruiters,
  approveRecruiter,
  rejectRecruiter,
  manageScrapedJobs,
  approveScrapedJob,
  rejectScrapedJob,
  approveAllScrapedJobs,
} = require("../controllers/adminController");
const { protect, restrictTo } = require("../middleware/auth");

router.use(protect, restrictTo("admin"));

router.get("/analytics", getAnalytics);
router.get("/users", getAllUsers);
router.put("/users/:id/suspend", suspendUser);
router.put("/users/:id/reactivate", reactivateUser);
router.get("/recruiters/pending", getPendingRecruiters);
router.put("/recruiters/:id/approve", approveRecruiter);
router.put("/recruiters/:id/reject", rejectRecruiter);
router.get("/scraped-jobs", manageScrapedJobs);
router.put("/scraped-jobs/approve-all", approveAllScrapedJobs);
router.put("/scraped-jobs/:id/approve", approveScrapedJob);
router.delete("/scraped-jobs/:id/reject", rejectScrapedJob);

module.exports = router;
