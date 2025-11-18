# Nutrition Assistant App - Implementation Prompt

## Project Overview
Build a full-stack nutrition tracking application that uses natural language processing and LLM agents to help users track their food intake, macros, body metrics, and visualize their health progress over time.

## Core Features

### 1. Natural Language Food Logging
- **Primary Interface**: Chat-based interface where users can say things like:
  - "I ate 2 slices of edam cheese and a banana"
  - "Had a chicken Caesar salad for lunch"
  - "100g of almonds as a snack"
- **LLM Processing**: Parse natural language to extract:
  - Food items
  - Quantities (weight, volume, or count)
  - Meal type (breakfast, lunch, dinner, snack) - inferred or asked
  - Timestamp (default to current time, but allow "I had X for breakfast" → set appropriate time)

### 2. Intelligent Macro Lookup
- **Tavily Search Integration**:
  - When user enters new food, use Tavily API to search for nutritional information
  - Extract: calories, protein, carbs, fat, fiber per standardized serving (typically per 100g)
  - Use mean/standardized values from reputable sources (USDA, nutrition databases)
- **Caching**: Store looked-up nutritional data in database to avoid repeated searches
- **LLM-Assisted Extraction**: Use LLM to parse search results and extract relevant macro data

### 3. Multi-LLM Provider Support
**Supported Providers**:
- OpenAI (GPT-4, GPT-3.5-turbo)
- Anthropic Claude (Sonnet, Haiku)
- DeepSeek

**Configuration UI**:
- Settings page for API key management (encrypted storage)
- Model selection dropdown for each provider
- Test connection button
- Default model selection
- Cost tracking/token usage display (optional nice-to-have)

### 4. Database Schema

#### Tables Required:

**users**
- id (primary key)
- username
- email
- created_at
- settings (JSON: default_llm, default_model, preferences)

**food_items**
- id (primary key)
- name (unique, lowercase normalized)
- calories_per_100g
- protein_per_100g
- carbs_per_100g
- fat_per_100g
- fiber_per_100g
- source (e.g., "USDA", "Tavily Search")
- created_at
- last_updated

**recipes**
- id (primary key)
- user_id (foreign key, nullable for global recipes)
- name
- description
- servings
- instructions (text)
- created_at
- is_public (boolean)

**recipe_ingredients**
- id (primary key)
- recipe_id (foreign key)
- food_item_id (foreign key)
- amount_grams
- notes

**food_log**
- id (primary key)
- user_id (foreign key)
- food_item_id (foreign key, nullable)
- recipe_id (foreign key, nullable)
- amount_grams
- meal_type (breakfast, lunch, dinner, snack, other)
- logged_at (timestamp)
- notes
- calories (denormalized for performance)
- protein (denormalized)
- carbs (denormalized)
- fat (denormalized)
- fiber (denormalized)

**body_metrics**
- id (primary key)
- user_id (foreign key)
- measured_at (timestamp)
- weight_kg
- body_fat_percentage
- muscle_mass_kg
- bmi (calculated)
- notes

**api_keys**
- id (primary key)
- user_id (foreign key)
- provider (openai, anthropic, deepseek, tavily)
- encrypted_key
- is_active
- created_at

### 5. Recipe Management
**Features**:
- Create recipes by selecting ingredients from food database
- Specify quantities for each ingredient
- Calculate total macros per recipe and per serving
- Save custom recipes to personal library
- Quick log: "I ate one serving of [my recipe name]"
- Import/export recipes (JSON format)

### 6. Manual Editing Capabilities
**User Controls**:
- Edit any logged food entry (change quantity, macros, time)
- Delete entries
- Manually add food items with custom macros
- Adjust ingredient macros in database (with source = "user-modified")
- Bulk edit operations (e.g., adjust all entries from a day)

### 7. Visualization & Analytics

**Daily View Dashboard**:
- Date selector (default: today)
- Macro breakdown pie/donut chart (protein, carbs, fat)
- Calorie progress bar with daily goal
- Meal-by-meal breakdown table
- Fiber tracking
- Timeline view of meals

**Weekly View**:
- 7-day macro trends (line chart)
- Average daily calories
- Macro distribution consistency
- Most eaten foods (bar chart)

**Monthly View**:
- 30-day calorie trend
- Body metrics correlation (weight vs calories)
- Macro averages
- Goal adherence percentage

**Body Metrics Dashboard**:
- Weight progress line chart
- Body fat percentage trend
- Muscle mass trend
- Multi-metric overlay chart
- Goal setting and tracking
- Photo upload for progress pics (optional)

**Export Options**:
- CSV export for any date range
- PDF report generation
- Share-friendly summary cards

### 8. Agentic Workflow

**LLM Agent Capabilities**:
1. **Food Logger Agent**:
   - Parse natural language input
   - Trigger Tavily searches when needed
   - Confirm ambiguous entries with user
   - Suggest portion sizes

2. **Nutrition Advisor Agent**:
   - Analyze eating patterns
   - Suggest meals to meet macro goals
   - Identify nutritional gaps
   - Recipe recommendations

3. **Data Analyst Agent**:
   - Generate insights from trends
   - Correlate body metrics with nutrition
   - Answer questions like "Why did I gain weight last week?"

**Agentic Features**:
- Multi-step reasoning for complex queries
- Tool use: database queries, calculations, searches
- Memory of conversation context
- Proactive suggestions

## Technical Stack Recommendations

### Backend
- **Framework**: Python FastAPI or Node.js Express
- **Database**: PostgreSQL (relational data) + Redis (caching)
- **ORM**: SQLAlchemy (Python) or Prisma (Node.js)
- **LLM Integration**: LangChain or direct API clients
- **Search**: Tavily API client
- **Authentication**: JWT tokens
- **Encryption**: Fernet (Python) or crypto module for API keys

### Frontend
- **Framework**: React with TypeScript or Next.js
- **UI Library**: shadcn/ui, Chakra UI, or Material-UI
- **Charts**: Recharts, Chart.js, or Plotly
- **State Management**: Zustand or Redux Toolkit
- **Forms**: React Hook Form with Zod validation
- **Date Handling**: date-fns or dayjs

### Database
- **Primary**: PostgreSQL 14+
- **Migrations**: Alembic (Python) or Prisma Migrate (Node.js)
- **Connection Pooling**: PgBouncer (production)

### Deployment
- **Backend**: Docker container on Railway, Render, or Fly.io
- **Frontend**: Vercel, Netlify, or Cloudflare Pages
- **Database**: Supabase, Neon, or Railway PostgreSQL
- **Environment**: Docker Compose for local dev

## Detailed Requirements

### Security
- [ ] Encrypt all API keys at rest (AES-256)
- [ ] HTTPS only in production
- [ ] Rate limiting on API endpoints
- [ ] Input validation and sanitization
- [ ] SQL injection prevention (parameterized queries)
- [ ] CORS configuration
- [ ] Environment variables for secrets

### Error Handling
- [ ] Graceful degradation if LLM API fails
- [ ] Retry logic with exponential backoff for external APIs
- [ ] User-friendly error messages
- [ ] Logging (structured logs with levels)
- [ ] Fallback to cached data when search fails

### Performance
- [ ] Cache nutritional data lookups
- [ ] Lazy loading for charts
- [ ] Pagination for food logs
- [ ] Debounced search inputs
- [ ] Database indexes on foreign keys and timestamp columns
- [ ] Aggregate tables for analytics (optional optimization)

### User Experience
- [ ] Loading states for all async operations
- [ ] Optimistic UI updates
- [ ] Confirmation dialogs for deletions
- [ ] Keyboard shortcuts (e.g., Ctrl+K for quick add)
- [ ] Mobile-responsive design
- [ ] Dark mode support
- [ ] Onboarding tutorial
- [ ] Sample data for new users

## Database Setup Instructions

### 1. PostgreSQL Installation

**Local Development**:
```bash
# Using Docker
docker run --name nutrition-db \
  -e POSTGRES_PASSWORD=your_password \
  -e POSTGRES_DB=nutrition_app \
  -p 5432:5432 \
  -d postgres:14

# Or install natively
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS
brew install postgresql@14
```

**Production**:
- Use managed service: Supabase (free tier), Neon, or Railway
- Or self-hosted with regular backups

### 2. Database Initialization Script

**SQL Schema** (`db/init.sql`):
```sql
-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Food items
CREATE TABLE food_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    calories_per_100g DECIMAL(8,2) NOT NULL,
    protein_per_100g DECIMAL(6,2) NOT NULL,
    carbs_per_100g DECIMAL(6,2) NOT NULL,
    fat_per_100g DECIMAL(6,2) NOT NULL,
    fiber_per_100g DECIMAL(6,2) DEFAULT 0,
    source VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recipes
CREATE TABLE recipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    servings INTEGER DEFAULT 1,
    instructions TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recipe ingredients
CREATE TABLE recipe_ingredients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
    food_item_id UUID REFERENCES food_items(id) ON DELETE CASCADE,
    amount_grams DECIMAL(8,2) NOT NULL,
    notes TEXT
);

-- Food log
CREATE TABLE food_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    food_item_id UUID REFERENCES food_items(id) ON DELETE SET NULL,
    recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
    amount_grams DECIMAL(8,2) NOT NULL,
    meal_type VARCHAR(20) CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack', 'other')),
    logged_at TIMESTAMP NOT NULL,
    notes TEXT,
    calories DECIMAL(8,2),
    protein DECIMAL(6,2),
    carbs DECIMAL(6,2),
    fat DECIMAL(6,2),
    fiber DECIMAL(6,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Body metrics
CREATE TABLE body_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    measured_at TIMESTAMP NOT NULL,
    weight_kg DECIMAL(5,2),
    body_fat_percentage DECIMAL(4,2),
    muscle_mass_kg DECIMAL(5,2),
    bmi DECIMAL(4,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- API keys (encrypted)
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,
    encrypted_key TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, provider)
);

-- Indexes
CREATE INDEX idx_food_log_user_date ON food_log(user_id, logged_at);
CREATE INDEX idx_food_log_meal_type ON food_log(meal_type);
CREATE INDEX idx_body_metrics_user_date ON body_metrics(user_id, measured_at);
CREATE INDEX idx_food_items_name ON food_items(LOWER(name));
CREATE INDEX idx_recipes_user ON recipes(user_id);
```

### 3. Seed Data Script

**Sample data** (`db/seed.sql`):
```sql
-- Insert common food items
INSERT INTO food_items (name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, source) VALUES
('edam cheese', 357, 25, 1.4, 28, 0, 'USDA'),
('banana', 89, 1.1, 23, 0.3, 2.6, 'USDA'),
('chicken breast', 165, 31, 0, 3.6, 0, 'USDA'),
('almonds', 579, 21, 22, 50, 12.5, 'USDA'),
('white rice cooked', 130, 2.7, 28, 0.3, 0.4, 'USDA'),
('broccoli', 34, 2.8, 7, 0.4, 2.6, 'USDA'),
('salmon', 208, 20, 0, 13, 0, 'USDA'),
('eggs', 155, 13, 1.1, 11, 0, 'USDA'),
('olive oil', 884, 0, 0, 100, 0, 'USDA'),
('sweet potato', 86, 1.6, 20, 0.1, 3, 'USDA');
```

### 4. Environment Variables

**`.env.example`**:
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/nutrition_app
REDIS_URL=redis://localhost:6379

# API Keys (users will enter their own in the app)
# These are optional for server-side usage
DEFAULT_TAVILY_API_KEY=
DEFAULT_OPENAI_API_KEY=
DEFAULT_ANTHROPIC_API_KEY=
DEFAULT_DEEPSEEK_API_KEY=

# Encryption
ENCRYPTION_KEY=your-32-byte-key-here

# App
JWT_SECRET=your-jwt-secret
PORT=8000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# LLM Settings
DEFAULT_LLM_PROVIDER=openai
DEFAULT_LLM_MODEL=gpt-4-turbo-preview
```

### 5. Docker Compose Setup

**`docker-compose.yml`**:
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: nutrition_app
      POSTGRES_USER: nutrition_user
      POSTGRES_PASSWORD: nutrition_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./db/init.sql:/docker-entrypoint-initdb.d/01-init.sql
      - ./db/seed.sql:/docker-entrypoint-initdb.d/02-seed.sql

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://nutrition_user:nutrition_password@postgres:5432/nutrition_app
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis
    volumes:
      - ./backend:/app
    command: uvicorn main:app --host 0.0.0.0 --port 8000 --reload

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8000
    volumes:
      - ./frontend:/app
      - /app/node_modules
    command: npm run dev

volumes:
  postgres_data:
  redis_data:
```

## Deployment Instructions

### Option 1: All-in-One Platform (Easiest)

**Railway.app**:
1. Create new project
2. Add PostgreSQL plugin
3. Deploy backend:
   ```bash
   railway up
   ```
4. Add environment variables in Railway dashboard
5. Deploy frontend to Vercel:
   ```bash
   vercel --prod
   ```

### Option 2: Separate Services

**Backend** (Render/Fly.io):
```bash
# Dockerfile for backend
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Frontend** (Vercel):
```bash
cd frontend
vercel --prod
```

**Database** (Supabase/Neon):
- Create project in dashboard
- Run migrations
- Update DATABASE_URL

### Database Migration Commands

```bash
# Initialize migrations
alembic init migrations

# Create migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

## Nice-to-Have Features

### Phase 1 Enhancements
- [ ] Barcode scanner for packaged foods
- [ ] Photo-based food logging (image recognition)
- [ ] Meal planning suggestions
- [ ] Shopping list generation from planned meals
- [ ] Water intake tracking
- [ ] Exercise logging and calorie burn calculation
- [ ] Social features (share recipes, follow friends)
- [ ] Integration with fitness trackers (Fitbit, Apple Health)

### Phase 2 Advanced Features
- [ ] AI meal prep recommendations
- [ ] Budget tracking for groceries
- [ ] Restaurant menu analysis
- [ ] Allergen warnings and dietary restriction filters
- [ ] Micronutrient tracking (vitamins, minerals)
- [ ] Blood glucose tracking integration
- [ ] Meal timing optimization
- [ ] Voice input for logging
- [ ] Browser extension for quick logging
- [ ] Mobile apps (React Native)

## Testing Requirements

### Unit Tests
- [ ] Database models and migrations
- [ ] LLM parsing logic
- [ ] Macro calculations
- [ ] API key encryption/decryption

### Integration Tests
- [ ] API endpoints
- [ ] LLM agent workflows
- [ ] Tavily search integration
- [ ] Database transactions

### E2E Tests
- [ ] User registration and login
- [ ] Complete food logging workflow
- [ ] Recipe creation and usage
- [ ] Chart rendering
- [ ] Settings management

## Documentation Deliverables

1. **README.md**: Project overview, setup, and quick start
2. **DEPLOYMENT.md**: Step-by-step deployment guide
3. **API.md**: API endpoint documentation
4. **ARCHITECTURE.md**: System design and data flow
5. **USER_GUIDE.md**: End-user documentation
6. **CONTRIBUTING.md**: Development guidelines
7. **ENV_SETUP.md**: Environment variable configuration

## Success Criteria

The application is complete when:
- [ ] User can log food in natural language and see macros immediately
- [ ] LLM automatically searches and finds nutritional data
- [ ] Multiple LLM providers work (at least OpenAI and Claude)
- [ ] Recipes can be created, saved, and logged
- [ ] Body metrics can be tracked with visual graphs
- [ ] Daily, weekly, and monthly views show accurate data
- [ ] Manual editing of all data works correctly
- [ ] Deployment scripts work on fresh environment
- [ ] Database setup is automated
- [ ] Basic authentication works
- [ ] Mobile-responsive UI
- [ ] Performance is acceptable (<2s for most operations)

## Implementation Priority Order

1. **Core Database & Backend** (Week 1)
   - PostgreSQL schema
   - Basic API endpoints (CRUD)
   - Authentication

2. **LLM Integration** (Week 1-2)
   - Multi-provider support
   - Natural language parsing
   - Food extraction logic

3. **Tavily Search** (Week 2)
   - Search integration
   - Data extraction
   - Caching logic

4. **Frontend UI** (Week 2-3)
   - Chat interface
   - Food logging views
   - Settings page

5. **Recipe System** (Week 3)
   - Recipe CRUD
   - Ingredient selection
   - Macro calculation

6. **Body Metrics** (Week 3-4)
   - Metrics logging
   - Basic charts

7. **Analytics & Visualization** (Week 4)
   - Dashboard charts
   - Date range selectors
   - Export functionality

8. **Deployment** (Week 4)
   - Docker setup
   - Production deployment
   - Documentation

---

## Questions to Consider Before Starting

1. **Authentication**: Should we use email/password or add OAuth (Google, Apple)?
2. **Multi-user**: Is this single-user or multi-tenant from the start?
3. **Mobile**: Web-only first, or React Native simultaneously?
4. **Offline**: Should the app work offline with sync?
5. **Language**: Any specific language support beyond English?
6. **Units**: Support both metric and imperial?
7. **Time zones**: How to handle users in different time zones?
8. **Data retention**: Any policy for how long to keep logs?
9. **Privacy**: Can users export/delete all their data?
10. **Monetization**: Free tier + paid, or fully free?

---

## Final Notes for Claude Code

- **Code Quality**: Use TypeScript for type safety, write tests, add comments
- **Error Handling**: Never crash on bad input, always provide feedback
- **Logging**: Add structured logging throughout
- **Security**: Validate all inputs, sanitize outputs, encrypt secrets
- **Performance**: Add indexes, use caching, optimize queries
- **UX**: Loading states, error messages, success confirmations
- **Accessibility**: Semantic HTML, ARIA labels, keyboard navigation
- **Documentation**: Code comments, API docs, user guides

Please implement this step-by-step, asking for clarification when needed, and ensuring each component works before moving to the next. Create a clean, maintainable codebase that can be extended with new features easily.
