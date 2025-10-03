import { NextRequest, NextResponse } from 'next/server'
import { getCollection } from '@/lib/mongodb.js'
import { sendEmail } from '@/lib/email-service.js'

// POST /api/auth/password-request - Request password change
export async function POST(request) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if email exists in vendors collection
    const vendorsCollection = await getCollection('vendors')
    const vendor = await vendorsCollection.findOne({ email })

    if (!vendor) {
      // Check if email exists in admin_users collection
      const adminCollection = await getCollection('admin_users')
      const adminUser = await adminCollection.findOne({ email })

      if (!adminUser) {
        return NextResponse.json(
          { error: 'Email address not found in our system' },
          { status: 404 }
        )
      }

      // Send password request notification to admins for admin user
      try {
        const adminNotificationEmail = {
          subject: '🔐 Password Change Request - Admin User',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Password Change Request</title>
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
                .message {
                  font-size: 16px;
                  margin-bottom: 25px;
                  color: #4b5563;
                }
                .request-details {
                  background-color: #f0f9ff;
                  padding: 20px;
                  border-radius: 8px;
                  border-left: 4px solid #2563eb;
                  margin: 25px 0;
                }
                .request-details h3 {
                  color: #2563eb;
                  margin-top: 0;
                  margin-bottom: 15px;
                }
                .detail-item {
                  margin: 10px 0;
                  font-size: 16px;
                }
                .detail-label {
                  font-weight: bold;
                  color: #374151;
                }
                .detail-value {
                  color: #1f2937;
                  font-family: 'Courier New', monospace;
                  background-color: #f3f4f6;
                  padding: 4px 8px;
                  border-radius: 4px;
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
                  <div class="title">Password Change Request</div>
                  <div class="subtitle">Admin User Password Change Request</div>
                </div>

                <div class="content">
                  <div class="message">
                    A password change request has been submitted for an admin user account.
                  </div>

                  <div class="request-details">
                    <h3>📋 Request Details</h3>
                    <div class="detail-item">
                      <span class="detail-label">Requested By:</span><br>
                      <span class="detail-value">${adminUser.firstName} ${adminUser.lastName}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Email Address:</span><br>
                      <span class="detail-value">${adminUser.email}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">User Role:</span><br>
                      <span class="detail-value">${adminUser.role}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Department:</span><br>
                      <span class="detail-value">${adminUser.department || 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Request Time:</span><br>
                      <span class="detail-value">${new Date().toLocaleString()}</span>
                    </div>
                  </div>

                  <div class="message">
                    Please review this request and change the password if approved. The user will receive an email notification with their new password.
                  </div>

                  <div style="text-align: center;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/users" class="cta-button">
                      🎯 Manage Admin Users
                    </a>
                  </div>

                  <div class="message">
                    <strong>Security Note:</strong> Please verify the identity of the user before changing their password. Consider contacting them directly to confirm the request.
                  </div>
                </div>

                <div class="footer">
                  <p>This is an automated notification from the Luxury Platform admin system.</p>
                  <p>© 2024 Luxury Platform. All rights reserved.</p>
                </div>
              </div>
            </body>
            </html>
          `,
          text: `
            Password Change Request - Admin User

            A password change request has been submitted for an admin user account.

            Request Details:
            - Requested By: ${adminUser.firstName} ${adminUser.lastName}
            - Email Address: ${adminUser.email}
            - User Role: ${adminUser.role}
            - Department: ${adminUser.department || 'N/A'}
            - Request Time: ${new Date().toLocaleString()}

            Please review this request and change the password if approved. The user will receive an email notification with their new password.

            Manage Admin Users: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/users

            Security Note: Please verify the identity of the user before changing their password. Consider contacting them directly to confirm the request.

            This is an automated notification from the Luxury Platform admin system.
            © 2024 Luxury Platform. All rights reserved.
          `
        }

        // Send to admin notification email (you can configure this)
        const adminNotificationEmailAddress = process.env.ADMIN_NOTIFICATION_EMAIL || 'admin@luxuryplatform.com'
        await sendEmail(adminNotificationEmailAddress, adminNotificationEmail.subject, adminNotificationEmail.html, adminNotificationEmail.text)
        
        console.log('Password request notification sent to admin for admin user:', email)
      } catch (emailError) {
        console.error('Error sending admin notification email:', emailError)
      }

      return NextResponse.json({
        message: 'Password change request submitted successfully. An admin will review your request.'
      })
    }

    // Handle vendor password request
    if (vendor.verificationStatus !== 'verified' || !vendor.adminPanelAccess) {
      return NextResponse.json(
        { error: 'Vendor account must be verified to request password change' },
        { status: 403 }
      )
    }

    // Send password request notification to admins for vendor
    try {
      const vendorNotificationEmail = {
        subject: '🔐 Password Change Request - Vendor',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Change Request</title>
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
              .message {
                font-size: 16px;
                margin-bottom: 25px;
                color: #4b5563;
              }
              .request-details {
                background-color: #f0f9ff;
                padding: 20px;
                border-radius: 8px;
                border-left: 4px solid #2563eb;
                margin: 25px 0;
              }
              .request-details h3 {
                color: #2563eb;
                margin-top: 0;
                margin-bottom: 15px;
              }
              .detail-item {
                margin: 10px 0;
                font-size: 16px;
              }
              .detail-label {
                font-weight: bold;
                color: #374151;
              }
              .detail-value {
                color: #1f2937;
                font-family: 'Courier New', monospace;
                background-color: #f3f4f6;
                padding: 4px 8px;
                border-radius: 4px;
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
                <div class="title">Password Change Request</div>
                <div class="subtitle">Vendor Password Change Request</div>
              </div>

              <div class="content">
                <div class="message">
                  A password change request has been submitted by a verified vendor.
                </div>

                <div class="request-details">
                  <h3>📋 Request Details</h3>
                  <div class="detail-item">
                    <span class="detail-label">Requested By:</span><br>
                    <span class="detail-value">${vendor.firstName} ${vendor.lastName}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Email Address:</span><br>
                    <span class="detail-value">${vendor.email}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Business Name:</span><br>
                    <span class="detail-value">${vendor.businessName}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Business Type:</span><br>
                    <span class="detail-value">${vendor.businessType}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Verification Status:</span><br>
                    <span class="detail-value">${vendor.verificationStatus}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Request Time:</span><br>
                    <span class="detail-value">${new Date().toLocaleString()}</span>
                  </div>
                </div>

                <div class="message">
                  Please review this request and change the password if approved. The vendor will receive an email notification with their new password.
                </div>

                <div style="text-align: center;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/vendors" class="cta-button">
                    🎯 Manage Vendors
                  </a>
                </div>

                <div class="message">
                  <strong>Security Note:</strong> Please verify the identity of the vendor before changing their password. Consider contacting them directly to confirm the request.
                </div>
              </div>

              <div class="footer">
                <p>This is an automated notification from the Luxury Platform admin system.</p>
                <p>© 2024 Luxury Platform. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
          Password Change Request - Vendor

          A password change request has been submitted by a verified vendor.

          Request Details:
          - Requested By: ${vendor.firstName} ${vendor.lastName}
          - Email Address: ${vendor.email}
          - Business Name: ${vendor.businessName}
          - Business Type: ${vendor.businessType}
          - Verification Status: ${vendor.verificationStatus}
          - Request Time: ${new Date().toLocaleString()}

          Please review this request and change the password if approved. The vendor will receive an email notification with their new password.

          Manage Vendors: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/vendors

          Security Note: Please verify the identity of the vendor before changing their password. Consider contacting them directly to confirm the request.

          This is an automated notification from the Luxury Platform admin system.
          © 2024 Luxury Platform. All rights reserved.
        `
      }

      // Send to admin notification email (you can configure this)
      const adminNotificationEmailAddress = process.env.ADMIN_NOTIFICATION_EMAIL || 'admin@luxuryplatform.com'
      await sendEmail(adminNotificationEmailAddress, vendorNotificationEmail.subject, vendorNotificationEmail.html, vendorNotificationEmail.text)
      
      console.log('Password request notification sent to admin for vendor:', email)
    } catch (emailError) {
      console.error('Error sending admin notification email:', emailError)
    }

    return NextResponse.json({
      message: 'Password change request submitted successfully. An admin will review your request.'
    })

  } catch (error) {
    console.error('Error processing password request:', error)
    return NextResponse.json(
      { error: 'Failed to process password request' },
      { status: 500 }
    )
  }
}
