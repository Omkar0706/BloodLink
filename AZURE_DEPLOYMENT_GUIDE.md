# 🚀 BloodLink Azure Deployment Guide

## Prerequisites
- Azure account (free tier works): https://azure.microsoft.com/free/
- GitHub account with BloodLink repository
- Node.js 18+ installed locally

## Step 1: Prepare for Azure Deployment

### Update package.json for Azure
Add these build scripts if not present:

```json
{
  "scripts": {
    "build": "next build",
    "start": "next start",
    "export": "next export"
  }
}
```

## Step 2: Create Azure Static Web App

### Method A: Azure Portal (Recommended)
1. Go to https://portal.azure.com
2. Search for "Static Web Apps" and click "Create"
3. Fill in details:
   - **Subscription**: Your Azure subscription
   - **Resource Group**: Create new "BloodLink-RG"
   - **Name**: "bloodlink-platform"
   - **Plan Type**: Free (for development)
   - **Region**: Choose closest to your users (e.g., Central India)
   - **Source**: GitHub
   - **GitHub Account**: Connect your GitHub account
   - **Organization**: Your GitHub username
   - **Repository**: BloodLink
   - **Branch**: main
   - **Build Presets**: Next.js
   - **App Location**: / (root)
   - **Output Location**: out (for static export) or .next (for SSR)

4. Click "Review + Create" then "Create"

### Method B: Azure CLI (Advanced)
```bash
# Install Azure CLI: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli

# Login to Azure
az login

# Create resource group
az group create --name BloodLink-RG --location "Central India"

# Create static web app
az staticwebapp create \
  --name bloodlink-platform \
  --resource-group BloodLink-RG \
  --source https://github.com/YOUR_USERNAME/BloodLink \
  --location "Central India" \
  --branch main \
  --app-location "/" \
  --output-location "out"
```

## Step 3: Configure Environment Variables

### In Azure Portal:
1. Go to your Static Web App resource
2. Click "Configuration" in left menu
3. Add Application Settings:
   - `NEXTAUTH_URL`: https://YOUR_APP_NAME.azurestaticapps.net
   - `NEXTAUTH_SECRET`: Generate random secret
   - `OPENAI_API_KEY`: Your Azure OpenAI key
   - `OPENAI_API_ENDPOINT`: Your Azure OpenAI endpoint

### Environment Variables Needed:
```env
NEXTAUTH_URL=https://bloodlink-platform.azurestaticapps.net
NEXTAUTH_SECRET=your-super-secret-key-here
OPENAI_API_KEY=your-azure-openai-key
OPENAI_API_ENDPOINT=https://your-openai-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4
```

## Step 4: Custom Domain (Optional)

### Add Custom Domain:
1. In Azure Portal, go to your Static Web App
2. Click "Custom domains" in left menu
3. Click "Add" and enter your domain
4. Follow DNS configuration instructions
5. Suggested domain: `bloodlink.health` or `bloodlink.ai`

## Step 5: Database Configuration

### Option A: Azure Database for PostgreSQL
```bash
# Create PostgreSQL server
az postgres server create \
  --resource-group BloodLink-RG \
  --name bloodlink-db \
  --location "Central India" \
  --admin-user bloodlinkadmin \
  --admin-password YourSecurePassword123! \
  --sku-name B_Gen5_1
```

### Option B: Continue with SQLite (Simple)
- Current SQLite database will work for demo
- For production, migrate to PostgreSQL or Azure SQL

## Step 6: Monitoring and Analytics

### Enable Application Insights:
1. Create Application Insights resource
2. Add connection string to Static Web App configuration
3. Monitor performance and usage

### Add to Configuration:
```env
APPLICATIONINSIGHTS_CONNECTION_STRING=your-app-insights-connection-string
```

## Expected Results After Deployment

### Your Live URLs:
- **Main App**: https://bloodlink-platform.azurestaticapps.net
- **API Endpoints**: https://bloodlink-platform.azurestaticapps.net/api/*
- **AI Features**: All three AI features will be live
- **Real-time Data**: 200 donors, 150 donations, 121 blood units

### Performance Expectations:
- **Load Time**: < 3 seconds globally
- **AI Response**: < 2 seconds for predictions
- **Donor Matching**: < 1 second response time
- **Availability**: 99.9% SLA with Azure

## Step 7: Post-Deployment Testing

### Test These Features:
1. **Homepage**: Verify all statistics load correctly
2. **AI Predictions**: Test blood demand forecasting
3. **Donor Matching**: Test emergency request flow
4. **Dashboard**: Verify all analytics display
5. **Mobile**: Test responsive design on phones

### Performance Testing:
```bash
# Install lighthouse for performance testing
npm install -g lighthouse

# Test your deployed site
lighthouse https://bloodlink-platform.azurestaticapps.net --view
```

## Troubleshooting Common Issues

### Build Failures:
- Check Node.js version (use 18.x)
- Verify all dependencies in package.json
- Check for TypeScript errors

### Environment Variables:
- Ensure all required env vars are set
- Check variable names match exactly
- Restart deployment after adding variables

### Database Connection:
- Verify connection strings
- Check firewall rules for Azure DB
- Test local connection first

## Cost Estimation

### Free Tier (Suitable for Demo):
- Static Web Apps: Free (100GB bandwidth/month)
- Azure OpenAI: Pay-per-use (~$0.002/1K tokens)
- PostgreSQL: ~$25/month (Basic tier)

### Production Tier:
- Static Web Apps: ~$9/month (Standard tier)
- Azure OpenAI: ~$50-200/month (based on usage)
- PostgreSQL: ~$100/month (General Purpose)

## Security Checklist

### Before Going Live:
- [ ] Enable HTTPS (automatic with Azure)
- [ ] Set up proper CORS policies
- [ ] Configure authentication properly
- [ ] Review and set environment variables
- [ ] Enable monitoring and alerts
- [ ] Test all API endpoints
- [ ] Verify data encryption

## Next Steps After Deployment

1. **Share Live Link**: Use for presentations and demos
2. **Monitor Usage**: Check Azure metrics and logs
3. **Scale if Needed**: Upgrade to Standard tier if traffic increases
4. **Add Features**: Implement additional AI capabilities
5. **Mobile App**: Create React Native mobile version
6. **Partnerships**: Share with hospitals and healthcare providers

Your BloodLink platform will be live at:
**https://bloodlink-platform.azurestaticapps.net**

Ready to save lives with AI! 🩸🤖💡
