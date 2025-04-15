#!/bin/bash

# Get user input for stack name
# read -p "Enter the name of the CloudFormation stack: " 
stack_name="SamApp"

# Get the AWS Region from the stack
aws_region="us-east-2"

# Get the S3 Bucket Name from the stack
s3_bucket_name=$(aws cloudformation describe-stacks --stack-name "$stack_name" --query "Stacks[0].Outputs[?OutputKey=='WebS3BucketName'].OutputValue" --output text)

# Construct the S3 Bucket URL
# For buckets in standard regions, the URL format is: http://bucket-name.s3-website.region.amazonaws.com
# For buckets in regions using virtual-hosted-style URLs, the format is: http://bucket-name.s3-website.amazonaws.com

s3_bucket_url="http://$s3_bucket_name.s3-website-$aws_region.amazonaws.com"

# Output the results
# echo "CloudFront Distribution ID: $cloudfront_distribution_id"
echo "S3 Bucket Name: $s3_bucket_name"
echo "S3 Bucket URL: $s3_bucket_url"

# Move to frontend and install
cd frontend/dist/

# Sync distribution with S3
aws s3 sync . s3://$s3_bucket_name/

echo "You have successfully updated your bucket. URL: $s3_bucket_url"


# Create cloudfront invalidation and capture id for next step
# invalidation_output=$(aws cloudfront create-invalidation --distribution-id $cloudfront_distribution_id --paths "/*")
# invalidation_id=$(echo "$invalidation_output" | grep -oP '(?<="Id": ")[^"]+')

# Wait for cloudfront invalidation to complete
# aws cloudfront wait invalidation-completed --distribution-id $cloudfront_distribution_id --id $invalidation_id

# Get cloudfront domain name and validate
# cloudfront_domain_name=$(aws cloudfront list-distributions --query "DistributionList.Items[?Id=='$cloudfront_distribution_id'].DomainName" --output text)

# echo "The invalidation is now complete - please visit your cloudfront URL to test: $cloudfront_domain_name"
