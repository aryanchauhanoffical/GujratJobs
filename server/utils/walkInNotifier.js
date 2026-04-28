const User = require('../models/User');
const Notification = require('../models/Notification');

/**
 * Sends a single digest notification to every active jobseeker
 * about today's walk-in drives. Uses insertMany for bulk efficiency
 * and socket.io for real-time delivery to online users.
 * Does NOT send email to avoid inbox spam.
 */
async function sendTodayWalkInNotifications(io, todaysJobs) {
  if (!todaysJobs.length) return;

  try {
    const seekers = await User.find({ role: 'jobseeker' }).select('_id').lean();
    if (!seekers.length) return;

    const title = 'Walk-in Interviews Today in Gujarat';
    const message = `${todaysJobs.length} walk-in drive(s) happening today. Don't miss out!`;
    const actionUrl = '/walk-ins';

    const docs = seekers.map((s) => ({
      user: s._id,
      type: 'walk_in_today',
      title,
      message,
      actionUrl,
    }));

    // ordered:false — a single bad doc won't abort the entire batch
    await Notification.insertMany(docs, { ordered: false });

    const payload = { type: 'walk_in_today', title, message, actionUrl };
    for (const s of seekers) {
      io.to(`user_${s._id}`).emit('notification', payload);
    }

    console.log(`[walkInNotifier] Sent walk-in digest to ${seekers.length} jobseekers`);
  } catch (err) {
    console.error('[walkInNotifier] Failed to send notifications:', err.message);
  }
}

module.exports = { sendTodayWalkInNotifications };
