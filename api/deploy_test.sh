#!/bin/bash

# Create deployment package for test lambda
rm -rf test-package test-lambda.zip
mkdir test-package

# Copy Lambda function
cp test_lambda.py test-package/

# Create ZIP file
cd test-package
zip -r ../test-lambda.zip .
cd ..

# Deploy test Lambda function
aws lambda create-function \
  --function-name test-lambda \
  --runtime python3.9 \
  --role arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):role/lambda-execution-role \
  --handler test_lambda.lambda_handler \
  --zip-file fileb://test-lambda.zip \
  --timeout 10 \
  --memory-size 128

echo "Test Lambda function deployed successfully!"