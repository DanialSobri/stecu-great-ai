#!/bin/bash

rm -rf agent-package agent-lambda.zip
mkdir agent-package

cp lambda_agent_report_lambda.py agent-package/

cd agent-package
zip -r ../agent-lambda.zip .
cd ..

aws lambda create-function \
  --function-name accident-report-summarizer \
  --runtime python3.9 \
  --role arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):role/lambda-execution-role \
  --handler lambda_agent_report_lambda.lambda_handler \
  --zip-file fileb://agent-lambda.zip \
  --timeout 30 \
  --memory-size 256

echo "Agent Lambda function deployed successfully!"