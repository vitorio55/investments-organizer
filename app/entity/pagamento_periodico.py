from pydantic import BaseModel
from datetime import date
from enum import Enum

class TipoEntrada(str, Enum):
    juros = "juros"
    amortizacao = "amortizacao"

class PagamentoPeriodico(BaseModel):
    tipo: TipoEntrada
    quantia: float
    data: date