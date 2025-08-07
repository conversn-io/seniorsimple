# Frontend Architecture Guide

## 🎯 **Clear Separation Strategy**

To avoid conflicts between different frontend frameworks (Vite, Next.js, etc.), we follow a **strict separation strategy**:

### **✅ Approved Frontend Technologies**

1. **Next.js 14** - Primary frontend framework for all marketing sites and complex applications
2. **React + TypeScript** - For simple components and utilities
3. **Tailwind CSS** - Standard styling framework across all frontends

### **❌ Avoid These Conflicts**

- **No mixing Vite and Next.js** in the same project
- **No duplicate frontend directories** with different frameworks
- **No conflicting package managers** (stick to npm for consistency)

## 📁 **Current Frontend Structure**

```
frontends/
├── seniorsimple-site/          # ✅ Next.js 14 (Marketing Site)
│   ├── src/
│   │   ├── app/               # App Router
│   │   └── lib/               # Utilities (Supabase, etc.)
│   ├── package.json           # Next.js dependencies
│   └── .env.local            # Environment variables
├── admin-dashboard/           # ✅ Next.js 14 (Admin Interface)
└── quiz-builder/             # ✅ Next.js 14 (Quiz Creation Tool)
```

## 🚀 **Development Workflow**

### **Starting Individual Frontends**
```bash
# SeniorSimple Site
cd frontends/seniorsimple-site
npm run dev                    # Runs on http://localhost:3000

# Admin Dashboard
cd frontends/admin-dashboard
npm run dev                    # Runs on http://localhost:3001

# Quiz Builder
cd frontends/quiz-builder
npm run dev                    # Runs on http://localhost:3002
```

### **Starting All Frontends (Monorepo)**
```bash
# From project root
npm run dev                    # Starts all services concurrently
```

## 🔧 **Technology Stack Per Frontend**

### **SeniorSimple Site** (`frontends/seniorsimple-site/`)
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **Database**: Supabase
- **Port**: 3000
- **Purpose**: Marketing site, lead generation, newsletter signups

### **Admin Dashboard** (`frontends/admin-dashboard/`)
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase
- **Port**: 3001
- **Purpose**: Content management, analytics, user management

### **Quiz Builder** (`frontends/quiz-builder/`)
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase
- **Port**: 3002
- **Purpose**: Quiz creation and management

## 🛡️ **Conflict Prevention Rules**

### **1. Directory Naming**
- ✅ Use descriptive names: `seniorsimple-site`, `admin-dashboard`
- ❌ Avoid generic names: `frontend`, `app`, `site`

### **2. Package Management**
- ✅ Use `npm` consistently across all frontends
- ✅ Keep `package-lock.json` files
- ❌ Don't mix `yarn` and `npm`

### **3. Environment Variables**
- ✅ Use `NEXT_PUBLIC_` prefix for client-side variables
- ✅ Keep `.env.local` files in each frontend directory
- ❌ Don't use `VITE_` prefix (Vite-specific)

### **4. Port Management**
- ✅ Assign specific ports to each frontend
- ✅ Document port assignments
- ❌ Don't use default ports that might conflict

## 🔄 **Adding New Frontends**

### **Step 1: Create Directory**
```bash
cd frontends
mkdir new-frontend-name
cd new-frontend-name
```

### **Step 2: Initialize Next.js**
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --yes
```

### **Step 3: Configure Port**
Update `package.json` scripts:
```json
{
  "scripts": {
    "dev": "next dev -p 3003",
    "build": "next build",
    "start": "next start -p 3003"
  }
}
```

### **Step 4: Add to Monorepo**
Update root `package.json`:
```json
{
  "workspaces": [
    "services/*",
    "frontends/*",
    "shared/*"
  ],
  "scripts": {
    "dev:new-frontend": "cd frontends/new-frontend-name && npm run dev"
  }
}
```

## 🚨 **Troubleshooting Common Conflicts**

### **Port Conflicts**
```bash
# Check what's using a port
lsof -i :3000

# Kill process using port
kill -9 <PID>
```

### **Package Manager Conflicts**
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### **Environment Variable Conflicts**
```bash
# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL

# Clear conflicting variables
unset VITE_SUPABASE_URL
```

## 📋 **Best Practices**

1. **Always use Next.js 14** for new frontends
2. **Keep frontends in separate directories** with clear names
3. **Use consistent port assignments** (3000, 3001, 3002, etc.)
4. **Document any deviations** from this architecture
5. **Test frontends independently** before running together
6. **Use TypeScript** for all new code
7. **Follow the established naming conventions**

## 🎯 **Success Metrics**

- ✅ No framework conflicts
- ✅ Clear separation of concerns
- ✅ Consistent development experience
- ✅ Easy deployment and maintenance
- ✅ Scalable architecture

---

**Remember**: When in doubt, stick to Next.js 14 + TypeScript + Tailwind CSS. This combination provides the best balance of features, performance, and maintainability for the Conversn Platform.
