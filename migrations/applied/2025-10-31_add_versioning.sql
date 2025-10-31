-- Migration: Add pipeline versioning tables
-- Created: 2025-10-31
-- Description: Adds version tracking, model registry, and experiment metrics

-- Pipeline Versions Table
CREATE TABLE IF NOT EXISTS pipeline_versions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pipeline_id INTEGER NOT NULL,
    version_number INTEGER NOT NULL,
    version_tag VARCHAR(50),                -- e.g., 'v1.0', 'stable', 'prod'
    name VARCHAR(200),
    description TEXT,
    nodes TEXT NOT NULL,                    -- JSON array of nodes
    edges TEXT NOT NULL,                    -- JSON array of edges
    generated_code TEXT,                    -- Python code snapshot
    meta_data TEXT,                         -- JSON: hyperparams, config, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    is_active BOOLEAN DEFAULT 0,            -- Current active version
    parent_version_id INTEGER,              -- For version lineage
    FOREIGN KEY (parent_version_id) REFERENCES pipeline_versions(id),
    UNIQUE(pipeline_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_pipeline_versions_pipeline ON pipeline_versions(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_versions_active ON pipeline_versions(is_active);
CREATE INDEX IF NOT EXISTS idx_pipeline_versions_created ON pipeline_versions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pipeline_versions_tag ON pipeline_versions(version_tag);

-- Model Metrics Table (for experiment tracking)
CREATE TABLE IF NOT EXISTS model_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    version_id INTEGER NOT NULL,
    metric_name VARCHAR(100) NOT NULL,     -- e.g., 'accuracy', 'loss', 'f1_score'
    metric_value FLOAT,
    metric_type VARCHAR(50),                -- 'training', 'validation', 'test'
    epoch INTEGER,                          -- For training metrics
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    meta_data TEXT,                         -- Additional context
    FOREIGN KEY (version_id) REFERENCES pipeline_versions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_model_metrics_version ON model_metrics(version_id);
CREATE INDEX IF NOT EXISTS idx_model_metrics_name ON model_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_model_metrics_type ON model_metrics(metric_type);

-- Version Tags Table (for release management)
CREATE TABLE IF NOT EXISTS version_tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    version_id INTEGER NOT NULL,
    tag_name VARCHAR(50) NOT NULL,         -- 'production', 'staging', 'experimental'
    tag_color VARCHAR(20),                  -- Hex color for UI
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (version_id) REFERENCES pipeline_versions(id) ON DELETE CASCADE,
    UNIQUE(version_id, tag_name)
);

CREATE INDEX IF NOT EXISTS idx_version_tags_version ON version_tags(version_id);
CREATE INDEX IF NOT EXISTS idx_version_tags_name ON version_tags(tag_name);

-- Version Comments Table (for collaboration)
CREATE TABLE IF NOT EXISTS version_comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    version_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (version_id) REFERENCES pipeline_versions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_version_comments_version ON version_comments(version_id);
CREATE INDEX IF NOT EXISTS idx_version_comments_created ON version_comments(created_at DESC);
