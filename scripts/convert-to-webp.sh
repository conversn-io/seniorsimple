#!/bin/bash

# WebP Conversion Script for SeniorSimple Site
# This script converts PNG images to WebP for better compression

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

# Function to convert PNG to WebP
convert_to_webp() {
    local input_file=$1
    local output_file=$2
    local quality=$3
    
    print_status "Converting: $(basename "$input_file")"
    
    local original_size=$(get_file_size "$input_file")
    print_status "Original size: ${original_size}KB"
    
    # Check if cwebp is available (WebP encoder)
    if command -v cwebp >/dev/null 2>&1; then
        # Convert to WebP with specified quality
        cwebp -q "$quality" "$input_file" -o "$output_file" 2>/dev/null
        
        if [ -f "$output_file" ]; then
            local webp_size=$(get_file_size "$output_file")
            local savings=$((original_size - webp_size))
            local savings_percent=$((savings * 100 / original_size))
            
            print_status "WebP size: ${webp_size}KB"
            print_status "Savings: ${savings}KB (${savings_percent}%)"
            
            if [ $webp_size -lt $original_size ]; then
                print_status "✅ Conversion successful!"
            else
                print_warning "WebP file is larger than original"
            fi
        else
            print_error "WebP conversion failed"
        fi
    else
        print_error "cwebp not available. Install WebP tools:"
        echo "  brew install webp"
        return 1
    fi
    
    echo ""
}

# Function to convert all images to WebP
convert_all_to_webp() {
    print_header "Converting All Images to WebP"
    
    # Create WebP directory
    local webp_dir="frontends/seniorsimple-site/public/images/webp"
    mkdir -p "$webp_dir"
    
    # Convert hero images (higher quality)
    print_header "Hero Images (Quality: 85)"
    mkdir -p "$webp_dir/hero"
    
    for file in frontends/seniorsimple-site/public/images/hero/*.png; do
        if [ -f "$file" ]; then
            local filename=$(basename "$file" .png).webp
            convert_to_webp "$file" "$webp_dir/hero/$filename" 85
        fi
    done
    
    # Convert topic images (lower quality for smaller size)
    print_header "Topic Images (Quality: 75)"
    mkdir -p "$webp_dir/topics"
    
    for file in frontends/seniorsimple-site/public/images/topics/*.png; do
        if [ -f "$file" ]; then
            local filename=$(basename "$file" .png).webp
            convert_to_webp "$file" "$webp_dir/topics/$filename" 75
        fi
    done
    
    print_status "All images converted to WebP! Check the 'webp' directory."
    echo ""
    echo "To use WebP images, update your image paths to:"
    echo "  /images/webp/hero/[filename].webp"
    echo "  /images/webp/topics/[filename].webp"
}

# Function to replace PNG with WebP in code
replace_png_with_webp() {
    print_header "Updating Image Paths to WebP"
    
    # Update homepage
    local homepage_file="frontends/seniorsimple-site/src/app/page.tsx"
    
    if [ -f "$homepage_file" ]; then
        # Replace hero image paths
        sed -i '' 's|/images/hero/\([^.]*\)\.png|/images/webp/hero/\1.webp|g' "$homepage_file"
        
        # Replace topic image paths
        sed -i '' 's|/images/topics/\([^.]*\)\.png|/images/webp/topics/\1.webp|g' "$homepage_file"
        
        print_status "Updated homepage image paths to WebP"
    fi
    
    print_status "✅ All image paths updated to WebP format!"
}

# Function to show WebP vs PNG comparison
show_comparison() {
    print_header "WebP vs PNG Comparison"
    
    echo "Hero Images:"
    for png_file in frontends/seniorsimple-site/public/images/hero/*.png; do
        if [ -f "$png_file" ]; then
            local filename=$(basename "$png_file" .png)
            local webp_file="frontends/seniorsimple-site/public/images/webp/hero/${filename}.webp"
            
            if [ -f "$webp_file" ]; then
                local png_size=$(get_file_size "$png_file")
                local webp_size=$(get_file_size "$webp_file")
                local savings=$((png_size - webp_size))
                local savings_percent=$((savings * 100 / png_size))
                
                echo "  📄 $filename.png: ${png_size}KB"
                echo "  📄 $filename.webp: ${webp_size}KB (${savings_percent}% smaller)"
                echo ""
            fi
        fi
    done
    
    echo "Topic Images:"
    for png_file in frontends/seniorsimple-site/public/images/topics/*.png; do
        if [ -f "$png_file" ]; then
            local filename=$(basename "$png_file" .png)
            local webp_file="frontends/seniorsimple-site/public/images/webp/topics/${filename}.webp"
            
            if [ -f "$webp_file" ]; then
                local png_size=$(get_file_size "$png_file")
                local webp_size=$(get_file_size "$webp_file")
                local savings=$((png_size - webp_size))
                local savings_percent=$((savings * 100 / png_size))
                
                echo "  📄 $filename.png: ${png_size}KB"
                echo "  📄 $filename.webp: ${webp_size}KB (${savings_percent}% smaller)"
                echo ""
            fi
        fi
    done
}

# Function to show help
show_help() {
    echo "WebP Conversion Script for SeniorSimple Site"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  convert               Convert all PNG images to WebP"
    echo "  update-paths          Update code to use WebP images"
    echo "  compare               Show WebP vs PNG size comparison"
    echo "  help                  Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 convert"
    echo "  $0 update-paths"
    echo "  $0 compare"
    echo ""
    echo "Note: Requires WebP tools. Install with: brew install webp"
}

# Main script logic
case "$1" in
    "convert")
        convert_all_to_webp
        ;;
    "update-paths")
        replace_png_with_webp
        ;;
    "compare")
        show_comparison
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
