# AWS Amplify Frontend-Only Deployment Guide

This guide will help you deploy your Next.js application as a static frontend to AWS Amplify.

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

The `amplify.yml` file is already configured for your Next.js static export. Amplify will automatically detect it.

**Build Settings:**
- Build command: `npm run build`
- Base directory: `my-app`
- Build output directory: `out`

### 3. Environment Variables

Add these environment variables in the Amplify console under **App settings** → **Environment variables**:

```
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=production
```

### 4. Custom Domain (Optional)

1. In Amplify console, go to **Domain management**
2. Add your custom domain
3. Configure DNS settings as instructed

## File Structure

```
/
├── amplify.yml                 # Amplify build configuration
├── my-app/
│   ├── app/
│   │   ├── claimer-dashboard/
│   │   ├── guided-report/
│   │   ├── insurance-dashboard/
│   │   ├── police-dashboard/
│   │   ├── post-submission/
│   │   └── ...
│   ├── components/
│   ├── next.config.mjs         # Next.js static export configuration
│   ├── package.json            # Dependencies and scripts
│   └── env.example             # Environment variables template
```

## Key Features

### ✅ Static Export Configuration
- Next.js configured for static export (`output: 'export'`)
- No server-side rendering or API routes
- Optimized for static hosting
- Image optimization disabled for compatibility

### ✅ Amplify Optimized
- Proper build settings for static export
- Caching configuration for better performance
- Environment variable support
- Automatic HTTPS and CDN

### ✅ Performance Optimizations
- Static file generation
- Compression enabled
- Proper caching headers
- Optimized bundle size

## Important Notes

### ⚠️ No Server-Side Features
- **API Routes**: Removed (not compatible with static export)
- **Server-Side Rendering**: Disabled
- **Dynamic Routes**: Limited to static generation
- **Database Connections**: Not available

### ✅ Frontend-Only Features
- **Static Pages**: All pages are pre-rendered
- **Client-Side JavaScript**: Full React functionality
- **External API Calls**: Can call external APIs from client-side
- **Static Assets**: Images, CSS, JS served from CDN

## Troubleshooting

### Build Failures
1. Check Node.js version (should be 18+)
2. Verify all dependencies are in `package.json`
3. Ensure no server-side code is being used
4. Check for dynamic imports that require server-side rendering

### Static Export Issues
1. Remove any `getServerSideProps` or `getStaticProps` with dynamic data
2. Ensure all pages can be statically generated
3. Check for server-only imports (like `fs`, `path`)

### External API Calls
If you need to call external APIs:
1. Use client-side fetch in `useEffect` or event handlers
2. Handle CORS properly on the external API
3. Consider using a separate backend service for sensitive operations

## Monitoring

- **Amplify Console**: Monitor build status and deployments
- **CloudWatch**: Monitor CDN and hosting metrics
- **Browser DevTools**: Monitor client-side performance

## Security Considerations

1. **Environment Variables**: Only `NEXT_PUBLIC_*` variables are available client-side
2. **API Keys**: Never expose sensitive keys in client-side code
3. **HTTPS**: Amplify automatically provides HTTPS
4. **CORS**: Configure CORS on external APIs properly

## Next Steps

1. Deploy to Amplify using the steps above
2. Test your application thoroughly
3. Set up monitoring and alerts
4. Configure custom domain if needed
5. Set up CI/CD for automatic deployments

## Support

- [AWS Amplify Documentation](https://docs.aws.amazon.com/amplify/)
- [Next.js Static Export Guide](https://nextjs.org/docs/advanced-features/static-html-export)
- [Amplify Hosting Guide](https://docs.aws.amazon.com/amplify/latest/userguide/getting-started.html)
