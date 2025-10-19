import os
import sys

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.main import app

print("Finance routes:")
for route in app.routes:
    if '/finance' in route.path:
        print(f"  {route.path} [{route.methods}]")