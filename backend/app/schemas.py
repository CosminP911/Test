from datetime import datetime
from pydantic import BaseModel

class RequestBase(BaseModel):
    operation: str
    input_data: str

class RequestCreate(RequestBase):
    pass

class Request(RequestBase):
    id: int
    result: float
    timestamp: datetime 

    class Config:
        orm_mode = True


class UserCreate(BaseModel):
    username: str
    password: str

class UserRead(BaseModel):
    id: int
    username: str

    class Config:
        orm_mode = True
        
class UserRead(BaseModel):
    id: int
    username: str

    class Config:
        orm_mode = True