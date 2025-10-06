import urllib.request
import urllib.parse
import json

# Test login with director credentials
login_data = {
    "username": "director",
    "password": "director123"
}

# Convert to JSON
data = json.dumps(login_data).encode('utf-8')

# Create request
req = urllib.request.Request(
    'http://127.0.0.1:8000/api/auth/login',
    data=data,
    headers={'Content-Type': 'application/json'}
)

try:
    # Send request
    response = urllib.request.urlopen(req)
    
    # Print response
    print(f"Status Code: {response.getcode()}")
    print(f"Headers: {dict(response.headers)}")
    
    # Read and print response body
    response_body = response.read().decode('utf-8')
    print(f"Response Body: {response_body}")
    
    # Try to parse as JSON
    try:
        response_json = json.loads(response_body)
        print(f"Parsed JSON: {json.dumps(response_json, indent=2)}")
    except Exception as e:
        print(f"Failed to parse JSON: {e}")
        
except Exception as e:
    print(f"Error occurred: {e}")