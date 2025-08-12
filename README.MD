# Math Microservice

## Overview

This project implements a Python-based microservice (FastAPI) that exposes mathematical operations (power, Fibonacci, factorial) via an API, with a React-based frontend.

- **Backend**: FastAPI, SQLite (persisting API requests)
- **Frontend**: React, JS
- **Communication**: REST API
- **Containerization**: Docker
- **Extras**: Pydantic for serialization, sample Click CLI

## How to Run

1. `docker-compose up --build`
2. Access the frontend at [http://localhost:3000](http://localhost:3000)
3. API endpoints at [http://localhost:8000/docs](http://localhost:8000/docs)

cd backend 
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000


cd frontend
npm install
npm start 
## Extensibility

The app follows MVC patterns, cleanly separates models, schemas, and logic, and can be extended for new operations or additional microservices.

## Authors

- Cosmin-Gabriel Petriuc