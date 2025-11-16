# DominoML - Visual Machine Learning Pipeline Builder

**Version:** 1.0  
**Last Updated:** 2025-01-27

A Flask-based visual machine learning pipeline builder that enables users to create ML workflows through an intuitive drag-and-drop interface. Build complete custom ML pipelines visually and generate production-ready Python code automatically.

## Table of Contents

- [Features](#-features)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Project Structure](#-project-structure)
- [Technology Stack](#-technology-stack)
- [Usage Guide](#-usage-guide)
- [Development](#-development)
- [Documentation](#-documentation)
- [Security](#-security)
- [Troubleshooting](#-troubleshooting)
- [License](#-license)

## Features

### Core Features
- **Drag & Drop Interface**: Visual pipeline builder with vanilla JavaScript
- **Component Library**: Extensive collection of ML components (data sources, preprocessing, models, evaluation)
- **Code Export**: Generate Python code from visual pipelines
- **Template Gallery**: Pre-built ML pipeline templates
- **Real-time Validation**: Model structure validation with detailed feedback

### Additional Features
- **User Authentication**: Login/signup with session management using Flask-Login
- **Cloud Storage**: Save and manage models in SQLite database
- **Dark Theme**: Full dark mode support with theme toggle
- **My Models Gallery**: View, load, and manage saved models
- **Import/Export**: Export models as JSON and import them back
- **Responsive Design**: Mobile-friendly interface

### ✨ NEW - Phase 1 & 2 Features

#### Undo/Redo System (Phase 1)
- **History Management**: Track up to 50 canvas operations with smart state management
- **Keyboard Shortcuts**: 
  - `Ctrl+Z` / `Cmd+Z` - Undo last action
  - `Ctrl+Shift+Z` / `Cmd+Shift+Z` - Redo undone action
- **Batch Operations**: Group multiple actions into single undo/redo step
- **Persistence**: Last 10 actions saved to localStorage for session recovery
- **Visual Feedback**: Dynamic toolbar buttons with action descriptions
- **Supported Actions**: Node add/delete, edge add/delete, parameter updates, template loads

#### Pipeline Versioning (Phase 2)
- **Version Control**: Full version tracking for ML pipelines with parent-child lineage
- **Version Management**:
  - Create new versions with descriptions and tags
  - Load and compare different versions
  - Activate specific versions for production
  - Delete unused versions
- **Experiment Tracking**: Store and track model metrics across versions
  - Training, validation, and test metrics
  - Epoch-based metric tracking
  - Custom metadata support
- **Release Management**: Tag versions (production, staging, experimental, etc.)
- **Collaboration**: Add comments to versions for team collaboration
- **Version Timeline**: Visual timeline showing version history
- **Code Snapshots**: Automatically generate and store Python code for each version

#### Export Runnable Artifacts (Phase 3)
- **Python Scripts**: Export as standalone executable Python scripts
  - Command-line interface with argparse
  - Logging and error handling
  - Dry-run and verbose modes
  - Auto-generated requirements.txt
- **Jupyter Notebooks**: Export as interactive notebooks
  - Cell-based structure with documentation
  - Import organization
  - Step-by-step execution
- **Docker Containers**: Full containerization support
  - Complete Dockerfile generation
  - docker-compose.yml orchestration
  - Volume mounts for data/output
  - Deployment documentation
  - GPU support templates
- **Requirements**: Auto-generated dependency lists with pinned versions

## Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- Modern web browser (Chrome, Firefox, Edge, Safari)

## Installation

### 1. Clone the repository

```bash
cd dominoML-flask
```

### 2. Create a virtual environment

```bash
python -m venv venv
```

### 3. Activate the virtual environment

**Windows:**
```bash
venv\Scripts\activate
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

### 4. Install dependencies

```bash
pip install -r requirements.txt
```

### 5. Set up environment variables

```bash
copy .env.example .env
```

Edit `.env` and update the configuration:
```env
SECRET_KEY=your-secret-key-here-change-this
DATABASE_URL=sqlite:///glideml.db
FLASK_ENV=development
FLASK_DEBUG=True
```

### 6. Initialize the database

```bash
python
>>> from app import create_app, db
>>> app = create_app()
>>> with app.app_context():
...     db.create_all()
... 
>>> exit()
```

### 7. Run the application

```bash
python run.py
```

The application will be available at `http://localhost:5000`

## Project Structure

For detailed project structure, see [PROJECT_STRUCTURE.md](../docs/PROJECT_STRUCTURE.md)

```
Domino_ML/
├── app/                          # Flask application package
│   ├── __init__.py              # Application factory
│   ├── models.py                # Database models
│   ├── forms.py                 # WTForms
│   ├── data/                    # Static data (components, templates)
│   ├── routes/                  # Route handlers (Blueprints)
│   ├── static/                  # Static assets (CSS, JS)
│   ├── templates/               # Jinja2 templates
│   └── utils/                   # Utility modules
├── migrations/                  # Database migrations
├── scripts/                     # Utility scripts
├── config.py                    # Configuration
├── run.py                       # Entry point
└── requirements.txt             # Dependencies
```

## Technology Stack

### Backend
- **Framework**: Flask 3.0
- **Database**: SQLAlchemy with SQLite
- **Authentication**: Flask-Login
- **Forms**: Flask-WTF + WTForms

### Frontend
- **Templates**: Jinja2
- **Styling**: Custom CSS (migrated from Tailwind CSS)
- **JavaScript**: Vanilla JS (no frameworks)
- **Icons**: Lucide Icons (via CDN)

## Design System

The application uses a custom CSS design system that replicates the original Tailwind-based design:

### Color Palette
- **Light Mode**: Clean whites and grays with blue/purple accents
- **Dark Mode**: Dark grays with adjusted contrast
- **Component Colors**:
  - Data: Blue tones
  - Preprocessing: Green tones
  - Models: Purple tones
  - Evaluation: Orange tones

### Responsive Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## Usage Guide

### Authentication
1. **Sign Up**: Create a new account with username, email, and password
2. **Sign In**: Log in to access your saved models
3. **Profile**: Manage your account from the user menu

### Building ML Pipelines
1. **Drag Components**: Drag components from the sidebar to the canvas
2. **Connect Components**: Click and drag between component connection points
3. **Configure Properties**: Click a component to edit its parameters in the property panel
4. **Validate Model**: Use the validation tool to check for issues
5. **Save Model**: Save your pipeline to the database

### Managing Models
- **Templates**: Browse and load pre-built templates
- **My Models**: Access your saved models
- **Import/Export**: Share models by exporting to JSON files
- **Code Generation**: Export Python code for your pipeline

### Component Categories
- **Data Sources**: CSV loaders, sample datasets
- **Preprocessing**: Data cleaning, feature engineering, scaling, dimensionality reduction
- **Models**: Classification, regression, clustering algorithms
- **Evaluation**: Metrics, validation, performance analysis

### Using Undo/Redo
- **Undo**: Press `Ctrl+Z` (or `Cmd+Z` on Mac) or click the undo button in the toolbar
- **Redo**: Press `Ctrl+Shift+Z` (or `Cmd+Shift+Z` on Mac) or click the redo button
- **History**: Hover over undo/redo buttons to see the action description
- **Persistence**: Your last 10 actions are saved when you reload the page

### Managing Pipeline Versions
1. **Create Version**: 
   - Build your pipeline
   - Save the model first
   - Click "Versions" button in the toolbar
   - Click "Create New Version"
   - Add name, description, and optional tags
   
2. **Load Version**:
   - Click "Versions" button
   - Browse version timeline
   - Click "Load" on any version to restore it to the canvas
   
3. **Activate Version**:
   - Set a version as "active" to mark it for production
   - Only one version can be active at a time
   
4. **Compare Versions**:
   - View changes between versions
   - Track metric improvements
   
5. **Add Metrics** (via API):
   - Store training/validation metrics
   - Track experiment results
   - Compare performance across versions

## Development

### Running in Development Mode

```bash
python run.py
```

The application will run with debug mode enabled on `http://localhost:5000`

### Database Migrations

When you make changes to the models:

```python
from app import create_app, db
app = create_app()
with app.app_context():
    db.drop_all()  # Caution: This will delete all data
    db.create_all()
```

### Adding New Components

1. Edit `app/data/ml_components.json`
2. Add your component following the existing structure
3. Restart the application

### Adding New Templates

1. Edit `app/data/ml_templates.json`
2. Add your template following the existing structure
3. Restart the application

## Security

- Passwords are hashed using Werkzeug's security functions
- CSRF protection enabled via Flask-WTF
- Session-based authentication with Flask-Login
- SQL injection prevention through SQLAlchemy ORM

## Troubleshooting

### Database Issues
```bash
# Delete the database and recreate
rm glideml.db
python
>>> from app import create_app, db
>>> app = create_app()
>>> with app.app_context():
...     db.create_all()
```

### Port Already in Use
Change the port in `run.py`:
```python
app.run(debug=True, host='0.0.0.0', port=5001)
```

### Static Files Not Loading
Clear browser cache and hard refresh (Ctrl+Shift+R or Cmd+Shift+R)


## Documentation

Comprehensive documentation is available in the `docs/` directory:

- **[SRS.md](../docs/SRS.md)** - System Requirements Specifications
- **[SYSTEM_DESIGN_AND_ARCHITECTURE.md](../docs/SYSTEM_DESIGN_AND_ARCHITECTURE.md)** - System design, ER diagrams, DFDs, use cases
- **[PROJECT_STRUCTURE.md](../docs/PROJECT_STRUCTURE.md)** - Detailed project structure
- **[API_DOCS.md](../docs/API_DOCS.md)** - REST API documentation
- **[QUICKSTART.md](../docs/QUICKSTART.md)** - Quick start guide

## License

Not yet licensed

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please open an issue on the GitHub repository.

---

**Built with ❤️ for the ML community**
