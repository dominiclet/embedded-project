# Set up guide

# Preparation step (optional)
If you would like to keep your os python installation clean, you can use python venv
1. python -m venv venv        # Create a virtual environment named 'venv'
2. source venv/bin/activate   # On macOS/Linux

# Step 1
python3 -m pip install -r requirements.txt

# Step 2
fastapi dev main.py

Server should run on:  http://127.0.0.1:8000
Visit this url for openapi docs: http://127.0.0.1:8000/docs