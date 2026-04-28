import { formatDistanceToNow, format } from 'date-fns';

// Format salary for display
export const formatSalary = (salary) => {
  if (!salary) return 'Not disclosed';

  const { min, max, currency = 'INR', period = 'monthly', isNegotiable } = salary;

  if (!min && !max) {
    return isNegotiable ? 'Negotiable' : 'Not disclosed';
  }

  const formatNum = (n) => {
    if (n >= 100000) return `${(n / 100000).toFixed(1)}L`;
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
    return n.toString();
  };

  const symbol = currency === 'INR' ? '₹' : '$';

  if (min && max && min !== max) {
    return `${symbol}${formatNum(min)} - ${symbol}${formatNum(max)} / ${period === 'monthly' ? 'month' : period === 'yearly' ? 'year' : period}`;
  }

  if (max) {
    return `Up to ${symbol}${formatNum(max)} / ${period === 'monthly' ? 'month' : 'year'}`;
  }

  if (min) {
    return `${symbol}${formatNum(min)}+ / ${period === 'monthly' ? 'month' : 'year'}`;
  }

  return isNegotiable ? 'Negotiable' : 'Not disclosed';
};

// Format date relative
export const timeAgo = (date) => {
  if (!date) return '';
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return '';
  }
};

// Format date as readable
export const formatDate = (date, dateFormat = 'dd MMM yyyy') => {
  if (!date) return '';
  try {
    return format(new Date(date), dateFormat);
  } catch {
    return '';
  }
};

// Get application status color
export const getStatusColor = (status) => {
  const colors = {
    applied: 'blue',
    viewed: 'gray',
    shortlisted: 'yellow',
    interview_scheduled: 'purple',
    hired: 'green',
    rejected: 'red',
    withdrawn: 'gray',
  };
  return colors[status] || 'gray';
};

// Get status label
export const getStatusLabel = (status) => {
  const labels = {
    applied: 'Applied',
    viewed: 'Viewed',
    shortlisted: 'Shortlisted',
    interview_scheduled: 'Interview Scheduled',
    hired: 'Hired',
    rejected: 'Not Selected',
    withdrawn: 'Withdrawn',
  };
  return labels[status] || status;
};

// Truncate text
export const truncate = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Get initials from name
export const getInitials = (name) => {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

// Format number with commas
export const formatNumber = (num) => {
  if (!num) return '0';
  return num.toLocaleString('en-IN');
};

// Get job type label
export const getJobTypeLabel = (type) => {
  const labels = {
    'full-time': 'Full Time',
    'part-time': 'Part Time',
    contract: 'Contract',
    internship: 'Internship',
    freelance: 'Freelance',
  };
  return labels[type] || type;
};

// Get experience level label
export const getExpLevelLabel = (level) => {
  const labels = {
    fresher: 'Fresher',
    junior: 'Junior (1-2 yrs)',
    mid: 'Mid-level (3-5 yrs)',
    senior: 'Senior (6+ yrs)',
    lead: 'Lead',
  };
  return labels[level] || level;
};

// Check if walk-in is upcoming
export const isWalkInUpcoming = (walkInDetails) => {
  if (!walkInDetails?.date) return false;
  return new Date(walkInDetails.date) >= new Date();
};

// Build query string from object
export const buildQueryString = (params) => {
  const qs = Object.entries(params)
    .filter(([_, v]) => v !== undefined && v !== null && v !== '' && v !== 'all')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
  return qs ? `?${qs}` : '';
};
