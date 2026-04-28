const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'GujaratJobs <noreply@gujaratjobs.in>',
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email send error:', error.message);
    return { success: false, error: error.message };
  }
};

// Email templates
const emailTemplates = {
  welcomeEmail: (name) => ({
    subject: 'Welcome to GujaratJobs! 🎉',
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
        <div style="background: white; border-radius: 12px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #4f46e5; margin: 0;">GujaratJobs</h1>
            <p style="color: #6b7280; margin: 4px 0;">Gujarat's #1 Job Platform</p>
          </div>
          <h2 style="color: #111827;">Welcome, ${name}! 👋</h2>
          <p style="color: #374151; line-height: 1.6;">
            Thank you for joining GujaratJobs! We're excited to help you find your dream job in Gujarat.
          </p>
          <p style="color: #374151; line-height: 1.6;">
            <strong>What you can do:</strong>
          </p>
          <ul style="color: #374151; line-height: 1.8;">
            <li>Browse thousands of jobs across Gujarat</li>
            <li>Find walk-in interviews near you</li>
            <li>Apply with one click</li>
            <li>Track your applications in real-time</li>
          </ul>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL}/jobs" style="background: #4f46e5; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">
              Browse Jobs
            </a>
          </div>
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            GujaratJobs | Connecting Gujarat's Workforce
          </p>
        </div>
      </body>
      </html>
    `,
  }),

  verifyEmail: (name, verificationUrl) => ({
    subject: 'Verify Your Email - GujaratJobs',
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
        <div style="background: white; border-radius: 12px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #4f46e5; margin: 0;">GujaratJobs</h1>
          </div>
          <h2 style="color: #111827;">Verify Your Email</h2>
          <p style="color: #374151; line-height: 1.6;">Hi ${name},</p>
          <p style="color: #374151; line-height: 1.6;">
            Please click the button below to verify your email address.
            This link will expire in 24 hours.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background: #4f46e5; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">
              Verify Email
            </a>
          </div>
          <p style="color: #9ca3af; font-size: 14px;">
            If you didn't create an account, you can safely ignore this email.
          </p>
        </div>
      </body>
      </html>
    `,
  }),

  applicationReceived: (recruiterName, jobTitle, applicantName) => ({
    subject: `New Application for ${jobTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
        <div style="background: white; border-radius: 12px; padding: 30px;">
          <h1 style="color: #4f46e5;">GujaratJobs</h1>
          <h2 style="color: #111827;">New Application Received</h2>
          <p style="color: #374151;">Hi ${recruiterName},</p>
          <p style="color: #374151;">
            <strong>${applicantName}</strong> has applied for the position of <strong>${jobTitle}</strong>.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL}/recruiter/applicants" style="background: #4f46e5; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none;">
              View Application
            </a>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  applicationStatusUpdate: (applicantName, jobTitle, status, companyName) => ({
    subject: `Application Update: ${jobTitle} at ${companyName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
        <div style="background: white; border-radius: 12px; padding: 30px;">
          <h1 style="color: #4f46e5;">GujaratJobs</h1>
          <h2 style="color: #111827;">Application Status Update</h2>
          <p style="color: #374151;">Hi ${applicantName},</p>
          <p style="color: #374151;">
            Your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been updated.
          </p>
          <div style="background: ${status === 'shortlisted' ? '#dcfce7' : status === 'rejected' ? '#fee2e2' : '#dbeafe'};
               border-radius: 8px; padding: 16px; margin: 20px 0; text-align: center;">
            <strong style="color: ${status === 'shortlisted' ? '#16a34a' : status === 'rejected' ? '#dc2626' : '#1d4ed8'}; font-size: 18px; text-transform: capitalize;">
              ${status.replace('_', ' ')}
            </strong>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL}/applications" style="background: #4f46e5; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none;">
              View My Applications
            </a>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  passwordReset: (name, resetUrl) => ({
    subject: 'Password Reset Request - GujaratJobs',
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
        <div style="background: white; border-radius: 12px; padding: 30px;">
          <h1 style="color: #4f46e5;">GujaratJobs</h1>
          <h2 style="color: #111827;">Reset Your Password</h2>
          <p style="color: #374151;">Hi ${name},</p>
          <p style="color: #374151;">
            We received a request to reset your password. Click the button below to create a new password.
            This link will expire in 1 hour.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: #4f46e5; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none;">
              Reset Password
            </a>
          </div>
          <p style="color: #9ca3af; font-size: 14px;">
            If you didn't request a password reset, please ignore this email.
          </p>
        </div>
      </body>
      </html>
    `,
  }),

  recruiterApproved: (name) => ({
    subject: 'Recruiter Account Approved - GujaratJobs',
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
        <div style="background: white; border-radius: 12px; padding: 30px;">
          <h1 style="color: #4f46e5;">GujaratJobs</h1>
          <h2 style="color: #111827;">Your Recruiter Account is Approved! 🎉</h2>
          <p style="color: #374151;">Hi ${name},</p>
          <p style="color: #374151;">
            Congratulations! Your recruiter account has been verified and approved.
            You can now post jobs and connect with Gujarat's top talent.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL}/recruiter/dashboard" style="background: #4f46e5; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none;">
              Go to Dashboard
            </a>
          </div>
        </div>
      </body>
      </html>
    `,
  }),
};

// Send specific emails
const sendWelcomeEmail = async (user) => {
  const { subject, html } = emailTemplates.welcomeEmail(user.name);
  return sendEmail({ to: user.email, subject, html });
};

const sendVerificationEmail = async (user, token) => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${token}`;
  const { subject, html } = emailTemplates.verifyEmail(user.name, verificationUrl);
  return sendEmail({ to: user.email, subject, html });
};

const sendApplicationReceivedEmail = async (recruiter, job, applicant) => {
  const { subject, html } = emailTemplates.applicationReceived(recruiter.name, job.title, applicant.name);
  return sendEmail({ to: recruiter.email, subject, html });
};

const sendApplicationStatusEmail = async (applicant, job, status) => {
  const { subject, html } = emailTemplates.applicationStatusUpdate(applicant.name, job.title, status, job.company);
  return sendEmail({ to: applicant.email, subject, html });
};

const sendPasswordResetEmail = async (user, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
  const { subject, html } = emailTemplates.passwordReset(user.name, resetUrl);
  return sendEmail({ to: user.email, subject, html });
};

const sendRecruiterApprovedEmail = async (user) => {
  const { subject, html } = emailTemplates.recruiterApproved(user.name);
  return sendEmail({ to: user.email, subject, html });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendVerificationEmail,
  sendApplicationReceivedEmail,
  sendApplicationStatusEmail,
  sendPasswordResetEmail,
  sendRecruiterApprovedEmail,
};
