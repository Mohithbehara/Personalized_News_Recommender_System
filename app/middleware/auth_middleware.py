from fastapi import Request, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.security import decode_access_token


security = HTTPBearer()


async def verify_token(request: Request, credentials: HTTPAuthorizationCredentials = None):
    """
    Middleware to verify JWT token from Authorization header.
    
    Args:
        request: FastAPI request object
        credentials: HTTP Authorization credentials
        
    Returns:
        Decoded token payload
        
    Raises:
        HTTPException: If token is invalid or missing
    """
    if not credentials:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    token = credentials.credentials
    payload = decode_access_token(token)
    
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    return payload


def get_current_user(token_payload: dict) -> str:
    """
    Extract user_id from token payload.
    
    Args:
        token_payload: Decoded JWT payload
        
    Returns:
        user_id string
    """
    user_id = token_payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    return user_id