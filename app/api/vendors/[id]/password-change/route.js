import { NextRequest, NextResponse } from 'next/server'
import { getCollection } from '@/lib/mongodb.js'
import { ObjectId } from 'mongodb'
import bcrypt from 'bcryptjs'
import { generateVendorPassword } from '@/lib/password-generator.js'
import { sendEmail } from '@/lib/email-service.js'

// POST /api/vendors/[id]/password-change - Request password change for vendor
export async function POST(request, { params }) {
  try {
    const { id } = params
    
    // Check if request has body, but don't require it for password change
    let body = {}
    try {
      const text = await request.text()
      if (text) {
        body = JSON.parse(text)
      }
    } catch (parseError) {
      // If no body or invalid JSON, continue with empty body
      console.log('No request body provided for password change')
    }
    
    const collection = await getCollection('vendors')
    
    // Try to find by ObjectId first, then by _id string
    let vendor
    if (ObjectId.isValid(id)) {
      vendor = await collection.findOne({ _id: new ObjectId(id) })
    } else {
      vendor = await collection.findOne({ _id: id })
    }
    
    if (!vendor) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      )
    }

    // Check if vendor is verified and has admin access
    if (vendor.verificationStatus !== 'verified' || !vendor.adminPanelAccess) {
      return NextResponse.json(
        { error: 'Vendor must be verified to change password' },
        { status: 403 }
      )
    }

    // Generate new password
    const newPassword = generateVendorPassword()
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update vendor password
    const updateResult = await collection.updateOne(
      { _id: ObjectId.isValid(id) ? new ObjectId(id) : id },
      { 
        $set: { 
          password: hashedPassword,
          updatedAt: new Date()
        } 
      }
    )

    if (updateResult.modifiedCount === 0) {
      return NextResponse.json(
        { error: 'Failed to update password' },
        { status: 500 }
      )
    }

    // Send password change email
    try {
      const emailTemplate = {
        subject: '🔐 Password Changed - Luxury Platform',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Changed</title>
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
                <div class="title">Password Changed</div>
                <div class="subtitle">Your new login credentials</div>
              </div>

              <div class="content">
                <div class="greeting">Dear ${vendor.firstName} ${vendor.lastName},</div>
                
                <div class="message">
                  Your password has been successfully changed for your vendor account at <strong>${vendor.businessName}</strong>.
                </div>

                <div class="credentials-box">
                  <h3>🔑 Your New Login Credentials</h3>
                  <p style="margin-bottom: 15px;">You can now access the admin panel using these credentials:</p>
                  <div class="login-credentials">
                    <div class="credential-item">
                      <span class="credential-label">Email:</span><br>
                      <span class="credential-value">${vendor.email}</span>
                    </div>
                    <div class="credential-item">
                      <span class="credential-label">New Password:</span><br>
                      <span class="credential-value">${newPassword}</span>
                    </div>
                  </div>
                  <p style="font-size: 14px; color: #6b7280; margin-top: 15px;">
                    <strong>Important:</strong> Please keep your new password secure and confidential.
                  </p>
                </div>

                <div style="text-align: center;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login" class="cta-button">
                    🎯 Access Admin Panel
                  </a>
                </div>

                <div class="security-note">
                  <h4>🔒 Security Reminder</h4>
                  <p>• Keep your login credentials confidential</p>
                  <p>• Use a strong, unique password</p>
                  <p>• Log out when finished using the admin panel</p>
                  <p>• Contact support if you suspect unauthorized access</p>
                </div>

                <div class="message">
                  If you did not request this password change, please contact our support team immediately.
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
          Password Changed - Luxury Platform

          Dear ${vendor.firstName} ${vendor.lastName},

          Your password has been successfully changed for your vendor account at ${vendor.businessName}.

          Your New Login Credentials:
          Email: ${vendor.email}
          New Password: ${newPassword}

          Important: Please keep your new password secure and confidential.

          Access Admin Panel: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login

          Security Reminder:
          - Keep your login credentials confidential
          - Use a strong, unique password
          - Log out when finished using the admin panel
          - Contact support if you suspect unauthorized access

          If you did not request this password change, please contact our support team immediately.

          Best regards,
          The Luxury Platform Team

          This email was sent to ${vendor.email}
          © 2024 Luxury Platform. All rights reserved.
        `
      }

      const emailResult = await sendEmail(vendor.email, emailTemplate.subject, emailTemplate.html, emailTemplate.text)
      if (emailResult.success) {
        console.log('Password change email sent successfully to:', vendor.email)
        console.log('New password for vendor:', newPassword)
      } else {
        console.error('Failed to send password change email:', emailResult.error)
      }
    } catch (emailError) {
      console.error('Error sending password change email:', emailError)
    }

    return NextResponse.json({
      message: 'Password changed successfully',
      emailSent: true,
      vendor: {
        _id: vendor._id?.toString(),
        firstName: vendor.firstName,
        lastName: vendor.lastName,
        email: vendor.email,
        businessName: vendor.businessName
      }
    })

  } catch (error) {
    console.error('Error changing vendor password:', error)
    return NextResponse.json(
      { error: 'Failed to change password' },
      { status: 500 }
    )
  }
}
