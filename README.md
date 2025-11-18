# Nutrition Assistant App

An AI-powered nutrition tracking application that allows you to log food using natural language, automatically finds nutritional data, tracks macros, manages recipes, and visualizes your progress over time.

## Features

### Core Functionality
- ✅ **Natural Language Food Logging**: Say "I ate 2 slices of edam cheese and a banana" and the app automatically logs the macros
- ✅ **Multi-LLM Support**: Choose between OpenAI (GPT), Anthropic (Claude), or DeepSeek
- ✅ **Automatic Nutrition Lookup**: Uses Tavily Search API to find nutritional information for unknown foods
- ✅ **Recipe Management**: Create recipes with multiple ingredients and log them with one click
- ✅ **Body Metrics Tracking**: Track weight, body fat %, muscle mass, BMI over time
- ✅ **Analytics Dashboard**: Daily, weekly, and monthly views with charts
- ✅ **Manual Editing**: Full CRUD operations on all data
- ✅ **Secure API Key Storage**: All API keys are encrypted in the database

### Technology Stack

**Backend:**
- FastAPI (Python)
- PostgreSQL database
- SQLAlchemy ORM
- JWT authentication
- Encrypted API key storage (Fernet)
- LLM integrations (OpenAI, Anthropic, DeepSeek)
- Tavily Search integration

**Frontend:**
- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- Zustand for state management
- Axios for API calls
- Recharts for data visualization (ready to use)

**Database:**
- PostgreSQL 14+
- Redis for caching (configured)
- Full relational schema with indexes

## Project Structure

```
nutrition-assistant/
├── backend/                  # FastAPI backend
│   ├── app/
│   │   ├── api/             # API routes
│   │   │   ├── auth.py      # Authentication endpoints
│   │   │   ├── food_items.py
│   │   │   ├── food_logs.py
│   │   │   ├── recipes.py
│   │   │   ├── body_metrics.py
│   │   │   ├── api_keys.py
│   │   │   └── analytics.py
│   │   ├── models/          # SQLAlchemy models
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── services/        # Business logic
│   │   │   ├── llm_service.py
│   │   │   ├── tavily_service.py
│   │   │   └── food_parser.py
│   │   ├── utils/           # Utilities
│   │   │   ├── auth.py
│   │   │   └── encryption.py
│   │   ├── db/              # Database setup
│   │   ├── config.py        # Configuration
│   │   └── main.py          # FastAPI app
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/                # Next.js frontend
│   ├── src/
│   │   ├── app/             # Next.js pages
│   │   │   ├── page.tsx     # Home
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── dashboard/
│   │   │   ├── chat/        # Natural language logging
│   │   │   └── settings/    # API key management
│   │   ├── components/      # React components
│   │   ├── lib/             # Utilities
│   │   │   └── api.ts       # API client
│   │   ├── store/           # Zustand stores
│   │   └── types/           # TypeScript types
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
├── db/                      # Database scripts
│   ├── init.sql             # Schema creation
│   └── seed.sql             # Sample data
├── docker-compose.yml       # Full stack orchestration
├── .env.example             # Environment template
└── README.md
```

## Quick Start (Local Development)

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local frontend development)
- Python 3.11+ (for local backend development)

### 1. Clone and Setup

```bash
git clone <your-repo>
cd nutrition-assistant

# Copy environment template
cp .env.example .env
```

### 2. Configure Environment Variables

Edit `.env` and set:

```bash
# Generate encryption key
python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"

# Add the generated key to .env
ENCRYPTION_KEY=your-generated-key-here

# Generate a secure JWT secret
JWT_SECRET=your-random-secret-here-change-in-production

# Optional: Add default API keys (users can also add their own in the UI)
DEFAULT_OPENAI_API_KEY=sk-...
DEFAULT_ANTHROPIC_API_KEY=sk-ant-...
DEFAULT_DEEPSEEK_API_KEY=sk-...
DEFAULT_TAVILY_API_KEY=tvly-...
```

### 3. Start with Docker Compose

```bash
# Start all services (PostgreSQL, Redis, Backend, Frontend)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### 4. Create Your First Account

1. Navigate to http://localhost:3000
2. Click "Register"
3. Create an account
4. Go to Settings and add your API keys:
   - At least ONE LLM provider (OpenAI, Claude, or DeepSeek)
   - Tavily Search API key (required for food lookup)

### 5. Start Logging Food!

1. Go to "Log Food"
2. Type something like: "I had 2 eggs, toast with peanut butter, and a banana for breakfast"
3. The app will:
   - Parse your input using the LLM
   - Search for nutritional data using Tavily
   - Calculate macros
   - Log everything to your food diary

## API Keys Required

### LLM Provider (choose one or more)

**OpenAI** - Most popular option
- Get key: https://platform.openai.com/api-keys
- Recommended model: `gpt-3.5-turbo` or `gpt-4`

**Anthropic Claude** - High quality alternative
- Get key: https://console.anthropic.com/
- Recommended model: `claude-3-haiku-20240307`

**DeepSeek** - Cost-effective option
- Get key: https://platform.deepseek.com/
- Recommended model: `deepseek-chat`

### Tavily Search (Required)

**Tavily** - For nutritional data lookup
- Get key: https://tavily.com/
- Free tier available

## Database Schema

The app uses PostgreSQL with the following tables:

- `users` - User accounts
- `food_items` - Food database with nutritional info (auto-populated)
- `recipes` - Custom user recipes
- `recipe_ingredients` - Recipe → Food Item mapping
- `food_log` - All logged meals
- `body_metrics` - Weight and body composition tracking
- `api_keys` - Encrypted API keys per user

All tables use UUIDs and include proper foreign keys, indexes, and constraints.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login (returns JWT token)
- `GET /api/auth/me` - Get current user

### Food Logging
- `GET /api/food-logs` - List food logs (with filters)
- `POST /api/food-logs` - Create food log manually
- `POST /api/food-logs/natural-language` - Log food with AI
- `PATCH /api/food-logs/{id}` - Update food log
- `DELETE /api/food-logs/{id}` - Delete food log

### Food Items
- `GET /api/food-items` - Search food database
- `POST /api/food-items` - Add custom food
- `PATCH /api/food-items/{id}` - Update food item
- `DELETE /api/food-items/{id}` - Delete food item

### Recipes
- `GET /api/recipes` - List recipes
- `POST /api/recipes` - Create recipe
- `PATCH /api/recipes/{id}` - Update recipe
- `DELETE /api/recipes/{id}` - Delete recipe

### Body Metrics
- `GET /api/body-metrics` - List metrics
- `POST /api/body-metrics` - Add metric
- `PATCH /api/body-metrics/{id}` - Update metric
- `DELETE /api/body-metrics/{id}` - Delete metric

### Analytics
- `GET /api/analytics/daily-summary` - Daily macro summary
- `GET /api/analytics/weekly-summary` - 7-day trends
- `GET /api/analytics/monthly-summary` - Monthly overview
- `GET /api/analytics/body-metrics-trends` - Body composition trends

### API Keys
- `GET /api/api-keys` - List configured providers
- `POST /api/api-keys` - Add/update API key
- `DELETE /api/api-keys/{provider}` - Remove API key

Full API documentation available at http://localhost:8000/docs

## Deployment

### Option 1: Railway (Recommended for Beginners)

1. Create Railway account
2. Create new project
3. Add PostgreSQL plugin
4. Deploy backend:
   ```bash
   cd backend
   railway up
   ```
5. Add environment variables in Railway dashboard
6. Deploy frontend to Vercel:
   ```bash
   cd frontend
   vercel --prod
   ```

### Option 2: Separate Services

**Database:** Use managed PostgreSQL
- Supabase (free tier)
- Neon (free tier)
- Railway PostgreSQL

**Backend:** Deploy to
- Render.com
- Fly.io
- Railway

**Frontend:** Deploy to
- Vercel (recommended)
- Netlify
- Cloudflare Pages

### Environment Variables for Production

Backend `.env`:
```bash
DATABASE_URL=postgresql://user:pass@host:5432/dbname
REDIS_URL=redis://host:6379
ENCRYPTION_KEY=your-production-key
JWT_SECRET=your-production-secret
CORS_ORIGINS=https://your-frontend-url.com
ENVIRONMENT=production
```

Frontend `.env.production`:
```bash
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

## Usage Guide

### Natural Language Food Logging

The app understands phrases like:

- "I had 2 slices of edam cheese and a banana"
- "Ate a chicken breast with 200g of rice for lunch"
- "100g of almonds as a snack"
- "Dinner was salmon with broccoli"

The LLM will:
1. Extract food items and quantities
2. Infer meal type (breakfast, lunch, dinner, snack)
3. Estimate weights if not specified
4. Search for unknown foods using Tavily
5. Calculate total macros

### Creating Recipes

1. Go to Recipes page (to be implemented in UI, API ready)
2. Add recipe name and servings
3. Add ingredients from food database
4. Specify quantities for each
5. Save recipe
6. Log "1 serving of [recipe name]" in chat

### Manual Data Entry

All data can be manually edited:
- Edit logged food amounts or macros
- Add custom food items with your own nutritional data
- Modify recipe ingredients
- Delete any entry

### Tracking Progress

- **Daily View**: See today's macro breakdown by meal
- **Weekly View**: 7-day trends and averages
- **Monthly View**: Full month overview
- **Body Metrics**: Chart weight, body fat, muscle mass over time

## Development

### Backend Development

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Run database migrations (if using Alembic)
alembic upgrade head

# Start development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
npm start
```

### Database Management

```bash
# Access PostgreSQL
docker exec -it nutrition_postgres psql -U nutrition_user -d nutrition_app

# Run seed data
docker exec -i nutrition_postgres psql -U nutrition_user -d nutrition_app < db/seed.sql

# Backup database
docker exec nutrition_postgres pg_dump -U nutrition_user nutrition_app > backup.sql

# Restore database
docker exec -i nutrition_postgres psql -U nutrition_user nutrition_app < backup.sql
```

## Troubleshooting

### "Could not validate credentials" error
- Make sure you're logged in
- Token may have expired, try logging in again
- Check that JWT_SECRET is set correctly

### "No active API key found" error
- Go to Settings and add your LLM provider API key
- Make sure you also add Tavily API key
- Check that keys are saved (green checkmark)

### Food not logging correctly
- Verify LLM and Tavily API keys are set
- Check backend logs: `docker-compose logs backend`
- Ensure you have credits/quota on your API provider accounts

### Database connection errors
- Make sure PostgreSQL is running: `docker-compose ps`
- Check DATABASE_URL is correct
- Verify network connectivity

## Future Enhancements

The codebase is designed to easily add:

- [ ] Barcode scanner for packaged foods
- [ ] Photo-based food recognition
- [ ] Weekly meal planning
- [ ] Shopping list generation
- [ ] Social features (share recipes)
- [ ] Fitness tracker integration
- [ ] Mobile apps (React Native)
- [ ] Water intake tracking
- [ ] Micronutrient tracking
- [ ] Goal setting and recommendations

## Security Notes

- All passwords are hashed using bcrypt
- API keys are encrypted using Fernet (AES-256)
- JWT tokens expire after 1 week (configurable)
- CORS is configured to only allow your frontend
- SQL injection prevention via SQLAlchemy
- Input validation with Pydantic

## Contributing

This is a personal project, but suggestions and bug reports are welcome!

## License

MIT License - feel free to use this for your own projects.

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review API docs at `/docs`
3. Check backend logs for errors
4. Ensure all environment variables are set correctly

---

**Happy tracking! 🥗📊**
