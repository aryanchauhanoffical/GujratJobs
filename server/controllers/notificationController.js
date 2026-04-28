const Notification = require('../models/Notification');

// Get notifications
const getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, unreadOnly } = req.query;

    const query = { user: req.user._id };
    if (unreadOnly === 'true') query.read = false;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('relatedJob', 'title company'),
      Notification.countDocuments(query),
      Notification.countDocuments({ user: req.user._id, read: false }),
    ]);

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Mark as read
const markAsRead = async (req, res, next) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { read: true, readAt: new Date() }
    );

    const unreadCount = await Notification.countDocuments({
      user: req.user._id,
      read: false,
    });

    res.json({
      success: true,
      data: { unreadCount },
      message: 'Notification marked as read.',
    });
  } catch (error) {
    next(error);
  }
};

// Mark all as read
const markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, read: false },
      { read: true, readAt: new Date() }
    );

    res.json({
      success: true,
      data: { unreadCount: 0 },
      message: 'All notifications marked as read.',
    });
  } catch (error) {
    next(error);
  }
};

// Delete notification
const deleteNotification = async (req, res, next) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    res.json({ success: true, message: 'Notification deleted.' });
  } catch (error) {
    next(error);
  }
};

// Get unread count
const getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user._id,
      read: false,
    });

    res.json({ success: true, data: { count } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllRead,
  deleteNotification,
  getUnreadCount,
};
