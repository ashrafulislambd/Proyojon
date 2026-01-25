@echo off
set PGPASSWORD=kolarmocha
set DB_NAME=proyojon_db
set PGUSER=postgres

echo Creating Database %DB_NAME%...
createdb %DB_NAME%

echo Executing Schema...
psql -d %DB_NAME% -f sql/schema.sql

echo Executing Constraints...
psql -d %DB_NAME% -f sql/constraints.sql

echo Executing Seed Data...
psql -d %DB_NAME% -f sql/seed.sql

echo Executing Functions...
psql -d %DB_NAME% -f sql/functions.sql

echo Executing Procedures...
psql -d %DB_NAME% -f sql/procedures.sql

echo Executing Triggers...
psql -d %DB_NAME% -f sql/triggers.sql

echo Executing Views...
psql -d %DB_NAME% -f sql/views.sql

echo Setup Completed.
