# Migration Guide: Updating Existing Components

## Overview
This guide helps you update your existing components to use the new refactored structure while maintaining all functionality.

## 🔄 Step-by-Step Migration

### 1. Update Service Imports

**Before:**
```typescript
import { JwtService } from '../Services/jwt.service';
import { AdminService } from '../Services/admin.service';
```

**After:**
```typescript
import { AuthService, AdminService, NotificationService } from '../core';
// or
import { AuthService } from '../core/services/auth.service';
```

### 2. Replace JWT Service with Auth Service

**Before:**
```typescript
constructor(private jwtService: JwtService) {}

logout() {
  this.jwtService.logout();
}

getUserName() {
  return this.jwtService.getUserName();
}
```

**After:**
```typescript
constructor(private authService: AuthService) {}

logout() {
  this.authService.logout();
}

getUserName() {
  return this.authService.getUserName();
}
```

### 3. Update Notification System

**Before:**
```typescript
// Manual notification handling
showNotificationMessage(message: string, type: 'success' | 'error') {
  this.notificationMessage.set(message);
  this.notificationType.set(type);
  this.showNotification.set(true);
  
  setTimeout(() => {
    this.showNotification.set(false);
  }, 3000);
}
```

**After:**
```typescript
constructor(private notificationService: NotificationService) {}

// Simple notification calls
this.notificationService.showSuccess('Operation successful!');
this.notificationService.showError('Operation failed!');
```

### 4. Use Reusable Button Component

**Before:**
```html
<button class="btn-primary" (click)="createAgent()">
  <i class="fas fa-save"></i>
  Create Agent
</button>
```

**After:**
```html
<app-button 
  variant="primary" 
  icon="save"
  [loading]="isCreating()"
  (clicked)="createAgent()">
  Create Agent
</app-button>
```

### 5. Use Reusable Card Component

**Before:**
```html
<div class="form-card">
  <div class="form-header">
    <h3>Create New Agent</h3>
    <button class="close-btn" (click)="toggleForm()">
      <i class="fas fa-times"></i>
    </button>
  </div>
  <div class="form-body">
    <!-- Form content -->
  </div>
</div>
```

**After:**
```html
<app-card variant="form" title="Create New Agent" icon="user-plus">
  <div slot="header-actions">
    <app-button variant="outline" icon="times" (clicked)="toggleForm()">
      Close
    </app-button>
  </div>
  
  <!-- Form content -->
  
</app-card>
```

## 📝 Example: Updating Admin Component

Here's how to update your existing admin component:

### 1. Update Imports
```typescript
// Add these imports
import { NotificationService } from '../core/services/notification.service';
import { ButtonComponent } from '../shared/components/button/button.component';
import { CardComponent } from '../shared/components/card/card.component';

// Update component imports
@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, CardComponent],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
```

### 2. Update Constructor
```typescript
constructor(
  private authService: AuthService,  // Changed from jwtService
  private adminService: AdminService,
  private notificationService: NotificationService  // Added
) {}
```

### 3. Update Methods
```typescript
// Replace manual notification with service
createAgent() {
  // ... existing logic ...
  
  this.adminService.createAgent(agentData).subscribe({
    next: () => {
      this.notificationService.showSuccess('Agent created successfully!');
      // ... rest of success logic
    },
    error: (error) => {
      this.notificationService.showError('Failed to create agent');
    }
  });
}
```

### 4. Update Template
```html
<!-- Replace manual notifications -->
<!-- Remove this: -->
<!-- <div class="notification" [class.show]="showNotification()">...</div> -->

<!-- Replace buttons with app-button -->
<app-button 
  variant="primary" 
  icon="plus"
  (clicked)="toggleAgentForm()">
  Add Agent
</app-button>

<!-- Replace form cards with app-card -->
<app-card variant="form" title="Create New Agent" icon="user-plus">
  <form (ngSubmit)="createAgent()">
    <!-- Form content -->
  </form>
</app-card>
```

## 🎯 Quick Checklist

For each component you migrate:

- [ ] Update service imports to use new structure
- [ ] Replace JwtService with AuthService
- [ ] Add NotificationService for user feedback
- [ ] Import and use ButtonComponent
- [ ] Import and use CardComponent
- [ ] Remove manual notification code
- [ ] Update template to use new components
- [ ] Test functionality to ensure nothing is broken

## 🔧 Gradual Migration Strategy

You don't need to migrate everything at once:

1. **Phase 1**: Update service imports and basic functionality
2. **Phase 2**: Replace buttons with ButtonComponent
3. **Phase 3**: Replace cards with CardComponent
4. **Phase 4**: Update notifications to use NotificationService
5. **Phase 5**: Add type safety with proper interfaces

## 🚨 Common Issues and Solutions

### Issue: Import Errors
**Problem**: Cannot find module errors
**Solution**: Update import paths to match new structure

### Issue: Service Not Found
**Problem**: Service injection fails
**Solution**: Ensure services are imported in component

### Issue: Styling Conflicts
**Problem**: New components don't match existing styles
**Solution**: Use CSS custom properties or update component styles

### Issue: Type Errors
**Problem**: TypeScript compilation errors
**Solution**: Add proper type annotations and interfaces

## 📚 Resources

- [Angular Style Guide](https://angular.io/guide/styleguide)
- [Component Documentation](./REFACTORED_STRUCTURE.md)
- [Service Documentation](./src/app/core/services/)
- [Shared Components](./src/app/shared/components/)

## 🎉 Benefits After Migration

- ✅ Cleaner, more maintainable code
- ✅ Reusable components across the app
- ✅ Consistent user experience
- ✅ Better type safety
- ✅ Easier testing
- ✅ Professional code structure
- ✅ Interview-ready codebase

Remember: The goal is to maintain all existing functionality while improving code quality and structure!