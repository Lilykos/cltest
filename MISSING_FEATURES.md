# Missing Features - Gap Analysis

## Critical Missing Features (From Original Spec)

### 🔴 **HIGH PRIORITY - Core Functionality Gaps**

#### 1. **Recipe Edit Functionality** ❌
**Status:** Can create and view recipes, but CANNOT edit them
**What's Missing:**
- Edit recipe name, description, servings
- Modify ingredient list (add/remove ingredients)
- Update ingredient amounts
- Frontend edit form for recipes

**Impact:** Users can't fix mistakes in recipes
**Effort:** 1-2 hours
**API:** ✅ Backend PATCH endpoint exists

---

#### 2. **Log Recipe via UI** ❌
**Status:** Can only log recipes via natural language
**What's Missing:**
- "Log This Recipe" button on recipe cards
- Quick-log form: select servings → log
- Show macro preview before logging

**Impact:** Users must use natural language to log recipes
**Effort:** 1 hour
**API:** ✅ Backend supports it

---

#### 3. **Goal Setting System** ❌
**Status:** No goals feature exists
**What's Missing:**
- **Backend:**
  - Goals table (user_id, daily_calories, daily_protein, daily_carbs, daily_fat, weight_goal)
  - GET/POST/PATCH endpoints for goals

- **Frontend:**
  - Goals settings page
  - Progress bars on dashboard showing % of daily goals
  - Goal vs actual comparison charts
  - Weekly goal adherence tracking

**Impact:** No way to track if users are meeting targets
**Effort:** 3-4 hours (backend + frontend)
**Priority:** HIGH - This is a core feature

---

#### 4. **Manual Food Creation UI** ❌
**Status:** Can only add foods via natural language (which triggers Tavily)
**What's Missing:**
- Form to manually add food items with custom macros
- Useful for: homemade foods, regional foods, protein supplements
- Edit existing food items
- Delete unused foods

**Impact:** Users stuck with what's in database or must use natural language
**Effort:** 1-2 hours
**API:** ✅ Backend POST/PATCH/DELETE endpoints exist

---

#### 5. **Model Selection in Settings** ❌
**Status:** User settings support it, but no UI
**What's Missing:**
- Dropdown to select LLM provider (OpenAI/Claude/DeepSeek)
- Dropdown to select model per provider
- Save preference to user.settings
- Show current selection

**Impact:** Users can't choose their preferred LLM without editing database
**Effort:** 1 hour
**API:** ✅ Backend supports settings JSON field

---

### 🟡 **MEDIUM PRIORITY - Expected Features**

#### 6. **CSV Export** ❌
**What's Missing:**
- Export food logs for date range
- Export body metrics
- Export recipes
- Download as .csv file

**Impact:** Users can't analyze data in Excel/Sheets
**Effort:** 1-2 hours
**Implementation:** Add export endpoints + frontend download buttons

---

#### 7. **Dark Mode** ❌
**What's Missing:**
- Theme toggle (light/dark)
- Persist preference in localStorage
- Dark mode CSS for all pages
- Icon showing current theme

**Impact:** Eye strain for nighttime users
**Effort:** 2-3 hours
**Implementation:** Tailwind dark mode + context provider

---

#### 8. **Meal Templates** ❌
**What's Missing:**
- **Backend:**
  - Templates table (user_id, name, meal_type)
  - Template_items table (template_id, food_item_id, amount_grams)
  - CRUD endpoints

- **Frontend:**
  - Templates management page
  - Save current meal as template
  - Quick-log from template
  - Edit/delete templates

**Impact:** Users must re-enter frequent meals every time
**Effort:** 4-5 hours
**Priority:** Would be very useful for users

---

#### 9. **Nutrition Insights (LLM-powered)** ❌
**What's Missing:**
- Analyze eating patterns with LLM
- Generate insights: "You're low on protein this week"
- Meal suggestions to hit goals
- Weekly nutrition report
- Alerts for nutritional deficiencies

**Impact:** Missed opportunity for AI to provide value
**Effort:** 3-4 hours
**Implementation:** New LLM agent + insights endpoint

---

#### 10. **Water Intake Tracking** ❌
**What's Missing:**
- **Backend:**
  - Water_log table (user_id, amount_ml, logged_at)
  - CRUD endpoints

- **Frontend:**
  - Water counter widget
  - Quick-add buttons (250ml, 500ml, 1L)
  - Daily goal setting
  - Hydration chart

**Impact:** Missing a common health tracking feature
**Effort:** 2-3 hours

---

### 🟢 **LOW PRIORITY - Nice to Have**

#### 11. **Recent/Favorite Foods** ❌
**What's Missing:**
- Track frequently logged foods
- "Recent Foods" section on manual entry
- Star/favorite foods
- Quick-access to top 10 foods

**Effort:** 1-2 hours
**Impact:** Quality of life improvement

---

#### 12. **User Profile Settings** ❌
**What's Missing:**
- Height (for BMI calculations)
- Age
- Gender
- Activity level (for calorie recommendations)
- Password change
- Email change

**Effort:** 2 hours
**Impact:** Currently BMI calculation assumes fixed height

---

#### 13. **Food Database Enhancements** ⚠️
**What's Missing:**
- Pagination on food lists (currently loads all 500+)
- Food search with filters (by calorie range, protein content, etc.)
- Bulk import from CSV
- Food categories/tags

**Effort:** 2-3 hours
**Impact:** Performance issue with large food database

---

#### 14. **Recipe Enhancements** ⚠️
**What's Missing:**
- Recipe photos
- Recipe rating/reviews
- Recipe categories (breakfast, dinner, dessert, etc.)
- Recipe search/filter
- Recipe favorites
- Recipe sharing (export/import JSON)
- Serving size calculator

**Effort:** 4-6 hours
**Impact:** Makes recipes more useful and discoverable

---

#### 15. **Analytics Enhancements** ⚠️
**What's Missing:**
- Body metrics correlation with nutrition (e.g., weight vs calories chart)
- Meal timing analysis (what time do you eat most?)
- Food frequency report (top 20 most eaten foods)
- Macro ratio trends (protein % over time)
- Compare weeks (this week vs last week)
- Meal adherence score

**Effort:** 3-4 hours
**Impact:** Deeper insights into eating patterns

---

#### 16. **Dashboard Improvements** ⚠️
**Current:** Shows today's totals only
**Missing:**
- Goal progress bars (requires goal setting)
- Recent foods widget
- Quick stats (weekly average, streak counter)
- Upcoming meals (if meal planning exists)
- Water intake widget
- Weight change indicator

**Effort:** 2-3 hours (after goals are implemented)

---

### 🔵 **TECHNICAL DEBT / PERFORMANCE**

#### 17. **Redis Caching** ⚠️
**Status:** Redis configured in docker-compose, but NOT used
**What's Missing:**
- Cache food item lookups
- Cache Tavily search results
- Cache daily/weekly summaries

**Impact:** Repeated API calls, slower responses
**Effort:** 2-3 hours

---

#### 18. **Pagination** ⚠️
**Status:** Food logs and food items load ALL records
**What's Missing:**
- Pagination on food-logs page
- Pagination on recipes page
- Load more / infinite scroll

**Impact:** Slow with 1000+ logs
**Effort:** 2 hours

---

#### 19. **Loading States** ⚠️
**Status:** Most pages just show "Loading..."
**What's Missing:**
- Skeleton loaders
- Progress indicators
- Optimistic UI updates

**Impact:** Feels slow/unpolished
**Effort:** 2-3 hours

---

#### 20. **Error Handling** ⚠️
**Status:** Basic error handling exists
**What's Missing:**
- Global error boundary (React)
- Retry logic for failed requests
- Better error messages
- Toast notifications for success/error

**Effort:** 2 hours

---

### 🚫 **EXPLICITLY NOT IMPLEMENTED (From Spec)**

#### 21. **Account Management** ❌
- Password reset
- Email verification
- Account deletion
- 2FA/MFA
- OAuth login (Google, Apple)

**Effort:** 8-10 hours

---

#### 22. **Advanced Features** ❌
- Photo recognition (GPT-4 Vision)
- Barcode scanner (OpenFoodFacts API)
- Meal planning calendar
- Shopping list generation
- Social features (following, sharing)
- Fitness tracker integration
- Mobile app (React Native)

**Effort:** 20-40 hours each

---

## 📊 **Summary by Category**

| Category | Complete | Missing | Total | % Done |
|----------|----------|---------|-------|--------|
| **Core Food Logging** | 4 | 2 | 6 | 67% |
| **Recipes** | 3 | 3 | 6 | 50% |
| **Body Metrics** | 4 | 1 | 5 | 80% |
| **Analytics** | 7 | 2 | 9 | 78% |
| **Goals & Tracking** | 0 | 2 | 2 | 0% |
| **User Settings** | 1 | 3 | 4 | 25% |
| **UX Polish** | 2 | 5 | 7 | 29% |
| **Performance** | 0 | 4 | 4 | 0% |
| **Advanced Features** | 0 | 7 | 7 | 0% |
| **TOTAL** | **21** | **29** | **50** | **42%** |

---

## 🎯 **Recommended Implementation Order**

### Phase 1: Complete Core Features (8-10 hours)
1. ✅ **Goal Setting System** (3-4h) - Most impactful
2. ✅ **Recipe Edit Functionality** (1-2h)
3. ✅ **Log Recipe via UI** (1h)
4. ✅ **Manual Food Creation UI** (1-2h)
5. ✅ **Model Selection in Settings** (1h)

### Phase 2: User Experience (6-8 hours)
6. ✅ **CSV Export** (1-2h)
7. ✅ **Dark Mode** (2-3h)
8. ✅ **Recent/Favorite Foods** (1-2h)
9. ✅ **User Profile Settings** (2h)

### Phase 3: Intelligence Features (6-8 hours)
10. ✅ **Meal Templates** (4-5h)
11. ✅ **Nutrition Insights** (3-4h)

### Phase 4: Additional Tracking (3-5 hours)
12. ✅ **Water Intake** (2-3h)
13. ✅ **Analytics Enhancements** (2-3h)

### Phase 5: Performance & Polish (6-8 hours)
14. ✅ **Redis Caching** (2-3h)
15. ✅ **Pagination** (2h)
16. ✅ **Loading States** (2-3h)
17. ✅ **Error Handling** (2h)

---

## 💡 **Quick Wins (Can do in next 2-3 hours)**

**If you only have 2-3 hours, implement these for maximum impact:**

1. **Recipe Edit** (1h) - Critical gap, users need this
2. **Log Recipe Button** (1h) - Makes recipes actually usable in UI
3. **CSV Export** (1h) - Highly requested feature
4. **Model Selection** (30min) - Simple but valuable

**Total:** 3.5 hours for 4 critical features

---

## 🔥 **Critical Gap: Goal Setting**

The biggest missing piece is **Goal Setting**. This was in the original spec but not implemented. Without it:
- Users don't know if they're on track
- Dashboard lacks progress indicators
- No way to set weight loss/gain targets
- Analytics don't show goal vs actual

**This should be Priority #1 if continuing development.**

---

**Current Status:** 42% of all possible features
**Core Features:** 79% complete
**Polish & Advanced:** 15% complete

The app is **production-ready for basic use** but missing key features for a complete nutrition tracking experience.
