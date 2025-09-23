from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from logic import router 

app = FastAPI(title="VAT RETURN API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://vat-management-system-choma.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
