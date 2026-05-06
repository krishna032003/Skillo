from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class UserProfileSchema(BaseModel):
    user_id: Optional[str] = None
    name: Optional[str] = Field(None, description="User's full name")
    profession: Optional[str] = Field(None, description="User's profession or role")
    objectives: List[str] = Field(default_factory=list, description="User's primary learning/career objectives")
    # Legacy optional fields kept for backward-compatibility
    degree: Optional[str] = Field(None, description="User's degree program")
    year: Optional[int] = Field(None, ge=1, le=5, description="Year of study (1-5)")
    batch: Optional[str] = Field(None, description="Batch or division section")
    goals: List[str] = Field(default_factory=list, description="Top active goals")
    hard_constraints: List[str] = Field(default_factory=list, description="Schedule constraints")
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class OnboardResponse(BaseModel):
    success: bool
    user_id: str
    message: str
