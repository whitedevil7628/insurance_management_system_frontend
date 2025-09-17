# Image Placeholders for Insurance Management System

## 📁 Required Images Directory Structure
```
src/assets/images/
├── logo.png                    # Main application logo (32x32px)
├── sidebar-logo.png            # Sidebar logo (32x32px)
├── hero-bg.jpg                 # Home page hero background (1920x1080px)
├── admin/
│   ├── dashboard-bg.jpg        # Admin dashboard background
│   └── admin-avatar.png        # Default admin avatar
├── agent/
│   ├── agent-dashboard.jpg     # Agent dashboard background
│   └── agent-avatar.png        # Default agent avatar
├── customer/
│   ├── customer-dashboard.jpg  # Customer dashboard background
│   └── customer-avatar.png     # Default customer avatar
└── icons/
    ├── insurance-icon.png      # Insurance policy icon
    ├── claims-icon.png         # Claims icon
    ├── agents-icon.png         # Agents icon
    └── customers-icon.png      # Customers icon
```

## 🖼️ Image Usage Locations

### **Navbar Component** (`components/common/navbar/`)
- **Logo**: `logoUrl = 'assets/images/logo.png'`
- **Usage**: Top navigation brand logo
- **Size**: 32x32px recommended

### **Sidebar Component** (`components/common/sidebar/`)
- **Logo**: `logoUrl = 'assets/images/sidebar-logo.png'`
- **Usage**: Sidebar header logo
- **Size**: 32x32px recommended

### **Stat Card Component** (`components/common/stat-card/`)
- **Image**: `imageUrl` property (optional)
- **Usage**: Alternative to FontAwesome icons in dashboard cards
- **Size**: 60x60px recommended

### **Home Page** (`home/`)
- **Hero Background**: Can be added to CSS
- **Feature Icons**: Can replace FontAwesome icons
- **Company Logo**: In navigation

### **Admin Dashboard** (`components/admin/`)
- **Background Images**: For dashboard sections
- **User Avatars**: Default profile images
- **Stat Card Icons**: Custom icons for statistics

### **Agent Dashboard** (`components/agent/`)
- **Background Images**: For agent-specific sections
- **Profile Images**: Agent profile pictures
- **Action Icons**: Custom icons for agent actions

### **Customer Dashboard** (`components/customer/`)
- **Background Images**: For customer sections
- **Profile Images**: Customer profile pictures
- **Policy Icons**: Custom policy type icons

## 🎨 Recommended Image Specifications

### **Logos**
- Format: PNG with transparency
- Size: 32x32px, 64x64px, 128x128px
- Style: Clean, professional, brand colors

### **Background Images**
- Format: JPG or WebP
- Size: 1920x1080px (Full HD)
- Style: Subtle, professional, insurance-themed

### **Icons**
- Format: PNG or SVG
- Size: 24x24px, 32x32px, 48x48px, 64x64px
- Style: Consistent with brand, outline or filled

### **Avatars**
- Format: PNG or JPG
- Size: 40x40px, 80x80px, 120x120px
- Style: Professional, circular crop recommended

## 🔧 How to Add Images

### **1. Place Images in Assets**
```bash
src/assets/images/logo.png
src/assets/images/sidebar-logo.png
# etc...
```

### **2. Update Component Properties**
```typescript
// In navbar component
logoUrl = 'assets/images/logo.png';

// In sidebar component  
logoUrl = 'assets/images/sidebar-logo.png';

// In stat card component
imageUrl = 'assets/images/icons/insurance-icon.png';
```

### **3. CSS Background Images**
```css
.hero-section {
  background-image: url('assets/images/hero-bg.jpg');
  background-size: cover;
  background-position: center;
}
```

## 📋 Current Component Structure

### **✅ Completed Components**
- ✅ **NavbarComponent** - Reusable navigation with logo placeholder
- ✅ **SidebarComponent** - Navigation sidebar with logo placeholder  
- ✅ **NotificationComponent** - Toast notifications
- ✅ **DataTableComponent** - Reusable data tables
- ✅ **FormModalComponent** - Reusable modal forms
- ✅ **StatCardComponent** - Dashboard statistics cards with image support
- ✅ **AdminComponent** - Complete admin dashboard using shared components

### **🔄 Component Features**
- **Bootstrap 5** styling throughout
- **@if/@for** control flow syntax
- **Responsive design** for mobile/desktop
- **Reusable components** - no duplication
- **Role-based access** with JWT guards
- **Image placeholders** ready for your images

### **🎯 Benefits of This Structure**
1. **Component Reusability** - Same components used across admin/agent/customer
2. **Consistent Styling** - Bootstrap ensures professional look
3. **Easy Maintenance** - Change one component, updates everywhere
4. **Modern Angular** - Uses latest @if/@for syntax
5. **Image Ready** - Placeholders ready for your brand images
6. **Mobile Responsive** - Works on all devices
7. **Simple & Clean** - Easy for beginners to understand

## 🚀 Next Steps

1. **Add your images** to the `src/assets/images/` directory
2. **Update image paths** in component properties
3. **Customize colors** in CSS to match your brand
4. **Create agent and customer components** using the same shared components
5. **Test on different devices** to ensure responsiveness

The structure is now **component-based**, **reusable**, and **image-ready**!