import os
import sys

# Add the current directory to sys.path so it can find the 'backend' package
sys.path.append(os.getcwd())

from backend.main import app

print("Inventory of Registered Routes:")
print("-" * 30)
for route in app.routes:
    if hasattr(route, "path"):
        methods = ", ".join(route.methods) if hasattr(route, "methods") else "N/A"
        print(f"[{methods}] {route.path}")
print("-" * 30)
