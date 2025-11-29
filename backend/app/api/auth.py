from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
import httpx
from app.core.config import settings
from app.core.database import get_db
from app.core.security import create_access_token
from app.models.database import User

router = APIRouter()

@router.get("/login")
async def login():
    github_auth_url = (
        f"https://github.com/login/oauth/authorize"
        f"?client_id={settings.GITHUB_CLIENT_ID}"
        f"&redirect_uri={settings.GITHUB_REDIRECT_URI}"
        f"&scope=repo,read:user,user:email"
    )
    return RedirectResponse(github_auth_url)

@router.get("/callback")
async def callback(code: str, db: Session = Depends(get_db)):
    async with httpx.AsyncClient() as client:
        token_response = await client.post(
            "https://github.com/login/oauth/access_token",
            headers={"Accept": "application/json"},
            data={
                "client_id": settings.GITHUB_CLIENT_ID,
                "client_secret": settings.GITHUB_CLIENT_SECRET,
                "code": code,
                "redirect_uri": settings.GITHUB_REDIRECT_URI
            }
        )
        token_data = token_response.json()
        if "error" in token_data:
            raise HTTPException(status_code=400, detail=token_data.get("error_description", "OAuth failed"))
        
        access_token = token_data["access_token"]
        user_response = await client.get(
            "https://api.github.com/user",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        user_data = user_response.json()
        email_response = await client.get(
            "https://api.github.com/user/emails",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        emails = email_response.json()
        primary_email = next((e["email"] for e in emails if e.get("primary")), None)
        user = db.query(User).filter(User.github_id == user_data["id"]).first()
        
        if user:
            user.username = user_data["login"]
            user.email = primary_email
            user.avatar_url = user_data["avatar_url"]
            user.access_token = access_token
        else:
            user = User(
                github_id=user_data["id"],
                username=user_data["login"],
                email=primary_email,
                avatar_url=user_data["avatar_url"],
                access_token=access_token
            )
            db.add(user)
        
        db.commit()
        db.refresh(user)
        jwt_token = create_access_token(data={"sub": str(user.id), "username": user.username})
        frontend_url = f"http://localhost:5173/auth/callback?token={jwt_token}"
        return RedirectResponse(frontend_url)

@router.get("/me")
async def get_current_user(token: str, db: Session = Depends(get_db)):
    from app.core.security import verify_token
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "avatar_url": user.avatar_url,
        "github_id": user.github_id
    }

@router.post("/logout")
async def logout():
    return {"message": "Logged out successfully"}