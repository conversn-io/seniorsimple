#!/bin/bash

# Image Optimization Script for SeniorSimple Site
# This script optimizes images for web performance

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

# Function to get file size in KB
get_file_size() {
    local file=$1
    if [ -f "$file" ]; then
        echo $(($(stat -f%z "$file") / 1024))
    else
        echo 0
    fi
}

# Function to optimize a single image
optimize_image() {
    local input_file=$1
    local output_file=$2
    local max_size=$3
    
    print_status "Optimizing: $(basename "$input_file")"
    
    local original_size=$(get_file_size "$input_file")
    print_status "Original size: ${original_size}KB"
    
    # Check if sips is available (macOS built-in image processor)
    if command -v sips >/dev/null 2>&1; then
        # Use sips for basic optimization
        cp "$input_file" "$output_file"
        
        # Get image dimensions
        local width=$(sips -g pixelWidth "$input_file" | tail -1 | cut -d: -f2 | xargs)
        local height=$(sips -g pixelHeight "$input_file" | tail -1 | cut -d: -f2 | xargs)
        
        print_status "Dimensions: ${width}x${height}px"
        
        # If image is too large, resize it
        if [ "$width" -gt 1200 ] || [ "$height" -gt 800 ]; then
            print_status "Resizing image to fit web standards..."
            sips -Z 1200 "$output_file" >/dev/null 2>&1
        fi
        
        local optimized_size=$(get_file_size "$output_file")
        local savings=$((original_size - optimized_size))
        local savings_percent=$((savings * 100 / original_size))
        
        print_status "Optimized size: ${optimized_size}KB"
        print_status "Savings: ${savings}KB (${savings_percent}%)"
        
        if [ $optimized_size -gt $max_size ]; then
            print_warning "Image still exceeds recommended size of ${max_size}KB"
        else
            print_status "✅ Image optimized successfully!"
        fi
        
    else
        print_warning "sips not available, copying without optimization"
        cp "$input_file" "$output_file"
    fi
    
    echo ""
}

# Function to optimize all images
optimize_all_images() {
    print_header "Optimizing All Images"
    
    # Create optimized directory
    local optimized_dir="frontends/seniorsimple-site/public/images/optimized"
    mkdir -p "$optimized_dir"
    
    # Optimize hero images
    print_header "Hero Images"
    mkdir -p "$optimized_dir/hero"
    
    for file in frontends/seniorsimple-site/public/images/hero/*.png; do
        if [ -f "$file" ]; then
            local filename=$(basename "$file")
            optimize_image "$file" "$optimized_dir/hero/$filename" 200
        fi
    done
    
    # Optimize topic images
    print_header "Topic Images"
    mkdir -p "$optimized_dir/topics"
    
    for file in frontends/seniorsimple-site/public/images/topics/*.png; do
        if [ -f "$file" ]; then
            local filename=$(basename "$file")
            optimize_image "$file" "$optimized_dir/topics/$filename" 100
        fi
    done
    
    print_status "All images optimized! Check the 'optimized' directory."
    echo ""
    echo "To use optimized images, update your image paths to:"
    echo "  /images/optimized/hero/[filename]"
    echo "  /images/optimized/topics/[filename]"
}

# Function to show current image sizes
show_image_sizes() {
    print_header "Current Image Sizes"
    
    echo "Hero Images:"
    for file in frontends/seniorsimple-site/public/images/hero/*.png; do
        if [ -f "$file" ]; then
            local size=$(get_file_size "$file")
            local filename=$(basename "$file")
            echo "  📄 $filename: ${size}KB"
        fi
    done
    
    echo ""
    echo "Topic Images:"
    for file in frontends/seniorsimple-site/public/images/topics/*.png; do
        if [ -f "$file" ]; then
            local size=$(get_file_size "$file")
            local filename=$(basename "$file")
            echo "  📄 $filename: ${size}KB"
        fi
    done
    
    echo ""
    echo "Recommended sizes:"
    echo "  Hero: < 200KB"
    echo "  Topics: < 100KB"
}

# Function to replace original images with optimized ones
replace_with_optimized() {
    print_header "Replacing Original Images with Optimized Versions"
    
    local optimized_dir="frontends/seniorsimple-site/public/images/optimized"
    
    if [ ! -d "$optimized_dir" ]; then
        print_error "Optimized directory not found. Run 'optimize' first."
        return 1
    fi
    
    # Backup original images
    local backup_dir="frontends/seniorsimple-site/public/images/backup-$(date +%Y%m%d-%H%M%S)"
    print_status "Creating backup in: $backup_dir"
    cp -r frontends/seniorsimple-site/public/images/hero "$backup_dir/"
    cp -r frontends/seniorsimple-site/public/images/topics "$backup_dir/"
    
    # Replace hero images
    if [ -d "$optimized_dir/hero" ]; then
        cp "$optimized_dir/hero"/* frontends/seniorsimple-site/public/images/hero/
        print_status "Hero images replaced"
    fi
    
    # Replace topic images
    if [ -d "$optimized_dir/topics" ]; then
        cp "$optimized_dir/topics"/* frontends/seniorsimple-site/public/images/topics/
        print_status "Topic images replaced"
    fi
    
    print_status "✅ All images replaced with optimized versions!"
    print_status "Original images backed up to: $backup_dir"
}

# Function to show help
show_help() {
    echo "Image Optimization Script for SeniorSimple Site"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  optimize              Optimize all images (creates optimized/ directory)"
    echo "  replace               Replace original images with optimized versions"
    echo "  sizes                 Show current image sizes"
    echo "  help                  Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 optimize"
    echo "  $0 replace"
    echo "  $0 sizes"
    echo ""
    echo "Note: This script uses macOS sips for optimization."
}

# Main script logic
case "$1" in
    "optimize")
        optimize_all_images
        ;;
    "replace")
        replace_with_optimized
        ;;
    "sizes")
        show_image_sizes
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
