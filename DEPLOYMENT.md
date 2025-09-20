# AWS Amplify Deployment Guide

This guide will help you deploy your Next.js application with Lambda functions to AWS Amplify.

## Prerequisites

1. AWS Account with Amplify access
2. GitHub repository with your code
3. Node.js 18+ installed locally

## Deployment Steps

### 1. Connect Repository to Amplify

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click "New app" → "Host web app"
3. Connect your GitHub repository
4. Select the branch you want to deploy (usually `main` or `master`)

### 2. Configure Build Settings

The `amplify.yml` file is already configured for your Next.js app. Amplify will automatically detect it.

**Build Settings:**
- Build command: `npm run build`
- Base directory: `my-app`
- Build output directory: `.next`

### 3. Environment Variables

Add these environment variables in the Amplify console under **App settings** → **Environment variables**:

```
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_NOTARIZE_URL=https://2f2279683902.ngrok-free.app/notarize
```

### 4. Lambda Function Configuration

Your API route `/api/notarize` will be automatically deployed as a Lambda function. The configuration is in `amplify.yml`:

- **Runtime**: Node.js 18.x
- **Memory**: 256 MB
- **Timeout**: 30 seconds
- **CORS**: Enabled

### 5. Custom Domain (Optional)

1. In Amplify console, go to **Domain management**
2. Add your custom domain
3. Configure DNS settings as instructed

## File Structure

```
/
├── amplify.yml                 # Amplify build configuration
├── my-app/
│   ├── app/
│   │   ├── api/
│   │   │   └── notarize/
│   │   │       └── route.ts    # API route (deployed as Lambda)
│   │   └── ...
│   ├── lambda/
│   │   └── notarize.js         # Standalone Lambda function
│   ├── next.config.mjs         # Next.js configuration
│   ├── package.json            # Dependencies and scripts
│   └── env.example             # Environment variables template
```

## Key Features

### ✅ Configured for Amplify
- Optimized Next.js configuration
- Proper build settings
- Lambda function support
- Environment variable management

### ✅ Lambda Functions
- API routes automatically deployed as Lambda functions
- Standalone Lambda function for `/api/notarize`
- CORS enabled
- Error handling and logging

### ✅ Performance Optimizations
- Image optimization disabled (for Amplify compatibility)
- Compression enabled
- Standalone output for better performance
- Proper caching configuration

## Troubleshooting

### Build Failures
1. Check Node.js version (should be 18+)
2. Verify all dependencies are in `package.json`
3. Check environment variables are set correctly

### Lambda Function Issues
1. Verify the Lambda function is deployed in AWS Console
2. Check CloudWatch logs for errors
3. Ensure CORS headers are properly set

### API Route Issues
1. Test the API route locally first
2. Check the external service URL is accessible
3. Verify environment variables are passed to Lambda

## Monitoring

- **Amplify Console**: Monitor build status and deployments
- **CloudWatch**: Monitor Lambda function logs and metrics
- **AWS X-Ray**: Trace requests (if enabled)

## Security Considerations

1. **Environment Variables**: Never commit sensitive data to the repository
2. **CORS**: Configure CORS properly for your domain
3. **API Keys**: Store API keys in Amplify environment variables
4. **HTTPS**: Amplify automatically provides HTTPS

## Next Steps

1. Deploy to Amplify using the steps above
2. Test your application thoroughly
3. Set up monitoring and alerts
4. Configure custom domain if needed
5. Set up CI/CD for automatic deployments

## Support

- [AWS Amplify Documentation](https://docs.aws.amazon.com/amplify/)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Lambda Function Guide](https://docs.aws.amazon.com/lambda/)
