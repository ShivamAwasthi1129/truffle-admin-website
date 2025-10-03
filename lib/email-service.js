import nodemailer from 'nodemailer';

// Email service configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || 'your-email@gmail.com',
      pass: process.env.SMTP_PASS || 'your-app-password'
    }
  });
};

// Email templates
export const emailTemplates = {
  vendorVerificationApproval: (vendor, generatedPassword) => ({
    subject: '🎉 Vendor Verification Approved - Welcome to Luxury Platform!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Vendor Verification Approved</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e0e0e0;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
          }
          .success-icon {
            font-size: 48px;
            color: #10b981;
            margin-bottom: 20px;
          }
          .title {
            font-size: 28px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 10px;
          }
          .subtitle {
            font-size: 16px;
            color: #6b7280;
            margin-bottom: 30px;
          }
          .content {
            margin-bottom: 30px;
          }
          .greeting {
            font-size: 18px;
            margin-bottom: 20px;
            color: #374151;
          }
          .message {
            font-size: 16px;
            margin-bottom: 25px;
            color: #4b5563;
          }
          .highlight {
            background-color: #f0f9ff;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #2563eb;
            margin: 25px 0;
          }
          .credentials-box {
            background-color: #fef3c7;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #f59e0b;
            margin: 25px 0;
            text-align: center;
          }
          .credentials-box h3 {
            color: #f59e0b;
            margin-top: 0;
            margin-bottom: 15px;
          }
          .login-credentials {
            background-color: #ffffff;
            padding: 15px;
            border-radius: 6px;
            border: 2px solid #f59e0b;
            margin: 15px 0;
          }
          .credential-item {
            margin: 10px 0;
            font-size: 16px;
          }
          .credential-label {
            font-weight: bold;
            color: #374151;
          }
          .credential-value {
            font-family: 'Courier New', monospace;
            background-color: #f3f4f6;
            padding: 4px 8px;
            border-radius: 4px;
            color: #1f2937;
            font-weight: bold;
          }
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            font-size: 16px;
            margin: 20px 0;
            text-align: center;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .cta-button:hover {
            background: linear-gradient(135deg, #1d4ed8 0%, #6d28d9 100%);
          }
          .features {
            background-color: #f9fafb;
            padding: 25px;
            border-radius: 8px;
            margin: 25px 0;
          }
          .features h3 {
            color: #1f2937;
            margin-bottom: 15px;
            font-size: 18px;
          }
          .features ul {
            list-style: none;
            padding: 0;
          }
          .features li {
            padding: 8px 0;
            color: #4b5563;
            position: relative;
            padding-left: 25px;
          }
          .features li:before {
            content: "✓";
            color: #10b981;
            font-weight: bold;
            position: absolute;
            left: 0;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            color: #6b7280;
            font-size: 14px;
          }
          .contact-info {
            background-color: #f3f4f6;
            padding: 20px;
            border-radius: 8px;
            margin: 25px 0;
          }
          .contact-info h4 {
            color: #1f2937;
            margin-bottom: 10px;
          }
          .contact-info p {
            margin: 5px 0;
            color: #4b5563;
          }
          .security-note {
            background-color: #fef2f2;
            padding: 15px;
            border-radius: 6px;
            border-left: 4px solid #ef4444;
            margin: 20px 0;
          }
          .security-note h4 {
            color: #dc2626;
            margin-top: 0;
            margin-bottom: 10px;
          }
          .security-note p {
            color: #7f1d1d;
            margin: 5px 0;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🏆 Luxury Platform</div>
            <div class="success-icon">🎉</div>
            <div class="title">Verification Approved!</div>
            <div class="subtitle">Welcome to our exclusive vendor network</div>
          </div>

          <div class="content">
            <div class="greeting">Dear ${vendor.firstName} ${vendor.lastName},</div>
            
            <div class="message">
              We are thrilled to inform you that your vendor application for <strong>${vendor.businessName}</strong> has been successfully verified and approved! 
              Welcome to our exclusive luxury services platform.
            </div>

            <div class="credentials-box">
              <h3>🔑 Your Login Credentials</h3>
              <p style="margin-bottom: 15px;">You can now access the admin panel using these credentials:</p>
              <div class="login-credentials">
                <div class="credential-item">
                  <span class="credential-label">Email:</span><br>
                  <span class="credential-value">${vendor.email}</span>
                </div>
                <div class="credential-item">
                  <span class="credential-label">Password:</span><br>
                  <span class="credential-value">${generatedPassword}</span>
                </div>
              </div>
              <p style="font-size: 14px; color: #6b7280; margin-top: 15px;">
                <strong>Important:</strong> Please change your password after your first login for security.
              </p>
            </div>

            <div class="highlight">
              <h3 style="color: #2563eb; margin-top: 0;">🚀 What's Next?</h3>
              <p style="margin-bottom: 15px;">You now have <strong>admin panel access</strong> and can:</p>
              <ul style="margin: 0; padding-left: 20px;">
                <li>Login to the admin panel using your credentials above</li>
                <li>Upload and manage your inventory items</li>
                <li>View and respond to booking requests</li>
                <li>Track your performance and earnings</li>
                <li>Access exclusive vendor resources</li>
              </ul>
            </div>

            <div style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login" class="cta-button">
                🎯 Access Admin Panel
              </a>
            </div>

            <div class="security-note">
              <h4>🔒 Security Reminder</h4>
              <p>• Keep your login credentials confidential</p>
              <p>• Change your password after first login</p>
              <p>• Use a strong, unique password</p>
              <p>• Log out when finished using the admin panel</p>
            </div>

            <div class="features">
              <h3>🌟 Platform Benefits</h3>
              <ul>
                <li>Access to high-end clientele worldwide</li>
                <li>Streamlined booking and payment processing</li>
                <li>Marketing support and brand exposure</li>
                <li>24/7 customer support</li>
                <li>Competitive commission rates</li>
                <li>Real-time analytics and reporting</li>
              </ul>
            </div>

            <div class="contact-info">
              <h4>📞 Need Help?</h4>
              <p><strong>Email:</strong> vendors@luxuryplatform.com</p>
              <p><strong>Phone:</strong> +1 (555) 123-4567</p>
              <p><strong>Support Hours:</strong> 24/7</p>
            </div>

            <div class="message">
              We're excited to have you as part of our luxury services network. If you have any questions or need assistance getting started, 
              please don't hesitate to contact our support team.
            </div>

            <div class="message">
              Best regards,<br>
              <strong>The Luxury Platform Team</strong>
            </div>
          </div>

          <div class="footer">
            <p>This email was sent to ${vendor.email}</p>
            <p>© 2024 Luxury Platform. All rights reserved.</p>
            <p>If you have any questions, please contact our support team.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Vendor Verification Approved - Welcome to Luxury Platform!

      Dear ${vendor.firstName} ${vendor.lastName},

      We are thrilled to inform you that your vendor application for ${vendor.businessName} has been successfully verified and approved! 
      Welcome to our exclusive luxury services platform.

      Your Login Credentials:
      Email: ${vendor.email}
      Password: ${generatedPassword}

      Important: Please change your password after your first login for security.

      What's Next?
      You now have admin panel access and can:
      - Login to the admin panel using your credentials above
      - Upload and manage your inventory items
      - View and respond to booking requests
      - Track your performance and earnings
      - Access exclusive vendor resources

      Access Admin Panel: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login

      Security Reminder:
      - Keep your login credentials confidential
      - Change your password after first login
      - Use a strong, unique password
      - Log out when finished using the admin panel

      Platform Benefits:
      - Access to high-end clientele worldwide
      - Streamlined booking and payment processing
      - Marketing support and brand exposure
      - 24/7 customer support
      - Competitive commission rates
      - Real-time analytics and reporting

      Need Help?
      Email: vendors@luxuryplatform.com
      Phone: +1 (555) 123-4567
      Support Hours: 24/7

      We're excited to have you as part of our luxury services network. If you have any questions or need assistance getting started, 
      please don't hesitate to contact our support team.

      Best regards,
      The Luxury Platform Team

      This email was sent to ${vendor.email}
      © 2024 Luxury Platform. All rights reserved.
    `
  }),

  vendorVerificationRejection: (vendor, reason) => ({
    subject: 'Vendor Application Update - Additional Information Required',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Vendor Application Update</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e0e0e0;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
          }
          .title {
            font-size: 24px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 10px;
          }
          .subtitle {
            font-size: 16px;
            color: #6b7280;
            margin-bottom: 30px;
          }
          .content {
            margin-bottom: 30px;
          }
          .greeting {
            font-size: 18px;
            margin-bottom: 20px;
            color: #374151;
          }
          .message {
            font-size: 16px;
            margin-bottom: 25px;
            color: #4b5563;
          }
          .highlight {
            background-color: #fef3c7;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #f59e0b;
            margin: 25px 0;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            color: #6b7280;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🏆 Luxury Platform</div>
            <div class="title">Application Update Required</div>
            <div class="subtitle">Additional information needed for verification</div>
          </div>

          <div class="content">
            <div class="greeting">Dear ${vendor.firstName} ${vendor.lastName},</div>
            
            <div class="message">
              Thank you for your interest in joining our luxury services platform. We have reviewed your application for <strong>${vendor.businessName}</strong> 
              and require additional information to complete the verification process.
            </div>

            <div class="highlight">
              <h3 style="color: #f59e0b; margin-top: 0;">📋 Required Information</h3>
              <p style="margin-bottom: 15px;"><strong>Reason:</strong> ${reason}</p>
              <p>Please provide the requested information to continue with your application.</p>
            </div>

            <div class="message">
              We appreciate your patience and look forward to welcoming you to our platform once the verification process is complete.
            </div>

            <div class="message">
              Best regards,<br>
              <strong>The Luxury Platform Team</strong>
            </div>
          </div>

          <div class="footer">
            <p>This email was sent to ${vendor.email}</p>
            <p>© 2024 Luxury Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Vendor Application Update - Additional Information Required

      Dear ${vendor.firstName} ${vendor.lastName},

      Thank you for your interest in joining our luxury services platform. We have reviewed your application for ${vendor.businessName} 
      and require additional information to complete the verification process.

      Required Information:
      Reason: ${reason}

      Please provide the requested information to continue with your application.

      We appreciate your patience and look forward to welcoming you to our platform once the verification process is complete.

      Best regards,
      The Luxury Platform Team

      This email was sent to ${vendor.email}
      © 2024 Luxury Platform. All rights reserved.
    `
  })
};

// Send email function
export async function sendEmail(to, subject, html, text) {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@luxuryplatform.com',
      to,
      subject,
      html,
      text
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
}

// Send vendor verification approval email
export async function sendVendorApprovalEmail(vendor, generatedPassword) {
  const template = emailTemplates.vendorVerificationApproval(vendor, generatedPassword);
  return await sendEmail(vendor.email, template.subject, template.html, template.text);
}

// Send vendor verification rejection email
export async function sendVendorRejectionEmail(vendor, reason) {
  const template = emailTemplates.vendorVerificationRejection(vendor, reason);
  return await sendEmail(vendor.email, template.subject, template.html, template.text);
}
