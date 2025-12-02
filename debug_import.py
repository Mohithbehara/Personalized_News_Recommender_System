import sys
import os

print("="*60)
print("DIAGNOSTIC REPORT")
print("="*60)

# 1. Current working directory
print(f"\n1. Current directory: {os.getcwd()}")

# 2. Python path
print(f"\n2. Python sys.path:")
for p in sys.path:
    print(f"   - {p}")

# 3. Check if file exists
file_path = "app/api/v1/routes/headlines_routes.py"
print(f"\n3. File exists? {os.path.exists(file_path)}")
print(f"   Path: {os.path.abspath(file_path)}")

# 4. Check __init__ files
init_files = [
    "app/__init__.py",
    "app/api/__init__.py",
    "app/api/v1/__init__.py",
    "app/api/v1/routes/__init__.py"
]

print(f"\n4. __init__.py files:")
for f in init_files:
    exists = "✅" if os.path.exists(f) else "❌"
    print(f"   {exists} {f}")

# 5. Try importing
print(f"\n5. Import test:")
try:
    from app.api.v1.routes.headlines_routes import headlines_router
    print("   ✅ SUCCESS! Import worked")
    print(f"   Router type: {type(headlines_router)}")
except ModuleNotFoundError as e:
    print(f"   ❌ ModuleNotFoundError: {e}")
except ImportError as e:
    print(f"   ❌ ImportError: {e}")
except SyntaxError as e:
    print(f"   ❌ SyntaxError in file: {e}")
except Exception as e:
    print(f"   ❌ Other error: {type(e).__name__}: {e}")

# 6. Check if app is importable
print(f"\n6. Can import 'app'?")
try:
    import app
    print(f"   ✅ Yes, app module found at: {app.__file__}")
except Exception as e:
    print(f"   ❌ No: {e}")

print("\n" + "="*60)