# Diagram Descriptions for AI Generation
## DominoML - Visual Machine Learning Pipeline Builder

This document contains detailed descriptions for generating various system diagrams using AI diagram generators.

---

## 1. Entity Relationship Diagram (ERD)

### Description
Create a database ER diagram showing all entities and their relationships in the DominoML system.

### Entities and Attributes

**User Entity:**
- Primary Key: id (Integer)
- Attributes: username (String, unique), email (String, unique), display_name (String), password_hash (String), created_at (DateTime)
- Relationships: One-to-Many with SavedModel

**SavedModel Entity:**
- Primary Key: id (Integer)
- Attributes: name (String), description (Text), user_id (Foreign Key), nodes (Text/JSON), edges (Text/JSON), created_at (DateTime), updated_at (DateTime), is_public (Boolean), tags (String)
- Relationships: 
  - Many-to-One with User (user_id)
  - One-to-Many with PipelineVersion

**PipelineVersion Entity:**
- Primary Key: id (Integer)
- Attributes: pipeline_id (Foreign Key), version_number (Integer), version_tag (String), name (String), description (Text), nodes (Text/JSON), edges (Text/JSON), generated_code (Text), meta_data (Text/JSON), created_at (DateTime), created_by (Integer), is_active (Boolean), parent_version_id (Foreign Key, self-referential)
- Relationships:
  - Many-to-One with SavedModel (pipeline_id)
  - One-to-Many with ModelMetric
  - One-to-Many with VersionTag
  - One-to-Many with VersionComment
  - Self-referential: One-to-Many with PipelineVersion (parent-child relationship)

**ModelMetric Entity:**
- Primary Key: id (Integer)
- Attributes: version_id (Foreign Key), metric_name (String), metric_value (Float), metric_type (String: training/validation/test), epoch (Integer), created_at (DateTime), meta_data (Text/JSON)
- Relationships: Many-to-One with PipelineVersion

**VersionTag Entity:**
- Primary Key: id (Integer)
- Attributes: version_id (Foreign Key), tag_name (String), tag_color (String), created_at (DateTime)
- Relationships: Many-to-One with PipelineVersion

**VersionComment Entity:**
- Primary Key: id (Integer)
- Attributes: version_id (Foreign Key), user_id (Integer), comment (Text), created_at (DateTime)
- Relationships: Many-to-One with PipelineVersion

### Relationships
1. User → SavedModel: One-to-Many (1:N) - A user can have many saved models
2. SavedModel → PipelineVersion: One-to-Many (1:N) - A model can have many versions
3. PipelineVersion → ModelMetric: One-to-Many (1:N) - A version can have many metrics
4. PipelineVersion → VersionTag: One-to-Many (1:N) - A version can have many tags
5. PipelineVersion → VersionComment: One-to-Many (1:N) - A version can have many comments
6. PipelineVersion → PipelineVersion: Self-referential One-to-Many (1:N) - A version can have a parent version and many child versions

### Visual Specifications
- Use rectangular boxes for entities
- Show primary keys in bold or with underline
- Show foreign keys with (FK) notation
- Use crow's foot notation for relationships (one-to-many)
- Use different colors for different entity types (User: Blue, Models: Green, Versions: Orange, Metrics: Purple)
- Include cardinality labels (1, N) on relationship lines
- Show cascade delete relationships with appropriate notation

---

## 2. Data Flow Diagram (DFD) - Level 0 (Context Diagram)

### Description
Create a context diagram showing DominoML system as a single process interacting with external entities.

### External Entities
1. **User** - The end user interacting with the system
2. **Web Browser** - Client application
3. **Database** - SQLite database (shown as external for clarity)

### Central Process
**DominoML System** - The main application process

### Data Flows

**From User to System:**
- Login Credentials (username, password)
- Registration Data (username, email, password)
- Pipeline Data (nodes, edges, parameters)
- Save Request (pipeline name, description)
- Load Request (model ID)
- Export Request (format: Python/Notebook/Docker)
- Version Creation Request (version metadata)
- Component Selection (component ID)

**From System to User:**
- Authentication Response (session token, success/failure)
- Pipeline Display (visual representation)
- Generated Code (Python script)
- Export Files (Python/Notebook/Docker files)
- Version List (version history)
- Validation Messages (errors, warnings)
- Component Library (component definitions)

**From System to Database:**
- User Data (save user record)
- Pipeline Data (save/update pipeline)
- Version Data (save version snapshot)
- Metrics Data (save experiment metrics)
- Query Requests (retrieve data)

**From Database to System:**
- User Records (authentication, profile)
- Pipeline Records (load saved pipelines)
- Version Records (load version history)
- Metrics Records (load experiment data)

### Visual Specifications
- Use circles or rounded rectangles for external entities
- Use a large circle or rounded rectangle for the central process
- Use arrows with labels for data flows
- Use different colors for different flow types (input: blue, output: green, database: orange)
- Show data flow direction clearly with arrowheads

---

## 3. Data Flow Diagram (DFD) - Level 1

### Description
Decompose the DominoML system into major processes showing internal data flows.

### Processes

**1.0 Authentication Process**
- Input: Login credentials, Registration data
- Output: Session token, User profile
- Database: Read/Write User table
- Sub-processes: Validate credentials, Create session, Hash password

**2.0 Pipeline Management Process**
- Input: Pipeline data (nodes, edges), Save/Load requests
- Output: Saved pipeline confirmation, Pipeline data
- Database: Read/Write SavedModel table
- Sub-processes: Validate pipeline, Serialize pipeline, Store pipeline

**3.0 Code Generation Process**
- Input: Pipeline nodes and edges
- Output: Generated Python code
- Data Store: Component templates (from JSON files)
- Sub-processes: Topological sort, Template substitution, Import generation

**4.0 Version Management Process**
- Input: Version creation request, Version metadata
- Output: Version record, Version list
- Database: Read/Write PipelineVersion table
- Sub-processes: Create version snapshot, Generate code snapshot, Update version lineage

**5.0 Export Process**
- Input: Pipeline data, Export format selection
- Output: Export files (Python/Notebook/Docker)
- Sub-processes: Format conversion, File generation, Requirements generation

**6.0 Component Library Process**
- Input: Component request
- Output: Component definitions
- Data Store: ml_components.json, ml_templates.json
- Sub-processes: Load components, Filter components, Return definitions

### Data Stores
- **D1: User Database** - User table
- **D2: Pipeline Database** - SavedModel table
- **D3: Version Database** - PipelineVersion, ModelMetric, VersionTag, VersionComment tables
- **D4: Component Library** - ml_components.json file
- **D5: Template Library** - ml_templates.json file

### Data Flows Between Processes
- Authentication → Pipeline Management: User session data
- Pipeline Management → Code Generation: Pipeline structure
- Pipeline Management → Version Management: Pipeline snapshot
- Version Management → Export: Version data
- Component Library → Code Generation: Component templates

### Visual Specifications
- Use numbered circles for processes (1.0, 2.0, etc.)
- Use open rectangles for data stores (D1, D2, etc.)
- Show data flows with labeled arrows
- Use different line styles for different data types (solid: data, dashed: control)
- Group related processes visually
- Show process hierarchy with indentation or grouping

---

## 4. User Flow Diagram

### Description
Create a user flow diagram showing the complete user journey through the DominoML application.

### User Flow Steps

**Entry Point:**
1. **Landing Page** - User arrives at homepage
   - Options: Login, Sign Up, View Demo

**Authentication Flow:**
2. **Sign Up** (if new user)
   - Enter: Username, Email, Password
   - Submit → Create Account → Go to Login
3. **Login** (if existing user)
   - Enter: Username/Email, Password
   - Submit → Authenticate → Go to Builder

**Main Application Flow:**
4. **Pipeline Builder** - Main workspace
   - View: Component library (left panel)
   - View: Canvas (center)
   - View: Properties panel (right panel)
   - Actions available:
     - Drag component to canvas
     - Connect components
     - Configure parameters
     - Save pipeline
     - Generate code
     - Create version
     - Export pipeline
     - Undo/Redo actions

**Component Interaction Flow:**
5. **Add Component**
   - Browse component library
   - Select component category
   - Drag component to canvas
   - Component appears on canvas
6. **Connect Components**
   - Click source node output port
   - Drag to target node input port
   - Edge created
   - Validation check performed
7. **Configure Component**
   - Click component on canvas
   - Properties panel shows component parameters
   - Edit parameters
   - Changes saved to component

**Pipeline Management Flow:**
8. **Save Pipeline**
   - Click Save button
   - Enter pipeline name and description
   - Submit → Pipeline saved to database
   - Confirmation message shown
9. **Load Pipeline**
   - Click "My Models" button
   - Browse saved pipelines
   - Select pipeline
   - Pipeline loaded to canvas
10. **Create Version**
    - Click "Versions" button
    - Click "Create New Version"
    - Enter version name, description, tags
    - Submit → Version created
    - Version appears in timeline

**Code Generation Flow:**
11. **Generate Code**
    - Click "Generate Code" button
    - System processes pipeline
    - Python code displayed in modal
    - Option to download code
    - Option to copy to clipboard

**Export Flow:**
12. **Export Pipeline**
    - Click "Export" button
    - Select format (Python/Notebook/Docker)
    - System generates export files
    - Files downloaded to user's computer

**Version Management Flow:**
13. **View Versions**
    - Click "Versions" button
    - View version timeline
    - See version details (name, description, tags, metrics)
    - Option to load version
    - Option to compare versions
    - Option to activate version

**Error Handling Flow:**
14. **Validation Errors**
    - Invalid pipeline structure detected
    - Error message displayed
    - Problematic components highlighted
    - User can fix and retry

### Decision Points
- New user? → Sign Up flow
- Existing user? → Login flow
- Valid pipeline? → Allow save/generate
- Authenticated? → Allow save/load
- Has versions? → Show version timeline

### Visual Specifications
- Use rectangles for pages/screens
- Use diamonds for decision points
- Use arrows to show flow direction
- Use different colors for different flow types:
  - Authentication: Blue
  - Main flow: Green
  - Error flow: Red
  - Optional flow: Gray (dashed)
- Group related flows with swimlanes
- Show user actions in bold
- Show system responses in italics

---

## 5. Phase Implementation Diagram

### Description
Create a Gantt chart or timeline diagram showing the implementation phases of the DominoML project.

### Phases

**Phase 1: Undo/Redo System**
- Duration: 2-3 days
- Status: ✅ Complete (Oct 31, 2025)
- Tasks:
  - Create History Manager (JS)
  - Integrate into Canvas
  - Add UI Components
  - Testing
- Deliverables: history.js, updated canvas.js, toolbar buttons

**Phase 2: Pipeline Versioning**
- Duration: 3-4 days
- Status: ✅ Complete (Oct 31, 2025)
- Dependencies: Phase 1
- Tasks:
  - Database schema design
  - Version API endpoints
  - Version UI components
  - Version comparison feature
  - Testing
- Deliverables: Version models, API endpoints, version.js, UI components

**Phase 3: Export Artifacts**
- Duration: 4-5 days
- Status: ✅ Complete (Nov 9, 2025)
- Dependencies: Phase 2
- Tasks:
  - Python exporter
  - Jupyter Notebook exporter
  - Docker exporter
  - Requirements builder
  - Testing
- Deliverables: Export modules, export.js, API endpoints

**Phase 4: Sandbox Runner**
- Duration: 5-7 days
- Status: ⏳ Pending
- Dependencies: Phase 3
- Tasks:
  - Sandbox environment setup
  - Code execution engine
  - Result visualization
  - Error handling
- Deliverables: Sandbox service, execution API

**Phase 5: Experiment Tracking**
- Duration: 4-5 days
- Status: ⏳ Pending
- Dependencies: Phase 2
- Tasks:
  - Metrics collection API
  - Metrics visualization
  - Experiment comparison
  - Dashboard
- Deliverables: Metrics UI, tracking API

**Phase 6: Hyperparameter Tuning**
- Duration: 6-8 days
- Status: ⏳ Pending
- Dependencies: Phase 4, Phase 5
- Tasks:
  - Tuning algorithm integration
  - Parameter space definition
  - Optimization engine
  - Results analysis
- Deliverables: Tuning module, optimization API

**Phase 7: Explainability**
- Duration: 5-6 days
- Status: ⏳ Pending
- Dependencies: Phase 4
- Tasks:
  - SHAP integration
  - Feature importance visualization
  - Model interpretability
  - Explanation generation
- Deliverables: Explainability module, visualization components

**Phase 8: Real-time Collaboration**
- Duration: 7-10 days
- Status: ⏳ Pending
- Dependencies: Phase 2
- Tasks:
  - WebSocket integration
  - Real-time sync
  - Conflict resolution
  - Presence indicators
- Deliverables: WebSocket service, collaboration UI

### Timeline
- Week 1: Phase 1, Phase 2 (start)
- Week 2: Phase 2 (complete), Phase 3 (start)
- Week 3: Phase 3 (complete)
- Week 4-5: Phase 4
- Week 6: Phase 5
- Week 7-8: Phase 6
- Week 9: Phase 7
- Week 10-12: Phase 8

### Visual Specifications
- Use horizontal bars for phases (Gantt chart style)
- Show completed phases in green
- Show in-progress phases in yellow
- Show pending phases in gray
- Show dependencies with arrows
- Include phase labels, durations, and status
- Use different bar heights or colors for different priority levels
- Add milestone markers for phase completions

---

## 6. Sequence Diagram - Save Pipeline Flow

### Description
Create a sequence diagram showing the interaction between user, browser, Flask application, and database when saving a pipeline.

### Actors/Objects
1. **User** - The end user
2. **Browser (Frontend)** - Client-side JavaScript
3. **Flask App (Backend)** - Flask application server
4. **Authentication Service** - Flask-Login
5. **Database** - SQLite database

### Sequence Steps

1. **User Action**: User clicks "Save" button in UI
2. **Browser**: Collects pipeline data (nodes, edges, name, description)
3. **Browser → Flask App**: POST /api/models (with pipeline data, session cookie)
4. **Flask App**: Receives request, extracts session cookie
5. **Flask App → Authentication Service**: Validate session
6. **Authentication Service → Flask App**: Return user object (or 401 if invalid)
7. **Flask App**: Check if user is authenticated
8. **Flask App**: Validate request data (JSON schema validation)
9. **Flask App → Database**: Create SavedModel record
   - INSERT INTO saved_model (user_id, name, description, nodes, edges, created_at, updated_at)
10. **Database → Flask App**: Return created model ID
11. **Flask App**: Serialize response (model ID, success message)
12. **Flask App → Browser**: HTTP 201 Response (JSON: {id, message})
13. **Browser**: Parse JSON response
14. **Browser**: Update UI (show success message, update model list)
15. **Browser → User**: Display confirmation message

### Alternative Flows

**Error: Unauthenticated**
- Step 6: Authentication fails
- Flask App → Browser: HTTP 401 Unauthorized
- Browser: Redirect to login page

**Error: Validation Failed**
- Step 8: Data validation fails
- Flask App → Browser: HTTP 400 Bad Request (with error details)
- Browser: Display error message to user

**Error: Database Error**
- Step 9: Database operation fails
- Database → Flask App: Error
- Flask App → Browser: HTTP 500 Internal Server Error
- Browser: Display error message to user

### Visual Specifications
- Use vertical lifelines for each actor/object
- Use horizontal arrows for messages (solid: synchronous, dashed: asynchronous)
- Use activation boxes on lifelines to show active periods
- Use different arrow styles for different message types:
  - Solid arrow: Synchronous call
  - Dashed arrow: Return/response
  - Open arrow: Asynchronous message
- Use notes/annotations for important details
- Show time progression from top to bottom
- Use different colors for different types of interactions (request: blue, response: green, error: red)

---

## 7. Sequence Diagram - Code Generation Flow

### Description
Create a sequence diagram showing the code generation process when user requests Python code from a visual pipeline.

### Actors/Objects
1. **User** - The end user
2. **Browser (Frontend)** - Client-side JavaScript
3. **Flask App (API)** - Flask REST API endpoint
4. **Code Generator** - Code generation utility module
5. **Data Loader** - Component data loader
6. **Component Library** - JSON file (ml_components.json)

### Sequence Steps

1. **User Action**: User clicks "Generate Code" button
2. **Browser**: Collects current pipeline state (nodes array, edges array)
3. **Browser → Flask App**: POST /api/generate-code (with nodes and edges JSON)
4. **Flask App**: Receives request, validates JSON
5. **Flask App → Code Generator**: Call generate_python_code(nodes, edges, pipeline_name)
6. **Code Generator**: Validates input (checks if nodes/edges are not empty)
7. **Code Generator → Data Loader**: Call get_components()
8. **Data Loader**: Reads ml_components.json file
9. **Component Library → Data Loader**: Return component definitions
10. **Data Loader → Code Generator**: Return components dictionary
11. **Code Generator**: Perform topological sort on nodes using edges
12. **Code Generator**: Extract imports from component templates
13. **Code Generator**: Generate code structure:
    - Generate imports section
    - Generate function definition
    - For each node in sorted order:
      - Get component template
      - Substitute parameters
      - Generate node code
14. **Code Generator → Flask App**: Return generated Python code string
15. **Flask App**: Serialize response
16. **Flask App → Browser**: HTTP 200 Response (JSON: {code: "..."})
17. **Browser**: Parse JSON response
18. **Browser**: Display code in modal/panel (with syntax highlighting)
19. **Browser → User**: Show generated code with copy/download options

### Alternative Flows

**Error: Empty Pipeline**
- Step 6: No nodes in pipeline
- Code Generator → Flask App: Return error message
- Flask App → Browser: HTTP 400 Bad Request
- Browser: Display error to user

**Error: Invalid Component**
- Step 11: Component not found in library
- Code Generator: Skip component or use default template
- Continue with warning

### Visual Specifications
- Show synchronous calls with solid arrows
- Show data flow with labeled arrows (include data type)
- Use activation boxes to show processing time
- Group related operations with frames (e.g., "Code Generation Process")
- Show loops/iterations with loop frames
- Use different colors for different processing stages

---

## 8. Class Diagram (Object-Oriented Design)

### Description
Create a UML class diagram showing the main classes in the DominoML system.

### Classes

**User Class**
- Attributes:
  - id: Integer (PK)
  - username: String
  - email: String
  - display_name: String
  - password_hash: String
  - created_at: DateTime
- Methods:
  - set_password(password: String): void
  - check_password(password: String): Boolean
  - __repr__(): String
- Relationships: One-to-Many with SavedModel

**SavedModel Class**
- Attributes:
  - id: Integer (PK)
  - name: String
  - description: Text
  - user_id: Integer (FK)
  - nodes: Text (JSON)
  - edges: Text (JSON)
  - created_at: DateTime
  - updated_at: DateTime
  - is_public: Boolean
  - tags: String
- Methods:
  - __repr__(): String
- Relationships:
  - Many-to-One with User
  - One-to-Many with PipelineVersion

**PipelineVersion Class**
- Attributes:
  - id: Integer (PK)
  - pipeline_id: Integer (FK)
  - version_number: Integer
  - version_tag: String
  - name: String
  - description: Text
  - nodes: Text (JSON)
  - edges: Text (JSON)
  - generated_code: Text
  - meta_data: Text (JSON)
  - created_at: DateTime
  - created_by: Integer
  - is_active: Boolean
  - parent_version_id: Integer (FK, self-ref)
- Methods:
  - to_dict(): Dictionary
  - __repr__(): String
- Relationships:
  - Many-to-One with SavedModel
  - One-to-Many with ModelMetric
  - One-to-Many with VersionTag
  - One-to-Many with VersionComment
  - Self-referential (parent-child)

**ModelMetric Class**
- Attributes:
  - id: Integer (PK)
  - version_id: Integer (FK)
  - metric_name: String
  - metric_value: Float
  - metric_type: String
  - epoch: Integer
  - created_at: DateTime
  - meta_data: Text (JSON)
- Methods:
  - to_dict(): Dictionary
  - __repr__(): String
- Relationships: Many-to-One with PipelineVersion

**VersionTag Class**
- Attributes:
  - id: Integer (PK)
  - version_id: Integer (FK)
  - tag_name: String
  - tag_color: String
  - created_at: DateTime
- Methods:
  - to_dict(): Dictionary
  - __repr__(): String
- Relationships: Many-to-One with PipelineVersion

**VersionComment Class**
- Attributes:
  - id: Integer (PK)
  - version_id: Integer (FK)
  - user_id: Integer
  - comment: Text
  - created_at: DateTime
- Methods:
  - to_dict(): Dictionary
  - __repr__(): String
- Relationships: Many-to-One with PipelineVersion

**CodeGenerator Class** (Utility)
- Methods:
  - topological_sort(nodes: List, edges: List): List
  - generate_python_code(nodes: List, edges: List, pipeline_name: String): String
- Relationships: Uses DataLoader

**DataLoader Class** (Utility)
- Methods:
  - get_components(): Dictionary
  - get_templates(): Dictionary
- Relationships: Reads JSON files

**PythonExporter Class** (Utility)
- Methods:
  - export_pipeline(nodes: List, edges: List, pipeline_name: String): Dictionary
- Relationships: Uses CodeGenerator

**NotebookExporter Class** (Utility)
- Methods:
  - export_notebook(nodes: List, edges: List, pipeline_name: String): Dictionary
- Relationships: Uses CodeGenerator

**DockerExporter Class** (Utility)
- Methods:
  - export_docker(nodes: List, edges: List, pipeline_name: String): Dictionary
- Relationships: Uses RequirementsBuilder

**RequirementsBuilder Class** (Utility)
- Methods:
  - from_nodes(nodes: List, pinned: Boolean): String
- Relationships: Uses DataLoader

### Relationships
- User → SavedModel: One-to-Many (composition)
- SavedModel → PipelineVersion: One-to-Many (composition)
- PipelineVersion → ModelMetric: One-to-Many (composition)
- PipelineVersion → VersionTag: One-to-Many (composition)
- PipelineVersion → VersionComment: One-to-Many (composition)
- PipelineVersion → PipelineVersion: Self-referential (aggregation)
- CodeGenerator → DataLoader: Dependency (uses)
- PythonExporter → CodeGenerator: Dependency (uses)
- NotebookExporter → CodeGenerator: Dependency (uses)
- DockerExporter → RequirementsBuilder: Dependency (uses)

### Visual Specifications
- Use rectangles for classes
- Divide class rectangles into three sections: Class name, Attributes, Methods
- Use + for public, - for private, # for protected
- Show data types for attributes and parameters
- Use arrows for relationships:
  - Solid arrow with filled diamond: Composition
  - Solid arrow with empty diamond: Aggregation
  - Dashed arrow: Dependency
  - Solid line: Association
- Label relationships with cardinality (1, *, 1..*)
- Use different colors for different class types (Models: Blue, Utilities: Green)

---

## 9. State Diagram - Pipeline Builder State Machine

### Description
Create a state diagram showing the different states of the pipeline builder canvas and transitions between them.

### States

**1. Empty Canvas State**
- Description: Initial state with no components
- Entry: User loads builder page
- Exit: User adds first component

**2. Building State**
- Description: User is actively building pipeline
- Entry: Component added to canvas
- Exit: User saves or clears canvas
- Sub-states:
  - Adding Component
  - Connecting Components
  - Configuring Parameters
  - Validating Pipeline

**3. Valid Pipeline State**
- Description: Pipeline structure is valid
- Entry: Validation passes
- Exit: User modifies pipeline (may become invalid)
- Actions available: Save, Generate Code, Export, Create Version

**4. Invalid Pipeline State**
- Description: Pipeline has validation errors
- Entry: Validation fails
- Exit: User fixes errors
- Actions: Show error messages, highlight problematic components

**5. Saved State**
- Description: Pipeline has been saved to database
- Entry: Save operation successful
- Exit: User modifies pipeline (returns to Building)
- Actions: Load, Update, Delete, Create Version

**6. Version Created State**
- Description: A version snapshot has been created
- Entry: Version creation successful
- Exit: User continues building (returns to Building)
- Actions: View versions, Compare versions, Activate version

**7. Code Generated State**
- Description: Python code has been generated
- Entry: Code generation successful
- Exit: User closes code view or continues building
- Actions: Copy code, Download code, Export

**8. Exporting State**
- Description: Export process is in progress
- Entry: User initiates export
- Exit: Export completes (success or failure)
- Sub-states:
  - Generating Python Script
  - Generating Notebook
  - Generating Docker Files

**9. Error State**
- Description: An error has occurred
- Entry: Any operation fails
- Exit: User acknowledges error or retries
- Actions: Show error message, Allow retry

### Transitions

1. Empty Canvas → Building: Add first component
2. Building → Valid Pipeline: Validation passes
3. Building → Invalid Pipeline: Validation fails
4. Valid Pipeline → Building: Modify pipeline
5. Invalid Pipeline → Building: Fix errors
6. Valid Pipeline → Saved: Save operation
7. Saved → Building: Modify pipeline
8. Valid Pipeline → Code Generated: Generate code
9. Code Generated → Building: Close code view
10. Valid Pipeline → Exporting: Initiate export
11. Exporting → Building: Export completes
12. Valid Pipeline → Version Created: Create version
13. Version Created → Building: Continue building
14. Any State → Error: Operation fails
15. Error → Previous State: Retry or acknowledge

### Visual Specifications
- Use rounded rectangles for states
- Use arrows for transitions with labels
- Use different colors for different state types:
  - Normal states: Blue
  - Success states: Green
  - Error states: Red
  - Processing states: Yellow
- Show entry/exit actions in state boxes
- Use composite states (nested states) for complex states
- Include initial state (filled circle) and final states (filled circle with border)
- Show guard conditions on transitions in square brackets

---

## 10. Activity Diagram - Pipeline Creation Workflow

### Description
Create an activity diagram showing the complete workflow for creating and saving a new ML pipeline.

### Activities

**Start Node**: User opens builder page

**Activity 1: Authenticate User**
- Check if user is logged in
- If not: Redirect to login
- If yes: Continue

**Activity 2: Load Component Library**
- Fetch components from API
- Display in component panel
- User can browse components

**Activity 3: Add Component to Canvas**
- User selects component from library
- User drags component to canvas
- Component appears on canvas
- Record action in history (for undo/redo)

**Activity 4: Configure Component**
- User clicks component
- Properties panel displays
- User edits parameters
- Changes saved to component
- Record action in history

**Activity 5: Connect Components**
- User clicks source node output port
- User drags to target node input port
- Edge created between nodes
- Record action in history

**Activity 6: Validate Pipeline**
- System checks pipeline structure
- Validate: All nodes connected properly
- Validate: No circular dependencies
- Validate: Required parameters set
- If valid: Continue
- If invalid: Show errors, return to Activity 3

**Activity 7: Save Pipeline**
- User clicks Save button
- User enters name and description
- System serializes pipeline (nodes, edges)
- System sends POST request to /api/models
- Database creates SavedModel record
- Success message displayed

**Activity 8: Generate Code (Optional)**
- User clicks Generate Code button
- System processes pipeline
- Code generated and displayed
- User can copy or download

**Activity 9: Create Version (Optional)**
- User clicks Versions button
- User clicks Create Version
- User enters version metadata
- System creates version snapshot
- Version added to timeline

**End Node**: Pipeline saved successfully

### Decision Points
- [User authenticated?] → Yes: Continue, No: Redirect to login
- [Pipeline valid?] → Yes: Continue, No: Show errors
- [User wants to save?] → Yes: Save, No: Continue building
- [User wants to generate code?] → Yes: Generate, No: Skip
- [User wants to create version?] → Yes: Create version, No: Skip

### Parallel Activities
- Component library loading can happen in parallel with authentication
- Code generation can happen in parallel with version creation

### Visual Specifications
- Use rounded rectangles for activities
- Use diamonds for decision points
- Use arrows to show flow
- Use fork/join nodes for parallel activities
- Use swimlanes to separate user actions from system actions
- Use different colors for different activity types:
  - User activities: Blue
  - System activities: Green
  - Validation activities: Yellow
  - Database activities: Orange
- Show loops with loop frames
- Include start and end nodes clearly

---

## 11. Component Architecture Diagram

### Description
Create a component diagram showing the high-level architecture and component interactions.

### Components

**Frontend Layer:**
- **UI Components** (HTML/CSS)
  - Landing Page
  - Authentication Page
  - Builder Page
  - My Models Page
- **JavaScript Modules**
  - canvas.js (Canvas management)
  - components.js (Component library)
  - api.js (API client)
  - history.js (Undo/Redo)
  - versions.js (Version management)
  - properties.js (Property panel)
  - theme.js (Theme toggle)
  - export.js (Export functionality)

**Backend Layer:**
- **Flask Application**
  - Application Factory (__init__.py)
  - Configuration (config.py)
- **Route Handlers (Blueprints)**
  - main.py (Main routes)
  - auth.py (Authentication routes)
  - api.py (REST API routes)
- **Data Models**
  - models.py (Database models)
- **Utilities**
  - code_generator.py
  - data_loader.py
  - exporters/ (Python, Notebook, Docker)

**Data Layer:**
- **Database** (SQLite)
  - User table
  - SavedModel table
  - PipelineVersion table
  - ModelMetric table
  - VersionTag table
  - VersionComment table
- **Static Data Files**
  - ml_components.json
  - ml_templates.json

**External Services:**
- **Flask Extensions**
  - Flask-Login (Authentication)
  - Flask-SQLAlchemy (ORM)
  - Flask-WTF (Forms)

### Component Relationships
- Frontend → Backend: HTTP/REST API calls
- Backend → Database: SQLAlchemy ORM
- Backend → Static Files: File I/O
- JavaScript Modules → API: AJAX requests
- Route Handlers → Models: Database queries
- Utilities → Models: Data processing
- Utilities → Static Files: JSON reading

### Visual Specifications
- Use rectangles for components
- Group components by layer (Frontend, Backend, Data)
- Use different colors for different layers:
  - Frontend: Blue
  - Backend: Green
  - Data: Orange
  - External: Gray
- Show dependencies with arrows
- Use ports/interfaces to show component interfaces
- Include component names and brief descriptions
- Show data flow direction

---

## 12. Deployment Architecture Diagram

### Description
Create a deployment diagram showing how the DominoML system is deployed in production.

### Deployment Nodes

**Client Tier:**
- **Web Browser** (Multiple instances)
  - Chrome, Firefox, Safari, Edge
  - Runs HTML/CSS/JavaScript
  - Communicates via HTTP/HTTPS

**Application Tier:**
- **Web Server** (Nginx)
  - Reverse proxy
  - SSL termination
  - Static file serving
  - Load balancing (if multiple app servers)
- **WSGI Server** (Gunicorn/uWSGI)
  - Runs Flask application
  - Multiple worker processes
  - Process manager (systemd/supervisor)

**Application Server:**
- **Flask Application**
  - Application code
  - Configuration
  - Logging

**Data Tier:**
- **Database Server** (PostgreSQL)
  - Primary database
  - Connection pooling
  - Backup system

**Storage:**
- **File System**
  - Static files
  - Uploaded files (if any)
  - Log files

**External Services:**
- **CDN** (Optional)
  - Static asset delivery
- **Monitoring** (Optional)
  - Application monitoring
  - Error tracking

### Deployment Artifacts
- **Application Code**: Python files, templates, static assets
- **Configuration Files**: .env, nginx.conf, gunicorn.conf
- **Database**: PostgreSQL database
- **Dependencies**: requirements.txt, virtual environment

### Communication
- Browser ↔ Web Server: HTTP/HTTPS
- Web Server ↔ WSGI Server: HTTP (internal)
- WSGI Server ↔ Database: SQL (via SQLAlchemy)
- Web Server ↔ File System: File I/O
- Web Server ↔ CDN: HTTP (for static assets)

### Visual Specifications
- Use 3D boxes or rectangles for deployment nodes
- Use different colors for different tiers:
  - Client: Light Blue
  - Application: Green
  - Data: Orange
  - External: Gray
- Show communication with arrows (labeled with protocol)
- Group related nodes
- Include node names and descriptions
- Show deployment artifacts within nodes
- Indicate scalability with multiple instances

---

## Usage Instructions for AI Diagram Generators

### For Mermaid Diagrams
Use these descriptions with Mermaid syntax. Convert entity descriptions to Mermaid ERD, sequence diagrams, etc.

### For Draw.io/Lucidchart
Import these descriptions and create diagrams manually or use AI-assisted diagram generation features.

### For PlantUML
Convert these descriptions to PlantUML syntax for automatic diagram generation.

### For AI Tools (ChatGPT, Claude, etc.)
Provide these descriptions as prompts:
"Generate a [diagram type] based on the following description: [paste description]"

### Key Points for AI Generation
1. Be specific about entity names, attributes, and relationships
2. Include cardinality information (1, N, 1..N)
3. Specify colors, shapes, and visual styles
4. Include all actors, objects, and processes
5. Specify flow directions and decision points
6. Include error handling and alternative flows
7. Specify time progression for sequence diagrams
8. Include state transitions and conditions for state diagrams

---

---

## 23. UML Use Case Diagram - Complete System Specification (UML 2.5 Compliant)

### Description
Create a comprehensive UML use case diagram following UML 2.5 standards, showing all actors, use cases, relationships, system boundaries, and packages for the DominoML system.

### System Boundary
**System Name:** DominoML - Visual Machine Learning Pipeline Builder  
**System Boundary:** Rectangle enclosing all use cases, labeled "DominoML System"

### Actors (UML Notation)

**Primary Actors:**
1. **User** (Stick figure icon)
   - **Type:** Human Actor
   - **Stereotype:** <<primary>>
   - **Description:** Data Scientist or ML Engineer who uses the system to create and manage ML pipelines
   - **Characteristics:** 
     - Must be authenticated to perform most operations
     - Has account with username and email
     - Can create, modify, and delete pipelines
   - **Associations:** Connected to all user-initiated use cases

**Secondary Actors:**
2. **System** (Rectangle icon with <<system>>)
   - **Type:** System Actor
   - **Stereotype:** <<system>>
   - **Description:** Internal system processes that perform automated tasks
   - **Associations:** Connected to validation, code generation, and background processes

3. **Database** (Rectangle icon with <<database>>)
   - **Type:** External System Actor
   - **Stereotype:** <<database>>
   - **Description:** Data persistence layer (SQLite/PostgreSQL)
   - **Associations:** Connected to data storage use cases

### Use Cases (Organized by Packages/Subsystems)

#### Package 1: Authentication Subsystem
**Package Name:** <<subsystem>> Authentication

**UC-AUTH-001: Register Account**
- **ID:** UC-AUTH-001
- **Actor:** User
- **Description:** New user creates an account with username, email, and password
- **Precondition:** User is not logged in, email is not already registered
- **Postcondition:** User account created, user can login
- **Priority:** High
- **Frequency:** Low (one-time per user)
- **Includes:** 
  - <<include>> Validate Email Format
  - <<include>> Hash Password
  - <<include>> Check Email Uniqueness
- **Extends:** None
- **Extension Points:** None
- **Business Rules:** 
  - Username must be unique
  - Email must be valid format
  - Password must meet security requirements

**UC-AUTH-002: Login**
- **ID:** UC-AUTH-002
- **Actor:** User
- **Description:** Authenticated user logs into the system
- **Precondition:** User has registered account
- **Postcondition:** User session created, user authenticated
- **Priority:** High
- **Frequency:** High (every session)
- **Includes:**
  - <<include>> Validate Credentials
  - <<include>> Create Session
  - <<include>> Set Session Cookie
- **Extends:** None
- **Extension Points:** None

**UC-AUTH-003: Logout**
- **ID:** UC-AUTH-003
- **Actor:** User
- **Description:** User ends their session
- **Precondition:** User is logged in
- **Postcondition:** Session terminated, user logged out
- **Priority:** Medium
- **Frequency:** Medium
- **Includes:**
  - <<include>> Destroy Session
  - <<include>> Clear Session Cookie
- **Extends:** None

**Included Use Cases (Authentication):**
- **Validate Email Format** (<<include>>)
- **Hash Password** (<<include>>)
- **Check Email Uniqueness** (<<include>>)
- **Validate Credentials** (<<include>>)
- **Create Session** (<<include>>)
- **Set Session Cookie** (<<include>>)
- **Destroy Session** (<<include>>)
- **Clear Session Cookie** (<<include>>)

#### Package 2: Pipeline Management Subsystem
**Package Name:** <<subsystem>> Pipeline Management

**UC-PIPE-001: Create Pipeline**
- **ID:** UC-PIPE-001
- **Actor:** User
- **Description:** User starts a new pipeline on the canvas
- **Precondition:** User is logged in, builder page is open
- **Postcondition:** Empty canvas ready for components
- **Priority:** High
- **Frequency:** High
- **Includes:** None
- **Extends:** None
- **Extension Points:** 
  - EP-ADD-COMPONENT: Can be extended by Add Component use case
  - EP-LOAD-TEMPLATE: Can be extended by Load Template use case

**UC-PIPE-002: Add Component**
- **ID:** UC-PIPE-002
- **Actor:** User
- **Description:** User adds an ML component to the pipeline canvas
- **Precondition:** Canvas is open, component library is loaded
- **Postcondition:** Component added to canvas, available for connection
- **Priority:** High
- **Frequency:** Very High
- **Includes:**
  - <<include>> Load Component Definition
  - <<include>> Record in History
- **Extends:** 
  - <<extend>> Create Pipeline (at extension point EP-ADD-COMPONENT)
- **Extension Points:**
  - EP-CONFIGURE: Can be extended by Configure Component
  - EP-CONNECT: Can be extended by Connect Components

**UC-PIPE-003: Connect Components**
- **ID:** UC-PIPE-003
- **Actor:** User
- **Description:** User creates an edge/connection between two components
- **Precondition:** At least 2 components exist on canvas
- **Postcondition:** Components connected via edge
- **Priority:** High
- **Frequency:** Very High
- **Includes:**
  - <<include>> Validate Connection
  - <<include>> Record in History
- **Extends:**
  - <<extend>> Add Component (at extension point EP-CONNECT)
- **Extension Points:**
  - EP-VALIDATE: Can be extended by Validate Pipeline

**UC-PIPE-004: Configure Component**
- **ID:** UC-PIPE-004
- **Actor:** User
- **Description:** User sets parameters for a component
- **Precondition:** Component is selected on canvas
- **Postcondition:** Component parameters updated
- **Priority:** High
- **Frequency:** High
- **Includes:**
  - <<include>> Load Component Parameters
  - <<include>> Record in History
- **Extends:**
  - <<extend>> Add Component (at extension point EP-CONFIGURE)

**UC-PIPE-005: Validate Pipeline**
- **ID:** UC-PIPE-005
- **Actor:** System
- **Description:** System validates the pipeline structure for correctness
- **Precondition:** Pipeline has at least one component
- **Postcondition:** Validation result returned (valid/invalid with errors)
- **Priority:** High
- **Frequency:** High (automatic on changes)
- **Includes:**
  - <<include>> Check Circular Dependencies
  - <<include>> Validate Required Parameters
  - <<include>> Check Data Flow Validity
- **Extends:**
  - <<extend>> Connect Components (at extension point EP-VALIDATE)

**UC-PIPE-006: Save Pipeline**
- **ID:** UC-PIPE-006
- **Actor:** User
- **Description:** User saves the current pipeline to the database
- **Precondition:** User is logged in, pipeline is valid (optional but recommended)
- **Postcondition:** Pipeline saved to database with unique ID
- **Priority:** High
- **Frequency:** Medium
- **Includes:**
  - <<include>> Serialize Pipeline Data
  - <<include>> Store in Database
  - <<include>> Update Pipeline List
- **Extends:** None
- **Extension Points:**
  - EP-UPDATE: Can be extended by Update Pipeline

**UC-PIPE-007: Load Pipeline**
- **ID:** UC-PIPE-007
- **Actor:** User
- **Description:** User loads a previously saved pipeline to the canvas
- **Precondition:** User is logged in, pipeline exists and user owns it
- **Postcondition:** Pipeline loaded to canvas, ready for editing
- **Priority:** High
- **Frequency:** Medium
- **Includes:**
  - <<include>> Retrieve from Database
  - <<include>> Deserialize Pipeline Data
  - <<include>> Render on Canvas
- **Extends:** None

**UC-PIPE-008: Update Pipeline**
- **ID:** UC-PIPE-008
- **Actor:** User
- **Description:** User updates an existing saved pipeline
- **Precondition:** Pipeline exists, user owns it, pipeline is loaded
- **Postcondition:** Pipeline updated in database
- **Priority:** High
- **Frequency:** Medium
- **Includes:**
  - <<include>> Serialize Pipeline Data
  - <<include>> Update Database Record
- **Extends:**
  - <<extend>> Save Pipeline (at extension point EP-UPDATE)

**UC-PIPE-009: Delete Pipeline**
- **ID:** UC-PIPE-009
- **Actor:** User
- **Description:** User deletes a saved pipeline
- **Precondition:** Pipeline exists, user owns it
- **Postcondition:** Pipeline and all associated versions deleted from database
- **Priority:** Medium
- **Frequency:** Low
- **Includes:**
  - <<include>> Delete from Database
  - <<include>> Cascade Delete Versions
  - <<include>> Update Pipeline List
- **Extends:** None

**Included Use Cases (Pipeline Management):**
- **Load Component Definition** (<<include>>)
- **Record in History** (<<include>>)
- **Validate Connection** (<<include>>)
- **Load Component Parameters** (<<include>>)
- **Check Circular Dependencies** (<<include>>)
- **Validate Required Parameters** (<<include>>)
- **Check Data Flow Validity** (<<include>>)
- **Serialize Pipeline Data** (<<include>>)
- **Store in Database** (<<include>>)
- **Update Pipeline List** (<<include>>)
- **Retrieve from Database** (<<include>>)
- **Deserialize Pipeline Data** (<<include>>)
- **Render on Canvas** (<<include>>)
- **Update Database Record** (<<include>>)
- **Delete from Database** (<<include>>)
- **Cascade Delete Versions** (<<include>>)

#### Package 3: Code Generation Subsystem
**Package Name:** <<subsystem>> Code Generation

**UC-CODE-001: Generate Code**
- **ID:** UC-CODE-001
- **Actor:** User
- **Description:** System generates executable Python code from the visual pipeline
- **Precondition:** Pipeline has at least one component
- **Postcondition:** Python code generated and displayed
- **Priority:** High
- **Frequency:** Medium
- **Includes:**
  - <<include>> Topological Sort Nodes
  - <<include>> Load Component Templates
  - <<include>> Substitute Parameters
  - <<include>> Generate Imports
  - <<include>> Assemble Code
- **Extends:** None
- **Extension Points:**
  - EP-EXPORT: Can be extended by Export use cases

**Included Use Cases (Code Generation):**
- **Topological Sort Nodes** (<<include>>)
- **Load Component Templates** (<<include>>)
- **Substitute Parameters** (<<include>>)
- **Generate Imports** (<<include>>)
- **Assemble Code** (<<include>>)

#### Package 4: Version Management Subsystem
**Package Name:** <<subsystem>> Version Management

**UC-VERS-001: Create Version**
- **ID:** UC-VERS-001
- **Actor:** User
- **Description:** User creates a version snapshot of the current pipeline
- **Precondition:** Pipeline is saved
- **Postcondition:** Version created with unique version number
- **Priority:** Medium
- **Frequency:** Medium
- **Includes:**
  - <<include>> Snapshot Pipeline State
  - <<include>> Generate Code Snapshot
  - <<include>> Store Version in Database
  - <<include>> Update Version Timeline
- **Extends:** None
- **Extension Points:**
  - EP-VIEW-VERSIONS: Can be extended by View Versions

**UC-VERS-002: View Versions**
- **ID:** UC-VERS-002
- **Actor:** User
- **Description:** User views the version history of a pipeline
- **Precondition:** Pipeline has at least one version
- **Postcondition:** Version list displayed in timeline
- **Priority:** Medium
- **Frequency:** Medium
- **Includes:**
  - <<include>> Retrieve Versions from Database
  - <<include>> Display Version Timeline
- **Extends:**
  - <<extend>> Create Version (at extension point EP-VIEW-VERSIONS)
- **Extension Points:**
  - EP-LOAD-VERSION: Can be extended by Load Version
  - EP-COMPARE: Can be extended by Compare Versions
  - EP-ACTIVATE: Can be extended by Activate Version

**UC-VERS-003: Load Version**
- **ID:** UC-VERS-003
- **Actor:** User
- **Description:** User loads a specific version to the canvas
- **Precondition:** Version exists
- **Postcondition:** Version loaded to canvas, replacing current state
- **Priority:** Medium
- **Frequency:** Low
- **Includes:**
  - <<include>> Retrieve Version from Database
  - <<include>> Deserialize Version Data
  - <<include>> Render on Canvas
- **Extends:**
  - <<extend>> View Versions (at extension point EP-LOAD-VERSION)

**UC-VERS-004: Compare Versions**
- **ID:** UC-VERS-004
- **Actor:** User
- **Description:** User compares two versions side by side
- **Precondition:** At least 2 versions exist
- **Postcondition:** Comparison view displayed showing differences
- **Priority:** Low
- **Frequency:** Low
- **Includes:**
  - <<include>> Retrieve Two Versions
  - <<include>> Calculate Differences
  - <<include>> Display Comparison
- **Extends:**
  - <<extend>> View Versions (at extension point EP-COMPARE)

**UC-VERS-005: Activate Version**
- **ID:** UC-VERS-005
- **Actor:** User
- **Description:** User sets a version as active/production version
- **Precondition:** Version exists
- **Postcondition:** Version activated, all other versions deactivated
- **Priority:** Medium
- **Frequency:** Low
- **Includes:**
  - <<include>> Deactivate Other Versions
  - <<include>> Set Version as Active
  - <<include>> Update Database
- **Extends:**
  - <<extend>> View Versions (at extension point EP-ACTIVATE)

**UC-VERS-006: Add Metrics**
- **ID:** UC-VERS-006
- **Actor:** User
- **Description:** User adds performance metrics to a version
- **Precondition:** Version exists
- **Postcondition:** Metrics stored and associated with version
- **Priority:** Low
- **Frequency:** Low
- **Includes:**
  - <<include>> Validate Metric Data
  - <<include>> Store Metrics in Database
- **Extends:** None

**Included Use Cases (Version Management):**
- **Snapshot Pipeline State** (<<include>>)
- **Generate Code Snapshot** (<<include>>)
- **Store Version in Database** (<<include>>)
- **Update Version Timeline** (<<include>>)
- **Retrieve Versions from Database** (<<include>>)
- **Display Version Timeline** (<<include>>)
- **Retrieve Version from Database** (<<include>>)
- **Deserialize Version Data** (<<include>>)
- **Retrieve Two Versions** (<<include>>)
- **Calculate Differences** (<<include>>)
- **Display Comparison** (<<include>>)
- **Deactivate Other Versions** (<<include>>)
- **Set Version as Active** (<<include>>)
- **Update Database** (<<include>>)
- **Validate Metric Data** (<<include>>)
- **Store Metrics in Database** (<<include>>)

#### Package 5: Export Subsystem
**Package Name:** <<subsystem>> Export

**UC-EXPT-001: Export as Python**
- **ID:** UC-EXPT-001
- **Actor:** User
- **Description:** User exports pipeline as standalone Python script
- **Precondition:** Pipeline is valid
- **Postcondition:** Python file (.py) generated and downloaded
- **Priority:** Medium
- **Frequency:** Medium
- **Includes:**
  - <<include>> Generate Code
  - <<include>> Generate Requirements
  - <<include>> Create Download File
- **Extends:**
  - <<extend>> Generate Code (at extension point EP-EXPORT)
- **Generalization:** Specializes Export Pipeline

**UC-EXPT-002: Export as Notebook**
- **ID:** UC-EXPT-002
- **Actor:** User
- **Description:** User exports pipeline as Jupyter Notebook
- **Precondition:** Pipeline is valid
- **Postcondition:** Notebook file (.ipynb) generated and downloaded
- **Priority:** Medium
- **Frequency:** Low
- **Includes:**
  - <<include>> Generate Code
  - <<include>> Format Notebook Structure
  - <<include>> Create Download File
- **Extends:**
  - <<extend>> Generate Code (at extension point EP-EXPORT)
- **Generalization:** Specializes Export Pipeline

**UC-EXPT-003: Export as Docker**
- **ID:** UC-EXPT-003
- **Actor:** User
- **Description:** User exports pipeline as Docker container
- **Precondition:** Pipeline is valid
- **Postcondition:** Docker files (Dockerfile, docker-compose.yml, requirements.txt) generated and downloaded
- **Priority:** Low
- **Frequency:** Low
- **Includes:**
  - <<include>> Generate Code
  - <<include>> Generate Dockerfile
  - <<include>> Generate Docker Compose
  - <<include>> Generate Requirements
  - <<include>> Create Archive
- **Extends:**
  - <<extend>> Generate Code (at extension point EP-EXPORT)
- **Generalization:** Specializes Export Pipeline

**Abstract Use Case:**
- **Export Pipeline** (Abstract, shown in italics or with {abstract} stereotype)
  - **Generalization:** Parent of Export as Python, Export as Notebook, Export as Docker

**Included Use Cases (Export):**
- **Generate Requirements** (<<include>>)
- **Create Download File** (<<include>>)
- **Format Notebook Structure** (<<include>>)
- **Generate Dockerfile** (<<include>>)
- **Generate Docker Compose** (<<include>>)
- **Create Archive** (<<include>>)

#### Package 6: History Management Subsystem
**Package Name:** <<subsystem>> History Management

**UC-HIST-001: Undo Action**
- **ID:** UC-HIST-001
- **Actor:** User
- **Description:** User undoes the last action performed on the canvas
- **Precondition:** History stack is not empty
- **Postcondition:** Previous state restored, action undone
- **Priority:** Medium
- **Frequency:** High
- **Includes:**
  - <<include>> Pop from Undo Stack
  - <<include>> Restore Previous State
  - <<include>> Push to Redo Stack
- **Extends:** None

**UC-HIST-002: Redo Action**
- **ID:** UC-HIST-002
- **Actor:** User
- **Description:** User redoes the last undone action
- **Precondition:** Redo stack is not empty
- **Postcondition:** Next state restored, action redone
- **Priority:** Medium
- **Frequency:** Medium
- **Includes:**
  - <<include>> Pop from Redo Stack
  - <<include>> Restore Next State
  - <<include>> Push to Undo Stack
- **Extends:** None

**Included Use Cases (History):**
- **Pop from Undo Stack** (<<include>>)
- **Restore Previous State** (<<include>>)
- **Push to Redo Stack** (<<include>>)
- **Pop from Redo Stack** (<<include>>)
- **Restore Next State** (<<include>>)
- **Push to Undo Stack** (<<include>>)

#### Package 7: Template Management Subsystem
**Package Name:** <<subsystem>> Template Management

**UC-TMPL-001: Browse Templates**
- **ID:** UC-TMPL-001
- **Actor:** User
- **Description:** User views available pipeline templates
- **Precondition:** User is logged in
- **Postcondition:** Template gallery displayed
- **Priority:** Low
- **Frequency:** Low
- **Includes:**
  - <<include>> Load Templates from Library
  - <<include>> Display Template Gallery
- **Extends:** None
- **Extension Points:**
  - EP-LOAD-TEMPLATE: Can be extended by Load Template

**UC-TMPL-002: Load Template**
- **ID:** UC-TMPL-002
- **Actor:** User
- **Description:** User loads a template to the canvas
- **Precondition:** Template exists
- **Postcondition:** Template loaded to canvas, ready for customization
- **Priority:** Low
- **Frequency:** Low
- **Includes:**
  - <<include>> Retrieve Template Data
  - <<include>> Deserialize Template
  - <<include>> Render on Canvas
- **Extends:**
  - <<extend>> Browse Templates (at extension point EP-LOAD-TEMPLATE)
  - <<extend>> Create Pipeline (at extension point EP-LOAD-TEMPLATE)

**Included Use Cases (Template):**
- **Load Templates from Library** (<<include>>)
- **Display Template Gallery** (<<include>>)
- **Retrieve Template Data** (<<include>>)
- **Deserialize Template** (<<include>>)
- **Render on Canvas** (<<include>>)

### Relationships Summary

**Association Relationships:**
- User ── (solid line) ── All user-initiated use cases
- System ── (solid line) ── Validate Pipeline, automated processes
- Database ── (solid line) ── All data storage use cases

**Include Relationships (<<include>>):**
- Dashed arrow with <<include>> stereotype pointing from base use case to included use case
- Direction: Base use case → Included use case
- All include relationships listed above

**Extend Relationships (<<extend>>):**
- Dashed arrow with <<extend>> stereotype pointing from extending use case to base use case
- Direction: Extending use case → Base use case
- Labeled with extension point name
- All extend relationships listed above

**Generalization Relationships:**
- Solid line with hollow triangle arrowhead
- Direction: Child use case → Parent use case
- Export as Python, Export as Notebook, Export as Docker → Export Pipeline (abstract)

### Visual Specifications (UML 2.5 Standards)

**Actors:**
- Use stick figure icon for human actors (User)
- Use rectangle icon with <<stereotype>> for system actors (System, Database)
- Place actors outside system boundary
- Label actors clearly
- Use different colors:
  - Primary actors: Blue
  - Secondary actors: Gray

**Use Cases:**
- Use ovals (ellipses) for use cases
- Place use cases inside system boundary
- Label use cases with name and optional ID
- Use different colors for different packages:
  - Authentication: Light Blue
  - Pipeline Management: Light Green
  - Code Generation: Light Yellow
  - Version Management: Light Orange
  - Export: Light Purple
  - History: Light Pink
  - Templates: Light Cyan
- Show abstract use cases in italics or with {abstract} stereotype
- Group use cases by packages/subsystems with dashed rectangles

**System Boundary:**
- Draw rectangle around all use cases
- Label with system name: "DominoML System"
- Place actors outside boundary
- Use solid line for boundary

**Relationships:**
- **Association:** Solid line between actor and use case
- **Include:** Dashed arrow with <<include>>, pointing to included use case
- **Extend:** Dashed arrow with <<extend>>, pointing to base use case, labeled with extension point
- **Generalization:** Solid line with hollow triangle arrowhead, pointing to parent use case

**Packages/Subsystems:**
- Use dashed rectangles to group related use cases
- Label with package name and <<subsystem>> stereotype
- Show package hierarchy if applicable
- Use different background colors for different packages

**Layout:**
- Place primary actor (User) on the left
- Place secondary actors on the right or bottom
- Group related use cases together
- Use clear spacing to avoid clutter
- Show relationships clearly without crossing when possible
- Include legend for relationship types and colors

**Additional UML Elements:**
- Show extension points clearly on base use cases
- Include use case IDs for traceability
- Show priority indicators if needed (High, Medium, Low)
- Include notes for complex relationships if necessary

### Use Case Details Table

| UC ID | Name | Actor | Priority | Frequency | Includes | Extends |
|-------|------|-------|----------|-----------|----------|---------|
| UC-AUTH-001 | Register Account | User | High | Low | 3 | - |
| UC-AUTH-002 | Login | User | High | High | 3 | - |
| UC-AUTH-003 | Logout | User | Medium | Medium | 2 | - |
| UC-PIPE-001 | Create Pipeline | User | High | High | - | - |
| UC-PIPE-002 | Add Component | User | High | Very High | 2 | 1 |
| UC-PIPE-003 | Connect Components | User | High | Very High | 2 | 1 |
| UC-PIPE-004 | Configure Component | User | High | High | 2 | 1 |
| UC-PIPE-005 | Validate Pipeline | System | High | High | 3 | 1 |
| UC-PIPE-006 | Save Pipeline | User | High | Medium | 3 | - |
| UC-PIPE-007 | Load Pipeline | User | High | Medium | 3 | - |
| UC-PIPE-008 | Update Pipeline | User | High | Medium | 2 | 1 |
| UC-PIPE-009 | Delete Pipeline | User | Medium | Low | 3 | - |
| UC-CODE-001 | Generate Code | User | High | Medium | 5 | - |
| UC-VERS-001 | Create Version | User | Medium | Medium | 4 | - |
| UC-VERS-002 | View Versions | User | Medium | Medium | 2 | 1 |
| UC-VERS-003 | Load Version | User | Medium | Low | 3 | 1 |
| UC-VERS-004 | Compare Versions | User | Low | Low | 3 | 1 |
| UC-VERS-005 | Activate Version | User | Medium | Low | 3 | 1 |
| UC-VERS-006 | Add Metrics | User | Low | Low | 2 | - |
| UC-EXPT-001 | Export as Python | User | Medium | Medium | 3 | 1 |
| UC-EXPT-002 | Export as Notebook | User | Medium | Low | 3 | 1 |
| UC-EXPT-003 | Export as Docker | User | Low | Low | 5 | 1 |
| UC-HIST-001 | Undo Action | User | Medium | High | 3 | - |
| UC-HIST-002 | Redo Action | User | Medium | Medium | 3 | - |
| UC-TMPL-001 | Browse Templates | User | Low | Low | 2 | - |
| UC-TMPL-002 | Load Template | User | Low | Low | 3 | 2 |

### Notes for Diagram Generation

1. **Follow UML 2.5 Standards:** Use proper notation for all elements
2. **Show Hierarchy:** Use packages to organize use cases logically
3. **Clarity:** Ensure relationships are clear and not cluttered
4. **Completeness:** Include all use cases and relationships
5. **Traceability:** Use consistent ID numbering (UC-XXX-XXX format)
6. **Documentation:** Each use case should have clear description, preconditions, and postconditions
7. **Extension Points:** Clearly label extension points on base use cases
8. **Abstract Use Cases:** Show abstract use cases appropriately (italics or {abstract})
9. **System Boundary:** Clearly define what is inside and outside the system
10. **Actor Placement:** Place actors logically (primary on left, secondary on right/bottom)

---

**Document Version:** 1.2  
**Last Updated:** 2025-01-27  
**UML Standard:** UML 2.5  
**Compliance:** Full compliance with UML 2.5 use case diagram specifications

**Document Version:** 1.0  
**Last Updated:** 2025-01-27