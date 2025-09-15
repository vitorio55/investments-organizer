import logging
from contextlib import asynccontextmanager
from datetime import datetime

from fastapi import FastAPI, HTTPException, Query
from bson import ObjectId

from seed.cri import load_cri_seed_investments
from seed.lca import load_lca_seed_investments
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from backend.controllers.investments import router as investments_router


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Applying seed investments...")

    try:
        load_cri_seed_investments()
        load_lca_seed_investments()
        logger.info("Seed investments loaded successfully!")
    except Exception as e:
        logger.error(f"Error loading seed investments: {e}")

    yield # After this line = executed on shutdown

    logger.info("App finalized. Add cleanup here if necessary.")


app = FastAPI(title="Investments API", lifespan=lifespan)
app.mount("/frontend", StaticFiles(directory="frontend", html=True), name="frontend")

##### OBS: Only for local tests ########
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
########################################

app.include_router(investments_router)