// Clear login form cache and force empty fields
console.log('🧹 Clearing login form cache...');

// Clear all storage
localStorage.clear();
sessionStorage.clear();

// Clear any cached form data
if ('caches' in window) {
    caches.keys().then(names => {
        names.forEach(name => {
            caches.delete(name);
        });
    });
}

// Force clear form fields when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Clear all input fields
    const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"]');
    inputs.forEach(input => {
        input.value = '';
        input.setAttribute('autocomplete', 'off');
    });
    
    console.log('✅ Form fields cleared');
});

// Disable browser autofill
document.addEventListener('DOMContentLoaded', function() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.setAttribute('autocomplete', 'off');
    });
});

console.log('✅ Login cache cleared');