from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import Post, Like, Comment, User
from app.schemas.schemas import PostCreate, PostUpdate
from app.services.auth_service import get_current_user, get_admin_user

router = APIRouter(prefix="/api", tags=["Posts"])


def _post_to_dict(post: Post, db: Session) -> dict:
    return {
        "post_id": post.post_id,
        "title": post.title,
        "thumbnail": post.thumbnail,
        "beneficial_for": post.beneficial_for,
        "short_description": post.short_description,
        "detailed_description": post.detailed_description,
        "created_by": post.created_by,
        "created_at": post.created_at,
        "creator_name": post.creator.name if post.creator else None,
        "like_count": db.query(Like).filter(Like.post_id == post.post_id).count(),
        "comment_count": db.query(Comment).filter(Comment.post_id == post.post_id).count(),
    }


@router.get("/posts")
def get_posts(
    page: int = Query(1, ge=1),
    limit: int = Query(9, ge=1, le=50),
    db: Session = Depends(get_db),
):
    offset = (page - 1) * limit
    total = db.query(Post).count()
    posts = db.query(Post).order_by(Post.created_at.desc()).offset(offset).limit(limit).all()
    return {
        "posts": [_post_to_dict(p, db) for p in posts],
        "total": total,
        "page": page,
        "pages": max(1, (total + limit - 1) // limit),
    }


@router.get("/posts/{post_id}")
def get_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.post_id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return _post_to_dict(post, db)


@router.post("/posts")
def create_post(
    post_data: PostCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
):
    post = Post(
        title=post_data.title,
        thumbnail=post_data.thumbnail,
        beneficial_for=post_data.beneficial_for,
        short_description=post_data.short_description,
        detailed_description=post_data.detailed_description,
        created_by=current_user.user_id,
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return _post_to_dict(post, db)


@router.put("/posts/{post_id}")
def update_post(
    post_id: int,
    post_data: PostUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
):
    post = db.query(Post).filter(Post.post_id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    for field, value in post_data.model_dump(exclude_unset=True).items():
        setattr(post, field, value)
    db.commit()
    db.refresh(post)
    return _post_to_dict(post, db)


@router.delete("/posts/{post_id}")
def delete_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
):
    post = db.query(Post).filter(Post.post_id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    db.delete(post)
    db.commit()
    return {"message": "Post deleted successfully"}
