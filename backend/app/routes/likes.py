from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import Like, User
from app.schemas.schemas import LikeCreate
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/api", tags=["Likes"])


@router.post("/like")
def toggle_like(
    data: LikeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing = (
        db.query(Like)
        .filter(Like.user_id == current_user.user_id, Like.post_id == data.post_id)
        .first()
    )
    if existing:
        db.delete(existing)
        db.commit()
        return {"liked": False, "message": "Like removed"}
    like = Like(user_id=current_user.user_id, post_id=data.post_id)
    db.add(like)
    db.commit()
    return {"liked": True, "message": "Like added"}


@router.get("/like/{post_id}/status")
def like_status(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    exists = (
        db.query(Like)
        .filter(Like.user_id == current_user.user_id, Like.post_id == post_id)
        .first()
    )
    return {"liked": exists is not None}
