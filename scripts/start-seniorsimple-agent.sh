#!/bin/bash

# 🤖 SeniorSimple Auto-Start Agent
# This script automatically starts the SeniorSimple development server

echo "🤖 Starting SeniorSimple Auto-Start Agent..."

# Configuration
SENIORSIMPLE_DIR="/Users/funkyfortress/Documents/01-ALL DOCUMENTS/05 - Projects/CallReady/02-Product-Offers/02-Production-Systems/web-applications/02-SeniorSimple-Platform 2/03-SeniorSimple"
PORT=3010
URL="http://localhost:$PORT"

# Function to log with emoji
log() {
    echo "🤖 $1"
}

# Function to check if directory exists
check_directory() {
    if [ -d "$SENIORSIMPLE_DIR" ]; then
        log "✅ Found SeniorSimple directory: $SENIORSIMPLE_DIR"
        return 0
    else
        log "❌ SeniorSimple directory not found: $SENIORSIMPLE_DIR"
        return 1
    fi
}

# Function to check if dependencies are installed
check_dependencies() {
    if [ -d "$SENIORSIMPLE_DIR/node_modules" ]; then
        log "✅ Dependencies already installed"
        return 0
    else
        log "📦 Installing dependencies..."
        cd "$SENIORSIMPLE_DIR" || exit 1
        if npm install; then
            log "✅ Dependencies installed successfully"
            return 0
        else
            log "❌ Failed to install dependencies"
            return 1
        fi
    fi
}

# Function to check if server is already running
check_server_running() {
    if curl --output /dev/null --silent --head --fail "$URL" 2>/dev/null; then
        log "✅ Server is already running on $URL"
        return 0
    else
        return 1
    fi
}

# Function to start the development server
start_server() {
    # Check if server is already running
    if check_server_running; then
        log "🎉 SeniorSimple is already running on $URL"
        return 0
    fi
    
    log "🚀 Starting SeniorSimple server on port $PORT..."
    cd "$SENIORSIMPLE_DIR" || exit 1
    
    # Start server in background
    npm run dev -- -p $PORT &
    SERVER_PID=$!
    
    # Wait for server to start
    log "⏳ Waiting for server to start..."
    sleep 10
    
    # Check if server is running
    if check_server_running; then
        log "✅ Server started successfully on $URL"
        return 0
    else
        log "❌ Server failed to start"
        return 1
    fi
}

# Function to open browser
open_browser() {
    log "🌐 Opening browser to $URL"
    if command -v open >/dev/null 2>&1; then
        open "$URL"
        log "✅ Browser opened successfully"
    else
        log "⚠️ Could not open browser automatically"
        log "Please navigate to $URL manually"
    fi
}

# Function to provide testing instructions
provide_instructions() {
    log "📋 Testing Instructions:"
    echo ""
    echo "🎯 Next Steps:"
    echo "1. Wait for 'Ready in Xms' message in the terminal"
    echo "2. Navigate to $URL in your browser"
    echo "3. Open browser console (F12 or Cmd+Option+I)"
    echo "4. Run the crawler script to test your fixes"
    echo ""
    echo "🕷️ Crawler Testing:"
    echo "- Use /crawl-test command in Cursor"
    echo "- Or copy the crawler script from the terminal"
    echo "- Test all 6 category pages: /retirement, /housing, /health, /estate, /tax, /insurance"
    echo ""
    echo "✅ Expected Results:"
    echo "- All category pages should load without 404 errors"
    echo "- Mobile menu should be detected"
    echo "- Touch targets should be properly sized"
    echo "- CallReady tracking elements should be present"
    echo ""
}

# Function to handoff to testing agents
handoff_to_testing_agents() {
    echo ""
    echo "🤖 ==============================================="
    echo "🤖 CREWAI TESTING AGENTS - HANDOFF OPTIONS"
    echo "🤖 ==============================================="
    echo ""
    log "🚀 Choose your next testing agent:"
    echo ""
    echo "1️⃣  🕷️  CRAWLER AGENT (Recommended First)"
    echo "    Command: /crawl-test-seniorsimple"
    echo "    Tests: Broken links, UX issues, performance"
    echo ""
    echo "2️⃣  🔌 API VALIDATION AGENT"
    echo "    Command: /api-test"
    echo "    Tests: API endpoints, CallReady integrations"
    echo ""
    echo "3️⃣  📝 FORM SUBMISSION AGENT"
    echo "    Command: /form-test"
    echo "    Tests: Form functionality, Supabase integration"
    echo ""
    echo "4️⃣  🧪 QUIZ FLOW AGENT"
    echo "    Command: /quiz-flow-testing"
    echo "    Tests: Complete quiz flow, OTP verification"
    echo ""
    echo "5️⃣  🔄 RUN ALL AGENTS (Comprehensive Suite)"
    echo "    Command: /run-all-testing-agents"
    echo "    Tests: All 4 agents in sequence automatically"
    echo ""
    echo "6️⃣  🚀 QUICK START (Recommended)"
    echo "    Command: /crawl-test-seniorsimple"
    echo "    Tests: Start with comprehensive site analysis"
    echo ""
    echo "🤖 ==============================================="
    echo ""
    log "💡 RECOMMENDED WORKFLOW:"
    echo "   Option A: /run-all-testing-agents (run all automatically)"
    echo "   Option B: /crawl-test-seniorsimple (start with site analysis)"
    echo ""
    log "🎯 Ready to continue with testing agents!"
    echo ""
}

# Main execution
main() {
    log "🚀 Starting SeniorSimple Auto-Start Agent..."
    
    # Step 1: Check directory
    if ! check_directory; then
        exit 1
    fi
    
    # Step 2: Check dependencies
    if ! check_dependencies; then
        exit 1
    fi
    
    # Step 3: Start server (or detect if already running)
    if ! start_server; then
        exit 1
    fi
    
    # Step 4: Open browser
    open_browser
    
    # Step 5: Provide instructions
    provide_instructions
    
    log "🎉 SeniorSimple Auto-Start Agent completed successfully!"
    log "🌐 Server running at: $URL"
    log "🕷️ Ready for crawler testing!"
    
    # Step 6: Handoff to testing agents
    handoff_to_testing_agents
    
    # If we started a new server, keep the script running
    if [ -n "$SERVER_PID" ] && kill -0 $SERVER_PID 2>/dev/null; then
        log "🔄 Server is running in the background. Press Ctrl+C to stop."
        wait $SERVER_PID
    else
        log "✅ Server is already running. You can now test with /crawl-test-seniorsimple"
    fi
}

# Run main function
main "$@"
