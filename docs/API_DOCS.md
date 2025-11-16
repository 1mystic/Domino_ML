# DominoML API Documentation

**Version:** 2.0 (Phase 1-2 Complete)  
**Base URL:** `/api`  
**Authentication:** Session-based (Flask-Login)

## Authentication

All API endpoints require authentication. Requests must include session cookies.

**Frontend Configuration:**
```javascript
fetch('/api/endpoint', {
    credentials: 'include',  // Required for session cookies
    headers: {
        'Content-Type': 'application/json'
    }
})
```

---

## Models

### Get All Models
```
GET /api/models
```

**Response:**
```json
[
    {
        "id": 1,
        "name": "Customer Churn Predictor",
        "description": "Predicts customer churn using Random Forest",
        "created_at": "2025-10-31T10:30:00",
        "updated_at": "2025-10-31T14:20:00",
        "is_public": false,
        "tags": "classification,churn,production"
    }
]
```

### Get Single Model
```
GET /api/models/<id>
```

**Response:**
```json
{
    "id": 1,
    "name": "Customer Churn Predictor",
    "description": "...",
    "nodes": [...],
    "edges": [...],
    "created_at": "2025-10-31T10:30:00",
    "updated_at": "2025-10-31T14:20:00"
}
```

### Create Model
```
POST /api/models
```

**Request Body:**
```json
{
    "name": "My Pipeline",
    "description": "Pipeline description",
    "nodes": [...],
    "edges": [...],
    "tags": "classification,production"
}
```

### Update Model
```
PUT /api/models/<id>
```

**Request Body:**
```json
{
    "name": "Updated name",
    "description": "Updated description",
    "nodes": [...],
    "edges": [...]
}
```

### Delete Model
```
DELETE /api/models/<id>
```

---

## Pipeline Versions ⭐ NEW

### List Versions
```
GET /api/models/<model_id>/versions
```

**Response:**
```json
[
    {
        "id": 1,
        "pipeline_id": 5,
        "version_number": 2,
        "version_tag": "v1.1",
        "name": "Improved accuracy",
        "description": "Added feature engineering step",
        "nodes": [...],
        "edges": [...],
        "metadata": {},
        "created_at": "2025-10-31T14:30:00",
        "created_by": 1,
        "is_active": true,
        "parent_version_id": null
    }
]
```

### Create Version
```
POST /api/models/<model_id>/versions
```

**Request Body:**
```json
{
    "name": "Version 1.1",
    "description": "Added PCA for dimensionality reduction",
    "version_tag": "v1.1",
    "nodes": [...],
    "edges": [...],
    "metadata": {
        "hyperparams": {...},
        "dataset": "customers_2025.csv"
    },
    "is_active": false,
    "parent_version_id": 1,
    "generate_code": true
}
```

**Response:**
```json
{
    "message": "Version created successfully",
    "version": {
        "id": 2,
        "version_number": 2,
        ...
    }
}
```

### Get Version
```
GET /api/versions/<version_id>
```

**Response:**
```json
{
    "id": 2,
    "pipeline_id": 5,
    "version_number": 2,
    "nodes": [...],
    "edges": [...],
    ...
}
```

### Activate Version
```
POST /api/versions/<version_id>/activate
```

Sets a version as the active/production version. Deactivates all other versions for the same pipeline.

**Response:**
```json
{
    "message": "Version activated",
    "version": {...}
}
```

### Delete Version
```
DELETE /api/versions/<version_id>
```

**Note:** Cannot delete active versions.

**Response:**
```json
{
    "message": "Version deleted successfully"
}
```

### Compare Versions
```
POST /api/versions/compare
```

**Request Body:**
```json
{
    "version1_id": 1,
    "version2_id": 2
}
```

**Response:**
```json
{
    "version1": {...},
    "version2": {...},
    "changes": {
        "nodes_added": 2,
        "edges_added": 3,
        "total_nodes_v1": 5,
        "total_nodes_v2": 7,
        "total_edges_v1": 4,
        "total_edges_v2": 7
    }
}
```

---

## Model Metrics ⭐ NEW

### Add Metrics
```
POST /api/versions/<version_id>/metrics
```

**Request Body:**
```json
{
    "metrics": [
        {
            "name": "accuracy",
            "value": 0.87,
            "type": "validation",
            "epoch": 10,
            "metadata": {"fold": 3}
        },
        {
            "name": "f1_score",
            "value": 0.85,
            "type": "validation"
        }
    ]
}
```

**Response:**
```json
{
    "message": "2 metrics added",
    "metrics": [...]
}
```

### Get Metrics
```
GET /api/versions/<version_id>/metrics
```

**Response:**
```json
[
    {
        "id": 1,
        "version_id": 2,
        "metric_name": "accuracy",
        "metric_value": 0.87,
        "metric_type": "validation",
        "epoch": 10,
        "created_at": "2025-10-31T15:00:00",
        "metadata": {"fold": 3}
    }
]
```

---

## Templates

### Get All Templates
```
GET /api/templates
```

**Response:**
```json
[
    {
        "id": "classification-basic",
        "name": "Basic Classification",
        "description": "...",
        "category": "classification",
        "nodes": [...],
        "edges": [...]
    }
]
```

---

## Components

### Get All Components
```
GET /api/components
```

**Response:**
```json
[
    {
        "id": "csv-loader",
        "name": "CSV Loader",
        "category": "data",
        "description": "...",
        "parameters": {...}
    }
]
```

---

## Code Generation

### Generate Code
```
POST /api/generate-code
```

**Request Body:**
```json
{
    "nodes": [...],
    "edges": [...],
    "pipeline_name": "My Pipeline"
}
```

**Response:**
```json
{
    "code": "# Generated Python code..."
}
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
    "error": "Error message description"
}
```

**Common Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (not owner)
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

No rate limiting currently implemented.

---

## Changelog

### v2.0 (Oct 31, 2025)
- ✅ Added pipeline versioning endpoints
- ✅ Added metrics tracking endpoints
- ✅ Added version comparison
- ✅ Added session cookie authentication
- ✅ Added GET `/api/models/<id>` endpoint

### v1.0 (Initial)
- Basic CRUD for models
- Template and component endpoints
- Code generation
