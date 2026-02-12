#!/bin/bash
echo "Creating S3 bucket for sumitsugi..."
awslocal s3 mb s3://sumitsugi
echo "Bucket created successfully."
