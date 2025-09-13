from pydantic import BaseModel
from datetime import date
from typing import List

from entity.tipo_investimento import TipoInvestimento
from entity.pagamento_periodico import PagamentoPeriodico


class Investimento(BaseModel):
    nome: str
    tipo: TipoInvestimento
    data_aquisicao: date
    data_vencimento: date
    quantia: float
    pagamentos_periodicos: List[PagamentoPeriodico] = []  # default vazio
