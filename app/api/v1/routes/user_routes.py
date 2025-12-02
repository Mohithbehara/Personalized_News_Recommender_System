from fastapi import APIRouter, HTTPException
from app.api.v1.schemas.user_schema import UserCreateSchema, UserLoginSchema, UserResponseSchema
from app.api.v1.models.user_model import create_user, get_user_by_id, validate_user
from app.core.security import create_access_token

user_router = APIRouter( tags=["Users"])


# ---------------- Register User ----------------
@user_router.post("/register", response_model=UserResponseSchema)
async def register_user(user: UserCreateSchema):
    existing = await get_user_by_id(user.user_id)
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

    user_dict = user.dict()
    created_user = await create_user(user_dict)
    
    # Generate JWT token for the newly registered user
    access_token = create_access_token(
        data={"user_id": created_user["user_id"], "email": created_user["email"]}
    )

    return UserResponseSchema(
        user_id=created_user["user_id"],
        email=created_user["email"],
        name=created_user.get("name"),
        access_token=access_token
    )


# ---------------- Login User ----------------
@user_router.post("/login", response_model=UserResponseSchema)
async def login_user(credentials: UserLoginSchema):
    user = await validate_user(credentials.user_id, credentials.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Generate JWT token for authenticated user
    access_token = create_access_token(
        data={"user_id": user["user_id"], "email": user["email"]}
    )

    return UserResponseSchema(
        user_id=user["user_id"],
        email=user["email"],
        name=user.get("name"),
        access_token=access_token
    )
