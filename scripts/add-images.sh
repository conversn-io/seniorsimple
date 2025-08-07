#!/bin/bash

# Image Management Script for SeniorSimple Site
# This script helps add and organize images for the Next.js frontend

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

# Function to check if file exists
file_exists() {
    if [ -f "$1" ]; then
        return 0
    else
        return 1
    fi
}

# Function to get file size in KB
get_file_size() {
    local file=$1
    if file_exists "$file"; then
        echo $(($(stat -f%z "$file") / 1024))
    else
        echo 0
    fi
}

# Function to validate image file
validate_image() {
    local file=$1
    local max_size=$2
    
    if ! file_exists "$file"; then
        print_error "File not found: $file"
        return 1
    fi
    
    local size=$(get_file_size "$file")
    local extension=$(echo "$file" | tr '[:upper:]' '[:lower:]' | sed 's/.*\.//')
    
    # Check file extension
    case $extension in
        jpg|jpeg|png|webp|svg)
            ;;
        *)
            print_error "Unsupported file format: $extension"
            return 1
            ;;
    esac
    
    # Check file size
    if [ $size -gt $max_size ]; then
        print_warning "File size ($size KB) exceeds recommended size ($max_size KB)"
        read -p "Continue anyway? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            return 1
        fi
    fi
    
    return 0
}

# Function to add hero image
add_hero_image() {
    local source_file=$1
    local target_name=${2:-"senior-couple.jpg"}
    
    print_header "Adding Hero Image"
    
    if ! validate_image "$source_file" 200; then
        return 1
    fi
    
    local target_dir="frontends/seniorsimple-site/public/images/hero"
    local target_file="$target_dir/$target_name"
    
    # Create directory if it doesn't exist
    mkdir -p "$target_dir"
    
    # Copy file
    cp "$source_file" "$target_file"
    
    print_status "Hero image added: $target_file"
    print_status "File size: $(get_file_size "$target_file") KB"
    
    echo ""
    echo "To use this image in your homepage, uncomment the Image component:"
    echo "src=\"/images/hero/$target_name\""
}

# Function to add topic image
add_topic_image() {
    local source_file=$1
    local topic_name=$2
    
    print_header "Adding Topic Image: $topic_name"
    
    if ! validate_image "$source_file" 100; then
        return 1
    fi
    
    local target_dir="frontends/seniorsimple-site/public/images/topics"
    local target_file="$target_dir/$topic_name.jpg"
    
    # Create directory if it doesn't exist
    mkdir -p "$target_dir"
    
    # Copy file
    cp "$source_file" "$target_file"
    
    print_status "Topic image added: $target_file"
    print_status "File size: $(get_file_size "$target_file") KB"
    
    echo ""
    echo "To use this image in your TopicCard component:"
    echo "imagePath=\"/images/topics/$topic_name.jpg\""
    echo "imageAlt=\"$topic_name illustration\""
}

# Function to add testimonial image
add_testimonial_image() {
    local source_file=$1
    local testimonial_number=${2:-"1"}
    
    print_header "Adding Testimonial Image"
    
    if ! validate_image "$source_file" 50; then
        return 1
    fi
    
    local target_dir="frontends/seniorsimple-site/public/images/testimonials"
    local target_file="$target_dir/testimonial-$testimonial_number.jpg"
    
    # Create directory if it doesn't exist
    mkdir -p "$target_dir"
    
    # Copy file
    cp "$source_file" "$target_file"
    
    print_status "Testimonial image added: $target_file"
    print_status "File size: $(get_file_size "$target_file") KB"
    
    echo ""
    echo "To use this image in your testimonials:"
    echo "src=\"/images/testimonials/testimonial-$testimonial_number.jpg\""
}

# Function to add logo
add_logo() {
    local source_file=$1
    local logo_name=$2
    
    print_header "Adding Logo: $logo_name"
    
    if ! validate_image "$source_file" 50; then
        return 1
    fi
    
    local target_dir="frontends/seniorsimple-site/public/images/logos"
    local target_file="$target_dir/$logo_name"
    
    # Create directory if it doesn't exist
    mkdir -p "$target_dir"
    
    # Copy file
    cp "$source_file" "$target_file"
    
    print_status "Logo added: $target_file"
    print_status "File size: $(get_file_size "$target_file") KB"
    
    echo ""
    echo "To use this logo in your site:"
    echo "src=\"/images/logos/$logo_name\""
}

# Function to show current image status
show_status() {
    print_header "Current Image Status"
    
    local image_dirs=(
        "frontends/seniorsimple-site/public/images/hero"
        "frontends/seniorsimple-site/public/images/topics"
        "frontends/seniorsimple-site/public/images/testimonials"
        "frontends/seniorsimple-site/public/images/team"
        "frontends/seniorsimple-site/public/images/logos"
    )
    
    for dir in "${image_dirs[@]}"; do
        echo ""
        echo "📁 $(basename "$dir"):"
        if [ -d "$dir" ]; then
            if [ "$(ls -A "$dir" 2>/dev/null)" ]; then
                ls -la "$dir" | grep -v "^total" | while read line; do
                    echo "  $line"
                done
            else
                echo "  (empty)"
            fi
        else
            echo "  (directory not created)"
        fi
    done
}

# Function to show help
show_help() {
    echo "Image Management Script for SeniorSimple Site"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  hero <file> [name]           Add hero image"
    echo "  topic <file> <topic>         Add topic image"
    echo "  testimonial <file> [number]  Add testimonial image"
    echo "  logo <file> <name>           Add logo"
    echo "  status                       Show current image status"
    echo "  help                         Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 hero ./my-hero-image.jpg"
    echo "  $0 topic ./annuities.jpg annuities"
    echo "  $0 testimonial ./customer.jpg 1"
    echo "  $0 logo ./forbes-logo.png forbes-logo.png"
    echo "  $0 status"
    echo ""
    echo "Image Specifications:"
    echo "  Hero: < 200KB, 1200x800px"
    echo "  Topics: < 100KB, 400x300px"
    echo "  Testimonials: < 50KB, 200x200px"
    echo "  Logos: < 50KB, variable size"
}

# Main script logic
case "$1" in
    "hero")
        if [ -z "$2" ]; then
            print_error "Source file required"
            echo "Usage: $0 hero <source_file> [target_name]"
            exit 1
        fi
        add_hero_image "$2" "$3"
        ;;
    "topic")
        if [ -z "$2" ] || [ -z "$3" ]; then
            print_error "Source file and topic name required"
            echo "Usage: $0 topic <source_file> <topic_name>"
            exit 1
        fi
        add_topic_image "$2" "$3"
        ;;
    "testimonial")
        if [ -z "$2" ]; then
            print_error "Source file required"
            echo "Usage: $0 testimonial <source_file> [number]"
            exit 1
        fi
        add_testimonial_image "$2" "$3"
        ;;
    "logo")
        if [ -z "$2" ] || [ -z "$3" ]; then
            print_error "Source file and logo name required"
            echo "Usage: $0 logo <source_file> <logo_name>"
            exit 1
        fi
        add_logo "$2" "$3"
        ;;
    "status")
        show_status
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
