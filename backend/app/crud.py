from sqlalchemy.orm import Session
from . import models, schemas, utils

def create_math_request(db: Session, operation: str, input_data: str, result: float):
    db_req = models.MathRequest(operation=operation, input_data=input_data, result=result)
    db.add(db_req)
    db.commit()
    db.refresh(db_req)
    return db_req

def get_requests(db: Session, skip: int = 0, limit: int = 10):
    return db.query(models.MathRequest).offset(skip).limit(limit).all()


def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_pw = utils.get_password_hash(user.password)
    db_user = models.User(username=user.username, hashed_password=hashed_pw)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user