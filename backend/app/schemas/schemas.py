from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# ─── Auth ────────────────────────────────────────────────────────────────────

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    gender: Optional[str] = None
    age: Optional[int] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    user_id: int
    name: str
    email: str
    role: str
    gender: Optional[str] = None
    age: Optional[int] = None

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


# ─── Posts ───────────────────────────────────────────────────────────────────

class PostCreate(BaseModel):
    title: str
    thumbnail: Optional[str] = None
    beneficial_for: Optional[str] = None
    short_description: Optional[str] = None
    detailed_description: Optional[str] = None


class PostUpdate(BaseModel):
    title: Optional[str] = None
    thumbnail: Optional[str] = None
    beneficial_for: Optional[str] = None
    short_description: Optional[str] = None
    detailed_description: Optional[str] = None


class PostResponse(BaseModel):
    post_id: int
    title: str
    thumbnail: Optional[str] = None
    beneficial_for: Optional[str] = None
    short_description: Optional[str] = None
    detailed_description: Optional[str] = None
    created_by: Optional[int] = None
    created_at: datetime
    creator_name: Optional[str] = None
    like_count: int = 0
    comment_count: int = 0

    model_config = {"from_attributes": True}


# ─── Comments ────────────────────────────────────────────────────────────────

class CommentCreate(BaseModel):
    post_id: int
    comment_text: str


class CommentUpdate(BaseModel):
    comment_text: str


class CommentResponse(BaseModel):
    comment_id: int
    post_id: int
    user_id: int
    comment_text: str
    sentiment: Optional[str] = None
    created_at: datetime
    user_name: Optional[str] = None

    model_config = {"from_attributes": True}


# ─── Likes ───────────────────────────────────────────────────────────────────

class LikeCreate(BaseModel):
    post_id: int


# ─── ML ──────────────────────────────────────────────────────────────────────

class PredictRequest(BaseModel):
    text: str


class PredictResponse(BaseModel):
    sentiment: str
