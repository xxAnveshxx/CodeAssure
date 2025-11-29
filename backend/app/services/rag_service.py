from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from sentence_transformers import SentenceTransformer
from app.core.config import settings
import hashlib

qdrant_client = None
embedder = None

def get_qdrant_client():
    global qdrant_client
    if qdrant_client is None and settings.QDRANT_URL and settings.QDRANT_API_KEY:
        qdrant_client = QdrantClient(
            url=settings.QDRANT_URL,
            api_key=settings.QDRANT_API_KEY
        )
    return qdrant_client

def get_embedder():
    global embedder
    if embedder is None:
        embedder = SentenceTransformer('all-MiniLM-L6-v2')
    return embedder

def get_collection_name(repo_name: str) -> str:
    safe_name = repo_name.replace('/', '_').replace('-', '_')
    return f"repo_{safe_name}"

async def embed_repository(repo_name: str, files: list) -> dict:
    client = get_qdrant_client()
    if not client:
        return {"status": "error", "message": "Qdrant not configured"}
    embedder = get_embedder()
    collection_name = get_collection_name(repo_name)
    print(f"Embedding repository: {repo_name}")
    print(f"   Collection: {collection_name}")
    print(f"   Files: {len(files)}")
    
    try:
        try:
            client.get_collection(collection_name)
            print(f"   Collection already exists, updating...")
        except:
            print(f"   Creating new collection...")
            client.create_collection(
                collection_name=collection_name,
                vectors_config=VectorParams(
                    size=384,
                    distance=Distance.COSINE
                )
            )
        points = []
        for idx, file in enumerate(files):
            if not file.get('content') or len(file['content']) > 50000:
                continue
            
            embedding = embedder.encode(file['content']).tolist()       
            file_hash = hashlib.md5(f"{repo_name}:{file['path']}".encode()).hexdigest()
            points.append(PointStruct(
                id=file_hash,
                vector=embedding,
                payload={
                    "repo": repo_name,
                    "path": file['path'],
                    "content": file['content'][:10000],
                    "language": file.get('language', 'unknown'),
                    "size": len(file['content'])
                }
            ))
            if (idx + 1) % 10 == 0:
                print(f"   Embedded {idx + 1}/{len(files)} files")
        if points:
            client.upsert(collection_name=collection_name, points=points)
            print(f"   Successfully uploaded {len(points)} embeddings")       
        return {
            "status": "success",
            "collection": collection_name,
            "files_embedded": len(points)
        }       
    except Exception as e:
        print(f"   Embedding error: {e}")
        return {"status": "error", "message": str(e)}

async def find_similar_code(repo_name: str, code_snippet: str, limit: int = 3) -> list:
    client = get_qdrant_client()
    if not client:
        return []
    embedder = get_embedder()
    collection_name = get_collection_name(repo_name)
    try:
        query_embedding = embedder.encode(code_snippet).tolist()
        results = client.search(
            collection_name=collection_name,
            query_vector=query_embedding,
            limit=limit,
            with_payload=True
        )
        return [
            {
                "path": hit.payload['path'],
                "content": hit.payload['content'],
                "language": hit.payload['language'],
                "score": hit.score
            }
            for hit in results
        ]
    except Exception as e:
        print(f"   Search error: {e}")
        return []

async def get_codebase_context(repo_name: str, code_changes: list) -> str:
    if not code_changes:
        return ""
    context_parts = []
    for change in code_changes[:3]:
        similar = await find_similar_code(repo_name, change['patch'][:1000], limit=2)
        if similar:
            context_parts.append(f"\n### Similar patterns in {change['filename']}:")
            for match in similar:
                context_parts.append(f"- {match['path']} (similarity: {match['score']:.2f})")
                preview = match['content'][:200].replace('\n', ' ')
                context_parts.append(f"  Context: {preview}...")
    
    return "\n".join(context_parts) if context_parts else ""