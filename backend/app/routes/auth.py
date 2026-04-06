from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import User
from app.schemas.schemas import UserRegister, UserLogin, Token, UserResponse
from app.services.auth_service import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/api", tags=["Auth"])


@router.post("/register", response_model=UserResponse)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        name=user_data.name,
        email=user_data.email,
        password=hash_password(user_data.password),
        gender=user_data.gender,
        age=user_data.age,
        role="user",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/admin/register", response_model=UserResponse)
def admin_register(user_data: UserRegister, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        name=user_data.name,
        email=user_data.email,
        password=hash_password(user_data.password),
        gender=user_data.gender,
        age=user_data.age,
        role="admin",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token({"sub": str(user.user_id)})
    return {"access_token": token, "token_type": "bearer", "user": user}
