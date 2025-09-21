# InsurerEdge AI - Autonomous Claim Solution

An AI-powered insurance claim processing system that leverages AWS services for intelligent document analysis, automated report generation, and seamless claim resolution.

## 🏗️ AWS Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        AWS Cloud Architecture                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐    ┌──────────────────┐    ┌─────────────┐ │
│  │   CloudFront    │    │   AWS Amplify    │    │   Route 53  │ │
│  │   (CDN/Cache)   │◄──►│  (Static Host)   │◄──►│    (DNS)    │ │
│  └─────────────────┘    └──────────────────┘    └─────────────┘ │
│           │                       │                             │
│           ▼                       ▼                             │
│  ┌─────────────────┐    ┌──────────────────┐                   │
│  │    S3 Bucket    │    │   Next.js App    │                   │
│  │ (Static Assets) │    │ (React Frontend) │                   │
│  └─────────────────┘    └──────────────────┘                   │
│                                   │                             │
│                                   ▼                             │
│  ┌─────────────────────────────────────────────────────────────┤
│  │                 API Gateway                                 │
│  │              (REST API Endpoints)                           │
│  └─────────────────────────────────────────────────────────────┤
│                                   │                             │
│                                   ▼                             │
│  ┌─────────────────┐    ┌──────────────────┐    ┌─────────────┐ │
│  │  AWS Lambda     │    │  Amazon Bedrock  │    │ CloudWatch  │ │
│  │ (AI Processing) │◄──►│   (AI Models)    │    │ (Monitoring)│ │
│  └─────────────────┘    └──────────────────┘    └─────────────┘ │
│           │                       │                             │
│           ▼                       ▼                             │
│  ┌─────────────────┐    ┌──────────────────┐                   │
│  │      IAM        │    │   S3 Bucket      │                   │
│  │   (Security)    │    │ (File Storage)   │                   │
│  └─────────────────┘    └──────────────────┘                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 🚀 Key Features

- **AI-Powered Analysis**: Automated incident report generation using Amazon Bedrock
- **Multi-Modal Processing**: Support for photos, videos, and voice transcriptions
- **Real-time Processing**: Instant AI summaries and claim assessments
- **Multi-Dashboard System**: Separate interfaces for claimers, insurance agents, and police
- **Serverless Architecture**: Cost-effective, scalable AWS infrastructure

## 📋 Prerequisites

- AWS Account with appropriate permissions
- Node.js 18+ installed
- AWS CLI configured
- GitHub account for repository hosting

## 🏛️ AWS Services Used

| Service | Purpose | Configuration |
|---------|---------|---------------|
| **AWS Amplify** | Static web hosting, CI/CD | Frontend deployment |
| **Amazon Bedrock** | AI model inference | GPT-based text generation |
| **AWS Lambda** | Serverless compute | AI processing functions |
| **API Gateway** | REST API management | CORS-enabled endpoints |
| **CloudFront** | CDN and caching | Global content delivery |
| **S3** | Static asset storage | File uploads and storage |
| **IAM** | Security and permissions | Role-based access control |
| **CloudWatch** | Monitoring and logging | Performance metrics |

## 🚀 Deployment Guide

### Phase 1: Backend Infrastructure Setup

#### 1. Deploy Lambda Functions

```bash
# Navigate to API directory
cd api

# Deploy AI processing Lambda
chmod +x deploy_agent.sh
./deploy_agent.sh

# Deploy test Lambda (optional)
chmod +x deploy_test.sh
./deploy_test.sh
```

#### 2. Configure IAM Permissions

Create IAM role for Lambda with Bedrock access:

```bash
aws iam create-role --role-name lambda-bedrock-role \
  --assume-role-policy-document file://bedrock-policy.json

aws iam attach-role-policy --role-name lambda-bedrock-role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
```

#### 3. Set up API Gateway

1. Create REST API in AWS Console
2. Create resources and methods
3. Configure CORS settings
4. Deploy API to stage

### Phase 2: Frontend Deployment

#### 1. Connect Repository to Amplify

```bash
# Clone repository
git clone <your-repo-url>
cd stecu-great-ai

# Install dependencies
cd my-app
npm install
```

#### 2. Configure Amplify

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click "New app" → "Host web app"
3. Connect your GitHub repository
4. Select branch (main/master)

#### 3. Build Configuration

Amplify will automatically detect `amplify.yml`:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - cd my-app
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: my-app/out
    files:
      - '**/*'
  cache:
    paths:
      - my-app/node_modules/**/*
      - my-app/.next/cache/**/*
```

#### 4. Environment Variables

Add in Amplify Console → App settings → Environment variables:

```
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_API_ENDPOINT=<your-api-gateway-url>
```

### Phase 3: Integration & Testing

#### 1. API Integration

Update frontend API calls to point to your Lambda functions:

```typescript
const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;

const response = await fetch(`${API_ENDPOINT}/generate-summary`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ transcription: userInput }),
});
```

#### 2. Test Deployment

```bash
# Local testing
cd my-app
npm run dev

# Build testing
npm run build
npm start
```

## 🔧 Configuration Files

### Next.js Configuration (`next.config.mjs`)

```javascript
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  compress: true,
  poweredByHeader: false,
};
```

### Lambda Function Structure

```python
import boto3
import json

def lambda_handler(event, context):
    # AI processing logic
    client = boto3.client("bedrock-runtime", region_name="us-east-1")
    
    # Process request and return AI-generated summary
    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        'body': json.dumps(response_data)
    }
```

## 📊 Monitoring & Maintenance

### CloudWatch Metrics

Monitor key metrics:
- Lambda function duration and errors
- API Gateway request count and latency
- Amplify build success rate
- Bedrock model invocation costs

### Cost Optimization

- **Lambda**: Pay per request, optimize function memory
- **Bedrock**: Monitor token usage and model selection
- **Amplify**: Static hosting with CDN caching
- **S3**: Lifecycle policies for file storage

## 🔒 Security Best Practices

1. **IAM Roles**: Least privilege access for all services
2. **API Security**: CORS configuration and rate limiting
3. **Data Encryption**: In-transit and at-rest encryption
4. **Environment Variables**: Secure storage of sensitive data
5. **VPC**: Consider VPC deployment for enhanced security

## 🚨 Troubleshooting

### Common Issues

**Build Failures**
```bash
# Check Node.js version
node --version  # Should be 18+

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Lambda Timeout**
- Increase timeout in Lambda configuration
- Optimize Bedrock model parameters
- Implement async processing for large requests

**CORS Issues**
- Verify API Gateway CORS settings
- Check Lambda response headers
- Test with browser developer tools

## 📈 Scaling Considerations

- **Auto Scaling**: Lambda automatically scales with demand
- **CDN Caching**: CloudFront reduces origin load
- **Database**: Consider DynamoDB for user data storage
- **File Processing**: Use S3 event triggers for large files

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **AWS Documentation**: [AWS Amplify](https://docs.aws.amazon.com/amplify/)
- **Bedrock Guide**: [Amazon Bedrock](https://docs.aws.amazon.com/bedrock/)
- **Next.js Docs**: [Next.js](https://nextjs.org/docs)

---

**Built with ❤️ using AWS serverless technologies**