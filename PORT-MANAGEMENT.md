# 🚀 Port Management Guide

## 📋 **Dedicated Port Ranges**

### **RateRoots Platform** (Ports 3000-3009)
- **Main**: `http://localhost:3000` - RateRoots Platform
- **Reserved**: 3001-3009 for RateRoots sub-projects

### **SeniorSimple Platform** (Ports 3010-3020)
- **Main**: `http://localhost:3010` - SeniorSimple Platform
- **Reserved**: 3011-3020 for SeniorSimple sub-projects

## 🎯 **Quick Commands**

### **RateRoots Development:**
```bash
npm run dev:rateroots    # Starts on port 3000
npm run dev              # Default (port 3000)
```

### **SeniorSimple Development:**
```bash
npm run dev:seniorsimple # Starts on port 3010
```

## 🕷️ **Crawler Auto-Detection**

The crawler automatically detects which port you're using:

- **Port 3000**: Tests RateRoots platform
- **Port 3010**: Tests SeniorSimple platform  
- **Any other port**: Uses that specific port
- **Production**: Always uses `https://seniorsimple.org`

## 🔧 **Development Workflow**

### **Working on RateRoots:**
1. `npm run dev:rateroots` (port 3000)
2. Navigate to `http://localhost:3000`
3. Run crawler - auto-detects port 3000

### **Working on SeniorSimple:**
1. `npm run dev:seniorsimple` (port 3010)
2. Navigate to `http://localhost:3010`
3. Run crawler - auto-detects port 3010

## 📊 **Port Status**

| Port | Project | Status | URL |
|------|---------|--------|-----|
| 3000 | RateRoots | Available | `http://localhost:3000` |
| 3010 | SeniorSimple | Available | `http://localhost:3010` |
| 3011-3020 | SeniorSimple Reserved | Reserved | Future use |
| 3001-3009 | RateRoots Reserved | Reserved | Future use |

## 🎯 **Benefits**

- ✅ **No Port Conflicts** - Each project has dedicated range
- ✅ **Auto-Detection** - Crawler knows which project you're testing
- ✅ **Parallel Development** - Run multiple projects simultaneously
- ✅ **Clear Organization** - Easy to remember which port for which project
