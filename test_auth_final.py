import requests
import json

# Test login with finance credentials
login_data = {
    "username": "finance",
    "password": "finance123",
    "role": "finance"
}

try:
    response = requests.post('http://localhost:8000/api/auth/login', 
                           json=login_data,
                           headers={'Content-Type': 'application/json'})
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        print("✅ Login successful!")
        response_data = response.json()
        print(f"Token: {response_data.get('data', {}).get('access_token')}")
    else:
        print("❌ Login failed!")
        print(f"Error: {response.text}")
        
except Exception as e:
    print(f"❌ Error occurred: {e}")