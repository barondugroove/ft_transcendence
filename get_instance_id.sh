#!/bin/bash

ENV_FILE=./.env
ENV_TS_FILE=frontend/angular/src/env.ts

echo "EC2 Instance ID Retrieval Script"
echo "--------------------------------"

# Try metadata service
echo "Attempting to retrieve Instance ID from metadata service..."
INSTANCE_ID=$(curl -s http://169.254.169.254/latest/meta-data/instance-id)

if [ -n "$INSTANCE_ID" ]; then
    echo "Success! Instance ID: $INSTANCE_ID"
else
    echo "Failed to retrieve Instance ID from metadata service."
    
    # Try IMDSv2
    echo "Attempting to retrieve Instance ID using IMDSv2..."
    TOKEN=$(curl -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600" -s)
    if [ -n "$TOKEN" ]; then
        INSTANCE_ID=$(curl -H "X-aws-ec2-metadata-token: $TOKEN" -s http://169.254.169.254/latest/meta-data/instance-id)
        if [ -n "$INSTANCE_ID" ]; then
            echo "Success! Instance ID: $INSTANCE_ID"
        else
            echo "Failed to retrieve Instance ID using IMDSv2."
        fi
    else
        echo "Failed to retrieve token for IMDSv2."
    fi
fi

# If still no Instance ID, try AWS CLI
if [ -z "$INSTANCE_ID" ]; then
    echo "Attempting to retrieve Instance ID using AWS CLI..."
    INSTANCE_ID=$(aws ec2 describe-instances --filters "Name=instance-state-name,Values=running" --query "Reservations[0].Instances[0].InstanceId" --output text)
    if [ -n "$INSTANCE_ID" ] && [ "$INSTANCE_ID" != "None" ]; then
        echo "Success! Instance ID: $INSTANCE_ID"
    else
        echo "Failed to retrieve Instance ID using AWS CLI."
        echo "Please ensure you're running this script on an EC2 instance and have proper IAM permissions."
    fi
fi

if [ -n "$INSTANCE_ID" ]; then
    PUBLIC_IP=$(aws ec2 describe-instances --instance-ids $INSTANCE_ID --query "Reservations[0].Instances[0].PublicIpAddress" --output text --region eu-north-1);
    if [ -n "$PUBLIC_IP" ]; then
        echo "Updating .env with public IP: $PUBLIC_IP:8000/api"
        sed -i "/^IP_SERVER *=/d" "$ENV_FILE"
        echo "IP_SERVER = ${PUBLIC_IP}:8000/api" >> "$ENV_FILE"
        echo "Updating Angular env.ts with public IP: $PUBLIC_IP:8000/api"
        sed -i "s|IP_SERVER = .*|IP_SERVER = '${PUBLIC_IP}:8000/api';|g" "$ENV_TS_FILE"
    else
        echo "Failed to retrieve public IP"
    fi
else
    echo "Failed to retrieve instance id."
fi
