#!/usr/bin/env bash

# DM Numbers Pay - Full Stack Development Script
# Starts all services concurrently: Frontend, Backend, Database, and Blockchain

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
FRONTEND_PORT=${FRONTEND_PORT:-3000}
BACKEND_PORT=${BACKEND_PORT:-3001}
DATABASE_PORT=${DATABASE_PORT:-5432}
REDIS_PORT=${REDIS_PORT:-6379}

# Function to print colored output
print_status() {
    local color=$1
    local service=$2
    local message=$3
    echo -e "${color}[${service}]${NC} ${message}"
}

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to wait for a service to be ready
wait_for_service() {
    local service=$1
    local port=$2
    local max_attempts=30
    local attempt=1
    
    print_status $YELLOW $service "Waiting for service to be ready on port $port..."
    
    while [ $attempt -le $max_attempts ]; do
        if check_port $port; then
            print_status $GREEN $service "Service is ready!"
            return 0
        fi
        
        print_status $YELLOW $service "Attempt $attempt/$max_attempts - Service not ready yet..."
        sleep 2
        ((attempt++))
    done
    
    print_status $RED $service "Service failed to start within expected time"
    return 1
}

# Function to start database
start_database() {
    print_status $BLUE "DATABASE" "Starting PostgreSQL database..."
    
    # Check if database script exists
    if [ -f "db.sh" ]; then
        chmod +x db.sh
        ./db.sh start -n dmnumberspay -p $DATABASE_PORT -f
    elif [ -f "frontend/start-database.sh" ]; then
        cd frontend
        chmod +x start-database.sh
        ./start-database.sh
        cd ..
    else
        print_status $RED "DATABASE" "No database startup script found"
        return 1
    fi
    
    wait_for_service "DATABASE" $DATABASE_PORT
}

# Function to start Redis
start_redis() {
    print_status $PURPLE "REDIS" "Starting Redis..."
    
    # Check if Redis is already running
    if check_port $REDIS_PORT; then
        print_status $GREEN "REDIS" "Redis is already running on port $REDIS_PORT"
        return 0
    fi
    
    # Try to start Redis with Docker
    if command -v docker >/dev/null 2>&1; then
        docker run -d \
            --name dmnumberspay-redis \
            -p $REDIS_PORT:6379 \
            redis:alpine >/dev/null 2>&1 || true
        
        wait_for_service "REDIS" $REDIS_PORT
    else
        print_status $YELLOW "REDIS" "Docker not found, skipping Redis startup"
        print_status $YELLOW "REDIS" "Please ensure Redis is running on port $REDIS_PORT"
    fi
}

# Function to start backend
start_backend() {
    print_status $CYAN "BACKEND" "Starting backend API server..."
    
    cd backend
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ] && [ ! -f "bun.lockb" ]; then
        print_status $YELLOW "BACKEND" "Installing dependencies..."
        bun install
    fi
    
    # Start the backend
    bun run index.ts &
    BACKEND_PID=$!
    
    cd ..
    
    wait_for_service "BACKEND" $BACKEND_PORT
}

# Function to start frontend
start_frontend() {
    print_status $GREEN "FRONTEND" "Starting frontend development server..."
    
    if [ "$(pwd)" != "$(pwd)/frontend" ]; then
        cd frontend
    fi
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ] && [ ! -f "bun.lockb" ]; then
        print_status $YELLOW "FRONTEND" "Installing dependencies..."
        bun install
    fi
    
    # Start the frontend
    bun dev &
    FRONTEND_PID=$!
    
    cd ..
    
    wait_for_service "FRONTEND" $FRONTEND_PORT
}

# Function to setup blockchain (placeholder for now)
setup_blockchain() {
    print_status $PURPLE "BLOCKCHAIN" "Setting up blockchain environment..."
    
    cd blockchain
    
    # Check if Rust is installed
    if ! command -v cargo >/dev/null 2>&1; then
        print_status $YELLOW "BLOCKCHAIN" "Rust/Cargo not found, skipping blockchain setup"
        print_status $YELLOW "BLOCKCHAIN" "Please install Rust: https://rustup.rs/"
        cd ..
        return 0
    fi
    
    # Check if Soroban CLI is installed
    if ! command -v soroban >/dev/null 2>&1; then
        print_status $YELLOW "BLOCKCHAIN" "Soroban CLI not found, installing..."
        curl -sSf https://soroban.stellar.org/install.sh | sh
        export PATH="$HOME/.local/bin:$PATH"
    fi
    
    # Build the contract
    print_status $YELLOW "BLOCKCHAIN" "Building smart contract..."
    cargo build --target wasm32-unknown-unknown --release
    
    cd ..
    
    print_status $GREEN "BLOCKCHAIN" "Blockchain setup completed"
}

# Function to cleanup on exit
cleanup() {
    print_status $YELLOW "CLEANUP" "Shutting down services..."
    
    # Kill background processes
    if [ ! -z "${BACKEND_PID:-}" ]; then
        kill $BACKEND_PID 2>/dev/null || true
        print_status $GREEN "BACKEND" "Stopped"
    fi
    
    if [ ! -z "${FRONTEND_PID:-}" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
        print_status $GREEN "FRONTEND" "Stopped"
    fi
    
    exit 0
}

# Function to show help
show_help() {
    echo "DM Numbers Pay - Development Environment"
    echo "======================================="
    echo
    echo "Usage: $0 [OPTIONS]"
    echo
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  -d, --db-only  Start only database and Redis"
    echo "  -b, --backend  Start only backend services (db + redis + backend)"
    echo "  -f, --frontend Start only frontend"
    echo "  -c, --clean    Clean up containers before starting"
    echo
    echo "Environment Variables:"
    echo "  FRONTEND_PORT  Frontend port (default: 3000)"
    echo "  BACKEND_PORT   Backend port (default: 3001)"
    echo "  DATABASE_PORT  Database port (default: 5432)"
    echo "  REDIS_PORT     Redis port (default: 6379)"
    echo
    echo "Services:"
    echo "  • Frontend (Next.js) - http://localhost:$FRONTEND_PORT"
    echo "  • Backend (Express) - http://localhost:$BACKEND_PORT"
    echo "  • Database (PostgreSQL) - localhost:$DATABASE_PORT"
    echo "  • Redis - localhost:$REDIS_PORT"
    echo "  • Blockchain (Soroban) - Smart contract compilation"
}

# Parse command line arguments
DB_ONLY=false
BACKEND_ONLY=false
FRONTEND_ONLY=false
CLEAN=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -d|--db-only)
            DB_ONLY=true
            shift
            ;;
        -b|--backend)
            BACKEND_ONLY=true
            shift
            ;;
        -f|--frontend)
            FRONTEND_ONLY=true
            shift
            ;;
        -c|--clean)
            CLEAN=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Main execution
main() {
    echo -e "${GREEN}🚀 Starting DM Numbers Pay Development Environment${NC}"
    echo "=================================================="
    echo
    
    # Check if Bun is installed
    if ! command -v bun >/dev/null 2>&1; then
        print_status $RED "ERROR" "Bun is not installed. Please install Bun first:"
        echo "  curl -fsSL https://bun.sh/install | bash"
        exit 1
    fi
    
    # Clean up if requested
    if [ "$CLEAN" = true ]; then
        print_status $YELLOW "CLEANUP" "Cleaning up existing containers..."
        docker stop dmnumberspay-postgres dmnumberspay-redis 2>/dev/null || true
        docker rm dmnumberspay-postgres dmnumberspay-redis 2>/dev/null || true
    fi
    
    # Start database and Redis
    start_database
    start_redis
    
    if [ "$DB_ONLY" = true ]; then
        print_status $GREEN "SUCCESS" "Database and Redis started successfully"
        print_status $GREEN "INFO" "Services running:"
        print_status $GREEN "INFO" "  • Database: localhost:$DATABASE_PORT"
        print_status $GREEN "INFO" "  • Redis: localhost:$REDIS_PORT"
        return 0
    fi
    
    # Setup blockchain
    setup_blockchain
    
    if [ "$BACKEND_ONLY" = true ]; then
        # Start backend
        start_backend
        
        print_status $GREEN "SUCCESS" "Backend services started successfully"
        print_status $GREEN "INFO" "Services running:"
        print_status $GREEN "INFO" "  • Database: localhost:$DATABASE_PORT"
        print_status $GREEN "INFO" "  • Redis: localhost:$REDIS_PORT"
        return 0
    fi
    
    if [ "$FRONTEND_ONLY" = true ]; then
        # Start frontend
        start_frontend
        
        print_status $GREEN "SUCCESS" "Frontend started successfully"
        print_status $GREEN "INFO" "Services running:"
        print_status $GREEN "INFO" "  • Frontend: http://localhost:$FRONTEND_PORT"
        return 0
    fi
    
    # Start all services
    start_backend
    start_frontend
    
    # Final status
    echo
    print_status $GREEN "SUCCESS" "All services started successfully! 🎉"
    echo
    print_status $GREEN "INFO" "Services running:"
    print_status $GREEN "INFO" "  • Frontend: http://localhost:$FRONTEND_PORT"
    print_status $GREEN "INFO" "  • Backend API: http://localhost:$BACKEND_PORT"
    print_status $GREEN "INFO" "  • Database: localhost:$DATABASE_PORT"
    print_status $GREEN "INFO" "  • Redis: localhost:$REDIS_PORT"
    echo
    print_status $YELLOW "INFO" "Press Ctrl+C to stop all services"
    
    # Wait for user interrupt
    wait
}

# Run main function
main "$@"
