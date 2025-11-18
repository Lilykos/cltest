# Backend Tests

## Running Tests

### Install Test Dependencies
```bash
cd backend
pip install -r requirements.txt
pip install -r requirements-test.txt
```

### Run All Tests
```bash
pytest
```

### Run Specific Test File
```bash
pytest tests/test_auth.py
```

### Run with Coverage
```bash
pytest --cov=app --cov-report=html
```

### Run in Watch Mode
```bash
pytest-watch
```

## Test Structure

```
tests/
├── conftest.py              # Shared fixtures
├── test_auth.py            # Auth utilities tests
├── test_encryption.py      # Encryption tests
├── test_models.py          # Database model tests
├── test_api_auth.py        # Auth API endpoint tests
├── test_api_food_items.py  # Food items API tests
├── test_api_food_logs.py   # Food logs API tests
└── test_api_body_metrics.py # Body metrics API tests
```

## Test Coverage

Current coverage includes:
- ✅ Authentication (password hashing, JWT tokens)
- ✅ API key encryption/decryption
- ✅ Database models (CRUD operations)
- ✅ Auth API endpoints (register, login)
- ✅ Food items API (CRUD, search)
- ✅ Food logs API (CRUD, filtering)
- ✅ Body metrics API (CRUD)

## Adding New Tests

### Unit Test Example
```python
def test_my_function():
    result = my_function("input")
    assert result == "expected"
```

### API Test Example
```python
def test_my_endpoint(client, auth_headers):
    response = client.post(
        "/api/my-endpoint",
        headers=auth_headers,
        json={"key": "value"}
    )
    assert response.status_code == 201
```

## Fixtures Available

- `db_session` - Fresh database for each test
- `client` - TestClient with database override
- `test_user` - Pre-created test user
- `auth_headers` - Authentication headers for test user

## CI/CD Integration

See `.github/workflows/test.yml` for GitHub Actions setup.
