import requests
import json

# Test login with director credentials
login_data = {
    "username": "director",
    "password": "director123",
    "role": "director"
}

try:
    # First, let's try the OPTIONS request (preflight)
    print("Testing OPTIONS request...")
    options_response = requests.options('http://127.0.0.1:8000/api/auth/login', headers={
        'Origin': 'http://localhost:3001',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type'
    })
    print(f"OPTIONS Status Code: {options_response.status_code}")
    
    # Now let's try the actual login
    print("\nTesting POST request...")
    response = requests.post('http://127.0.0.1:8000/api/auth/login', 
                           json=login_data,
                           headers={'Origin': 'http://localhost:3001'})
    
    print(f"POST Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        print("Login successful!")
        response_data = response.json()
        print(f"Token: {response_data.get('access_token')}")
    else:
        print("Login failed!")
        print(f"Error: {response.text}")
        
except Exception as e:
    print(f"Error occurred: {e}")