// Shadcn-inspired components using vanilla JS
const shadcn = {
  // Create a button with shadcn styling
  button: function(element) {
    if (!element) return;
    
    element.classList.add(
      "inline-flex",
      "items-center",
      "justify-center",
      "whitespace-nowrap",
      "rounded-md",
      "text-sm",
      "font-medium",
      "transition-colors",
      "focus-visible:outline-none",
      "focus-visible:ring-1",
      "focus-visible:ring-ring",
      "disabled:pointer-events-none",
      "disabled:opacity-50"
    );
    
    // Different variants
    if (element.dataset.variant === "outline") {
      element.classList.add("border", "border-input", "bg-background", "hover:bg-accent", "hover:text-accent-foreground");
    } else if (element.dataset.variant === "secondary") {
      element.classList.add("bg-secondary", "text-secondary-foreground", "hover:bg-secondary/80");
    } else if (element.dataset.variant === "ghost") {
      element.classList.add("hover:bg-accent", "hover:text-accent-foreground");
    } else if (element.dataset.variant === "link") {
      element.classList.add("text-primary", "underline-offset-4", "hover:underline");
    } else if (element.dataset.variant === "destructive") {
      element.classList.add("bg-destructive", "text-destructive-foreground", "hover:bg-destructive/90");
    } else {
      // Default: primary
      element.classList.add("bg-primary", "text-primary-foreground", "hover:bg-primary/90");
    }
    
    // Different sizes
    if (element.dataset.size === "sm") {
      element.classList.add("h-8", "px-3", "text-xs");
    } else if (element.dataset.size === "lg") {
      element.classList.add("h-11", "px-8");
    } else if (element.dataset.size === "icon") {
      element.classList.add("h-9", "w-9");
    } else {
      // Default: md
      element.classList.add("h-9", "px-4", "py-2");
    }
  },
  
  // Create form input with shadcn styling
  input: function(element) {
    if (!element) return;
    
    element.classList.add(
      "flex",
      "h-9",
      "w-full",
      "rounded-md",
      "border",
      "border-input",
      "bg-transparent",
      "px-3",
      "py-1",
      "text-sm",
      "shadow-sm",
      "transition-colors",
      "file:border-0",
      "file:bg-transparent",
      "file:text-sm",
      "file:font-medium",
      "placeholder:text-muted-foreground",
      "focus-visible:outline-none",
      "focus-visible:ring-1",
      "focus-visible:ring-ring",
      "disabled:cursor-not-allowed",
      "disabled:opacity-50"
    );
  },
  
  // Create select with shadcn styling
  select: function(element) {
    if (!element) return;
    
    element.classList.add(
      "flex",
      "h-9",
      "w-full",
      "rounded-md",
      "border",
      "border-input",
      "bg-transparent",
      "px-3",
      "py-1",
      "text-sm",
      "shadow-sm",
      "transition-colors",
      "focus-visible:outline-none",
      "focus-visible:ring-1",
      "focus-visible:ring-ring",
      "disabled:cursor-not-allowed",
      "disabled:opacity-50"
    );
  },
  
  // Create card with shadcn styling
  card: function(element) {
    if (!element) return;
    
    element.classList.add(
      "rounded-xl",
      "border",
      "bg-card",
      "text-card-foreground",
      "shadow"
    );
  },
  
  // Apply styles to card header
  cardHeader: function(element) {
    if (!element) return;
    
    element.classList.add(
      "flex",
      "flex-col",
      "space-y-1.5",
      "p-6"
    );
  },
  
  // Apply styles to card title
  cardTitle: function(element) {
    if (!element) return;
    
    element.classList.add(
      "font-semibold",
      "leading-none",
      "tracking-tight"
    );
  },
  
  // Apply styles to card content
  cardContent: function(element) {
    if (!element) return;
    
    element.classList.add("p-6", "pt-0");
  },
  
  // Apply styles to card footer
  cardFooter: function(element) {
    if (!element) return;
    
    element.classList.add(
      "flex",
      "items-center",
      "p-6",
      "pt-0"
    );
  },
  
  // Initialize all components by data attribute
  init: function() {
    // Apply button styles
    document.querySelectorAll('[data-shadcn="button"]').forEach(el => {
      this.button(el);
    });
    
    // Apply input styles
    document.querySelectorAll('[data-shadcn="input"]').forEach(el => {
      this.input(el);
    });
    
    // Apply select styles
    document.querySelectorAll('[data-shadcn="select"]').forEach(el => {
      this.select(el);
    });
    
    // Apply card styles
    document.querySelectorAll('[data-shadcn="card"]').forEach(el => {
      this.card(el);
    });
    
    // Apply card header styles
    document.querySelectorAll('[data-shadcn="card-header"]').forEach(el => {
      this.cardHeader(el);
    });
    
    // Apply card title styles
    document.querySelectorAll('[data-shadcn="card-title"]').forEach(el => {
      this.cardTitle(el);
    });
    
    // Apply card content styles
    document.querySelectorAll('[data-shadcn="card-content"]').forEach(el => {
      this.cardContent(el);
    });
    
    // Apply card footer styles
    document.querySelectorAll('[data-shadcn="card-footer"]').forEach(el => {
      this.cardFooter(el);
    });
  }
};

// Initialize components when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  shadcn.init();
});