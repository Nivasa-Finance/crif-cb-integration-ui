# 🚀 AWS Deployment Guide for CRIF Credit Bureau Integration UI

This guide will walk you through deploying your React application to AWS Amplify and setting up API Gateway for your backend APIs with the nivasa.io domain.

## 📋 Prerequisites

Before starting, ensure you have:
- AWS Account with appropriate permissions
- Domain registered (nivasa.io) with access to DNS management
- AWS CLI installed and configured
- Node.js 18+ installed locally

## 🎯 URL Structure
- **Frontend**: `https://nivasa.io`
- **APIs**: `https://nivasa.io/crif/api/v1/...`

## 🏗️ Phase 1: AWS Amplify Frontend Deployment

### Step 1: Build Your Application Locally

First, let's ensure your application builds correctly:

```bash
# Install dependencies
npm install

# Build for production
npm run build
```

### Step 2: Create AWS Amplify App

1. **Go to AWS Amplify Console**
   - Navigate to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
   - Click "New app" → "Host web app"

2. **Connect Repository**
   - Choose "GitHub" as your repository source
   - Select your repository: `Nivasa-Finance/crif-cb-integration-ui`
   - Click "Next"

3. **Configure Build Settings**
   - **Repository**: `Nivasa-Finance/crif-cb-integration-ui`
   - **Branch**: `main`
   - **Build settings**: Use the following configuration:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

4. **Environment Variables**
   Add these environment variables in Amplify:
   - `VITE_API_BASE_URL`: `https://nivasa.io/crif/api/v1`
   - `VITE_APP_TITLE`: `CRIF Credit Bureau Integration`
   - `VITE_APP_ENV`: `production`

5. **Review and Deploy**
   - Review your settings
   - Click "Save and deploy"

### Step 3: Configure Custom Domain

1. **Add Custom Domain**
   - In your Amplify app, go to "Domain management"
   - Click "Add domain"
   - Enter: `nivasa.io` (not a subdomain)

2. **Verify Domain Ownership**
   - AWS will provide CNAME records
   - Add these to your DNS provider (where nivasa.io is registered)

3. **SSL Certificate**
   - AWS will automatically provision an SSL certificate
   - Wait for validation (usually 5-10 minutes)

## 🔌 Phase 2: API Gateway Setup

### Step 1: Create API Gateway

1. **Go to API Gateway Console**
   - Navigate to [API Gateway Console](https://console.aws.amazon.com/apigateway/)
   - Click "Create API"
   - Choose "REST API" → "Build"

2. **Configure API**
   - **API name**: `nivasa-crif-api`
   - **Description**: `CRIF Credit Bureau Integration API`
   - **Endpoint type**: `Regional`
   - Click "Create API"

### Step 2: Create Resources and Methods

1. **Create Base Resource Structure**
   - Click "Actions" → "Create Resource"
   - **Resource Name**: `crif`
   - **Resource Path**: `/crif`
   - Click "Create Resource"

2. **Create API Resource**
   - Select `/crif` resource
   - Click "Actions" → "Create Resource"
   - **Resource Name**: `api`
   - **Resource Path**: `/api`
   - Click "Create Resource"

3. **Create Version Resource**
   - Select `/crif/api` resource
   - Click "Actions" → "Create Resource"
   - **Resource Name**: `v1`
   - **Resource Path**: `/v1`
   - Click "Create Resource"

4. **Create API Endpoints**
   For each of your API endpoints, create resources under `/crif/api/v1`:

   **Consent Management:**
   - `/crif/api/v1/consent/status/{uuid}`
   - `/crif/api/v1/consent/generate-link/{uuid}`
   - `/crif/api/v1/consent/submit/{uuid}`
   - `/crif/api/v1/consent/withdraw/{uuid}`

   **Person Management:**
   - `/crif/api/v1/persons/{uuid}`
   - `/crif/api/v1/persons/{uuid}/update`

   **Credit Bureau:**
   - `/crif/api/v1/credit-bureau/pull-report`
   - `/crif/api/v1/credit-bureau/enquiry/{uuid}/complete-report`

### Step 3: Configure Methods

For each endpoint, configure the appropriate HTTP methods:

1. **Select the resource**
2. **Click "Actions" → "Create Method"**
3. **Choose HTTP method** (GET, POST, PUT, DELETE)
4. **Integration type**: `HTTP`
5. **Endpoint URL**: Your backend service URL
6. **HTTP method**: Same as the method you're creating

### Step 4: Deploy API

1. **Create Stage**
   - Click "Actions" → "Deploy API"
   - **Deployment stage**: `prod`
   - **Stage description**: `Production`
   - Click "Deploy"

2. **Note the Invoke URL**
   - Copy the Invoke URL (e.g., `https://abc123.execute-api.ap-south-1.amazonaws.com/prod`)

## 🌐 Phase 3: Domain Configuration

### Step 1: Configure API Gateway Custom Domain

1. **Go to Custom Domain Names**
   - In API Gateway, click "Custom Domain Names"
   - Click "Create"
   - **Domain name**: `nivasa.io`
   - **Regional endpoint**: Select your region
   - Click "Create"

2. **Configure API Mappings**
   - Click on your domain
   - Go to "API Mappings"
   - Click "Configure API mappings"
   - **API**: Select your API
   - **Stage**: `prod`
   - **Path**: `/crif` (this is crucial!)
   - Click "Save"

### Step 2: Update DNS Records

Add these records to your DNS provider:

```
# Frontend (Amplify)
nivasa.io    CNAME    d1234abcd.cloudfront.net

# Backend (API Gateway) - Same domain, different path
nivasa.io    CNAME    abc123.execute-api.ap-south-1.amazonaws.com
```

**Important**: Since both frontend and backend use the same domain, you'll need to use path-based routing in API Gateway.

## 🔧 Phase 4: Update Application Configuration

### Step 1: Update Environment Variables

In AWS Amplify Console, update your environment variables:

```
VITE_API_BASE_URL=https://nivasa.io/crif/api/v1
VITE_APP_TITLE=CRIF Credit Bureau Integration
VITE_APP_ENV=production
```

### Step 2: Redeploy Application

1. **Trigger New Build**
   - In Amplify, go to "All builds"
   - Click "Redeploy this version" or push a new commit

2. **Verify Deployment**
   - Check that your app loads at `https://nivasa.io`
   - Verify API calls go to `https://nivasa.io/crif/api/v1`

## 🧪 Phase 5: Testing and Validation

### Step 1: Test Frontend
1. Visit `https://nivasa.io`
2. Verify the application loads correctly
3. Check browser console for any errors

### Step 2: Test API Endpoints
1. Test each API endpoint using Postman or curl
2. Example: `https://nivasa.io/crif/api/v1/consent/status/test-uuid`
3. Verify responses are correct
4. Check API Gateway CloudWatch logs for any issues

### Step 3: Test End-to-End Flow
1. Test the complete user journey
2. Verify consent forms work
3. Test credit bureau integration

## 🔍 Troubleshooting Common Issues

### Issue: Build Fails
- Check build logs in Amplify Console
- Verify all dependencies are in package.json
- Ensure build command is correct

### Issue: API Calls Fail
- Verify API Gateway endpoints are correct
- Check CORS configuration
- Verify domain mapping in API Gateway
- Ensure path mapping is set to `/crif`

### Issue: Domain Not Working
- Verify DNS records are correct
- Check SSL certificate status
- Ensure domain validation is complete
- Verify API Gateway path mapping

## 📚 Additional Resources

- [AWS Amplify Documentation](https://docs.aws.amazon.com/amplify/)
- [API Gateway Documentation](https://docs.aws.amazon.com/apigateway/)
- [Route 53 DNS Management](https://docs.aws.amazon.com/route53/)

## 🆘 Support

If you encounter issues:
1. Check AWS CloudWatch logs
2. Review Amplify build logs
3. Verify API Gateway configuration
4. Check DNS propagation (can take up to 48 hours)

---

**Next Steps**: After completing this guide, your application will be accessible at `https://nivasa.io` with APIs at `https://nivasa.io/crif/api/v1/...`. 