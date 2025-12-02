# JWT Authentication - Quick Reference Guide

## 🔐 What Changed?

**Before:** bcrypt password hashing only  
**After:** JWT token-based authentication with SHA-256 password hashing

---

## 📁 Modified Files

1. ✅ `requirements.txt` - Replaced bcrypt with PyJWT
2. ✅ `app/core/config.py` - Added JWT configuration
3. ✅ `app/core/security.py` - NEW: JWT utilities
4. ✅ `app/api/v1/models/user_model.py` - Updated password handling
5. ✅ `app/api/v1/schemas/user_schema.py` - Added token fields
6. ✅ `app/api/v1/routes/user_routes.py` - Returns JWT tokens
7. ✅ `app/middleware/auth_middleware.py` - NEW: Token validation

---

## 🚀 Installation

```bash
# Install PyJWT (already done)
pip install PyJWT>=2.8.0
```

---

## 🔑 Configuration (.env file)

Add these to your `.env` file:
```env
JWT_SECRET_KEY=your-super-secret-key-change-in-production
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
```

---

## 📝 API Endpoints

### Register User
```bash
POST /api/v1/users/register
Content-Type: application/json

{
  "user_id": "john_doe",
  "email": "john@example.com",
  "password": "mypassword123",
  "name": "John Doe"
}

Response:
{
  "user_id": "john_doe",
  "email": "john@example.com",
  "name": "John Doe",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### Login User
```bash
POST /api/v1/users/login
Content-Type: application/json

{
  "user_id": "john_doe",
  "password": "mypassword123"
}

Response:
{
  "user_id": "john_doe",
  "email": "john@example.com",
  "name": "John Doe",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

---

## 🛡️ Protecting Routes

### Method 1: Using Depends
```python
from fastapi import APIRouter, Depends
from app.middleware.auth_middleware import verify_token, get_current_user

router = APIRouter()

@router.get("/my-protected-route")
async def protected_endpoint(token_payload = Depends(verify_token)):
    user_id = get_current_user(token_payload)
    return {"message": f"Hello {user_id}!"}
```

### Method 2: Manual Token Extraction
```python
from fastapi import APIRouter, Header, HTTPException
from app.core.security import decode_access_token

router = APIRouter()

@router.get("/another-protected-route")
async def another_protected(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")
    
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user_id = payload.get("user_id")
    return {"user_id": user_id}
```

---

## 🧪 Testing with cURL

### 1. Register
```bash
curl -X POST http://localhost:8000/api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "testuser",
    "email": "test@example.com",
    "password": "test123",
    "name": "Test User"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:8000/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "testuser",
    "password": "test123"
  }'
```

### 3. Access Protected Route
```bash
curl -X GET http://localhost:8000/api/v1/protected-endpoint \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

---

## 🧪 Testing with Python

```python
import requests

BASE_URL = "http://localhost:8000/api/v1"

# Register
response = requests.post(
    f"{BASE_URL}/users/register",
    json={
        "user_id": "testuser",
        "email": "test@example.com",
        "password": "test123",
        "name": "Test User"
    }
)
data = response.json()
token = data["access_token"]
print(f"Token: {token}")

# Use token in protected route
headers = {"Authorization": f"Bearer {token}"}
protected_response = requests.get(
    f"{BASE_URL}/protected-endpoint",
    headers=headers
)
print(protected_response.json())
```

---

## 🔧 Security Functions

### Hash Password
```python
from app.core.security import hash_password

hashed = hash_password("mypassword")
# Returns: SHA-256 hash string
```

### Verify Password
```python
from app.core.security import verify_password

is_valid = verify_password("mypassword", hashed_password)
# Returns: True or False
```

### Create Token
```python
from app.core.security import create_access_token

token = create_access_token(data={"user_id": "john_doe", "email": "john@example.com"})
# Returns: JWT token string
```

### Decode Token
```python
from app.core.security import decode_access_token

payload = decode_access_token(token)
# Returns: {"user_id": "john_doe", "email": "john@example.com", "exp": 1234567890}
# Or None if invalid/expired
```

---

## ⚠️ Important Notes

1. **Token Expiration**: Tokens expire after 30 minutes by default
2. **Store Token Securely**: On client-side, store in httpOnly cookies or secure storage
3. **HTTPS Required**: Always use HTTPS in production
4. **Secret Key**: Change `JWT_SECRET_KEY` in production!
5. **Old Users**: Users registered with bcrypt need to re-register

---

## 🐛 Troubleshooting

### "Invalid or expired token"
- Token may have expired (30 min default)
- Token may be malformed
- Secret key mismatch
- Solution: Get a new token by logging in again

### "Authorization header missing"
- Forgot to include `Authorization: Bearer <token>` header
- Solution: Add the header with your JWT token

### "Invalid credentials"
- Wrong user_id or password
- Solution: Check credentials or register new user

---

## ✅ Status

- Migration: **COMPLETED**
- Testing: **PASSED**
- Ready for use: **YES**

All authentication now uses JWT tokens!
