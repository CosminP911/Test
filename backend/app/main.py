from fastapi import FastAPI, Depends, HTTPException, status, Body, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from . import models, schemas, crud, utils
from .schemas import UserUpdate

from .database import SessionLocal, engine, Base
import math
from pydantic import BaseModel, field_validator

from fastapi.middleware.cors import CORSMiddleware

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")






Base.metadata.create_all(bind=engine)
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For dev only! Lock this down for production.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = utils.decode_access_token(token)
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except Exception:
        raise credentials_exception
    user = crud.get_user_by_username(db, username=username)
    if user is None:
        raise credentials_exception
    return user




@app.post("/calculate/", response_model=schemas.Request)
def calculate(req: schemas.RequestCreate, db: Session = Depends(get_db), current_user: schemas.UserRead = Depends(get_current_user)):
    if req.operation == "pow":
        base, exp = map(float, req.input_data.split(","))
        result = math.pow(base, exp)
    elif req.operation == "fibonacci":
        n = int(req.input_data)
        def fib(n):
            a, b = 0, 1
            for _ in range(n):
                a, b = b, a + b
            return a
        result = fib(n)
    elif req.operation == "factorial":
        n = int(req.input_data)
        result = math.factorial(n)
    else:
        raise HTTPException(status_code=400, detail="Unknown operation")
    db_req = crud.create_math_request(db, req.operation, req.input_data, result)
    return db_req

@app.get("/requests/", response_model=list[schemas.Request])
def list_requests(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    return crud.get_requests(db, skip=skip, limit=limit)




@app.post("/register", response_model=schemas.UserRead)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_username(db, user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    return crud.create_user(db, user)

@app.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud.get_user_by_username(db, form_data.username)
    if not user or not utils.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    access_token = utils.create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = utils.decode_access_token(token)
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except Exception:
        raise credentials_exception
    user = crud.get_user_by_username(db, username=username)
    if user is None:
        raise credentials_exception
    return user



@app.get("/me", response_model=schemas.UserRead)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user


@app.put("/me", response_model=schemas.UserRead)
def update_user_me(
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Username update as before
    if data.username and data.username != current_user.username:
        user_check = crud.get_user_by_username(db, data.username)
        if user_check:
            raise HTTPException(status_code=400, detail="Username already in use")
        current_user.username = data.username
    # Password update with verification
    if data.password:
        if not data.old_password or not utils.verify_password(data.old_password, current_user.hashed_password):
            raise HTTPException(status_code=400, detail="Current password is incorrect.")
        current_user.hashed_password = utils.get_password_hash(data.password)
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user

@app.post("/verify-password")
def verify_password(
    password: str = Body(..., embed=True),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if not utils.verify_password(password, current_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid password")
    return {"ok": True}

class UserUpdate(BaseModel):
    username: str | None = None
    password: str | None = None
    old_password: str | None = None
    
    @field_validator('username', 'password')
    def no_spaces(cls, v, info):
        if v != v.strip():
            raise ValueError(f"{info.field_name} cannot have leading or trailing spaces")
        if ' ' in v:
            raise ValueError(f"{info.field_name} cannot contain spaces")
    
        return v