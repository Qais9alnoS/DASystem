import os
import sys
import json

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.main import app

# Create a test client
from fastapi.testclient import TestClient
client = TestClient(app)

def test_admin_login():
    """Test admin login with credentials from login_correct.json"""
    # Read credentials from file
    with open("../login_correct.json", "r") as f:
        credentials = json.load(f)
    
    response = client.post("/api/auth/login", json=credentials)
    return response

def test_finance_endpoints(token):
    """Test the new finance endpoints"""
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test categories endpoint
    print("Testing /api/finance/categories endpoint...")
    response = client.get("/api/finance/categories", headers=headers)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        categories = response.json()
        print(f"Categories: {len(categories)} items")
        if categories:
            print(f"First category: {categories[0]}")
    else:
        print(f"Error: {response.json()}")
    
    # Test dashboard endpoint
    print("\nTesting /api/finance/dashboard endpoint...")
    response = client.get("/api/finance/dashboard", headers=headers)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Dashboard data keys: {list(data.keys())}")
        if "financial_summary" in data:
            print(f"Financial summary: {data['financial_summary']}")
    else:
        print(f"Error: {response.json()}")

if __name__ == "__main__":
    print("Testing admin login...")
    login_response = test_admin_login()
    print(f"Status code: {login_response.status_code}")
    if login_response.status_code == 200:
        print("Login successful")
        token = login_response.json()["access_token"]
        test_finance_endpoints(token)
    else:
        print(f"Login failed: {login_response.json()}")