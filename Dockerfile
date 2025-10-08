# Stage 1: Build frontend
FROM node:20 AS frontend-builder
WORKDIR /app/frontend/vat-dashboard

# Copy package.json and install dependencies
COPY frontend/vat-dashboard/package*.json ./
RUN npm install

# Copy frontend code and build
COPY frontend/vat-dashboard/ ./
RUN npm run build

# Stage 2: Backend + Nginx
FROM python:3.11-slim

# Install prerequisites + ODBC + Nginx
RUN apt-get update && apt-get install -y \
    curl \
    gnupg2 \
    apt-transport-https \
    unixodbc \
    unixodbc-dev \
    libgssapi-krb5-2 \
    build-essential \
    nginx \
    && rm -rf /var/lib/apt/lists/*

# Remove default Nginx site
RUN rm -f /etc/nginx/sites-enabled/default

# Add Microsoft repo + install ODBC driver
RUN curl -sSL https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor -o /usr/share/keyrings/microsoft.gpg \
    && echo "deb [arch=amd64 signed-by=/usr/share/keyrings/microsoft.gpg] https://packages.microsoft.com/debian/11/prod bullseye main" \
    > /etc/apt/sources.list.d/mssql-release.list \
    && apt-get update \
    && ACCEPT_EULA=Y apt-get install -y msodbcsql17 mssql-tools \
    && rm -rf /var/lib/apt/lists/*

# Set workdir
WORKDIR /app/backend

# Copy backend code
COPY backend/ . 

# Install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy built frontend from builder stage
COPY --from=frontend-builder /app/frontend/vat-dashboard/build /usr/share/nginx/html

# Copy Nginx config
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Copy start script and make executable
COPY start-services.sh .
RUN chmod +x start-services.sh

# Expose ports
EXPOSE 80 8000

# Start both backend and frontend
CMD ["./start-services.sh"]