#!/bin/bash
# =============================================================
# SocialForge - Deploy to Google Cloud Run
# =============================================================
# Usage:
#   1. First time: Run steps 1-3 manually (see below)
#   2. Then: ./deploy.sh
# =============================================================

# ---- Configuration ----
PROJECT_ID="socialforge-app"        # Change if your GCP project ID is different
REGION="us-central1"                # Free tier region
SERVICE_NAME="socialforge"
MEMORY="1Gi"
CPU="1"
TIMEOUT="300"                       # 5 minutes max per request
MIN_INSTANCES="0"                   # Scale to zero (saves $$$)
MAX_INSTANCES="2"                   # Limit for free tier

# ---- Deploy ----
echo "🚀 Deploying SocialForge to Cloud Run..."
echo "   Project: $PROJECT_ID"
echo "   Region:  $REGION"
echo "   Service: $SERVICE_NAME"
echo ""

gcloud run deploy $SERVICE_NAME \
  --source . \
  --project $PROJECT_ID \
  --region $REGION \
  --allow-unauthenticated \
  --memory $MEMORY \
  --cpu $CPU \
  --timeout $TIMEOUT \
  --min-instances $MIN_INSTANCES \
  --max-instances $MAX_INSTANCES \
  --set-env-vars "NODE_ENV=production" \
  --port 8080

echo ""
echo "✅ Deploy complete!"
echo ""
echo "⚠️  IMPORTANT: Set environment variables in Cloud Run Console:"
echo "   https://console.cloud.google.com/run/detail/$REGION/$SERVICE_NAME/revisions?project=$PROJECT_ID"
echo ""
echo "   Required env vars:"
echo "   - NEXT_PUBLIC_APP_URL    (your Cloud Run URL, e.g. https://socialforge-xxxxx.run.app)"
echo "   - AUTH_SECRET"
echo "   - AUTH_URL               (same as NEXT_PUBLIC_APP_URL)"
echo "   - MONGODB_URI"
echo "   - ENCRYPTION_KEY"
echo "   - GROQ_API_KEY"
echo "   - DEEPSEEK_API_KEY"
echo "   - GEMINI_API_KEY"
echo "   - OPENROUTER_API_KEY"
echo "   - TOGETHER_API_KEY"
echo "   - CLOUDINARY_CLOUD_NAME"
echo "   - CLOUDINARY_API_KEY"
echo "   - CLOUDINARY_API_SECRET"
echo "   - META_APP_ID"
echo "   - META_APP_SECRET"
echo "   - TIKTOK_CLIENT_KEY"
echo "   - TIKTOK_CLIENT_SECRET"
echo "   - CRON_SECRET"
