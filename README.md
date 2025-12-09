# DOMINO ML

[![Deployed on Render](https://img.shields.io/badge/DEPLOYED_ON-RENDER-000000?style=for-the-badge&logo=render&logoColor=white)](https://domino-ml.onrender.com)
[![Python](https://img.shields.io/badge/PYTHON-3.8+-000000?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/FLASK-3.0-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)

**VISUAL MACHINE LEARNING PIPELINE BUILDER**

---

### 🚀 [LAUNCH LIVE DEMO](https://domino-ml.onrender.com)

A Flask-based visual machine learning pipeline builder that enables users to create ML workflows through an intuitive drag-and-drop interface. Build complete custom ML pipelines visually and generate production-ready Python code automatically.

---

## VIDEO DEMO

[![Watch the Demo](Snaps/yt.jpg)](https://youtu.be/FNp3avbL1t0)

> *Click the image above to watch the walkthrough*

---

## VISUAL TOUR

### 1. LANDING EXPERIENCE
![Landing Page](Snaps/land.png)

### 2. AUTHENTICATION
![Login Screen](Snaps/login.png)

### 3. PROJECT DASHBOARD
![Dashboard](Snaps/dash.png)

### 4. PIPELINE BUILDER CANVAS
![Builder Canvas](Snaps/builder.png)

### 5. VERSION CONTROL
![Version Control](Snaps/versions.png)

### 6. IMPORT / EXPORT
![Export](Snaps/export.png)

### 7. TEMPLATE GALLERY
![Gallery](Snaps/gallery.png)

---

## FEATURES

### CORE
- **DRAG & DROP INTERFACE**: Visual pipeline builder with vanilla JavaScript.
- **COMPONENT LIBRARY**: Extensive collection of ML components.
- **CODE EXPORT**: Generate Python code from visual pipelines.
- **TEMPLATE GALLERY**: Pre-built ML pipeline templates.
- **REAL-TIME VALIDATION**: Model structure validation.

### ADDITIONAL
- **USER AUTHENTICATION**: Secure login/signup.
- **CLOUD STORAGE**: Save models in SQLite database.
- **DARK THEME**: Full dark mode support.
- **MY MODELS**: Manage saved pipelines.

### NEW CAPABILITIES
- **UNDO/REDO SYSTEM**: Smart state management for canvas operations.
- **PIPELINE VERSIONING**: Full version tracking and comparison.
- **RUNNABLE ARTIFACTS**: Export to Python scripts, Notebooks, or Docker containers.

---

## QUICK START

### PREREQUISITES
- Python 3.8+
- pip
- Modern Web Browser

### INSTALLATION

1. **CLONE**
   ```bash
   git clone https://github.com/yourusername/dominoML-flask.git
   cd dominoML-flask
   ```

2. **VIRTUAL ENV**
   ```bash
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # Mac/Linux
   source venv/bin/activate
   ```

3. **DEPENDENCIES**
   ```bash
   pip install -r requirements.txt
   ```

4. **CONFIGURE**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

5. **INIT DB**
   ```bash
   python
   >>> from app import create_app, db
   >>> app = create_app()
   >>> with app.app_context():
   ...     db.create_all()
   >>> exit()
   ```

6. **RUN**
   ```bash
   python run.py
   ```
   Visit `http://localhost:5000`

---

## PROJECT STRUCTURE

```
Domino_ML/
├── app/                  # Flask application
│   ├── data/            # Components & Templates
│   ├── routes/          # Blueprints
│   ├── static/          # CSS/JS Assets
│   └── templates/       # Jinja2 Views
├── migrations/          # DB Migrations
├── config.py            # App Config
└── run.py               # Entry Point
```

---

## TECHNOLOGY STACK

**BACKEND**
- Flask 3.0
- SQLAlchemy (SQLite)
- Flask-Login
- Flask-WTF

**FRONTEND**
- Jinja2 Templates
- Custom CSS (Monochrome/Dark)
- Vanilla JavaScript
- Lucide Icons

---

## LICENSE
Not yet licensed.

---

**BUILT WITH 🖤 FOR THE ML COMMUNITY**
