import logging
from contextlib import asynccontextmanager
from datetime import datetime

from fastapi import FastAPI, HTTPException, Query
from bson import ObjectId

from seed.cri import carregar_investimentos_exemplo_cri
from seed.lca import carregar_investimentos_exemplo_lca
from database import investimentos_collection
from entity.investimento import Investimento
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Iniciando o carregamento de investimentos de exemplo...")

    try:
        carregar_investimentos_exemplo_cri()
        carregar_investimentos_exemplo_lca()
        logger.info("Investimentos de exemplo carregados com sucesso!")
    except Exception as e:
        logger.error(f"Erro ao carregar investimentos de exemplo: {e}")

    yield # Após = shutdown

    logger.info("Aplicação finalizando. Cleanup se necessário.")


app = FastAPI(title="API de Investimentos", lifespan=lifespan)
app.mount("/frontend", StaticFiles(directory="frontend", html=True), name="frontend")

# OBS Somente uso local
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # para testar localmente
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuração básica do logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# --- Rotas ---
@app.post("/investimentos")
def criar_investimento(investimento: Investimento):
    # Converte o Pydantic model para dicionário (Pydantic v2)
    investimento_dict = investimento.model_dump()
    investimento_dict["data_aquisicao"] = datetime.combine(investimento.data_aquisicao, datetime.min.time())
    investimento_dict["data_vencimento"] = datetime.combine(investimento.data_vencimento, datetime.min.time())

    # Insere no MongoDB
    result = investimentos_collection.insert_one(investimento_dict)

    if not result.acknowledged:
        raise HTTPException(status_code=500, detail="Erro ao salvar investimento")

    return {"id": str(result.inserted_id), "msg": "Investimento salvo com sucesso"}


@app.get("/investimentos/estatisticas")
def calcular_estatisticas():
    try:
        cursor = investimentos_collection.find()

        investimentos = []
        soma = 0.0

        for inv in cursor:
            investimento = {
                "id": str(inv["_id"]),
                "nome": inv.get("nome", ""),
                "quantia": float(inv.get("quantia", 0)),
                "tipo": inv.get("tipo", ""),
                "data_aquisicao": str(inv.get("data_aquisicao", 0)),
                "data_vencimento": str(inv.get("data_vencimento", 0)),
            }

            soma += investimento["quantia"]
            investimentos.append(investimento)

        return {
            "soma": soma,
            "investimentos": investimentos
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao calcular estatísticas: {str(e)}")


@app.get("/investimentos/{investimento_id}")
def buscar_investimento(investimento_id: str):
    if not ObjectId.is_valid(investimento_id):
        raise HTTPException(status_code=400, detail="ID de investimento inválido")

    investimento = investimentos_collection.find_one({"_id": ObjectId(investimento_id)})
    if not investimento:
        raise HTTPException(status_code=404, detail="Investimento não encontrado")

    # Converte ObjectId para string para serialização JSON
    investimento["id"] = str(investimento["_id"])
    del investimento["_id"]

    return investimento


@app.get("/investimentos")
def listar_investimentos(skip: int = Query(0, ge=0), limit: int = Query(10, ge=1)):
    """
    Lista todos os investimentos com paginação.
    - skip: número de documentos a pular
    - limit: número máximo de documentos a retornar
    """
    investimentos_cursor = investimentos_collection.find().skip(skip).limit(limit)
    investimentos = []

    for inv in investimentos_cursor:
        inv["id"] = str(inv["_id"])
        del inv["_id"]
        investimentos.append(inv)

    return {
        "skip": skip,
        "limit": limit,
        "total": investimentos_collection.count_documents({}),
        "investimentos": investimentos
    }


@app.delete("/investimentos")
def apagar_todos_investimentos():
    result = investimentos_collection.delete_many({})  # deleta todos os documentos

    if result.deleted_count == 0:
        return {"msg": "Nenhum investimento encontrado para apagar"}

    return {"msg": f"{result.deleted_count} investimento(s) apagado(s) com sucesso"}


@app.delete("/investimentos/{investimento_id}")
def deletar_investimento(investimento_id: str):
    try:
        obj_id = ObjectId(investimento_id)
    except:
        raise HTTPException(status_code=400, detail="ID inválido")

    result = investimentos_collection.delete_one({"_id": obj_id})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Investimento não encontrado")

    return {"msg": "Investimento deletado com sucesso"}