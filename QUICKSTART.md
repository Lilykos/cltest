# Quick Start Guide

Get your Nutrition Assistant app running in 5 minutes!

## Prerequisites

- Docker and Docker Compose installed
- API keys ready:
  - **ONE** LLM provider (OpenAI, Claude, or DeepSeek)
  - Tavily Search API key

## Step 1: Generate Encryption Key

```bash
python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

Copy the output (something like `gAAAAAB...`)

## Step 2: Configure Environment

Open `.env` and update these critical values:

```bash
# Paste your generated key from Step 1
ENCRYPTION_KEY=your-generated-key-here

# Change to a random secure string
JWT_SECRET=your-random-secret-at-least-32-chars
```

## Step 3: Start the Application

```bash
# Start all services (PostgreSQL, Redis, Backend, Frontend)
docker-compose up -d

# Wait about 30 seconds for services to start
# Watch the logs
docker-compose logs -f
```

## Step 4: Access the Application

Open your browser to: **http://localhost:3000**

## Step 5: Create Your Account

1. Click "Register"
2. Fill in:
   - Username (min 3 characters)
   - Email
   - Password (min 8 characters)
3. You'll be automatically logged in

## Step 6: Add API Keys

1. Click "Settings" in the navigation
2. Add your API keys:

   **LLM Provider (choose ONE):**
   - OpenAI: Get from https://platform.openai.com/api-keys
   - Anthropic Claude: Get from https://console.anthropic.com/
   - DeepSeek: Get from https://platform.deepseek.com/

   **Tavily Search (REQUIRED):**
   - Get from https://tavily.com/

3. Paste each key and click "Save"
4. Wait for the green checkmark (✓ Configured)

## Step 7: Log Your First Meal!

1. Click "Log Food"
2. Type something like:
   ```
   I had 2 eggs, toast with peanut butter, and a banana for breakfast
   ```
3. Click "Log Food"
4. Wait 5-10 seconds while the AI processes
5. Success! Go to Dashboard to see your macros

## What Just Happened?

The app:
1. Used your LLM to parse "2 eggs, toast, peanut butter, banana"
2. Searched Tavily for nutritional data on unknown foods
3. Calculated exact macros based on estimated portions
4. Logged everything to your database
5. Updated your daily summary

## Common Issues

### "No active API key found"
- Go to Settings and make sure you saved both:
  - At least ONE LLM provider (OpenAI/Claude/DeepSeek)
  - Tavily Search API key
- Look for the green checkmark next to each

### Services won't start
```bash
# Check if ports are already in use
docker-compose down
docker ps  # Make sure nothing is using ports 3000, 5432, 6379, 8000

# Restart
docker-compose up -d
```

### Database connection errors
```bash
# Reset database
docker-compose down -v
docker-compose up -d
```

## Next Steps

### Explore Features

**Dashboard** - View your daily macro breakdown

**Log Food** - Use natural language to log meals

**Settings** - Manage API keys, select LLM model

**Body Metrics** - Track weight, body fat %, muscle mass

**Recipes** - Create custom recipes (API ready, UI can be extended)

### Customize

**Change LLM Provider:**
1. Go to Settings
2. Add API key for different provider
3. In user settings (stored in database), you can specify preferred provider

**Add More Foods:**
- Just log them using natural language
- The app will automatically search and add them

**Manual Entry:**
- Use the API directly at http://localhost:8000/docs
- Full CRUD operations available

## API Documentation

Interactive API docs: **http://localhost:8000/docs**

Try the endpoints:
1. Click "Authorize"
2. Login to get your token
3. Paste token in authorization
4. Test all endpoints

## File Structure

```
/home/user/cltest/
├── backend/           # FastAPI backend
├── frontend/          # Next.js frontend
├── db/                # Database init scripts
├── docker-compose.yml # All services
├── .env               # Your configuration
├── README.md          # Full documentation
├── DEPLOYMENT.md      # Production deployment guide
└── QUICKSTART.md      # This file
```

## Useful Commands

```bash
# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Restart a service
docker-compose restart backend

# Stop everything
docker-compose down

# Stop and remove all data
docker-compose down -v

# Check service status
docker-compose ps

# Access database
docker exec -it nutrition_postgres psql -U nutrition_user -d nutrition_app
```

## Pro Tips

### Better Natural Language Parsing

Be specific with quantities:
- ✅ "I had 100g of chicken breast"
- ✅ "Ate 2 slices of bread"
- ✅ "Had a medium banana"
- ❌ "Ate some chicken" (will estimate, may be inaccurate)

### Meal Types

The app auto-detects meal types, but you can be explicit:
- "I had eggs for breakfast"
- "Lunch was a chicken salad"
- "Dinner: salmon with rice"
- "Had almonds as a snack"

### Recipes (via API)

Create a recipe once, reuse forever:
1. Go to http://localhost:8000/docs
2. POST /api/recipes
3. Add ingredients with quantities
4. Then just say: "I had one serving of my protein shake recipe"

### Cost Optimization

**Cheapest combo:**
- DeepSeek LLM (~$0.14 per 1M tokens)
- Tavily free tier (1000 searches/month)
- **Total for 100 meals/month:** ~$0.50

**Best quality:**
- OpenAI GPT-4 or Claude Sonnet
- Tavily paid
- **Total for 100 meals/month:** ~$5-10

## Support

If something isn't working:

1. Check logs: `docker-compose logs -f`
2. Verify API keys are saved in Settings
3. Check troubleshooting in README.md
4. Inspect backend errors at http://localhost:8000/docs

## What's Next?

This app is fully functional and ready to:
- Track your nutrition daily
- Build a food database automatically
- Monitor your progress
- Export data (via API)

**Ready to extend it?**
- Add charts to frontend (Recharts already installed)
- Build recipe management UI
- Add barcode scanner
- Integrate with fitness trackers
- Deploy to production (see DEPLOYMENT.md)

---

**Enjoy tracking! 🥗📊**
