from fastapi import APIRouter, Request, BackgroundTasks
from app.services.code_analyzer import analyze_pr

router = APIRouter()

@router.post("/github")
async def github_webhook(request: Request, background_tasks: BackgroundTasks):
    payload = await request.json()
    if "pull_request" not in payload:
        return {"status": "ignored", "reason": "not a PR event"}
    
    action = payload.get("action")
    if action not in ["opened", "synchronize"]:
        return {"status": "ignored", "reason": f"action '{action}' not tracked"}
    
    pr_data = {
        "repo": payload["repository"]["full_name"],
        "pr_number": payload["pull_request"]["number"],
        "pr_url": payload["pull_request"]["html_url"],
        "base_sha": payload["pull_request"]["base"]["sha"],
        "head_sha": payload["pull_request"]["head"]["sha"],
    }
    background_tasks.add_task(analyze_pr, pr_data)
    return {"status": "processing", "pr": pr_data["pr_number"]}

@router.get("/test")
def test_webhook():
    return {"message": "Webhook endpoint is working"}