from fastapi import APIRouter, BackgroundTasks
from github import Github
from app.core.config import settings
from app.services.rag_service import embed_repository

router = APIRouter()

github_client = Github(settings.GITHUB_TOKEN)

async def fetch_repo_files(repo_name: str) -> list:
    try:
        repo = github_client.get_repo(repo_name)
        files = []
        contents = repo.get_contents("")
        while contents:
            file_content = contents.pop(0)
            
            if file_content.type == "dir":
                contents.extend(repo.get_contents(file_content.path))
            else:
                if should_embed_file(file_content.path):
                    try:
                        content = file_content.decoded_content.decode('utf-8')
                        files.append({
                            'path': file_content.path,
                            'content': content,
                            'language': detect_language(file_content.path)
                        })
                    except:
                        pass  # Skip binary/unreadable files
        
        return files
    
    except Exception as e:
        print(f"Error fetching repo files: {e}")
        return []

def should_embed_file(path: str) -> bool:
    """Check if file should be embedded"""
    code_extensions = [
        '.py', '.js', '.jsx', '.ts', '.tsx', '.java', '.go', 
        '.rs', '.cpp', '.c', '.rb', '.php', '.cs', '.swift'
    ]
    skip_dirs = ['node_modules', '.git', 'dist', 'build', '__pycache__', 'venv']
    for skip in skip_dirs:
        if skip in path:
            return False
    return any(path.endswith(ext) for ext in code_extensions)

def detect_language(path: str) -> str:
    """Detect language from file extension"""
    ext_map = {
        '.py': 'python', '.js': 'javascript', '.jsx': 'javascript',
        '.ts': 'typescript', '.tsx': 'typescript', '.java': 'java',
        '.go': 'go', '.rs': 'rust', '.cpp': 'cpp', '.c': 'c'
    }
    for ext, lang in ext_map.items():
        if path.endswith(ext):
            return lang
    return 'unknown'

@router.post("/embed-repository")
async def embed_repo(repo: str, background_tasks: BackgroundTasks):
    """Embed a repository into Qdrant"""
    async def process_embedding():
        print(f"\nStarting repository embedding: {repo}")
        files = await fetch_repo_files(repo)
        result = await embed_repository(repo, files)
        print(f"   Final result: {result}")
    background_tasks.add_task(process_embedding)
    return {
        "status": "processing",
        "message": f"Embedding repository: {repo}",
        "note": "This may take a few minutes. Future reviews will use this context."
    }

@router.get("/embedding-status")
async def check_status(repo: str):
    """Check if repository is embedded"""
    from app.services.rag_service import get_qdrant_client, get_collection_name
    client = get_qdrant_client()
    if not client:
        return {"embedded": False, "reason": "Qdrant not configured"}
    collection_name = get_collection_name(repo)
    try:
        info = client.get_collection(collection_name)
        return {
            "embedded": True,
            "collection": collection_name,
            "vectors": info.points_count
        }
    except:
        return {"embedded": False, "collection": collection_name}