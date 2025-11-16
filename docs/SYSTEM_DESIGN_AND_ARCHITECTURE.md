# System Design and Architecture
## DominoML - Visual Machine Learning Pipeline Builder

**Document Version:** 1.0  
**Date:** 2025-01-27  
**Project:** DominoML Flask Edition

---

## Table of Contents
1. [System Architecture Overview](#1-system-architecture-overview)
2. [High-Level Architecture](#2-high-level-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Database Design](#4-database-design)
5. [ER Diagram](#5-er-diagram)
6. [Schema Definition](#6-schema-definition)
7. [Design Framework](#7-design-framework)
8. [Use Case Diagram](#8-use-case-diagram)
9. [Data Flow Diagram (DFD)](#9-data-flow-diagram-dfd)
10. [Component Architecture](#10-component-architecture)
11. [API Design](#11-api-design)
12. [Security Architecture](#12-security-architecture)

---

## 1. System Architecture Overview

DominoML follows a **three-tier architecture** pattern:
- **Presentation Layer**: HTML/CSS/JavaScript frontend
- **Application Layer**: Flask backend with REST API
- **Data Layer**: SQLite database with SQLAlchemy ORM

### Architecture Principles
- **Separation of Concerns**: Clear separation between UI, business logic, and data
- **Modularity**: Component-based design for maintainability
- **Scalability**: Stateless API design for horizontal scaling
- **Security**: Authentication, authorization, and input validation at each layer

---

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Browser    │  │   Browser    │  │   Browser    │          │
│  │  (Chrome)    │  │  (Firefox)   │  │  (Safari)    │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                  │                   │
└─────────┼─────────────────┼──────────────────┼──────────────────┘
          │                 │                  │
          │   HTTP/HTTPS    │                  │
          │   REST API      │                  │
          │                 │                  │
┌─────────┼─────────────────┼──────────────────┼──────────────────┐
│         ▼                 ▼                  ▼                   │
│                    APPLICATION LAYER                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Flask Application                      │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │   │
│  │  │   Routes     │  │   Models     │  │   Utils       │  │   │
│  │  │  - main.py   │  │  - User      │  │  - Code Gen   │  │   │
│  │  │  - auth.py   │  │  - Pipeline  │  │  - Exporters │  │   │
│  │  │  - api.py    │  │  - Version   │  │  - Data Load  │  │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  │   │
│  │                                                           │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │         Flask Extensions                         │   │   │
│  │  │  - Flask-Login (Auth)                            │   │   │
│  │  │  - Flask-SQLAlchemy (ORM)                        │   │   │
│  │  │  - Flask-WTF (Forms & CSRF)                      │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└──────────────────────────┬───────────────────────────────────────┘
                           │
                           │ SQLAlchemy ORM
                           │
┌──────────────────────────▼───────────────────────────────────────┐
│                        DATA LAYER                                 │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │              SQLite Database                             │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐            │    │
│  │  │   User   │  │ Pipeline │  │ Version  │            │    │
│  │  │  Table   │  │  Table   │  │  Table   │            │    │
│  │  └──────────┘  └──────────┘  └──────────┘            │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐            │    │
│  │  │ Metrics  │  │   Tags   │  │ Comments │            │    │
│  │  │  Table   │  │  Table   │  │  Table   │            │    │
│  │  └──────────┘  └──────────┘  └──────────┘            │    │
│  └──────────────────────────────────────────────────────────┘    │
└───────────────────────────────────────────────────────────────────┘
```

### System Flow
1. **User Request**: Browser sends HTTP request to Flask server
2. **Route Handling**: Flask routes request to appropriate handler
3. **Authentication**: Flask-Login validates user session
4. **Business Logic**: Route handler processes request using models/utils
5. **Data Access**: SQLAlchemy queries/updates database
6. **Response**: JSON/HTML response sent back to client
7. **Rendering**: Browser renders response (HTML) or processes JSON (API)

---

## 3. Technology Stack

### Backend Technologies

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Web Framework** | Flask | 3.0+ | Core web application framework |
| **ORM** | SQLAlchemy | Latest | Database abstraction layer |
| **Authentication** | Flask-Login | Latest | User session management |
| **Forms** | Flask-WTF | Latest | Form handling and CSRF protection |
| **Password Hashing** | Werkzeug | Latest | Secure password storage |
| **Environment Config** | python-dotenv | Latest | Environment variable management |
| **Database** | SQLite | 3.x | Development database (PostgreSQL for production) |

### Frontend Technologies

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Markup** | HTML5 | Structure |
| **Styling** | CSS3 | Custom CSS (no frameworks) |
| **Scripting** | Vanilla JavaScript (ES6+) | Client-side logic |
| **Icons** | Lucide Icons (CDN) | Icon library |
| **Templates** | Jinja2 | Server-side templating |

### Development Tools

| Tool | Purpose |
|------|---------|
| **Git** | Version control |
| **Python 3.8+** | Runtime environment |
| **pip** | Package management |

---

## 4. Database Design

### Database Choice
- **Development**: SQLite (file-based, easy setup)
- **Production**: PostgreSQL (recommended for scalability)

### Design Principles
- **Normalization**: 3NF (Third Normal Form)
- **Relationships**: Foreign keys with cascade delete
- **Indexing**: Indexes on frequently queried columns
- **JSON Storage**: JSON fields for flexible data (nodes, edges, metadata)

---

## 5. ER Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         ENTITY RELATIONSHIP DIAGRAM              │
└─────────────────────────────────────────────────────────────────┘

                    ┌─────────────┐
                    │    User     │
                    ├─────────────┤
                    │ PK id       │
                    │    username │
                    │    email    │
                    │    password │
                    │    created  │
                    └──────┬──────┘
                           │
                           │ 1
                           │
                           │ has many
                           │
                           │ N
                    ┌──────▼──────────┐
                    │  SavedModel     │
                    ├─────────────────┤
                    │ PK id           │
                    │ FK user_id      │──┐
                    │    name         │  │
                    │    description  │  │
                    │    nodes (JSON) │  │
                    │    edges (JSON) │  │
                    │    tags         │  │
                    │    is_public    │  │
                    │    created_at   │  │
                    │    updated_at   │  │
                    └──────┬──────────┘  │
                           │             │
                           │ 1           │
                           │             │
                           │ has many    │
                           │             │
                           │ N           │
                    ┌──────▼──────────────┐
                    │ PipelineVersion     │
                    ├─────────────────────┤
                    │ PK id               │
                    │ FK pipeline_id      │──┐
                    │ FK parent_version_id│──┼──┐
                    │    version_number   │  │  │
                    │    version_tag      │  │  │
                    │    name             │  │  │
                    │    description      │  │  │
                    │    nodes (JSON)     │  │  │
                    │    edges (JSON)     │  │  │
                    │    generated_code   │  │  │
                    │    meta_data (JSON) │  │  │
                    │    is_active        │  │  │
                    │    created_at       │  │  │
                    │    created_by       │  │  │
                    └──────┬──────────────┘  │  │
                           │                 │  │
                           │ 1               │  │
                           │                 │  │
        ┌───────────────────┼─────────────────┼──┘
        │                   │                 │
        │ has many          │ has many        │ self-reference
        │                   │                 │ (parent-child)
        │ N                 │ N               │
        │                   │                 │
┌───────▼────────┐  ┌───────▼────────┐  ┌─────▼──────────┐
│  ModelMetric   │  │  VersionTag    │  │ PipelineVersion│
├───────────────┤  ├───────────────┤  │  (parent)      │
│ PK id         │  │ PK id         │  └─────────────────┘
│ FK version_id │  │ FK version_id │
│    metric_name│  │    tag_name   │
│    metric_val │  │    tag_color  │
│    metric_type│  │    created_at │
│    epoch      │  └───────────────┘
│    meta_data  │
│    created_at │
└───────────────┘
        │
        │ 1
        │
        │ has many
        │
        │ N
┌───────▼────────┐
│VersionComment  │
├───────────────┤
│ PK id         │
│ FK version_id │
│    user_id    │
│    comment    │
│    created_at │
└───────────────┘
```

### Relationship Summary
- **User → SavedModel**: One-to-Many (1:N)
- **SavedModel → PipelineVersion**: One-to-Many (1:N)
- **PipelineVersion → ModelMetric**: One-to-Many (1:N)
- **PipelineVersion → VersionTag**: One-to-Many (1:N)
- **PipelineVersion → VersionComment**: One-to-Many (1:N)
- **PipelineVersion → PipelineVersion**: Self-referential (parent-child versions)

---

## 6. Schema Definition

### 6.1 User Table

```sql
CREATE TABLE user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(80) UNIQUE NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    display_name VARCHAR(120),
    password_hash VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_username ON user(username);
CREATE INDEX idx_user_email ON user(email);
```

**Fields**:
- `id`: Primary key, auto-increment
- `username`: Unique identifier for login
- `email`: Unique email address
- `display_name`: Optional display name
- `password_hash`: Hashed password (Werkzeug)
- `created_at`: Account creation timestamp

### 6.2 SavedModel Table

```sql
CREATE TABLE saved_model (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    user_id INTEGER NOT NULL,
    nodes TEXT NOT NULL,  -- JSON array
    edges TEXT NOT NULL,  -- JSON array
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_public BOOLEAN DEFAULT 0,
    tags VARCHAR(500),
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

CREATE INDEX idx_saved_model_user_id ON saved_model(user_id);
CREATE INDEX idx_saved_model_updated ON saved_model(updated_at);
```

**Fields**:
- `id`: Primary key
- `name`: Pipeline name
- `description`: Optional description
- `user_id`: Foreign key to User
- `nodes`: JSON string of pipeline nodes
- `edges`: JSON string of pipeline edges
- `is_public`: Public visibility flag
- `tags`: Comma-separated tags
- `created_at`, `updated_at`: Timestamps

### 6.3 PipelineVersion Table

```sql
CREATE TABLE pipeline_versions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pipeline_id INTEGER NOT NULL,
    version_number INTEGER NOT NULL,
    version_tag VARCHAR(50),
    name VARCHAR(200),
    description TEXT,
    nodes TEXT NOT NULL,  -- JSON array
    edges TEXT NOT NULL,  -- JSON array
    generated_code TEXT,
    meta_data TEXT,  -- JSON object
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    is_active BOOLEAN DEFAULT 0,
    parent_version_id INTEGER,
    FOREIGN KEY (pipeline_id) REFERENCES saved_model(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_version_id) REFERENCES pipeline_versions(id) ON DELETE SET NULL
);

CREATE INDEX idx_version_pipeline ON pipeline_versions(pipeline_id);
CREATE INDEX idx_version_number ON pipeline_versions(pipeline_id, version_number);
CREATE INDEX idx_version_active ON pipeline_versions(pipeline_id, is_active);
```

**Fields**:
- `id`: Primary key
- `pipeline_id`: Foreign key to SavedModel
- `version_number`: Sequential version number
- `version_tag`: Tag (e.g., "v1.0", "production")
- `nodes`, `edges`: Pipeline snapshot (JSON)
- `generated_code`: Generated Python code snapshot
- `meta_data`: Additional metadata (JSON)
- `parent_version_id`: Self-referential foreign key for version lineage
- `is_active`: Active version flag

### 6.4 ModelMetric Table

```sql
CREATE TABLE model_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    version_id INTEGER NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    metric_value FLOAT,
    metric_type VARCHAR(50),  -- training, validation, test
    epoch INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    meta_data TEXT,  -- JSON object
    FOREIGN KEY (version_id) REFERENCES pipeline_versions(id) ON DELETE CASCADE
);

CREATE INDEX idx_metric_version ON model_metrics(version_id);
CREATE INDEX idx_metric_name ON model_metrics(metric_name);
```

### 6.5 VersionTag Table

```sql
CREATE TABLE version_tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    version_id INTEGER NOT NULL,
    tag_name VARCHAR(50) NOT NULL,
    tag_color VARCHAR(20),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (version_id) REFERENCES pipeline_versions(id) ON DELETE CASCADE
);
```

### 6.6 VersionComment Table

```sql
CREATE TABLE version_comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    version_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    comment TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (version_id) REFERENCES pipeline_versions(id) ON DELETE CASCADE
);
```

---

## 7. Design Framework

### 7.1 MVC Pattern (Modified)

DominoML uses a **modified MVC pattern**:

- **Model**: SQLAlchemy models (`app/models.py`)
- **View**: Jinja2 templates (`app/templates/`)
- **Controller**: Flask routes (`app/routes/`)

### 7.2 Application Factory Pattern

```python
# app/__init__.py
def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize extensions
    db.init_app(app)
    login_manager.init_app(app)
    
    # Register blueprints
    app.register_blueprint(main_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(api_bp)
    
    return app
```

### 7.3 Blueprint Pattern

Routes are organized into blueprints:
- `main_bp`: Main application routes
- `auth_bp`: Authentication routes
- `api_bp`: REST API endpoints

### 7.4 Utility Modules

- **Code Generator**: Converts visual pipeline to Python code
- **Data Loader**: Loads components and templates from JSON
- **Exporters**: Export pipelines in various formats

### 7.5 Frontend Architecture

```
Frontend Structure:
├── Static Assets
│   ├── CSS (modular stylesheets)
│   └── JavaScript (modular scripts)
│       ├── canvas.js      (Canvas/drawing logic)
│       ├── components.js   (Component library)
│       ├── api.js         (API client)
│       ├── history.js     (Undo/Redo)
│       └── versions.js    (Version management)
└── Templates (Jinja2)
    ├── base.html
    ├── landing.html
    ├── auth.html
    └── builder.html
```

---

## 8. Use Case Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USE CASE DIAGRAM                        │
└─────────────────────────────────────────────────────────────────┘

                    ┌──────────────┐
                    │     User     │
                    └──────┬───────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                     │
        │                  │                     │
┌───────▼──────┐  ┌────────▼────────┐  ┌────────▼────────┐
│   Register   │  │      Login      │  │     Logout      │
│   Account    │  │                 │  │                 │
└──────────────┘  └─────────────────┘  └─────────────────┘
        │                  │                     │
        │                  │                     │
        └──────────────────┼─────────────────────┘
                           │
                           │ (authenticated)
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
┌───────▼──────┐  ┌────────▼────────┐  ┌─────▼──────────┐
│  Create     │  │   Load Pipeline │  │  Save Pipeline  │
│  Pipeline   │  │                 │  │                 │
└─────────────┘  └─────────────────┘  └─────────────────┘
        │                  │                     │
        │                  │                     │
┌───────▼──────┐  ┌────────▼────────┐  ┌─────▼──────────┐
│  Add Node    │  │  Connect Nodes  │  │  Configure      │
│              │  │                 │  │  Parameters     │
└──────────────┘  └─────────────────┘  └─────────────────┘
        │                  │                     │
        │                  │                     │
┌───────▼──────┐  ┌────────▼────────┐  ┌─────▼──────────┐
│  Generate    │  │  Create Version  │  │  Export Pipeline│
│  Code        │  │                 │  │                 │
└──────────────┘  └─────────────────┘  └─────────────────┘
        │                  │                     │
        │                  │                     │
┌───────▼──────┐  ┌────────▼────────┐  ┌─────▼──────────┐
│  Compare     │  │  Add Metrics    │  │  View History   │
│  Versions    │  │                 │  │  (Undo/Redo)    │
└──────────────┘  └─────────────────┘  └─────────────────┘
```

### Use Case Descriptions

1. **Register Account**: New user creates account with username, email, password
2. **Login**: User authenticates with credentials
3. **Logout**: User ends session
4. **Create Pipeline**: User starts new pipeline on canvas
5. **Add Node**: User drags component from library to canvas
6. **Connect Nodes**: User creates edge between two nodes
7. **Configure Parameters**: User sets component parameters
8. **Save Pipeline**: User saves pipeline with name/description
9. **Load Pipeline**: User loads saved pipeline to canvas
10. **Generate Code**: System generates Python code from pipeline
11. **Create Version**: User creates version snapshot
12. **Compare Versions**: User compares two versions
13. **Export Pipeline**: User exports as Python/Notebook/Docker
14. **Add Metrics**: User adds performance metrics to version
15. **View History**: User uses undo/redo functionality

---

## 9. Data Flow Diagram (DFD)

### 9.1 Level 0 (Context Diagram)

```
┌─────────────────────────────────────────────────────────────────┐
│                        CONTEXT DIAGRAM                           │
└─────────────────────────────────────────────────────────────────┘

         ┌──────────┐                    ┌──────────┐
         │   User   │                    │ External │
         │          │                    │  System  │
         └────┬─────┘                    └────┬─────┘
              │                                │
              │ HTTP Requests                  │
              │ (Login, Save, Load)            │
              │                                │
              │                                │
         ┌────▼────────────────────────────────▼─────┐
         │         DominoML System                    │
         │  ┌──────────────────────────────────────┐ │
         │  │   Flask Application                  │ │
         │  │   - Authentication                   │ │
         │  │   - Pipeline Management              │ │
         │  │   - Code Generation                  │ │
         │  │   - Version Control                  │ │
         │  └──────────────────────────────────────┘ │
         │              │                            │
         │              │ SQL Queries                │
         │              ▼                            │
         │      ┌──────────────┐                    │
         │      │   Database    │                    │
         │      │   (SQLite)    │                    │
         │      └──────────────┘                    │
         └──────────────────────────────────────────┘
```

### 9.2 Level 1 DFD

```
┌─────────────────────────────────────────────────────────────────┐
│                         LEVEL 1 DFD                              │
└─────────────────────────────────────────────────────────────────┘

User Request
    │
    ▼
┌─────────────────┐
│  Authentication │◄─────┐
│     Process     │      │
└────────┬────────┘      │
         │               │
         │ Valid Session  │
         │               │
         ▼               │
┌─────────────────┐      │
│  Route Handler  │      │
│     Process     │      │
└────────┬────────┘      │
         │               │
         ├───────────────┘
         │
         ├──► ┌─────────────────┐
         │    │  Pipeline       │
         │    │  Management     │
         │    │     Process     │
         │    └────────┬────────┘
         │             │
         │             ▼
         │    ┌─────────────────┐
         │    │  Code Generator │
         │    │     Process     │
         │    └────────┬────────┘
         │             │
         │             ▼
         │    ┌─────────────────┐
         │    │  Version        │
         │    │  Management     │
         │    │     Process     │
         │    └────────┬────────┘
         │             │
         │             ▼
         └───────────►┌─────────────────┐
                      │  Database       │
                      │  Access        │
                      │     Process    │
                      └────────┬───────┘
                               │
                               ▼
                      ┌─────────────────┐
                      │    Database     │
                      │    (SQLite)     │
                      └─────────────────┘
```

### 9.3 Data Flows

**Authentication Flow**:
1. User → Login Request → Authentication Process
2. Authentication Process → User Credentials → Database
3. Database → User Record → Authentication Process
4. Authentication Process → Session Token → User

**Pipeline Save Flow**:
1. User → Pipeline Data → Route Handler
2. Route Handler → Pipeline Data → Pipeline Management
3. Pipeline Management → Pipeline Record → Database Access
4. Database Access → Save Operation → Database
5. Database → Success Response → Database Access
6. Database Access → Response → Pipeline Management
7. Pipeline Management → Response → Route Handler
8. Route Handler → JSON Response → User

**Code Generation Flow**:
1. User → Generate Request → Route Handler
2. Route Handler → Pipeline Data → Code Generator
3. Code Generator → Component Templates → Data Loader
4. Data Loader → Component JSON → Code Generator
5. Code Generator → Generated Code → Route Handler
6. Route Handler → Code Response → User

---

## 10. Component Architecture

### 10.1 Backend Components

```
app/
├── __init__.py          (Application factory)
├── models.py            (Database models)
├── forms.py             (WTForms)
├── routes/
│   ├── main.py         (Main routes: landing, builder)
│   ├── auth.py         (Authentication routes)
│   └── api.py          (REST API endpoints)
├── utils/
│   ├── data_loader.py  (Load components/templates)
│   ├── code_generator.py (Generate Python code)
│   └── exporters/
│       ├── python_exporter.py
│       ├── notebook_exporter.py
│       └── docker_exporter.py
└── static/
    ├── css/            (Stylesheets)
    └── js/             (JavaScript modules)
```

### 10.2 Frontend Components

**Canvas Component** (`canvas.js`):
- Manages visual pipeline canvas
- Handles node/edge creation/deletion
- Implements drag-and-drop
- Integrates with history system

**Component Library** (`components.js`):
- Displays available ML components
- Handles component search/filter
- Manages component categories

**API Client** (`api.js`):
- REST API communication
- Session management
- Error handling

**History Manager** (`history.js`):
- Undo/Redo functionality
- Action tracking
- State persistence

**Version Manager** (`versions.js`):
- Version creation/management UI
- Version comparison
- Version activation

---

## 11. API Design

### 11.1 REST API Endpoints

#### Authentication Endpoints
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout

#### Pipeline Endpoints
- `GET /api/models` - List user pipelines
- `POST /api/models` - Create new pipeline
- `GET /api/models/<id>` - Get pipeline details
- `PUT /api/models/<id>` - Update pipeline
- `DELETE /api/models/<id>` - Delete pipeline

#### Version Endpoints
- `POST /api/models/<id>/versions` - Create version
- `GET /api/models/<id>/versions` - List versions
- `GET /api/versions/<id>` - Get version details
- `POST /api/versions/<id>/activate` - Activate version
- `DELETE /api/versions/<id>` - Delete version
- `POST /api/versions/compare` - Compare versions

#### Export Endpoints
- `POST /api/models/<id>/export/python` - Export as Python
- `POST /api/models/<id>/export/notebook` - Export as Notebook
- `POST /api/models/<id>/export/docker` - Export as Docker
- `POST /api/models/<id>/export/requirements` - Export requirements.txt

#### Utility Endpoints
- `GET /api/components` - Get component library
- `GET /api/templates` - Get template gallery
- `POST /api/generate-code` - Generate code from pipeline

### 11.2 API Response Format

**Success Response**:
```json
{
  "status": "success",
  "data": { ... },
  "message": "Operation completed"
}
```

**Error Response**:
```json
{
  "status": "error",
  "error": "Error message",
  "code": 400
}
```

---

## 12. Security Architecture

### 12.1 Authentication & Authorization

- **Session-based Authentication**: Flask-Login manages user sessions
- **Password Hashing**: Werkzeug's password hashing (bcrypt)
- **CSRF Protection**: Flask-WTF CSRF tokens on forms
- **Route Protection**: `@login_required` decorator on protected routes

### 12.2 Data Security

- **Input Validation**: All user inputs validated and sanitized
- **SQL Injection Prevention**: SQLAlchemy ORM (parameterized queries)
- **XSS Prevention**: Jinja2 auto-escaping
- **User Data Isolation**: Users can only access their own pipelines

### 12.3 Security Best Practices

- Secret key stored in environment variables
- Password never stored in plain text
- Session cookies with secure flags (production)
- HTTPS recommended for production

---

## 13. Deployment Architecture

### 13.1 Development Environment
- Flask development server
- SQLite database
- Local file storage

### 13.2 Production Environment (Recommended)
- **WSGI Server**: Gunicorn or uWSGI
- **Reverse Proxy**: Nginx
- **Database**: PostgreSQL
- **Process Manager**: systemd or supervisor
- **SSL/TLS**: Let's Encrypt certificates

---

## 14. Future Enhancements

### 14.1 Scalability Improvements
- Database migration to PostgreSQL
- Redis for session storage
- Horizontal scaling with load balancer
- CDN for static assets

### 14.2 Feature Enhancements
- Real-time collaboration
- Cloud storage integration
- Model training integration
- Advanced visualization

---

**Document Status**: Approved  
**Last Updated**: 2025-01-27

