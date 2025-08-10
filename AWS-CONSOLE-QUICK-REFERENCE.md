# 🚀 AWS Console Quick Reference Card

## 📍 AWS Console URLs

### Frontend (Amplify)
- **Console**: https://console.aws.amazon.com/amplify/
- **Action**: New app → Host web app

### Backend (API Gateway)
- **Console**: https://console.aws.amazon.com/apigateway/
- **Action**: Create API → REST API → Build

### DNS Management (Route 53)
- **Console**: https://console.aws.amazon.com/route53/
- **Action**: Hosted zones → nivasa.io

## 🎯 Key Configuration Values

### Frontend Configuration
- **Repository**: `Nivasa-Finance/crif-cb-integration-ui`
- **Branch**: `main`
- **Domain**: `nivasa.io`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### Backend Configuration
- **API Name**: `nivasa-crif-api`
- **Stage**: `prod`
- **Domain**: `api.nivasa.io`
- **API Path**: ``
- **Base Path**: ``

### Environment Variables
```
VITE_API_BASE_URL=https://api.nivasa.io
VITE_APP_TITLE=Nivasa Navigator
VITE_APP_ENV=production
```

## 🔄 Step-by-Step Console Navigation

### Phase 1: Amplify Setup
1. **Amplify Console** → New app → Host web app
2. **Repository**: Connect to GitHub → Select `Nivasa-Finance/crif-cb-integration-ui`
3. **Build Settings**: Use `amplify.yml` file
4. **Environment Variables**: Add the 3 variables above
5. **Deploy**: Save and deploy

### Phase 2: API Gateway Setup
1. **API Gateway Console** → Create API → REST API → Build
2. **API Name**: `nivasa-crif-api`
3. **Resources**: Create `/consent`, `/persons`, `/credit-bureau` directly under root
4. **Methods**: Add GET/POST/PUT/DELETE for each endpoint
5. **Deploy**: Create stage `prod`

### Phase 3: Domain Configuration
1. **API Gateway** → Custom Domain Names → Create
2. **Domain**: `api.nivasa.io`
3. **API Mappings**: Map API to root path (leave empty)
4. **DNS**: Add CNAME records from AWS

## ⚠️ Important Notes

### Critical Configuration Points
- **Frontend Domain**: `nivasa.io` (main domain)
- **Backend Domain**: `api.nivasa.io` (separate subdomain)
- **SSL Certificates**: AWS will provision automatically
- **CORS**: No issues since different domains

### Common Pitfalls
- Using wrong build command or output directory
- Not setting environment variables in Amplify
- DNS propagation can take up to 48 hours
- Mixing up frontend and backend domains

## 🧪 Testing URLs

### Frontend Test
- **URL**: `https://nivasa.io`
- **Expected**: React app loads without errors

### API Test
- **Base URL**: `https://api.nivasa.io`
- **Test Endpoint**: `https://api.nivasa.io/consent/status/test-uuid`
- **Expected**: API response (or 404 if endpoint not configured)

## 📞 AWS Support Resources

- **Documentation**: https://docs.aws.amazon.com/
- **Amplify Docs**: https://docs.aws.amazon.com/amplify/
- **API Gateway Docs**: https://docs.aws.amazon.com/apigateway/
- **Route 53 Docs**: https://docs.aws.amazon.com/route53/

---

**Remember**: Take screenshots of each step for troubleshooting! 