import os
import sys

# Ensure the backend root is importable as the `app` package when pytest is
# invoked as `pytest tests/` from the backend directory.
sys.path.insert(0, os.path.dirname(__file__))
