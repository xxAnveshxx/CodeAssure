from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.database import Review, User
from app.core.security import verify_token

router = APIRouter()

def get_current_user_id(token: str = None):
    if not token:
        return None
    payload = verify_token(token)
    if not payload:
        return None
    return int(payload.get("sub"))

@router.get("/")
def get_reviews(
    token: str = None,
    db: Session = Depends(get_db)
):
    userId = get_current_user_id(token)
    if userId:
        reviews = db.query(Review).filter(Review.user_id == userId).order_by(Review.created_at.desc()).limit(50).all()
    else:
        reviews = db.query(Review).order_by(Review.created_at.desc()).limit(50).all()
    return {"reviews": reviews, "count": len(reviews)}

@router.get("/{review_id}")
def get_review(review_id: int, db: Session = Depends(get_db)):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    return review