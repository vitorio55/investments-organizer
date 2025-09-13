# Use Python slim para imagem mais leve
FROM python:3.11-slim

# Diretório de trabalho
WORKDIR /app

# Copia os arquivos de dependências
COPY app/requirements.txt .

# Instala dependências
RUN pip install --no-cache-dir -r requirements.txt

# Copia os arquivos da aplicação
COPY ./app ./app

# Expõe a porta 8000
EXPOSE 8000

# Comando para iniciar a aplicação
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
