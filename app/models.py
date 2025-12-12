from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
from app import db, login_manager
import json

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    display_name = db.Column(db.String(120))
    role = db.Column(db.String(20), default='student')  # 'student' or 'instructor'
    password_hash = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    models = db.relationship('SavedModel', backref='user', lazy='dynamic', cascade='all, delete-orphan')

    # LMS Relationships
    enrollments = db.relationship('Enrollment', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    submissions = db.relationship('Submission', backref='student', lazy='dynamic', cascade='all, delete-orphan')
    owned_classrooms = db.relationship('Classroom', backref='owner', lazy='dynamic')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f'<User {self.username}>'

# --- LMS MODELS ---

class Classroom(db.Model):
    __tablename__ = 'classrooms'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    section = db.Column(db.String(100))
    description = db.Column(db.Text)
    join_code = db.Column(db.String(20), unique=True, index=True)
    owner_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    enrollments = db.relationship('Enrollment', backref='classroom', lazy='dynamic', cascade='all, delete-orphan')
    classwork = db.relationship('Classwork', backref='classroom', lazy='dynamic', cascade='all, delete-orphan')

    def generate_join_code(self):
        import random, string
        chars = string.ascii_uppercase + string.digits
        self.join_code = ''.join(random.choice(chars) for _ in range(6))

class Enrollment(db.Model):
    __tablename__ = 'enrollments'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    classroom_id = db.Column(db.Integer, db.ForeignKey('classrooms.id'), nullable=False)
    role = db.Column(db.String(20), default='student') # 'student', 'teacher'
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)

class Classwork(db.Model):
    __tablename__ = 'classwork'
    id = db.Column(db.Integer, primary_key=True)
    classroom_id = db.Column(db.Integer, db.ForeignKey('classrooms.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    type = db.Column(db.String(50), default='material') # 'material', 'lab', 'assignment'
    topic = db.Column(db.String(100)) # Simple grouping
    
    # Content storage
    content_text = db.Column(db.Text) # For markdown
    lab_model_id = db.Column(db.Integer, db.ForeignKey('saved_model.id')) # For labs (link to template)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    due_date = db.Column(db.DateTime)
    
    submissions = db.relationship('Submission', backref='work', lazy='dynamic', cascade='all, delete-orphan')

class Submission(db.Model):
    __tablename__ = 'submissions'
    id = db.Column(db.Integer, primary_key=True)
    classwork_id = db.Column(db.Integer, db.ForeignKey('classwork.id'), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    status = db.Column(db.String(20), default='assigned') # assigned, turned_in, graded
    
    # For Lab submissions, we might link to a NEW SavedModel (the student's copy)
    submission_model_id = db.Column(db.Integer, db.ForeignKey('saved_model.id')) 
    
    grade = db.Column(db.Integer) # 0-100 or similar
    feedback = db.Column(db.Text)
    
    submitted_at = db.Column(db.DateTime)
    graded_at = db.Column(db.DateTime)

# --- EXISTING MODELS ---

class SavedModel(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    nodes = db.Column(db.Text, nullable=False)  # JSON string
    edges = db.Column(db.Text, nullable=False)  # JSON string
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_public = db.Column(db.Boolean, default=False)
    tags = db.Column(db.String(500))
    
    # Version tracking
    versions = db.relationship('PipelineVersion', backref='pipeline', lazy='dynamic', cascade='all, delete-orphan')
    
    # LMS Relationships
    lab_templates = db.relationship('Classwork', backref='lab_template', lazy='dynamic', foreign_keys='Classwork.lab_model_id')
    student_submissions = db.relationship('Submission', backref='submitted_model', lazy='dynamic', foreign_keys='Submission.submission_model_id')

    def __repr__(self):
        return f'<SavedModel {self.name}>'


class PipelineVersion(db.Model):
    """Version tracking for ML pipelines"""
    __tablename__ = 'pipeline_versions'
    
    id = db.Column(db.Integer, primary_key=True)
    pipeline_id = db.Column(db.Integer, db.ForeignKey('saved_model.id'), nullable=False)
    version_number = db.Column(db.Integer, nullable=False)
    version_tag = db.Column(db.String(50))
    name = db.Column(db.String(200))
    description = db.Column(db.Text)
    nodes = db.Column(db.Text, nullable=False)
    edges = db.Column(db.Text, nullable=False)
    generated_code = db.Column(db.Text)
    meta_data = db.Column(db.Text)  # JSON - renamed from metadata to avoid SQLAlchemy conflict
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    created_by = db.Column(db.Integer)
    is_active = db.Column(db.Boolean, default=False)
    parent_version_id = db.Column(db.Integer, db.ForeignKey('pipeline_versions.id'))
    
    # Relationships
    parent = db.relationship('PipelineVersion', remote_side=[id], backref='children')
    metrics = db.relationship('ModelMetric', backref='version', lazy='dynamic', cascade='all, delete-orphan')
    tags_rel = db.relationship('VersionTag', backref='version', lazy='dynamic', cascade='all, delete-orphan')
    comments = db.relationship('VersionComment', backref='version', lazy='dynamic', cascade='all, delete-orphan')
    
    def to_dict(self):
        """Convert to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'pipeline_id': self.pipeline_id,
            'version_number': self.version_number,
            'version_tag': self.version_tag,
            'name': self.name,
            'description': self.description,
            'nodes': json.loads(self.nodes) if self.nodes else [],
            'edges': json.loads(self.edges) if self.edges else [],
            'metadata': json.loads(self.meta_data) if self.meta_data else {},
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'is_active': self.is_active,
            'created_by': self.created_by,
            'parent_version_id': self.parent_version_id
        }
    
    def __repr__(self):
        return f'<PipelineVersion {self.pipeline_id}:v{self.version_number}>'


class ModelMetric(db.Model):
    """Metrics for model experiments"""
    __tablename__ = 'model_metrics'
    
    id = db.Column(db.Integer, primary_key=True)
    version_id = db.Column(db.Integer, db.ForeignKey('pipeline_versions.id'), nullable=False)
    metric_name = db.Column(db.String(100), nullable=False)
    metric_value = db.Column(db.Float)
    metric_type = db.Column(db.String(50))  # training, validation, test
    epoch = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    meta_data = db.Column(db.Text)  # Renamed from metadata
    
    def to_dict(self):
        return {
            'id': self.id,
            'version_id': self.version_id,
            'metric_name': self.metric_name,
            'metric_value': self.metric_value,
            'metric_type': self.metric_type,
            'epoch': self.epoch,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'metadata': json.loads(self.meta_data) if self.meta_data else {}
        }
    
    def __repr__(self):
        return f'<ModelMetric {self.metric_name}={self.metric_value}>'


class VersionTag(db.Model):
    """Tags for version releases (production, staging, etc.)"""
    __tablename__ = 'version_tags'
    
    id = db.Column(db.Integer, primary_key=True)
    version_id = db.Column(db.Integer, db.ForeignKey('pipeline_versions.id'), nullable=False)
    tag_name = db.Column(db.String(50), nullable=False)
    tag_color = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'version_id': self.version_id,
            'tag_name': self.tag_name,
            'tag_color': self.tag_color,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    def __repr__(self):
        return f'<VersionTag {self.tag_name}>'


class VersionComment(db.Model):
    """Comments on versions for collaboration"""
    __tablename__ = 'version_comments'
    
    id = db.Column(db.Integer, primary_key=True)
    version_id = db.Column(db.Integer, db.ForeignKey('pipeline_versions.id'), nullable=False)
    user_id = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'version_id': self.version_id,
            'user_id': self.user_id,
            'comment': self.comment,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    def __repr__(self):
        return f'<VersionComment {self.id}>'
