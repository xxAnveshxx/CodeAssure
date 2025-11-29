from fastapi import APIRouter, BackgroundTasks, Depends
from sqlalchemy.orm import Session
from app.services.code_analyzer import analyze_pr
from app.core.database import get_db
from app.core.security import verify_token

router = APIRouter()

def get_current_user_id(token: str = None):
    if not token:
        return None
    payload = verify_token(token)
    if not payload:
        return None
    return int(payload.get("sub"))

@router.post("/manual-review")
async def manual_review(
    repo: str,
    pr_number: int,
    token: str = None,
    background_tasks: BackgroundTasks = None
):
    user_id = get_current_user_id(token)
    pr_data = {
        "repo": repo,
        "pr_number": pr_number,
        "pr_url": f"https://github.com/{repo}/pull/{pr_number}",
        "base_sha": "main",
        "head_sha": "branch",
        "user_id": user_id
    }
    background_tasks.add_task(analyze_pr, pr_data)
    return {
        "status": "processing",
        "message": f"Analyzing {repo}#{pr_number}",
        "pr_url": pr_data['pr_url']
    }

@router.get("/health")
def health():
    """Test if services are configured"""
    from app.core.config import settings
    
    return {
        "groq_configured": bool(settings.GROQ_API_KEY and settings.GROQ_API_KEY != "your_groq_api_key_here"),
        "github_configured": bool(settings.GITHUB_TOKEN and settings.GITHUB_TOKEN != "your_github_token_here")
    }