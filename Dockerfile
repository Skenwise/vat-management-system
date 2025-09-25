# Base image: Ubuntu 20.04
FROM ubuntu:20.04

# Environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV ACCEPT_EULA=Y
ENV DEBIAN_FRONTEND=noninteractive
ENV SA_PASSWORD=DemoPassword123!
ENV MSSQL_PID=Express

# Install system dependencies + Python 3 + pip + SQL Server dependencies
RUN apt-get update && \
    apt-get install -y \
        python3 \
        python3-pip \
        python3-dev \
        curl \
        gnupg2 \
        apt-transport-https \
        unixodbc-dev \
        build-essential \
        libgssapi-krb5-2 \
        libssl1.1 \
        libssl-dev \
        libcurl4 \
        libunwind8 \
        supervisor && \
    rm -rf /var/lib/apt/lists/*

# Add Microsoft repo and install ODBC 17 + SQL Server
RUN curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add - && \
    curl https://packages.microsoft.com/config/ubuntu/20.04/prod.list > /etc/apt/sources.list.d/mssql-release.list && \
    curl https://packages.microsoft.com/config/ubuntu/20.04/mssql-server-2022.list > /etc/apt/sources.list.d/mssql-server-2022.list && \
    apt-get update && \
    ACCEPT_EULA=Y apt-get install -y msodbcsql17 mssql-tools mssql-server

# Create mssql user and set permissions
RUN /opt/mssql/bin/mssql-conf setup accept-eula

# Set working directory
WORKDIR /app

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN python3 -m pip install --no-cache-dir -r requirements.txt

# Copy app code and database scripts
COPY . .
COPY script.sql /script.sql
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY start-services.sh /start-services.sh
RUN chmod +x /start-services.sh

# Expose FastAPI port
EXPOSE 8000

# Start both services
CMD ["/start-services.sh"]