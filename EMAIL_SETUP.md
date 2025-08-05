# Email Setup Guide for SaveChat

This guide will help you set up real email functionality for password reset and verification.

## Option 1: EmailJS (Recommended for Demo/Testing)

### Step 1: Create EmailJS Account
1. Go to [emailjs.com](https://www.emailjs.com/)
2. Sign up for a free account
3. Verify your email address

### Step 2: Add Email Service
1. In EmailJS dashboard, go to "Email Services"
2. Click "Add New Service"
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the setup instructions
5. Note your **Service ID**

### Step 3: Create Email Template
1. Go to "Email Templates"
2. Click "Create New Template"
3. Use this template:

```html
Subject: SaveChat Password Reset Code

Hello,

You requested a password reset for your SaveChat account.

Your verification code is: {{verification_code}}

This code will expire in 10 minutes.

If you didn't request this reset, please ignore this email.

Best regards,
The SaveChat Team
```

4. Note your **Template ID**

### Step 4: Get Public Key
1. Go to "Account" → "API Keys"
2. Copy your **Public Key**

### Step 5: Update the Code
In `app.js`, replace the placeholder values:

```javascript
// In the initEmailJS() function:
emailjs.init("YOUR_ACTUAL_PUBLIC_KEY");

// In the sendEmailVerification() function:
await emailjs.send('YOUR_ACTUAL_SERVICE_ID', 'YOUR_ACTUAL_TEMPLATE_ID', templateParams);
```

## Option 2: Alternative Email Services

### SendGrid
- Free tier: 100 emails/day
- More professional setup
- Requires backend integration

### Mailgun
- Free tier: 5,000 emails/month
- Good for production use
- Requires backend integration

### AWS SES
- Very cost-effective
- Requires AWS account
- More complex setup

## Option 3: Simple Backend Solution

If you want to add a simple backend:

### Using Node.js + Nodemailer
```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-password'
  }
});

const mailOptions = {
  from: 'your-email@gmail.com',
  to: userEmail,
  subject: 'SaveChat Password Reset',
  text: `Your verification code is: ${code}`
};

transporter.sendMail(mailOptions);
```

## Current Demo Mode

Until you configure real email:
- Verification codes appear on screen in yellow notification boxes
- This allows full testing of the application
- No actual emails are sent

## Security Notes

1. **Never commit API keys to version control**
2. **Use environment variables for sensitive data**
3. **Rate limit email sending to prevent abuse**
4. **Validate email addresses before sending**
5. **Set appropriate expiration times for codes**

## Testing

1. Configure EmailJS following the steps above
2. Test with your own email address
3. Check spam folder if emails don't arrive
4. Verify the reset process works end-to-end

## Troubleshooting

### Emails not sending:
- Check EmailJS configuration
- Verify service and template IDs
- Check browser console for errors
- Ensure email address is valid

### Codes not working:
- Check if codes are being generated correctly
- Verify localStorage is working
- Check browser console for errors

### Demo mode not working:
- Refresh the page
- Clear browser cache
- Check if JavaScript is enabled 