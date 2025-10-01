# Image Management Guidelines - SeniorSimple Site

## 📁 **Image Directory Structure**

```
public/
├── images/
│   ├── hero/                    # Hero section images
│   │   ├── senior-couple.jpg    # Main hero image
│   │   └── hero-bg.jpg          # Background images
│   ├── topics/                  # Topic-specific images
│   │   ├── annuities.jpg
│   │   ├── tax-planning.jpg
│   │   ├── estate-planning.jpg
│   │   ├── reverse-mortgage.jpg
│   │   ├── regenerative-medicine.jpg
│   │   └── housing.jpg
│   ├── testimonials/            # Customer testimonials
│   │   ├── testimonial-1.jpg
│   │   ├── testimonial-2.jpg
│   │   └── testimonial-3.jpg
│   ├── team/                    # Team member photos
│   │   ├── advisor-1.jpg
│   │   ├── advisor-2.jpg
│   │   └── team-group.jpg
│   └── logos/                   # Partner and certification logos
│       ├── forbes-logo.png
│       ├── aarp-logo.png
│       ├── fiduciary-alliance.png
│       └── certifications/
│           ├── certified-advisor.png
│           └── licensed-insurance.png
```

## 🖼️ **Image Specifications**

### **Hero Images**
- **Format**: JPG or WebP
- **Size**: 1200x800px (16:9 ratio)
- **File size**: < 200KB
- **Purpose**: Main homepage hero, landing pages

### **Topic Images**
- **Format**: JPG or WebP
- **Size**: 400x300px (4:3 ratio)
- **File size**: < 100KB
- **Purpose**: Topic cards, blog posts

### **Testimonial Images**
- **Format**: JPG or WebP
- **Size**: 200x200px (1:1 ratio, circular)
- **File size**: < 50KB
- **Purpose**: Customer testimonials, reviews

### **Team Images**
- **Format**: JPG or WebP
- **Size**: 300x400px (3:4 ratio)
- **File size**: < 80KB
- **Purpose**: Team member profiles, advisor bios

### **Logos**
- **Format**: PNG (for transparency) or SVG
- **Size**: Variable (maintain aspect ratio)
- **File size**: < 50KB
- **Purpose**: Partner logos, certifications

## 🚀 **Using Images in Next.js**

### **1. Import Next.js Image Component**
```tsx
import Image from 'next/image'
```

### **2. Basic Image Usage**
```tsx
<Image
  src="/images/hero/senior-couple.jpg"
  alt="Senior couple planning retirement"
  width={1200}
  height={800}
  priority={true} // For above-the-fold images
/>
```

### **3. Responsive Images**
```tsx
<Image
  src="/images/topics/annuities.jpg"
  alt="Annuities planning"
  width={400}
  height={300}
  className="w-full h-auto"
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

### **4. Circular Images (Testimonials)**
```tsx
<Image
  src="/images/testimonials/testimonial-1.jpg"
  alt="Happy customer"
  width={200}
  height={200}
  className="rounded-full object-cover"
/>
```

### **5. Background Images**
```tsx
<div 
  className="bg-cover bg-center bg-no-repeat"
  style={{
    backgroundImage: "url('/images/hero/hero-bg.jpg')"
  }}
>
  {/* Content */}
</div>
```

## 📋 **Image Optimization Best Practices**

### **1. File Naming Convention**
- Use **kebab-case**: `senior-couple-retirement.jpg`
- Be **descriptive**: `annuities-planning-guide.jpg`
- Include **dimensions** if needed: `hero-1200x800.jpg`

### **2. Alt Text Guidelines**
- **Be descriptive**: "Senior couple reviewing retirement documents at kitchen table"
- **Include context**: "Annuities planning consultation with financial advisor"
- **Keep it concise**: Under 125 characters

### **3. Performance Optimization**
- Use **WebP format** when possible (better compression)
- **Optimize file sizes** before uploading
- Use **appropriate dimensions** (don't use 2000px images for 200px displays)
- Set `priority={true}` for above-the-fold images

### **4. Accessibility**
- Always include **alt text**
- Use **semantic HTML** with images
- Consider **loading states** for large images

## 🎯 **Current Image Placeholders**

### **Hero Section**
- **Placeholder**: `[Senior couple smiling at kitchen table with papers and laptop]`
- **Target file**: `/images/hero/senior-couple.jpg`
- **Description**: Warm, inviting image of a senior couple (55+) reviewing retirement documents together

### **Value Proposition Section**
- **Placeholder**: `[Happy multigenerational family in living room]`
- **Target file**: `/images/hero/family-trust.jpg`
- **Description**: Multi-generational family (grandparents, parents, children) in a comfortable living room setting

### **Topic Images** (6 images needed)
1. **Annuities**: `/images/topics/annuities.jpg` - Financial documents, charts
2. **Tax Planning**: `/images/topics/tax-planning.jpg` - Calculator, tax forms
3. **Estate Planning**: `/images/topics/estate-planning.jpg` - Legal documents, family
4. **Reverse Mortgage**: `/images/topics/reverse-mortgage.jpg` - House, equity concept
5. **Regenerative Medicine**: `/images/topics/regenerative-medicine.jpg` - Medical consultation
6. **Housing**: `/images/topics/housing.jpg` - Different housing options

## 🔧 **Implementation Steps**

### **Step 1: Add Images to Public Directory**
```bash
# Copy your images to the appropriate directories
cp your-hero-image.jpg frontends/seniorsimple-site/public/images/hero/senior-couple.jpg
cp your-topic-images/* frontends/seniorsimple-site/public/images/topics/
```

### **Step 2: Update Homepage Component**
Replace placeholder divs with actual Image components:

```tsx
// Before (placeholder)
<div className="w-full h-96 bg-white bg-opacity-10 rounded-xl flex items-center justify-center text-lg opacity-70">
  [Senior couple smiling at kitchen table with papers and laptop]
</div>

// After (actual image)
<Image
  src="/images/hero/senior-couple.jpg"
  alt="Senior couple planning retirement together"
  width={600}
  height={400}
  className="w-full h-96 object-cover rounded-xl"
  priority={true}
/>
```

### **Step 3: Optimize Images**
- Use tools like **TinyPNG** or **Squoosh** to compress images
- Convert to **WebP** format when possible
- Ensure proper **dimensions** and **aspect ratios**

## 📊 **Image Performance Checklist**

- [ ] Images are optimized (< 200KB for hero, < 100KB for others)
- [ ] WebP format used where possible
- [ ] Proper alt text included
- [ ] Responsive sizing implemented
- [ ] Priority loading for above-the-fold images
- [ ] Descriptive file names used
- [ ] Images stored in correct directories

## 🎨 **Design Guidelines**

### **Visual Style**
- **Warm and inviting** color palette
- **Professional but approachable** tone
- **Diverse representation** of seniors (55+)
- **High-quality, well-lit** photography
- **Consistent style** across all images

### **Brand Alignment**
- **SeniorSimple colors**: #36596A, #82A6B1, #E4CDA1
- **Trust and credibility** focus
- **Educational and helpful** tone
- **Family-oriented** messaging

---

**Remember**: Images are crucial for building trust and engagement. Invest in high-quality, professional photography that reflects your brand values and resonates with your target audience.
