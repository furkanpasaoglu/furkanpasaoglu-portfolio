# syntax=docker/dockerfile:1

# ── Build stage ───────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:9.0-alpine AS build
WORKDIR /src

# Copy csproj and restore first for better layer caching
COPY Portfolio.Api.csproj ./
RUN dotnet restore

# Copy the rest and publish
COPY . .
RUN dotnet publish -c Release -o /app /p:UseAppHost=false

# ── Runtime stage ─────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:9.0-alpine AS runtime
WORKDIR /app

COPY --from=build /app ./
RUN mkdir -p /app/uploads

ARG GIT_SHA=unknown
ARG BUILD_TIME=unknown

ENV ASPNETCORE_URLS=http://+:8080 \
    ASPNETCORE_ENVIRONMENT=Production \
    DOTNET_RUNNING_IN_CONTAINER=true \
    APP_GIT_SHA=${GIT_SHA} \
    APP_BUILD_TIME=${BUILD_TIME}

EXPOSE 8080

ENTRYPOINT ["dotnet", "Portfolio.Api.dll"]
