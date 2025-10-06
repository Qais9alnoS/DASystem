import requests
import json

# Test login with director credentials
login_data = {
    "username": "director",
    "password": "director123"
}

try:
    print("Testing login request...")
    response = requests.post('http://127.0.0.1:8000/api/auth/login', 
                           json=login_data,
                           headers={'Origin': 'http://localhost:3001'})
    
    print(f"Status Code: {response.status_code}")
    print(f"Response Headers: {dict(response.headers)}")
    print(f"Response Text: {response.text}")
    
    if response.status_code == 200:
        try:
            response_data = response.json()
            print(f"Parsed JSON: {json.dumps(response_data, indent=2)}")
        except Exception as e:
            print(f"Failed to parse JSON: {e}")
    else:
        print("Login failed!")
        
except Exception as e:
    print(f"Error occurred: {e}")