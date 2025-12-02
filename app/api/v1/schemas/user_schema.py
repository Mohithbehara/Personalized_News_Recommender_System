from pydantic import BaseModel, EmailStr
from typing import Optional

# For user registration
class UserCreateSchema(BaseModel):
    user_id: str
    email: EmailStr
    password: str
    name: Optional[str] = None

# For user login
class UserLoginSchema(BaseModel):
    user_id: str
    password: str

# For response (what we return to client)
class UserResponseSchema(BaseModel):
    user_id: str
    email: EmailStr
    name: Optional[str]
    access_token: str
    token_type: str = "bearer"
