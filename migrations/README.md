# Database Migrations

This directory contains SQL migration scripts for the GlideML database.

## Directory Structure

- `applied/` - Migrations that have been successfully applied to the database
- `*.sql` - Pending migrations ready to be applied

## Applied Migrations

### 2025-10-31: add_versioning.sql
**Status:** ✅ Applied  
**Description:** Added pipeline versioning system with 4 new tables:
- `pipeline_versions` - Version tracking for ML pipelines
- `model_metrics` - Experiment metrics storage
- `version_tags` - Release management tags
- `version_comments` - Collaboration comments

**Changes:**
- Created versioning tables with proper foreign keys
- Renamed `metadata` columns to `meta_data` to avoid SQLAlchemy conflicts
- Added indexes for performance optimization

## How to Apply Migrations

### Using Python Script
```python
python apply_migration.py migrations/your_migration.sql
```

### Manual Application
```bash
sqlite3 glideml.db < migrations/your_migration.sql
```

## Migration Best Practices

1. **Always backup the database before applying migrations**
2. **Test migrations on development database first**
3. **Use transactions for atomic changes**
4. **Document all schema changes**
5. **Move applied migrations to `applied/` folder**
6. **Add migration entry to this README**

## Rollback

If a migration causes issues, restore from backup:
```bash
cp glideml.db.backup glideml.db
```
