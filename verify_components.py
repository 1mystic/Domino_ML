import sys
import os

# Add current directory to path
sys.path.append(os.getcwd())

try:
    from app.utils.data_loader import get_components
    components = get_components()
    print(f"Successfully loaded {len(components['components'])} components.")
except Exception as e:
    print(f"Error loading components: {e}")
    sys.exit(1)
