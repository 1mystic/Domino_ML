from flask import Blueprint, render_template, request, flash, redirect, url_for, jsonify
from flask_login import login_required, current_user
from app import db
from app.models import Classroom, Enrollment, Classwork, Submission, SavedModel
from datetime import datetime

try:
    import markdown
except ImportError:
    markdown = None

bp = Blueprint('lms', __name__, url_prefix='/lms')

@bp.app_template_filter('markdown')
def markdown_filter(text):
    if not text:
        return ""
    if markdown:
        return markdown.markdown(text)
    # Fallback to simple line breaks if markdown lib not installed
    return text.replace('\n', '<br>')

@bp.route('/dashboard')
@login_required
def dashboard():
    """Redirect to main unified dashboard"""
    return redirect(url_for('main.dashboard'))

@bp.route('/classroom/create', methods=['POST'])
@login_required
def create_classroom():
    name = request.form.get('name')
    section = request.form.get('section')
    description = request.form.get('description')
    
    if not name:
        flash('Class name is required', 'error')
        return redirect(url_for('lms.dashboard'))
        
    classroom = Classroom(
        name=name,
        section=section,
        description=description,
        owner_id=current_user.id
    )
    classroom.generate_join_code()
    
    db.session.add(classroom)
    db.session.commit()
    
    flash(f'Classroom "{name}" created!', 'success')
    return redirect(url_for('lms.classroom_view', class_id=classroom.id))

@bp.route('/classroom/join', methods=['POST'])
@login_required
def join_classroom():
    code = request.form.get('code', '').strip().upper()
    
    classroom = Classroom.query.filter_by(join_code=code).first()
    if not classroom:
        flash('Invalid join code', 'error')
        return redirect(url_for('lms.dashboard'))
        
    if classroom.owner_id == current_user.id:
        flash('You are the teacher of this class', 'info')
        return redirect(url_for('lms.classroom_view', class_id=classroom.id))
        
    existing = Enrollment.query.filter_by(user_id=current_user.id, classroom_id=classroom.id).first()
    if existing:
        flash('You are already enrolled', 'info')
        return redirect(url_for('lms.classroom_view', class_id=classroom.id))
        
    enrollment = Enrollment(
        user_id=current_user.id,
        classroom_id=classroom.id,
        role='student'
    )
    db.session.add(enrollment)
    db.session.commit()
    
    flash(f'Joined {classroom.name}!', 'success')
    return redirect(url_for('lms.classroom_view', class_id=classroom.id))

@bp.route('/classroom/<int:class_id>')
@login_required
def classroom_view(class_id):
    classroom = Classroom.query.get_or_404(class_id)
    
    # Check access
    is_teacher = classroom.owner_id == current_user.id
    if not is_teacher:
        enrollment = Enrollment.query.filter_by(user_id=current_user.id, classroom_id=class_id).first()
        if not enrollment:
            flash('Access denied', 'error')
            return redirect(url_for('lms.dashboard'))
            
    # organizing classwork by topic
    classworks = classroom.classwork.order_by(Classwork.created_at.desc()).all()
    
    return render_template('lms/classroom.html', 
                         classroom=classroom, 
                         is_teacher=is_teacher,
                         classworks=classworks)

@bp.route('/classroom/<int:class_id>/classwork/add', methods=['POST'])
@login_required
def add_classwork(class_id):
    classroom = Classroom.query.get_or_404(class_id)
    
    if classroom.owner_id != current_user.id:
        flash('Only teachers can add classwork', 'error')
        return redirect(url_for('lms.classroom_view', class_id=class_id))
        
    title = request.form.get('title')
    description = request.form.get('description')
    cw_type = request.form.get('type') # material, lab, assignment
    content = request.form.get('content')
    lab_id = request.form.get('lab_model_id')
    
    classwork = Classwork(
        classroom_id=classroom.id,
        title=title,
        description=description,
        type=cw_type,
        content_text=content,
        lab_model_id=lab_id if lab_id else None
    )
    
    db.session.add(classwork)
    db.session.commit()
    
    flash('Classwork added', 'success')
    return redirect(url_for('lms.classroom_view', class_id=class_id))

@bp.route('/classwork/<int:cw_id>')
@login_required
def view_classwork(cw_id):
    work = Classwork.query.get_or_404(cw_id)
    classroom = work.classroom
    
    # Check access
    is_teacher = classroom.owner_id == current_user.id
    if not is_teacher:
        enrollment = Enrollment.query.filter_by(user_id=current_user.id, classroom_id=classroom.id).first()
        if not enrollment:
            return redirect(url_for('lms.dashboard'))
            
    submission = None
    if not is_teacher:
        submission = Submission.query.filter_by(classwork_id=cw_id, student_id=current_user.id).first()
        
    return render_template('lms/assignment.html', 
                         work=work, 
                         is_teacher=is_teacher,
                         submission=submission)

@bp.route('/classwork/<int:cw_id>/edit', methods=['POST'])
@login_required
def edit_classwork(cw_id):
    work = Classwork.query.get_or_404(cw_id)
    if work.classroom.owner_id != current_user.id:
        flash('Unauthorized', 'error')
        return redirect(url_for('lms.view_classwork', cw_id=cw_id))
    
    work.title = request.form.get('title')
    work.content_text = request.form.get('content')
    # work.description update is optional or can be synced if needed, but content_text is primary for markdown
    
    db.session.commit()
    flash('Content updated', 'success')
    return redirect(url_for('lms.view_classwork', cw_id=cw_id))

@bp.route('/classwork/<int:cw_id>/delete', methods=['POST'])
@login_required
def delete_classwork(cw_id):
    work = Classwork.query.get_or_404(cw_id)
    classroom_id = work.classroom.id
    if work.classroom.owner_id != current_user.id:
        flash('Unauthorized', 'error')
        return redirect(url_for('lms.view_classwork', cw_id=cw_id))
    
    db.session.delete(work)
    db.session.commit()
    flash('Classwork deleted', 'success')
    return redirect(url_for('lms.classroom_view', class_id=classroom_id))

@bp.route('/classwork/<int:cw_id>/submit', methods=['POST'])
@login_required
def submit_assignment(cw_id):
    work = Classwork.query.get_or_404(cw_id)
    
    # Check if already submitted
    submission = Submission.query.filter_by(classwork_id=cw_id, student_id=current_user.id).first()
    if not submission:
        submission = Submission(
            classwork_id=cw_id,
            student_id=current_user.id,
            status='turned_in',
            submitted_at=datetime.utcnow()
        )
        db.session.add(submission)
    else:
        submission.submitted_at = datetime.utcnow()
        submission.status = 'turned_in'

    # Content
    model_id = request.form.get('model_id')
    if model_id:
        submission.submission_model_id = model_id
    
    # Could handle text feedback/content here too if added to form
    
    db.session.commit()
    flash('Work submitted successfully!', 'success')
    return redirect(url_for('lms.view_classwork', cw_id=cw_id))

@bp.route('/submission/<int:sub_id>/grade', methods=['POST'])
@login_required
def grade_submission(sub_id):
    submission = Submission.query.get_or_404(sub_id)
    classroom = submission.work.classroom
    
    if classroom.owner_id != current_user.id:
        flash('Only teachers can grade', 'error')
        return redirect(url_for('lms.view_classwork', cw_id=submission.classwork_id))
        
    grade = request.form.get('grade')
    if grade:
        submission.grade = int(grade)
        submission.status = 'graded'
        submission.graded_at = datetime.utcnow()
        
    db.session.commit()
    flash('Grade updated', 'success')
    return redirect(url_for('lms.view_classwork', cw_id=submission.classwork_id))
