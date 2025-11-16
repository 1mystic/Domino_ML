# System Requirements Specifications (SRS)
## DominoML - Visual Machine Learning Pipeline Builder

**Document Version:** 1.0  
**Date:** 2025-01-27  
**Project:** DominoML Flask Edition

---

## 1. Introduction

### 1.1 Purpose
This document specifies the functional and non-functional requirements for DominoML, a web-based visual machine learning pipeline builder that enables users to create ML workflows through a drag-and-drop interface.

### 1.2 Scope
DominoML is a Flask-based application that provides:
- Visual pipeline construction interface
- Component library for ML operations
- Code generation from visual pipelines
- Pipeline versioning and management
- User authentication and model storage
- Export capabilities (Python, Jupyter Notebook, Docker)

### 1.3 Definitions, Acronyms, and Abbreviations
- **ML**: Machine Learning
- **API**: Application Programming Interface
- **REST**: Representational State Transfer
- **CRUD**: Create, Read, Update, Delete
- **DFD**: Data Flow Diagram
- **ERD**: Entity Relationship Diagram

### 1.4 References
- Flask Documentation: https://flask.palletsprojects.com/
- SQLAlchemy Documentation: https://www.sqlalchemy.org/
- ML Component Standards: scikit-learn, pandas, numpy

### 1.5 Overview
This document is organized into sections covering functional requirements, non-functional requirements, system constraints, and user interface specifications.

---

## 2. Overall Description

### 2.1 Product Perspective
DominoML is a standalone web application that operates independently. It interfaces with:
- **Web Browser**: Client-side interface
- **SQLite Database**: Local data storage
- **Python Runtime**: Code execution environment

### 2.2 Product Functions
1. **User Management**: Registration, authentication, session management
2. **Visual Pipeline Builder**: Drag-and-drop interface for creating ML pipelines
3. **Component Library**: Pre-built ML components (data sources, preprocessing, models, evaluation)
4. **Code Generation**: Automatic Python code generation from visual pipelines
5. **Pipeline Management**: Save, load, update, delete pipelines
6. **Version Control**: Track pipeline versions with history
7. **Export Functionality**: Export pipelines as Python scripts, Jupyter notebooks, or Docker containers
8. **Template Gallery**: Pre-built pipeline templates

### 2.3 User Classes and Characteristics
- **Primary Users**: Data scientists, ML engineers, researchers
- **Skill Level**: Intermediate to advanced Python and ML knowledge
- **Access**: Web-based, requires account registration

### 2.4 Operating Environment
- **Server**: Python 3.8+, Flask 3.0+
- **Database**: SQLite (development), PostgreSQL (production-ready)
- **Client**: Modern web browsers (Chrome, Firefox, Safari, Edge)
- **OS**: Cross-platform (Windows, macOS, Linux)

### 2.5 Design and Implementation Constraints
- Flask framework for backend
- Vanilla JavaScript (no frontend frameworks)
- SQLAlchemy ORM for database operations
- Responsive design for mobile compatibility
- Dark mode support

### 2.6 Assumptions and Dependencies
- Users have basic understanding of ML concepts
- Python environment available for code execution
- Modern browser with JavaScript enabled
- Network connectivity for initial setup

---

## 3. System Features

### 3.1 User Authentication (FR-001)
**Priority**: High  
**Description**: Users must be able to register, login, and manage sessions.

**Functional Requirements**:
- FR-001.1: User registration with username, email, and password
- FR-001.2: User login with credentials
- FR-001.3: Session management with Flask-Login
- FR-001.4: Password hashing using Werkzeug
- FR-001.5: Logout functionality
- FR-001.6: Protected routes requiring authentication

**Inputs**: Username, email, password  
**Outputs**: Session token, user dashboard

### 3.2 Visual Pipeline Builder (FR-002)
**Priority**: High  
**Description**: Drag-and-drop interface for building ML pipelines.

**Functional Requirements**:
- FR-002.1: Drag components from library to canvas
- FR-002.2: Connect components with edges
- FR-002.3: Configure component parameters
- FR-002.4: Real-time validation of pipeline structure
- FR-002.5: Visual feedback for valid/invalid connections
- FR-002.6: Delete nodes and edges
- FR-002.7: Undo/Redo functionality (50 action history)
- FR-002.8: Keyboard shortcuts (Ctrl+Z, Ctrl+Shift+Z)

**Inputs**: Mouse/touch interactions, component selections  
**Outputs**: Visual pipeline representation, validation status

### 3.3 Component Library (FR-003)
**Priority**: High  
**Description**: Pre-built ML components for pipeline construction.

**Functional Requirements**:
- FR-003.1: Display categorized components (Data, Preprocessing, Models, Evaluation)
- FR-003.2: Component search and filtering
- FR-003.3: Component details and documentation
- FR-003.4: Template-based component loading
- FR-003.5: Custom parameter configuration per component

**Component Categories**:
- Data Sources: CSV, JSON, Database
- Preprocessing: Scaling, Encoding, Feature Selection
- Models: Classification, Regression, Clustering
- Evaluation: Metrics, Cross-validation, Reports

### 3.4 Code Generation (FR-004)
**Priority**: High  
**Description**: Generate executable Python code from visual pipelines.

**Functional Requirements**:
- FR-004.1: Topological sort of pipeline nodes
- FR-004.2: Generate Python imports based on components
- FR-004.3: Generate sequential execution code
- FR-004.4: Parameter substitution in code templates
- FR-004.5: Export code as formatted Python script
- FR-004.6: Include CLI support in generated code

**Inputs**: Pipeline nodes and edges  
**Outputs**: Executable Python code

### 3.5 Pipeline Management (FR-005)
**Priority**: High  
**Description**: Save, load, update, and delete ML pipelines.

**Functional Requirements**:
- FR-005.1: Save pipeline with name and description
- FR-005.2: Load saved pipeline to canvas
- FR-005.3: Update existing pipeline
- FR-005.4: Delete pipeline
- FR-005.5: List all user pipelines
- FR-005.6: Search and filter pipelines
- FR-005.7: Tag pipelines for organization
- FR-005.8: Public/private pipeline visibility

**Inputs**: Pipeline data, metadata  
**Outputs**: Saved pipeline records, pipeline list

### 3.6 Version Control (FR-006)
**Priority**: Medium  
**Description**: Track and manage pipeline versions.

**Functional Requirements**:
- FR-006.1: Create new pipeline version
- FR-006.2: Version numbering (auto-increment)
- FR-006.3: Version tags (production, staging, dev)
- FR-006.4: Version descriptions and metadata
- FR-006.5: Parent-child version relationships
- FR-006.6: Activate/deactivate versions
- FR-006.7: Compare versions
- FR-006.8: Version history timeline

**Inputs**: Pipeline snapshot, version metadata  
**Outputs**: Version records, comparison data

### 3.7 Export Functionality (FR-007)
**Priority**: Medium  
**Description**: Export pipelines in multiple formats.

**Functional Requirements**:
- FR-007.1: Export as Python script (.py)
- FR-007.2: Export as Jupyter Notebook (.ipynb)
- FR-007.3: Export as Docker container (Dockerfile + requirements)
- FR-007.4: Generate requirements.txt with dependencies
- FR-007.5: Include documentation in exports
- FR-007.6: Download export files

**Inputs**: Pipeline data, export format selection  
**Outputs**: Export files (Python, Notebook, Docker)

### 3.8 Template Gallery (FR-008)
**Priority**: Low  
**Description**: Pre-built pipeline templates for common ML tasks.

**Functional Requirements**:
- FR-008.1: Display template gallery
- FR-008.2: Load template to canvas
- FR-008.3: Template categories (Classification, Regression, etc.)
- FR-008.4: Template preview and description

**Inputs**: Template selection  
**Outputs**: Pre-configured pipeline on canvas

### 3.9 Metrics Tracking (FR-009)
**Priority**: Low  
**Description**: Track and store model metrics for versions.

**Functional Requirements**:
- FR-009.1: Add metrics to pipeline versions
- FR-009.2: Store metric name, value, type (training/validation/test)
- FR-009.3: Track metrics over epochs
- FR-009.4: Display metrics in version details
- FR-009.5: Metric metadata storage

**Inputs**: Metric data  
**Outputs**: Stored metric records

---

## 4. Non-Functional Requirements

### 4.1 Performance Requirements
- **NFR-001**: Page load time < 2 seconds
- **NFR-002**: Pipeline save/load operation < 1 second
- **NFR-003**: Code generation < 500ms for pipelines with < 20 nodes
- **NFR-004**: Support up to 1000 nodes per pipeline
- **NFR-005**: Support concurrent users (10+ simultaneous)

### 4.2 Security Requirements
- **NFR-006**: Password hashing using bcrypt/Werkzeug
- **NFR-007**: CSRF protection on forms
- **NFR-008**: Session-based authentication
- **NFR-009**: Input validation and sanitization
- **NFR-010**: SQL injection prevention (SQLAlchemy ORM)
- **NFR-011**: User data isolation (users can only access their own pipelines)

### 4.3 Usability Requirements
- **NFR-012**: Intuitive drag-and-drop interface
- **NFR-013**: Responsive design for mobile devices
- **NFR-014**: Dark mode support
- **NFR-015**: Keyboard shortcuts for common operations
- **NFR-016**: Clear error messages and validation feedback
- **NFR-017**: Tooltips and help text for components

### 4.4 Reliability Requirements
- **NFR-018**: System uptime > 99%
- **NFR-019**: Data persistence (no data loss on restart)
- **NFR-020**: Graceful error handling
- **NFR-021**: Automatic database backups

### 4.5 Maintainability Requirements
- **NFR-022**: Modular code structure
- **NFR-023**: Comprehensive documentation
- **NFR-024**: Code comments and docstrings
- **NFR-025**: Version control integration (Git)

### 4.6 Portability Requirements
- **NFR-026**: Cross-platform compatibility (Windows, macOS, Linux)
- **NFR-027**: Browser compatibility (Chrome, Firefox, Safari, Edge)
- **NFR-028**: Database abstraction (SQLite/PostgreSQL)

---

## 5. System Constraints

### 5.1 Technical Constraints
- Flask framework (Python-based)
- SQLite database (can be migrated to PostgreSQL)
- Vanilla JavaScript (no frontend frameworks)
- Client-side rendering (no server-side rendering)

### 5.2 Business Constraints
- Open-source project
- Free for individual use
- No commercial licensing restrictions

### 5.3 Regulatory Constraints
- GDPR compliance for user data
- Data privacy requirements
- Secure password storage

---

## 6. User Interface Requirements

### 6.1 Landing Page
- Welcome message and feature overview
- Login/Signup buttons
- Demo or tutorial link

### 6.2 Authentication Page
- Login form (username/email, password)
- Signup form (username, email, password, confirm password)
- Error message display
- Remember me option

### 6.3 Pipeline Builder Interface
- **Left Panel**: Component library with categories
- **Center Panel**: Canvas for pipeline construction
- **Right Panel**: Properties panel for selected component
- **Top Bar**: Toolbar with save, export, version controls
- **Bottom Bar**: Status bar with validation messages

### 6.4 My Models Gallery
- Grid/list view of saved pipelines
- Search and filter options
- Pipeline cards with name, description, tags
- Actions: Load, Edit, Delete, Export

### 6.5 Version Management UI
- Version list with timeline
- Version comparison view
- Version details with metrics
- Create new version dialog

---

## 7. Data Requirements

### 7.1 User Data
- Username (unique, 80 chars max)
- Email (unique, 120 chars max)
- Password hash (255 chars)
- Display name (120 chars)
- Created timestamp

### 7.2 Pipeline Data
- Pipeline name (200 chars)
- Description (text)
- Nodes (JSON array)
- Edges (JSON array)
- Tags (comma-separated, 500 chars)
- Created/updated timestamps
- Public/private flag

### 7.3 Version Data
- Version number (integer)
- Version tag (50 chars)
- Name (200 chars)
- Description (text)
- Nodes and edges snapshot (JSON)
- Generated code (text)
- Metadata (JSON)
- Parent version reference
- Active flag

### 7.4 Metrics Data
- Metric name (100 chars)
- Metric value (float)
- Metric type (50 chars: training/validation/test)
- Epoch number (integer)
- Metadata (JSON)
- Timestamp

---

## 8. System Interfaces

### 8.1 User Interfaces
- Web-based HTML/CSS/JavaScript interface
- Responsive design for mobile and desktop
- RESTful API for programmatic access

### 8.2 Hardware Interfaces
- Standard web server hardware
- No special hardware requirements

### 8.3 Software Interfaces
- Python 3.8+ runtime
- Flask 3.0+ framework
- SQLAlchemy ORM
- Web browser (client-side)

### 8.4 Communication Interfaces
- HTTP/HTTPS protocol
- REST API endpoints
- JSON data format

---

## 9. Appendices

### 9.1 Glossary
- **Pipeline**: A sequence of ML operations represented visually
- **Node**: A component in the pipeline (data source, model, etc.)
- **Edge**: Connection between two nodes
- **Version**: A snapshot of a pipeline at a specific point in time
- **Template**: Pre-built pipeline configuration

### 9.2 Change History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-01-27 | System Architect | Initial SRS document |

---

**Document Status**: Approved  
**Next Review Date**: 2025-04-27

