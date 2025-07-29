from datetime import datetime
from pydantic import BaseModel, field_validator

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

    @field_validator('username', 'password')
    def no_spaces(cls,v,info):
        if v != v.strip():
            raise ValueError(f"{info.field_name} cannot have leading or trailing spaces")
        if ' ' in v:
            raise ValueError(f"{info.field_name} cannot contain spaces")
    
        return v


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