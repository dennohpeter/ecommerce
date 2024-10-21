#!/usr/bin/env bash
set -x
set -eo pipefail


if ! [ -x "$(command -v psql)" ]; then
    echo >&2  'Error: psql is not installed.'
    exit 1
fi


# Check if a custom user has been set, otherwise default to 'postgres'
DB_USER=${POSTGRES_USER:=postgres}
# Check if a custom password has been set, otherwise default to 'password'
DB_PASS="${POSTGRES_PASSWORD:=password}"
# Check if a custom database name has been set, otherwise default to 'ecommerce'
DB_NAME="${POSTGRES_DB:=ecommerce}"
# Check if a custom port has been set, otherwise default to '5432'
DB_PORT="${POSTGRES_PORT:=5432}"


# Launch postgres using Docker
docker run \
-e POSTGRES_USER=${DB_USER} \
-e POSTGRES_PASSWORD=${DB_PASS} \
-e POSTGRES_DB=${DB_NAME} \
-p "${DB_PORT}":5432 \
-d postgres \
postgres -N 1000

export PGPASSWORD=${DB_PASS}
until psql -h "localhost" -U "${DB_USER}" -p "${DB_PORT}" -d "postgres" -c '\q'; do
    >&2 echo "Postgres is still unavailable - sleeping"
    sleep 1
done

>&2 echo "Postgres is up and running on port ${DB_PORT} - executing command"

# Load schema

