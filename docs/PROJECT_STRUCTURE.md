# Project Structure
## DominoML - Visual Machine Learning Pipeline Builder

**Last Updated:** 2025-01-27

---

## Directory Structure

```
LNCT-DominoML/
├── Domino_ML/                          # Main application directory
│   ├── app/                            # Flask application package
│   │   ├── __init__.py                 # Application factory
│   │   ├── models.py                   # Database models (User, Pipeline, Version, etc.)
│   │   ├── forms.py                    # WTForms for authentication
│   │   │
│   │   ├── data/                       # Static data files
│   │   │   ├── ml_components.json      # ML component definitions
│   │   │   └── ml_templates.json       # Pre-built pipeline templates
│   │   │
│   │   ├── routes/                     # Route handlers (Blueprints)
│   │   │   ├── __init__.py
│   │   │   ├── main.py                 # Main routes (landing, builder)
│   │   │   ├── auth.py                 # Authentication routes (login, register)
│   │   │   └── api.py                  # REST API endpoints
│   │   │
│   │   ├── static/                     # Static assets
│   │   │   ├── css/                    # Stylesheets
│   │   │   │   ├── main.css            # Main application styles
│   │   │   │   ├── landing.css         # Landing page styles
│   │   │   │   ├── builder.css         # Builder page styles
│   │   │   │   ├── components.css      # Component library styles
│   │   │   │   └── auth.css            # Authentication page styles
│   │   │   │
│   │   │   └── js/                     # JavaScript modules
│   │   │       ├── api.js              # API client (REST communication)
│   │   │       ├── canvas.js           # Canvas/drawing logic
│   │   │       ├── components.js       # Component library logic
│   │   │       ├── properties.js       # Property panel logic
│   │   │       ├── history.js          # Undo/Redo system
│   │   │       ├── versions.js         # Version management UI
│   │   │       ├── theme.js            # Theme toggle logic
│   │   │       ├── export.js           # Export functionality
│   │   │       └── ...                 # Other utility scripts
│   │   │
│   │   ├── templates/                  # Jinja2 templates
│   │   │   ├── base.html               # Base template
│   │   │   ├── landing.html            # Landing page
│   │   │   ├── auth.html               # Login/signup page
│   │   │   ├── builder.html            # ML builder interface
│   │   │   ├── 404.html                # 404 error page
│   │   │   │
│   │   │   └── export/                 # Export templates
│   │   │       ├── Dockerfile.jinja    # Dockerfile template
│   │   │       ├── python_script.py.jinja  # Python script template
│   │   │       ├── requirements.txt.jinja  # Requirements template
│   │   │       └── README.md           # Export documentation
│   │   │
│   │   └── utils/                      # Utility modules
│   │       ├── __init__.py
│   │       ├── data_loader.py          # Load components and templates
│   │       ├── code_generator.py       # Generate Python code from pipeline
│   │       │
│   │       └── exporters/              # Export modules
│   │           ├── __init__.py
│   │           ├── python_exporter.py  # Python script exporter
│   │           ├── notebook_exporter.py # Jupyter notebook exporter
│   │           ├── docker_exporter.py  # Docker container exporter
│   │           ├── requirements_builder.py # Requirements.txt builder
│   │           └── README.md           # Exporter documentation
│   │
│   ├── migrations/                     # Database migrations
│   │   ├── README.md                   # Migration documentation
│   │   └── applied/                    # Applied migrations archive
│   │       └── 2025-10-31_add_versioning.sql
│   │
│   ├── scripts/                         # Utility scripts
│   │   └── init_features.py            # Initialize features
│   │
│   ├── config.py                        # Application configuration
│   ├── run.py                           # Application entry point
│   ├── apply_migration.py              # Migration script
│   ├── requirements.txt                 # Python dependencies
│   ├── setup.sh                         # Setup script (Unix)
│   ├── setup.bat                        # Setup script (Windows)
│   ├── .env.example                     # Environment variables template
│   ├── .gitignore                       # Git ignore rules
│   └── README.md                        # Project README
│
├── docs/                                # Documentation directory
│   ├── SRS.md                           # System Requirements Specifications
│   ├── SYSTEM_DESIGN_AND_ARCHITECTURE.md # System design document
│   ├── PROJECT_STRUCTURE.md             # This file
│   ├── API_DOCS.md                      # API documentation
│   ├── COMPLETION_REPORT.md             # Phase completion reports
│   ├── IMPLEMENTATION_PLAN.md           # Implementation planning
│   ├── PHASE1-2_COMPLETE.md             # Phase 1-2 completion report
│   ├── PHASE3_COMPLETE.md               # Phase 3 completion report
│   ├── PHASE3_PLAN.md                   # Phase 3 planning
│   ├── QUICKSTART.md                    # Quick start guide
│   ├── WRAP_UP_CHECKLIST.md             # Project checklist
│   └── project_structure.txt            # Legacy structure file
│
└── README.md                            # Root README (if exists)
```

---

## File Descriptions

### Core Application Files

#### `app/__init__.py`
- Flask application factory
- Initializes extensions (db, login_manager)
- Registers blueprints
- Returns configured Flask app instance

#### `app/models.py`
- SQLAlchemy database models:
  - `User`: User account model
  - `SavedModel`: Pipeline storage model
  - `PipelineVersion`: Version tracking model
  - `ModelMetric`: Metrics storage model
  - `VersionTag`: Version tags model
  - `VersionComment`: Version comments model

#### `app/forms.py`
- WTForms form classes for authentication
- Login and registration forms

#### `config.py`
- Application configuration class
- Environment variable loading
- Database URI configuration
- Secret key management

#### `run.py`
- Application entry point
- Creates app instance and runs development server

### Route Handlers

#### `app/routes/main.py`
- Landing page route
- Builder page route
- Main application routes

#### `app/routes/auth.py`
- User registration route
- User login route
- User logout route
- Session management

#### `app/routes/api.py`
- REST API endpoints:
  - Pipeline CRUD operations
  - Version management
  - Metrics tracking
  - Export functionality
  - Component and template endpoints

### Utility Modules

#### `app/utils/data_loader.py`
- Loads ML components from JSON
- Loads pipeline templates from JSON
- Returns structured data for frontend

#### `app/utils/code_generator.py`
- Topological sort algorithm for pipeline nodes
- Python code generation from visual pipeline
- Template parameter substitution
- Import statement generation

#### `app/utils/exporters/`
- **python_exporter.py**: Exports pipeline as Python script
- **notebook_exporter.py**: Exports pipeline as Jupyter notebook
- **docker_exporter.py**: Exports pipeline as Docker container
- **requirements_builder.py**: Generates requirements.txt

### Frontend Assets

#### CSS Files (`app/static/css/`)
- **main.css**: Core application styles
- **landing.css**: Landing page specific styles
- **builder.css**: Builder interface styles
- **components.css**: Component library styles
- **auth.css**: Authentication page styles

#### JavaScript Files (`app/static/js/`)
- **api.js**: REST API client, session management
- **canvas.js**: Canvas drawing, node/edge management
- **components.js**: Component library UI
- **properties.js**: Property panel for component configuration
- **history.js**: Undo/Redo system implementation
- **versions.js**: Version management UI
- **theme.js**: Dark/light theme toggle
- **export.js**: Export functionality UI

### Templates

#### `app/templates/base.html`
- Base template with common structure
- Navigation bar
- Theme toggle
- Footer

#### `app/templates/landing.html`
- Welcome page
- Feature overview
- Call-to-action buttons

#### `app/templates/auth.html`
- Login and registration forms
- Tab-based interface

#### `app/templates/builder.html`
- Main pipeline builder interface
- Canvas area
- Component library panel
- Properties panel
- Toolbar with actions

### Data Files

#### `app/data/ml_components.json`
- ML component definitions
- Component metadata (name, category, parameters)
- Python code templates for each component

#### `app/data/ml_templates.json`
- Pre-built pipeline templates
- Template metadata and descriptions
- Template node/edge configurations

### Database

#### `migrations/`
- Database migration scripts
- Applied migrations archive
- Migration documentation

### Documentation

#### `docs/SRS.md`
- System Requirements Specifications
- Functional and non-functional requirements
- User interface specifications

#### `docs/SYSTEM_DESIGN_AND_ARCHITECTURE.md`
- System architecture overview
- Database design (ER diagram, schema)
- Use case diagrams
- Data flow diagrams
- Technology stack

#### `docs/API_DOCS.md`
- REST API endpoint documentation
- Request/response formats
- Authentication requirements

---

## Module Dependencies

### Backend Dependencies
```
Flask                    # Web framework
Flask-Login              # User session management
Flask-SQLAlchemy         # Database ORM
Flask-WTF                # Form handling and CSRF
WTForms                  # Form validation
python-dotenv            # Environment variables
Werkzeug                 # Password hashing, WSGI utilities
email-validator          # Email validation
```

### Frontend Dependencies
- **No external frameworks** (Vanilla JavaScript)
- **Lucide Icons** (via CDN)
- **Custom CSS** (no CSS frameworks)

---

## Configuration Files

### `.env`
Environment variables (not in repository):
```
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///dominoml.db
FLASK_ENV=development
FLASK_DEBUG=True
```

### `.gitignore`
Git ignore patterns for:
- Python cache files (`__pycache__/`, `*.pyc`)
- Virtual environments (`venv/`, `env/`)
- Database files (`*.db`)
- Environment files (`.env`)
- IDE files (`.vscode/`, `.idea/`)

### `requirements.txt`
Python package dependencies list

---

## Development Workflow

### Setup
1. Clone repository
2. Create virtual environment
3. Install dependencies: `pip install -r requirements.txt`
4. Copy `.env.example` to `.env` and configure
5. Initialize database: `python -c "from app import create_app, db; app = create_app(); app.app_context().push(); db.create_all()"`
6. Run application: `python run.py`

### Development
- Backend changes: Edit Python files in `app/`
- Frontend changes: Edit JavaScript/CSS in `app/static/`
- Template changes: Edit Jinja2 templates in `app/templates/`
- Database changes: Create migration scripts in `migrations/`

### Testing
- Run Flask development server
- Test in browser
- Check console for JavaScript errors
- Verify API endpoints with Postman/curl

---

## Deployment Structure

### Production Recommendations
```
Production Server:
├── Application code (Domino_ML/)
├── Virtual environment (venv/)
├── Database file (dominoml.db) or PostgreSQL
├── Static files (served by Nginx)
├── WSGI server (Gunicorn/uWSGI)
└── Reverse proxy (Nginx)
```

---

## Code Organization Principles

1. **Separation of Concerns**: Clear separation between routes, models, and utilities
2. **Modularity**: Each module has a single responsibility
3. **Reusability**: Utility functions are reusable across modules
4. **Maintainability**: Clear naming conventions and documentation
5. **Scalability**: Blueprint pattern allows easy extension

---

**Last Updated**: 2025-01-27

