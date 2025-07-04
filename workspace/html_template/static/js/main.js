// Main JavaScript for HomeMadePickles website

// DOM Elements
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenu = document.querySelector('.mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenu) {
        mobileMenu.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }
    
    // Check if user is logged in
    updateUserUI();
    
    // Handle form submissions
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const contactForm = document.getElementById('contact-form');
    const reviewForm = document.getElementById('review-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }
    
    if (reviewForm) {
        reviewForm.addEventListener('submit', handleReviewSubmit);
    }
    
    // Initialize product pages
    initProductsPage();
    
    // Initialize cart page
    initCartPage();
    
    // Initialize profile page
    initProfilePage();
    
    // Initialize reviews page
    initReviewsPage();
});

// User Authentication
function updateUserUI() {
    const userGreeting = document.getElementById('user-greeting');
    const loginLinks = document.querySelectorAll('.login-link');
    const profileLinks = document.querySelectorAll('.profile-link');
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (currentUser) {
        // User is logged in
        if (userGreeting) {
            userGreeting.textContent = `Welcome, ${currentUser.name}`;
            userGreeting.classList.remove('hidden');
        }
        
        // Hide login links, show profile links
        loginLinks.forEach(link => link.classList.add('hidden'));
        profileLinks.forEach(link => link.classList.remove('hidden'));
    } else {
        // User is not logged in
        if (userGreeting) {
            userGreeting.classList.add('hidden');
        }
        
        // Show login links, hide profile links
        loginLinks.forEach(link => link.classList.remove('hidden'));
        profileLinks.forEach(link => link.classList.add('hidden'));
    }
}

function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Find user with matching email and password
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        // Store current user in localStorage
        localStorage.setItem('currentUser', JSON.stringify({
            name: user.name,
            email: user.email
        }));
        
        // Show success message
        alert('Login successful!');
        
        // Redirect to home page
        window.location.href = 'index.html';
    } else {
        // Show error message
        alert('Invalid email or password!');
    }
}

function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    // Validate passwords match
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }
    
    // Get existing users
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Check if user already exists
    if (users.some(user => user.email === email)) {
        alert('Email already registered!');
        return;
    }
    
    // Add new user
    users.push({
        name,
        email,
        password
    });
    
    // Save to localStorage
    localStorage.setItem('users', JSON.stringify(users));
    
    // Store current user
    localStorage.setItem('currentUser', JSON.stringify({
        name,
        email
    }));
    
    // Show success message
    alert('Registration successful!');
    
    // Redirect to home page
    window.location.href = 'index.html';
}

function logout() {
    // Remove current user from localStorage
    localStorage.removeItem('currentUser');
    
    // Update UI
    updateUserUI();
    
    // Redirect to login page
    window.location.href = 'login.html';
}

// Product Management
function initProductsPage() {
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    const buyNowButtons = document.querySelectorAll('.buy-now-btn');
    
    if (addToCartButtons) {
        addToCartButtons.forEach(button => {
            button.addEventListener('click', handleAddToCart);
        });
    }
    
    if (buyNowButtons) {
        buyNowButtons.forEach(button => {
            button.addEventListener('click', handleBuyNow);
        });
    }
}

function handleAddToCart(e) {
    const productCard = e.target.closest('.product-card');
    const productId = productCard.dataset.id;
    const productName = productCard.querySelector('.product-title').textContent;
    const productPrice = parseFloat(productCard.querySelector('.product-price').textContent.replace('₹', ''));
    const productImage = productCard.querySelector('.product-image').src;
    
    // Get cart from localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Check if product already in cart
    const existingProduct = cart.find(item => item.id === productId);
    
    if (existingProduct) {
        // Increment quantity
        existingProduct.quantity += 1;
    } else {
        // Add new product to cart
        cart.push({
            id: productId,
            name: productName,
            price: productPrice,
            image: productImage,
            quantity: 1
        });
    }
    
    // Save cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Show success message
    alert('Product added to cart!');
}

function handleBuyNow(e) {
    handleAddToCart(e);
    
    // Redirect to cart page
    window.location.href = 'cart.html';
}

// Cart Management
function initCartPage() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const checkoutButton = document.getElementById('checkout-btn');
    
    if (cartItemsContainer) {
        displayCartItems(cartItemsContainer, cartTotal);
        
        // Add event listener for checkout button
        if (checkoutButton) {
            checkoutButton.addEventListener('click', handleCheckout);
        }
    }
}

function displayCartItems(container, totalElement) {
    // Get cart from localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (cart.length === 0) {
        // Cart is empty
        container.innerHTML = '<p>Your cart is empty.</p>';
        totalElement.textContent = '₹0.00';
        return;
    }
    
    // Clear container
    container.innerHTML = '';
    
    // Calculate total
    let total = 0;
    
    // Display each cart item
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.dataset.id = item.id;
        
        itemElement.innerHTML = `
            <div class="cart-item-info">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div>
                    <h3>${item.name}</h3>
                    <p>₹${item.price.toFixed(2)}</p>
                </div>
            </div>
            <div class="cart-quantity">
                <button class="quantity-btn decrease-btn">-</button>
                <span class="quantity">${item.quantity}</span>
                <button class="quantity-btn increase-btn">+</button>
            </div>
            <p class="item-total">₹${itemTotal.toFixed(2)}</p>
            <button class="remove-btn">Remove</button>
        `;
        
        container.appendChild(itemElement);
        
        // Add event listeners for quantity buttons
        const decreaseBtn = itemElement.querySelector('.decrease-btn');
        const increaseBtn = itemElement.querySelector('.increase-btn');
        const removeBtn = itemElement.querySelector('.remove-btn');
        
        decreaseBtn.addEventListener('click', () => updateCartItemQuantity(item.id, -1));
        increaseBtn.addEventListener('click', () => updateCartItemQuantity(item.id, 1));
        removeBtn.addEventListener('click', () => removeCartItem(item.id));
    });
    
    // Update total
    totalElement.textContent = `₹${total.toFixed(2)}`;
}

function updateCartItemQuantity(itemId, change) {
    // Get cart from localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Find item in cart
    const item = cart.find(i => i.id === itemId);
    
    if (item) {
        // Update quantity
        item.quantity += change;
        
        // Remove item if quantity <= 0
        if (item.quantity <= 0) {
            removeCartItem(itemId);
            return;
        }
        
        // Save cart to localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Refresh cart display
        const cartItemsContainer = document.getElementById('cart-items');
        const cartTotal = document.getElementById('cart-total');
        
        displayCartItems(cartItemsContainer, cartTotal);
    }
}

function removeCartItem(itemId) {
    // Get cart from localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Filter out the item
    const updatedCart = cart.filter(item => item.id !== itemId);
    
    // Save cart to localStorage
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    
    // Refresh cart display
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    
    displayCartItems(cartItemsContainer, cartTotal);
}

function handleCheckout() {
    // Check if user is logged in
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        alert('Please log in to checkout!');
        window.location.href = 'login.html';
        return;
    }
    
    // Simulate checkout process
    alert('Thank you for your order! This is a dummy checkout.');
    
    // Clear cart
    localStorage.removeItem('cart');
    
    // Redirect to home page
    window.location.href = 'index.html';
}

// Profile Management
function initProfilePage() {
    const profileNameElement = document.getElementById('profile-name');
    const profileEmailElement = document.getElementById('profile-email');
    const logoutButton = document.getElementById('logout-btn');
    
    if (profileNameElement && profileEmailElement) {
        // Get current user
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        if (currentUser) {
            profileNameElement.textContent = currentUser.name;
            profileEmailElement.textContent = currentUser.email;
        } else {
            // Redirect to login if not logged in
            window.location.href = 'login.html';
        }
        
        // Add event listener for logout button
        if (logoutButton) {
            logoutButton.addEventListener('click', logout);
        }
    }
}

// Contact Form
function handleContactSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('contact-name').value;
    const email = document.getElementById('contact-email').value;
    const message = document.getElementById('contact-message').value;
    
    // In a real application, this would send data to a server
    // For this demo, just show a success message
    alert('Message sent successfully!');
    
    // Reset form
    e.target.reset();
}

// Reviews
function initReviewsPage() {
    const reviewsContainer = document.getElementById('reviews-list');
    
    if (reviewsContainer) {
        displayReviews(reviewsContainer);
    }
}

function displayReviews(container) {
    // Get reviews from localStorage or use default reviews
    const reviews = JSON.parse(localStorage.getItem('reviews')) || getDefaultReviews();
    
    // Clear container
    container.innerHTML = '';
    
    // Display each review
    reviews.forEach(review => {
        const reviewElement = document.createElement('div');
        reviewElement.className = 'review';
        
        reviewElement.innerHTML = `
            <div class="review-header">
                <p class="review-author">${review.author}</p>
                <p class="review-date">${review.date}</p>
            </div>
            <div class="review-rating">
                ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}
            </div>
            <p class="review-content">${review.content}</p>
        `;
        
        container.appendChild(reviewElement);
    });
}

function getDefaultReviews() {
    return [
        {
            author: 'Priya Sharma',
            date: '2023-05-15',
            rating: 5,
            content: 'The mango pickle tastes just like my mother used to make! Authentic flavor and perfect spice level.'
        },
        {
            author: 'Rahul Gupta',
            date: '2023-06-02',
            rating: 4,
            content: 'Love the lemon pickle! Not too sour, not too spicy. Perfect with paratha.'
        },
        {
            author: 'Anita Desai',
            date: '2023-04-28',
            rating: 5,
            content: 'The tamarind chutney is absolutely divine! Sweet, tangy and spicy - all in perfect balance.'
        }
    ];
}

function handleReviewSubmit(e) {
    e.preventDefault();
    
    // Check if user is logged in
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        alert('Please log in to submit a review!');
        window.location.href = 'login.html';
        return;
    }
    
    const rating = document.getElementById('review-rating').value;
    const content = document.getElementById('review-content').value;
    
    // Get existing reviews
    const reviews = JSON.parse(localStorage.getItem('reviews')) || getDefaultReviews();
    
    // Add new review
    reviews.unshift({
        author: currentUser.name,
        date: new Date().toISOString().split('T')[0],
        rating: parseInt(rating),
        content: content
    });
    
    // Save to localStorage
    localStorage.setItem('reviews', JSON.stringify(reviews));
    
    // Show success message
    alert('Review submitted successfully!');
    
    // Refresh reviews display
    const reviewsContainer = document.getElementById('reviews-list');
    displayReviews(reviewsContainer);
    
    // Reset form
    e.target.reset();
}