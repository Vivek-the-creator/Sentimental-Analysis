import re
from collections import Counter
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import Comment, Like, Post, User
from app.services.auth_service import get_admin_user

router = APIRouter(prefix="/api", tags=["Analytics"])

STOPWORDS = {
    "the","a","an","is","it","in","on","at","to","for","of","and","or","but",
    "not","with","this","that","are","was","be","have","has","had","do","did",
    "will","would","i","you","he","she","we","they","my","your","our","their",
    "its","very","so","from","by","as","if","about","also","been","more","can",
    "could","should","may","might","much","many","some","any","all","there",
    "when","what","who","which","how","than","then","no","just","get","got",
    "go","like","make","made","good","great","need","want","use","new","one",
}


@router.get("/analytics/{post_id}")
def get_analytics(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
):
    if not db.query(Post).filter(Post.post_id == post_id).first():
        raise HTTPException(status_code=404, detail="Post not found")

    rows = (
        db.query(Comment, User)
        .join(User, Comment.user_id == User.user_id)
        .filter(Comment.post_id == post_id)
        .all()
    )

    sentiment = {"Positive": 0, "Neutral": 0, "Negative": 0}
    gender = {
        "Male":   {"Positive": 0, "Neutral": 0, "Negative": 0},
        "Female": {"Positive": 0, "Neutral": 0, "Negative": 0},
        "Other":  {"Positive": 0, "Neutral": 0, "Negative": 0},
    }
    age_groups = {
        "18-25": {"Positive": 0, "Neutral": 0, "Negative": 0},
        "26-40": {"Positive": 0, "Neutral": 0, "Negative": 0},
        "40+":   {"Positive": 0, "Neutral": 0, "Negative": 0},
        "Unknown": {"Positive": 0, "Neutral": 0, "Negative": 0},
    }

    for comment, user in rows:
        s = comment.sentiment if comment.sentiment in sentiment else "Neutral"
        sentiment[s] += 1

        g = (user.gender or "").strip().capitalize()
        if g not in gender:
            g = "Other"
        gender[g][s] += 1

        age = user.age
        if age:
            if 18 <= age <= 25:
                age_groups["18-25"][s] += 1
            elif 26 <= age <= 40:
                age_groups["26-40"][s] += 1
            elif age > 40:
                age_groups["40+"][s] += 1
            else:
                age_groups["Unknown"][s] += 1
        else:
            age_groups["Unknown"][s] += 1

    total_likes = db.query(Like).filter(Like.post_id == post_id).count()

    return {
        "sentiment": {
            "positive": sentiment["Positive"],
            "neutral":  sentiment["Neutral"],
            "negative": sentiment["Negative"],
        },
        "gender": {
            "male_positive":   gender["Male"]["Positive"],
            "male_neutral":    gender["Male"]["Neutral"],
            "male_negative":   gender["Male"]["Negative"],
            "female_positive": gender["Female"]["Positive"],
            "female_neutral":  gender["Female"]["Neutral"],
            "female_negative": gender["Female"]["Negative"],
        },
        "age_groups": {
            "18_25":   age_groups["18-25"],
            "26_40":   age_groups["26-40"],
            "40_plus": age_groups["40+"],
            "unknown": age_groups["Unknown"],
        },
        "total_comments": len(rows),
        "total_likes": total_likes,
    }


@router.get("/wordcloud/{post_id}")
def get_wordcloud(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
):
    comments = db.query(Comment).filter(Comment.post_id == post_id).all()
    all_text = " ".join(c.comment_text for c in comments)
    words = re.findall(r"\b[a-zA-Z]{3,}\b", all_text.lower())
    filtered = [w for w in words if w not in STOPWORDS]
    freq = Counter(filtered)
    return {"words": [{"text": w, "value": v} for w, v in freq.most_common(60)]}
