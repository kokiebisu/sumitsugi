#!/bin/bash
echo "Creating S3 bucket for tsumugi..."
awslocal s3 mb s3://tsumugi
echo "Bucket created successfully."
