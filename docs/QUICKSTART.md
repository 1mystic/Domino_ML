# 🚀 Quick Start Guide - DominoML Flask

## Prerequisites
- Python 3.8 or higher
- pip (Python package manager)

## Installation (5 minutes)

### 1. Create Virtual Environment
```bash
cd dominoML-flask
python -m venv venv
```

### 2. Activate Virtual Environment

**Windows (PowerShell)**:
```powershell
venv\Scripts\Activate.ps1
```

**Windows (CMD)**:
```cmd
venv\Scripts\activate.bat
```

**Linux/Mac**:
```bash
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install flask flask-sqlalchemy flask-login flask-wtf email-validator
```

### 4. Initialize Database
```bash
python
```

Then in Python:
```python
from app import create_app, db
app = create_app()
with app.app_context():
    db.create_all()
exit()
```

### 5. Run Application
```bash
python run.py
```

### 6. Open Browser
Navigate to: **http://localhost:5000**

---

## 🎯 First Steps

### Create Account
1. Click "Join Us" or "Sign Up"
2. Enter username, email, password
3. Click "Create Account"

### Build Your First ML Pipeline
1. Click "Try It First" or "Start Building Now"
2. Drag components from the left sidebar to the canvas
3. Connect components by clicking on handles (blue dots)
4. Click on nodes to edit parameters in the right panel
5. Click "Export Code" to generate Python code

### Use Templates
1. In the builder, click "Templates" button
2. Choose a template (Iris Classification, Linear Regression, or K-Means)
3. Template loads with pre-configured nodes
4. Customize as needed

### Save Your Work
1. Click "Save" button in toolbar
2. Enter a model name
3. Click "Save"
4. Access saved models via "Open" button

---

## 📚 Features Overview

### Available ML Components (15)
- **Data Sources**: CSV Loader, Sample Dataset Loader
- **Preprocessing**: Standard Scaler, Min-Max Scaler, PCA, Train-Test Split
- **Classification**: Random Forest, SVM, Logistic Regression, KNN
- **Regression**: Linear Regression, Random Forest Regressor
- **Evaluation**: Classification Metrics, Regression Metrics
- **Clustering**: K-Means

### Canvas Controls
- **Pan**: Click and drag on empty canvas
- **Zoom**: Mouse wheel or zoom controls (bottom-left)
- **Select Node**: Click on a node
- **Delete Node**: Select node → Click "Delete Node" in property panel
- **Add Component**: Drag from sidebar to canvas

### Keyboard Shortcuts
- **Ctrl/Cmd + Scroll**: Zoom in/out
- **Click + Drag**: Pan canvas
- **Escape**: Deselect node

---

## 🎨 Theme Toggle
Click the moon/sun icon in the header to switch between dark and light modes. Your preference is saved in browser storage.

---

## 🐛 Troubleshooting

### Database Error
If you get a database error:
```bash
rm instance/dominoml.db  # Delete old database
python
>>> from app import create_app, db
>>> app = create_app()
>>> with app.app_context():
...     db.create_all()
```

### Port Already in Use
Change port in `run.py`:
```python
app.run(debug=True, host='0.0.0.0', port=5001)  # Use port 5001 instead
```

### Templates Not Loading
Ensure JSON files exist:
- `app/data/ml_components.json`
- `app/data/ml_templates.json`

---

## 📝 Sample Workflow

### Example: Iris Classification
1. **Add CSV Loader**
   - Drag "CSV Loader" to canvas
   - Set `file_path` = "iris.csv"

2. **Add Train-Test Split**
   - Drag "Train-Test Split" to canvas
   - Connect CSV Loader → Train-Test Split
   - Set `test_size` = 0.3

3. **Add Random Forest Classifier**
   - Drag "Random Forest Classifier" to canvas
   - Connect Train-Test Split → Random Forest
   - Set `n_estimators` = 100

4. **Add Classification Metrics**
   - Drag "Classification Metrics" to canvas
   - Connect Random Forest → Classification Metrics

5. **Export Code**
   - Click "Export Code" button
   - Copy generated Python code
   - Run in your Python environment

---

## 🔐 User Accounts

### Default Behavior
- Authentication is optional for testing
- Can use builder without login (data not saved)
- Create account to save models permanently

### Password Requirements
- Minimum 6 characters
- No specific complexity requirements (can be enhanced in `app/forms.py`)

---

## 🌐 API Endpoints

### Models
- `GET /api/models` - Get all user's models
- `POST /api/models` - Create new model
- `GET /api/models/<id>` - Get specific model
- `PUT /api/models/<id>` - Update model
- `DELETE /api/models/<id>` - Delete model

### Templates & Components
- `GET /api/templates` - Get all templates
- `GET /api/components` - Get all ML components
- `POST /api/generate-code` - Generate Python code from pipeline

---

## 📖 Documentation

- **README.md**: Full installation and configuration guide
- **MIGRATION_SUMMARY.md**: Technical migration details
- **COMPLETED.md**: Complete file inventory and feature list

---

## 🎉 You're Ready!

The application is now running. Enjoy building ML pipelines visually! 🚀

For issues or questions, check the troubleshooting section above.

---

*Happy Building! 🤖*
