#!/bin/bash

# SeniorSimple Development Server Manager
# This script provides a reliable way to start and manage the development server

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/Users/funkyfortress/Documents/01-ALL DOCUMENTS/05 - Projects/CallReady/17-Web-Applications/03-SeniorSimple"
PORT=3000
PID_FILE="$PROJECT_DIR/.dev-server.pid"
LOG_FILE="$PROJECT_DIR/.dev-server.log"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[$(date '+%H:%M:%S')]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[$(date '+%H:%M:%S')]${NC} $1"
}

print_error() {
    echo -e "${RED}[$(date '+%H:%M:%S')]${NC} $1"
}

# Function to check if server is running
is_server_running() {
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        if ps -p "$pid" > /dev/null 2>&1; then
            return 0
        else
            rm -f "$PID_FILE"
            return 1
        fi
    fi
    return 1
}

# Function to start the server
start_server() {
    print_status "Starting SeniorSimple development server..."
    
    # Kill any existing processes
    pkill -f "next dev" 2>/dev/null || true
    pkill -f "node.*next" 2>/dev/null || true
    
    # Clear port
    lsof -ti:$PORT | xargs kill -9 2>/dev/null || true
    
    # Navigate to project directory
    cd "$PROJECT_DIR"
    
    # Start the server in background
    nohup npm run dev > "$LOG_FILE" 2>&1 &
    local pid=$!
    
    # Save PID
    echo $pid > "$PID_FILE"
    
    print_success "Server started with PID: $pid"
    print_status "Logs: $LOG_FILE"
    print_status "URL: http://localhost:$PORT"
    
    # Wait a moment and check if it's responding
    sleep 5
    
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT | grep -q "200"; then
        print_success "✅ Server is responding on http://localhost:$PORT"
    else
        print_warning "⚠️  Server started but not responding yet. Check logs: $LOG_FILE"
    fi
}

# Function to stop the server
stop_server() {
    print_status "Stopping SeniorSimple development server..."
    
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        if ps -p "$pid" > /dev/null 2>&1; then
            kill $pid
            print_success "Server stopped (PID: $pid)"
        else
            print_warning "Server was not running"
        fi
        rm -f "$PID_FILE"
    fi
    
    # Kill any remaining processes
    pkill -f "next dev" 2>/dev/null || true
    pkill -f "node.*next" 2>/dev/null || true
}

# Function to show server status
show_status() {
    if is_server_running; then
        local pid=$(cat "$PID_FILE")
        print_success "✅ Server is running (PID: $pid)"
        print_status "URL: http://localhost:$PORT"
        print_status "Logs: $LOG_FILE"
        
        # Check if responding
        if curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT | grep -q "200"; then
            print_success "✅ Server is responding"
        else
            print_warning "⚠️  Server is running but not responding"
        fi
    else
        print_error "❌ Server is not running"
    fi
}

# Function to show logs
show_logs() {
    if [ -f "$LOG_FILE" ]; then
        print_status "Showing last 20 lines of server logs:"
        echo "----------------------------------------"
        tail -20 "$LOG_FILE"
        echo "----------------------------------------"
        print_status "Full logs: $LOG_FILE"
    else
        print_error "No log file found"
    fi
}

# Function to restart the server
restart_server() {
    print_status "Restarting SeniorSimple development server..."
    stop_server
    sleep 2
    start_server
}

# Main script logic
case "${1:-start}" in
    start)
        if is_server_running; then
            print_warning "Server is already running"
            show_status
        else
            start_server
        fi
        ;;
    stop)
        stop_server
        ;;
    restart)
        restart_server
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs}"
        echo ""
        echo "Commands:"
        echo "  start   - Start the development server (default)"
        echo "  stop    - Stop the development server"
        echo "  restart - Restart the development server"
        echo "  status  - Show server status"
        echo "  logs    - Show recent server logs"
        exit 1
        ;;
esac


