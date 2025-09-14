import logging
from contextlib import asynccontextmanager
from datetime import datetime

from fastapi import FastAPI, HTTPException, Query
from bson import ObjectId

from seed.cri import load_cri_seed_investments
from seed.lca import load_lca_seed_investments
from database import investments_collection
from entity.investment import Investment
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

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

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- Routes ---
@app.post("/investments")
def register_investment(investment: Investment):
    investment_dict = investment.model_dump()
    investment_dict["acquisition_date"] = datetime.combine(investment.acquisition_date, datetime.min.time())
    investment_dict["maturity_date"] = datetime.combine(investment.maturity_date, datetime.min.time())

    result = investments_collection.insert_one(investment_dict)

    if not result.acknowledged:
        raise HTTPException(status_code=500, detail="Error saving investment.")

    return {"id": str(result.inserted_id), "msg": "Investment saved successfully!"}


@app.get("/investments/statistics")
def calculate_statistics():
    try:
        cursor = investments_collection.find()

        investments = []
        sum = 0.0

        for inv in cursor:
            investment = {
                "id": str(inv["_id"]),
                "name": inv.get("name", ""),
                "amount": float(inv.get("amount", 0)),
                "type": inv.get("type", ""),
                "acquisition_date": str(inv.get("acquisition_date", 0)),
                "maturity_date": str(inv.get("maturity_date", 0)),
            }

            sum += investment["amount"]
            investments.append(investment)

        return {
            "sum": sum,
            "investments": investments
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating investment statistics: {str(e)}")


@app.get("/investments/monthly")
def get_investments_by_month(
    year: int = Query(..., ge=1900),
    month: int = Query(..., ge=1, le=12)
):
    try:
        start_date = datetime(year, month, 1)
        if month == 12:
            end_date = datetime(year + 1, 1, 1)
        else:
            end_date = datetime(year, month + 1, 1)

        investments_cursor = investments_collection.find({
            "maturity_date": {"$gte": start_date, "$lt": end_date}
        })

        investments = []
        for inv in investments_cursor:
            inv["id"] = str(inv["_id"])
            del inv["_id"]
            investments.append(inv)

        return {"year": year, "month": month, "investments": investments}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching monthly investments: {str(e)}")


@app.get("/investments/{investment_id}")
def get_investment(investment_id: str):
    if not ObjectId.is_valid(investment_id):
        raise HTTPException(status_code=400, detail="Invalid investment ID.")

    investment = investments_collection.find_one({"_id": ObjectId(investment_id)})
    if not investment:
        raise HTTPException(status_code=404, detail="Investment not found.")

    # Convert ObjectId to string for JSON serialization
    investment["id"] = str(investment["_id"])
    del investment["_id"]

    return investment


@app.get("/investments")
def list_investments(skip: int = Query(0, ge=0), limit: int = Query(10, ge=1)):
    """
    List investments with pagination.
    - skip: number of documents to skip
    - limit: max number of documents to return
    """
    investments_cursor = investments_collection.find().skip(skip).limit(limit)
    investments = []

    for inv in investments_cursor:
        inv["id"] = str(inv["_id"])
        del inv["_id"]
        investments.append(inv)

    return {
        "skip": skip,
        "limit": limit,
        "total": investments_collection.count_documents({}),
        "investments": investments
    }


@app.delete("/investments")
def delete_all_investments():
    result = investments_collection.delete_many({})

    if result.deleted_count == 0:
        return {"msg": "No investments found for deletion."}

    return {"msg": f"{result.deleted_count} investment(s) deleted successfully."}


@app.delete("/investments/{investment_id}")
def delete_investment(investment_id: str):
    try:
        obj_id = ObjectId(investment_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid ID.")

    result = investments_collection.delete_one({"_id": obj_id})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Investment not found.")

    return {"msg": "Investment deleted successfully."}