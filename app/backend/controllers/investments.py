from fastapi import APIRouter, HTTPException, Query
from bson import ObjectId
from datetime import datetime
from database import investments_collection
from entity.investment import Investment
from entity.periodic_payment import EntryType

router = APIRouter(prefix="/investments", tags=["Investments"])

@router.get("/statistics")
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


@router.post("/")
def register_investment(investment: Investment):
    investment_dict = investment.model_dump()
    investment_dict["acquisition_date"] = datetime.combine(investment.acquisition_date, datetime.min.time())
    investment_dict["maturity_date"] = datetime.combine(investment.maturity_date, datetime.min.time())

    result = investments_collection.insert_one(investment_dict)
    if not result.acknowledged:
        raise HTTPException(status_code=500, detail="Error saving investment.")
    return {"id": str(result.inserted_id), "msg": "Investment saved successfully!"}


@router.get("/monthly")
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
        total_interest = 0.0
        total_amortization = 0.0
        total_amount = 0.0

        for inv in investments_cursor:
            inv["id"] = str(inv["_id"])
            del inv["_id"]

            for payment in inv.get("periodic_payments", []):
                if payment["type"] == EntryType.INTEREST:
                    total_interest += float(payment.get("amount", 0.0))
                elif payment["type"] == EntryType.AMORTIZATION:
                    total_amortization += float(payment.get("amount", 0.0))

            total_amount += inv.get("amount", 0.0)
            investments.append(inv)

        return {
            "year": year,
            "month": month,
            "investments": investments,
            "total_interest": total_interest,
            "total_amortization": total_amortization,
            "total_maturity_amount": total_amount,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching monthly investments: {str(e)}")


@router.get("/{investment_id}")
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


@router.get("/")
def list_investments(skip: int = Query(0, ge=0), limit: int = Query(10, ge=1)):
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


@router.delete("/")
def delete_all_investments():
    result = investments_collection.delete_many({})

    if result.deleted_count == 0:
        return {"msg": "No investments found for deletion."}

    return {"msg": f"{result.deleted_count} investment(s) deleted successfully."}


@router.delete("/{investment_id}")
def delete_investment(investment_id: str):
    try:
        obj_id = ObjectId(investment_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid ID.")

    result = investments_collection.delete_one({"_id": obj_id})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Investment not found.")

    return {"msg": "Investment deleted successfully."}
