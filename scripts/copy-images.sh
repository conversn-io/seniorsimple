#!/bin/bash

# Image Copy Script for SeniorSimple Site
# This script helps copy images from the source folder to the organized structure

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

# Source directory
SOURCE_DIR="/Users/funkyfortress/Documents/01-ALL DOCUMENTS/05 - Projects/RetireSafe/senior photos"

# Function to copy hero image
copy_hero_image() {
    local source_file=$1
    local target_name=${2:-"senior-couple.jpg"}
    
    print_header "Copying Hero Image"
    
    local target_file="frontends/seniorsimple-site/public/images/hero/$target_name"
    
    if [ -f "$source_file" ]; then
        cp "$source_file" "$target_file"
        print_status "Hero image copied: $target_file"
        
        # Get file size
        local size=$(($(stat -f%z "$target_file") / 1024))
        print_status "File size: ${size}KB"
        
        echo ""
        echo "To activate this image, uncomment the Image component in your homepage:"
        echo "src=\"/images/hero/$target_name\""
    else
        print_error "Source file not found: $source_file"
        return 1
    fi
}

# Function to copy topic image
copy_topic_image() {
    local source_file=$1
    local topic_name=$2
    
    print_header "Copying Topic Image: $topic_name"
    
    local target_file="frontends/seniorsimple-site/public/images/topics/$topic_name.jpg"
    
    if [ -f "$source_file" ]; then
        cp "$source_file" "$target_file"
        print_status "Topic image copied: $target_file"
        
        # Get file size
        local size=$(($(stat -f%z "$target_file") / 1024))
        print_status "File size: ${size}KB"
        
        echo ""
        echo "To use this image in your TopicCard component:"
        echo "imagePath=\"/images/topics/$topic_name.jpg\""
        echo "imageAlt=\"$topic_name illustration\""
    else
        print_error "Source file not found: $source_file"
        return 1
    fi
}

# Function to list available images
list_available_images() {
    print_header "Available Images in Source Directory"
    
    if [ -d "$SOURCE_DIR" ]; then
        echo "📁 Source directory: $SOURCE_DIR"
        echo ""
        echo "Available image files:"
        find "$SOURCE_DIR" -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.webp" \) 2>/dev/null | while read file; do
            local filename=$(basename "$file")
            local size=$(($(stat -f%z "$file" 2>/dev/null) / 1024))
            echo "  📄 $filename (${size}KB)"
        done
    else
        print_error "Source directory not found: $SOURCE_DIR"
        echo ""
        echo "Please ensure the source directory exists and is accessible."
    fi
}

# Function to show help
show_help() {
    echo "Image Copy Script for SeniorSimple Site"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  hero <source_file> [target_name]     Copy hero image"
    echo "  topic <source_file> <topic>          Copy topic image"
    echo "  list                                 List available images"
    echo "  help                                 Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 hero \"$SOURCE_DIR/hero-image.jpg\""
    echo "  $0 topic \"$SOURCE_DIR/annuities.jpg\" annuities"
    echo "  $0 list"
    echo ""
    echo "Note: Replace the source file paths with actual file names from your source directory."
}

# Main script logic
case "$1" in
    "hero")
        if [ -z "$2" ]; then
            print_error "Source file required"
            echo "Usage: $0 hero <source_file> [target_name]"
            exit 1
        fi
        copy_hero_image "$2" "$3"
        ;;
    "topic")
        if [ -z "$2" ] || [ -z "$3" ]; then
            print_error "Source file and topic name required"
            echo "Usage: $0 topic <source_file> <topic_name>"
            exit 1
        fi
        copy_topic_image "$2" "$3"
        ;;
    "list")
        list_available_images
        ;;
    "help"|"--help"|"-h")
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo "Use '$0 help' for usage information"
        exit 1
        ;;
esac
