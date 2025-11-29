from sqlalchemy import Column, Integer, String, DateTime, JSON, Text, ForeignKey
from datetime import datetime
from app.core.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    github_id = Column(Integer, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    access_token = Column(Text)  
    created_at = Column(DateTime, default=datetime.utcnow)

class Review(Base):
    __tablename__ = "reviews"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  
    repo_name = Column(String, index=True)
    pr_number = Column(Integer)
    pr_url = Column(String)
    severity = Column(String)
    summary = Column(Text)
    issues = Column(JSON)
    status = Column(String, default="completed")
    created_at = Column(DateTime, default=datetime.utcnow)

class Repository(Base):
    __tablename__ = "repositories"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id")) 
    full_name = Column(String, index=True)
    github_id = Column(Integer, unique=True)
    webhook_id = Column(Integer, nullable=True)
    is_active = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)