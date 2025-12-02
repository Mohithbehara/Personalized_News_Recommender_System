import requests
import time
import random

BASE_URL = "http://127.0.0.1:8000/api/v1"

def test_root():
    print("\n=== Testing Root Endpoint ===")
    response = requests.get("http://127.0.0.1:8000/")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")

def test_register_user():
    print("\n=== Testing User Registration ===")
    user_id = f"testuser{random.randint(1000, 9999)}"
    data = {
        "user_id": user_id,
        "email": f"{user_id}@example.com",
        "password": "password123",
        "name": "Test User"
    }
    
    response = requests.post(f"{BASE_URL}/users/register", json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        print("[SUCCESS] User registered successfully!")
        return user_id, data["password"]
    else:
        print("[FAILED] User registration failed!")
        return None, None

def test_login_user(user_id, password):
    print("\n=== Testing User Login ===")
    data = {
        "user_id": user_id,
        "password": password
    }
    
    response = requests.post(f"{BASE_URL}/users/login", json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        print("[SUCCESS] User login successful!")
    else:
        print("[FAILED] User login failed!")

if __name__ == "__main__":
    print("Starting API Tests...")
    print("Make sure the server is running on http://127.0.0.1:8000")
    
    time.sleep(1)
    
    # Test root
    try:
        test_root()
    except Exception as e:
        print(f"Root test error: {e}")
    
    # Test user registration
    try:
        user_id, password = test_register_user()
        
        if user_id:
            # Test login with the registered user
            test_login_user(user_id, password)
    except Exception as e:
        print(f"User test error: {e}")
    
    print("\n=== All Tests Complete ===")
