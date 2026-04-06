from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import Comment, User
from app.schemas.schemas import CommentCreate
from app.services.auth_service import get_current_user
from app.services.ml_service import predict_sentiment

router = APIRouter(prefix="/api", tags=["Comments"])


@router.post("/comments")
def create_comment(
    data: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sentiment = predict_sentiment(data.comment_text)
    comment = Comment(
        post_id=data.post_id,
        user_id=current_user.user_id,
        comment_text=data.comment_text,
        sentiment=sentiment,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return {
        "comment_id": comment.comment_id,
        "post_id": comment.post_id,
        "user_id": comment.user_id,
        "comment_text": comment.comment_text,
        "sentiment": comment.sentiment,
        "created_at": comment.created_at,
        "user_name": current_user.name,
    }


@router.get("/comments/{post_id}")
def get_comments(
    post_id: int,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    offset = (page - 1) * limit
    total = db.query(Comment).filter(Comment.post_id == post_id).count()
    comments = (
        db.query(Comment)
        .filter(Comment.post_id == post_id)
        .order_by(Comment.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    result = [
        {
            "comment_id": c.comment_id,
            "post_id": c.post_id,
            "user_id": c.user_id,
            "comment_text": c.comment_text,
            "sentiment": c.sentiment,
            "created_at": c.created_at,
            "user_name": c.user.name if c.user else "Unknown",
        }
        for c in comments
    ]
    return {
        "comments": result,
        "total": total,
        "page": page,
        "pages": max(1, (total + limit - 1) // limit),
    }
