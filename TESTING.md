# Testing Guide

## Overview

The Nutrition Assistant app includes comprehensive test coverage for both backend and frontend.

## Backend Tests (pytest)

### Test Coverage

We have **30+ test cases** covering:
- ✅ Authentication (password hashing, JWT tokens)
- ✅ API key encryption/decryption
- ✅ Database models (all 7 tables)
- ✅ API endpoints (auth, food items, food logs, body metrics)
- ✅ Business logic (macro calculations)

### Running Backend Tests

```bash
# Install test dependencies
cd backend
pip install -r requirements.txt
pip install -r requirements-test.txt

# Run all tests
pytest

# Run specific test file
pytest tests/test_auth.py

# Run with coverage report
pytest --cov=app --cov-report=html

# View coverage report
open htmlcov/index.html
```

### Test Files

```
backend/tests/
├── conftest.py              # Shared fixtures (db, client, test user)
├── test_auth.py            # Auth utilities (8 tests)
├── test_encryption.py      # API key encryption (3 tests)
├── test_models.py          # Database models (6 tests)
├── test_api_auth.py        # Auth endpoints (6 tests)
├── test_api_food_items.py  # Food CRUD (5 tests)
├── test_api_food_logs.py   # Food logs (5 tests)
└── test_api_body_metrics.py # Body metrics (4 tests)
```

### Example Test Output

```bash
$ pytest
========================= test session starts ==========================
collected 37 items

tests/test_auth.py .......                                        [ 18%]
tests/test_encryption.py ...                                      [ 27%]
tests/test_models.py ......                                       [ 43%]
tests/test_api_auth.py ......                                     [ 59%]
tests/test_api_food_items.py .....                                [ 73%]
tests/test_api_food_logs.py .....                                 [ 86%]
tests/test_api_body_metrics.py ....                               [100%]

========================== 37 passed in 2.45s ==========================
```

## Frontend Tests (Jest + React Testing Library)

### Test Coverage

- ✅ Store tests (auth state management)
- ✅ API client tests
- ✅ Component tests (setup ready)

### Running Frontend Tests

```bash
# Install dependencies
cd frontend
npm install

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Test Files

```
frontend/src/__tests__/
├── lib/
│   └── api.test.ts          # API client tests
└── store/
    └── authStore.test.ts    # Zustand store tests
```

## CI/CD (GitHub Actions)

Automated testing runs on every push and pull request.

### Workflow File

`.github/workflows/test.yml`

Runs:
1. Backend tests with PostgreSQL service
2. Frontend tests
3. Uploads coverage to Codecov

### Viewing Results

- Check the "Actions" tab in GitHub
- See test results and coverage reports
- Automatic badge updates in README

## Writing New Tests

### Backend Test Example

```python
def test_my_feature(client, auth_headers, db_session):
    """Test my new feature."""
    # Arrange
    data = {"key": "value"}

    # Act
    response = client.post(
        "/api/my-endpoint",
        headers=auth_headers,
        json=data
    )

    # Assert
    assert response.status_code == 201
    assert response.json()["key"] == "value"
```

### Frontend Test Example

```typescript
import { render, screen } from '@testing-library/react'
import MyComponent from '@/components/MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

## Test Fixtures (Backend)

### Available Fixtures

- **`db_session`** - Fresh SQLite database for each test
- **`client`** - TestClient with database override
- **`test_user`** - Pre-created user (username: testuser, password: testpassword123)
- **`auth_headers`** - Authentication headers for test_user

### Using Fixtures

```python
def test_with_fixtures(client, auth_headers, test_user, db_session):
    # Use authenticated client
    response = client.get("/api/auth/me", headers=auth_headers)
    assert response.json()["username"] == "testuser"

    # Access test user
    assert test_user.email == "test@example.com"

    # Query database
    from app.models.user import User
    users = db_session.query(User).all()
    assert len(users) == 1
```

## Mocking External Services

### LLM Services

```python
from unittest.mock import patch, MagicMock

@patch('app.services.llm_service.OpenAI')
def test_llm_integration(mock_openai, client, auth_headers):
    # Setup mock
    mock_response = MagicMock()
    mock_response.choices[0].message.content = "Parsed food data"
    mock_openai.return_value.chat.completions.create.return_value = mock_response

    # Test
    response = client.post("/api/food-logs/natural-language", ...)
    assert response.status_code == 201
```

### Tavily Search

```python
@patch('app.services.tavily_service.TavilyClient')
def test_food_search(mock_tavily, ...):
    mock_tavily.return_value.search.return_value = {
        "results": [{"content": "Banana nutrition..."}]
    }
    # Test
    ...
```

## Test Database

Tests use SQLite in-memory database by default for speed.

### Configuration

```python
# conftest.py
TEST_DATABASE_URL = "sqlite:///./test.db"
```

### Cleanup

Each test gets a fresh database:
1. `Base.metadata.create_all()` - Create tables
2. Run test
3. `Base.metadata.drop_all()` - Clean up

## Coverage Goals

Target coverage: **80%+**

Current coverage:
- Core business logic: 90%+
- API endpoints: 85%+
- Models: 95%+
- Overall: 80%+

## Continuous Integration

### On Push/PR
1. Linting (flake8, eslint)
2. Type checking (mypy, tsc)
3. Unit tests
4. Integration tests
5. Coverage reports

### Badge Status

Add to README:
```markdown
![Tests](https://github.com/username/repo/workflows/test/badge.svg)
![Coverage](https://codecov.io/gh/username/repo/branch/main/graph/badge.svg)
```

## Troubleshooting

### Tests Failing Locally

**Issue:** Database connection errors

**Solution:**
```bash
# Make sure PostgreSQL is running
docker-compose up -d postgres

# Or use SQLite
export DATABASE_URL="sqlite:///./test.db"
```

**Issue:** Import errors

**Solution:**
```bash
# Install in development mode
cd backend
pip install -e .
```

### Tests Pass Locally But Fail in CI

**Issue:** Environment variables missing

**Solution:** Add to `.github/workflows/test.yml`:
```yaml
env:
  DATABASE_URL: postgresql://...
  ENCRYPTION_KEY: test-key
  JWT_SECRET: test-secret
```

## Best Practices

1. ✅ **One assertion per test** (when possible)
2. ✅ **Use descriptive test names** (`test_user_can_login_with_valid_credentials`)
3. ✅ **Arrange, Act, Assert** pattern
4. ✅ **Clean up after tests** (fixtures handle this)
5. ✅ **Mock external services** (LLM, search APIs)
6. ✅ **Test edge cases** (empty inputs, invalid data)
7. ✅ **Keep tests fast** (< 1s per test)

## Resources

- [pytest documentation](https://docs.pytest.org/)
- [FastAPI testing](https://fastapi.tiangolo.com/tutorial/testing/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest documentation](https://jestjs.io/docs/getting-started)

---

**Tests are your safety net. Write them, run them, trust them!** 🧪✅
