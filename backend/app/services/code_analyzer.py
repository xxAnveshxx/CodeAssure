from groq import Groq
from github import Github
import json
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.database import Review
from app.core.database import SessionLocal

groq_client = Groq(api_key=settings.GROQ_API_KEY)
github_client = Github(settings.GITHUB_TOKEN)

async def analyze_pr(pr_data: dict):
    print(f"\nStarting analysis for {pr_data['repo']}#{pr_data['pr_number']}")
    try:
        print("Fetching PR code from GitHub...")
        code_changes = fetch_pr_code(pr_data)
        
        if not code_changes:
            print("Warning: No code changes found in this PR")
            return {"status": "no_changes"}
        
        print(f"Found files:")
        for change in code_changes:
            print(f"   - {change['filename']} ({change['language']})")
        
        print("Running AI analysis...")
        review_result = await analyze_with_ai(code_changes, repo_name=pr_data['repo'])
        
        print("Saving review to database...")
        db = SessionLocal()
        review = Review(
            user_id=pr_data.get('user_id'),
            repo_name=pr_data['repo'],
            pr_number=pr_data['pr_number'],
            pr_url=pr_data['pr_url'],
            severity=review_result['severity'],
            summary=review_result['summary'],
            issues=review_result['issues'],
            status='completed'
        )
        db.add(review)
        db.commit()
        db.refresh(review)
        db.close()
        
        print("Posting review to GitHub...")
        post_review_to_github(pr_data, review_result)
        
        print("Analysis complete")
        return {
            "status": "success",
            "review_id": review.id,
            "severity": review_result['severity']
        }
    except Exception as e:
        print(f"Error during analysis: {e}")
        import traceback
        traceback.print_exc() 
        return {"status": "error", "message": str(e)}

def fetch_pr_code(pr_data: dict) -> list:
    try:
        repo = github_client.get_repo(pr_data['repo'])
        pr = repo.get_pull(pr_data['pr_number'])
        
        code_changes = []
        files = pr.get_files()
        
        for file in files:
            if should_analyze_file(file.filename):
                if file.patch:
                    try:
                        patch = file.patch
                        if isinstance(patch, bytes):
                            patch = patch.decode('utf-8', errors='replace')
                        
                        code_changes.append({
                            'filename': file.filename,
                            'patch': patch,
                            'additions': file.additions,
                            'deletions': file.deletions,
                            'language': detect_language(file.filename)
                        })
                    except Exception as e:
                        print(f" Skipping {file.filename}: {e}")
                        continue
        
        print(f"   Found {len(code_changes)} files to analyze")
        return code_changes
        
    except Exception as e:
        print(f"   GitHub API error: {e}")
        import traceback
        traceback.print_exc() 
        return []

def should_analyze_file(filename: str) -> bool:
    skip_extensions = [
        '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.md', '.txt', '.json', '.yaml', '.yml', '.lock', '.log'
    ]
    for ext in skip_extensions:
        if filename.endswith(ext):
            return False
    return True

def detect_language(filename: str) -> str:
    extension_map = {
        '.py': 'python', '.js': 'javascript', '.jsx': 'javascript', '.ts': 'typescript', '.tsx': 'typescript', '.java': 'java', '.go': 'go', '.rs': 'rust', '.cpp': 'cpp', '.c': 'c', '.rb': 'ruby', '.php': 'php',
    }
    for ext, lang in extension_map.items():
        if filename.endswith(ext):
            return lang
    return 'unknown'


async def analyze_with_ai(code_changes: list, repo_name: str = None) -> dict:
    prompt = build_analysis_prompt(code_changes)

    # add codebase context if we have it
    if repo_name:
        from app.services.rag_service import get_codebase_context
        context = await get_codebase_context(repo_name, code_changes)
        if context:
            prompt += f"\n\n## Existing Codebase Patterns:\n{context}"
            print(f"   Added codebase context ({len(context)} chars)")
    
    try:
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": """You are a pragmatic code reviewer. Classify issues by severity:

                **HIGH SEVERITY** (Critical - Must fix before merge):
                - Security vulnerabilities (SQL injection, XSS, authentication bypass)
                - Critical bugs that crash the application or cause data loss
                - Memory leaks or severe performance issues
                - Exposed secrets or credentials in code

                **MEDIUM SEVERITY** (Important - Should fix soon):
                - Non-critical bugs (edge cases, minor logic errors)
                - Missing error handling that could cause issues
                - Performance problems that slow things down but don't break
                - Deprecated API usage
                - Missing input validation (non-security critical)
                - Code duplication that affects maintainability

                **LOW SEVERITY** (Minor or no issues):
                - Clean code with no functional issues
                - Minor style inconsistencies
                - Missing documentation
                - Code that works correctly but could be improved

                Response format (JSON only):
                {
                "severity": "high|medium|low",
                "summary": "brief explanation",
                "issues": [
                    {
                    "type": "bug|security|performance|style",
                    "file": "filename",
                    "line": number,
                    "title": "issue title",
                    "description": "what's wrong",
                    "suggestion": "how to fix"
                    }
                ]
                }
                If no issues found, return: {"severity": "low", "summary": "Code looks good!", "issues": []}
                """
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.1,
            max_tokens=2000
        )
        ai_response = response.choices[0].message.content
        print(f"   AI response length: {len(ai_response)} chars")
        result = parse_ai_response(ai_response)
        return result
        
    except Exception as e:
        print(f"   Groq API error: {e}")
        return {
            "severity": "low",
            "summary": "Analysis failed due to API error",
            "issues": []
        }

def build_analysis_prompt(code_changes: list) -> str:
    prompt = "Review the following code changes:\n\n"
    for change in code_changes[:5]:
        prompt += f"### File: `{change['filename']}` ({change['language']})\n"
        prompt += f"**Changes:** +{change['additions']} -{change['deletions']}\n\n"
        prompt += "```diff\n"
        prompt += change['patch'][:1000]
        prompt += "\n```\n\n"
    
    if len(code_changes) > 5:
        prompt += f"_(and {len(code_changes) - 5} more files)_\n"
    return prompt


def parse_ai_response(ai_response: str) -> dict:
    try:
        if '```json' in ai_response:
            ai_response = ai_response.split('```json')[1].split('```')[0]
        elif '```' in ai_response:
            ai_response = ai_response.split('```')[1].split('```')[0]

        ai_response = ai_response.strip()
        result = json.loads(ai_response)
        if 'severity' not in result:
            result['severity'] = 'low'
        if 'summary' not in result:
            result['summary'] = 'Code review completed'
        if 'issues' not in result:
            result['issues'] = []
        
        return result
        
    except json.JSONDecodeError as e:
        print(f"JSON parse error: {e}")
        print(f"Raw AI response:\n{ai_response[:500]}")
        return {
            "severity": "low",
            "summary": "Analysis completed but response format was invalid",
            "issues": [{
                "type": "error",
                "file": "system",
                "title": "Parse Error",
                "description": f"Could not parse AI response: {str(e)}"
            }]
        }

def post_review_to_github(pr_data: dict, review: dict):
    try:
        repo = github_client.get_repo(pr_data['repo'])
        pr = repo.get_pull(pr_data['pr_number'])
        comment = build_comment_markdown(review)
        pr.create_issue_comment(comment)
        print("   Successfully posted to GitHub")
    except Exception as e:
        print(f"   GitHub comment failed: {e}")

def build_comment_markdown(review: dict) -> str:
    severity_labels = {
        'high': 'HIGH',
        'medium': 'MEDIUM',
        'low': 'LOW'
    }
    comment = f"## CodeAssure Review - {severity_labels.get(review['severity'], 'UNKNOWN')}\n\n"
    comment += f"### Summary\n{review['summary']}\n\n"
    
    if review['issues']:
        comment += f"### Issues Found ({len(review['issues'])})\n\n"
        
        for i, issue in enumerate(review['issues'], 1):
            comment += f"#### {i}. [{issue['type'].upper()}] {issue.get('title', issue['type'].title())}\n\n"
            comment += f"**File:** `{issue['file']}`"
            if issue.get('line'):
                comment += f" (Line {issue['line']})"
            comment += "\n\n"
            
            comment += f"**Issue:** {issue['description']}\n\n"
            
            if issue.get('suggestion'):
                comment += f"**Fix:** {issue['suggestion']}\n\n"
            
            if issue.get('code_example'):
                comment += f"```{issue.get('language', '')}\n{issue['code_example']}\n```\n\n"
            
            comment += "---\n\n"
    else:
        comment += "### No Issues Found\n\n"
        comment += "The code looks good! No major issues detected.\n\n"
    comment += "_Generated by CodeAssure - AI Code Review Assistant_\n"
    
    return comment