# Proyojon Database Setup Script
$DB_NAME = "proyojon_db"

Write-Host "Setting up Proyojon Database..." -ForegroundColor Cyan

# 1. Create Database
Write-Host "Creating Database '$DB_NAME'..."
createdb $DB_NAME 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "Database created." -ForegroundColor Green
} else {
    Write-Host "Database might already exist (ignoring error)." -ForegroundColor Yellow
}

# 2. Run SQL Files
$files = @(
    "sql/schema.sql",
    "sql/constraints.sql",
    "sql/seed.sql",
    "sql/functions.sql",
    "sql/procedures.sql",
    "sql/triggers.sql",
    "sql/views.sql"
)

foreach ($file in $files) {
    Write-Host "Executing $file..."
    psql -d $DB_NAME -f $file
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error executing $file" -ForegroundColor Red
        exit 1
    }
}

Write-Host "------------------------------------------------" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "You can now run the complex queries using:"
Write-Host "psql -d $DB_NAME -f sql/queries.sql" -ForegroundColor Yellow
Write-Host "------------------------------------------------" -ForegroundColor Cyan
