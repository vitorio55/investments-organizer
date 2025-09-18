from enum import Enum

class InvestmentType(str, Enum):
    CDB = "CDB"
    CRA = "CRA"
    CRI = "CRI"
    LCA = "LCA"
    LCI = "LCI"
    DEBENTURE = "Debenture"
    TESOURO_DIRETO = "TesouroDireto"
    FUNDO_DE_INVESTIMENTO = "FundoDeInvestimento"
    MOEDA = "Moeda"
