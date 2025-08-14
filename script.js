// Navbar hide/show on scroll
let lastScroll = 0;
const navbar = document.querySelector('.navbar');
const navbarHeight = navbar.offsetHeight;

window.addEventListener('scroll', function() {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 0) {
        // At top of page - always show navbar
        navbar.classList.remove('scroll-down');
        navbar.classList.add('scroll-up');
        return;
    }
    
    if (currentScroll > lastScroll && !navbar.classList.contains('scroll-down')) {
        // Scrolling down
        navbar.classList.remove('scroll-up');
        navbar.classList.add('scroll-down');
    } else if (currentScroll < lastScroll && navbar.classList.contains('scroll-down')) {
        // Scrolling up
        navbar.classList.remove('scroll-down');
        navbar.classList.add('scroll-up');
    }
    
    lastScroll = currentScroll;
});
document.addEventListener('DOMContentLoaded', function() {
    // Initialize AOS animations
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true
    });

    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    hamburger.addEventListener('click', function() {
        this.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Close mobile menu when clicking a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });

    // Load products from JSON
    // Load products from external GitHub repo
fetch('https://raw.githubusercontent.com/israelalonge2024/Products-data/main/products.json')
  .then(response => response.json())
  .then(products => {
    displayProducts(products);
  })
  .catch(error => console.error('Error loading products:', error));
    // Initialize cart and wishlist
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    updateCartCount();
    updateWishlistCount();

    // Modal functionality
    const cartModal = document.getElementById('cart-modal');
    const wishlistModal = document.getElementById('wishlist-modal');
    const cartBtn = document.getElementById('cart-btn');
    const wishlistBtn = document.getElementById('wishlist-btn');
    const closeModalButtons = document.querySelectorAll('.close-modal');

    cartBtn.addEventListener('click', function(e) {
        e.preventDefault();
        showCartModal();
    });

    wishlistBtn.addEventListener('click', function(e) {
        e.preventDefault();
        showWishlistModal();
    });

    closeModalButtons.forEach(button => {
        button.addEventListener('click', function() {
            cartModal.style.display = 'none';
            wishlistModal.style.display = 'none';
        });
    });

    window.addEventListener('click', function(e) {
        if (e.target === cartModal) {
            cartModal.style.display = 'none';
        }
        if (e.target === wishlistModal) {
            wishlistModal.style.display = 'none';
        }
    });

    // Contact form submission
    const contactForm = document.getElementById('contact-form');
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Thank you for your message! We will get back to you soon.');
        this.reset();
    });

    // Display products function
    function displayProducts(products) {
        const productsContainer = document.getElementById('products-container');
        productsContainer.innerHTML = '';

        // Shuffle products for random display
        const shuffledProducts = shuffleArray(products);

        shuffledProducts.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.setAttribute('data-aos', 'fade-up');
            productCard.innerHTML = `
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <div class="product-price">&#x20A6;${product.price}</div>
                    <p class="product-description">${product.description}</p>
                    <div class="product-actions">
                        <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
                        <button class="add-to-wishlist" data-id="${product.id}">Wishlist</button>
                    </div>
                </div>
            `;
            productsContainer.appendChild(productCard);
        });

        // Add event listeners to buttons
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', function() {
                const productId = parseInt(this.getAttribute('data-id'));
                addToCart(productId, products);
            });
        });

        document.querySelectorAll('.add-to-wishlist').forEach(button => {
            button.addEventListener('click', function() {
                const productId = parseInt(this.getAttribute('data-id'));
                addToWishlist(productId, products);
            });
        });
    }

    // Add to cart function
    function addToCart(productId, products) {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                ...product,
                quantity: 1
            });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        
        // Show added to cart feedback
        showFeedback(`${product.name} added to cart`);
    }

    // Add to wishlist function
    function addToWishlist(productId, products) {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        const existingItem = wishlist.find(item => item.id === productId);
        if (!existingItem) {
            wishlist.push(product);
            localStorage.setItem('wishlist', JSON.stringify(wishlist));
            updateWishlistCount();
            
            // Show added to wishlist feedback
            showFeedback(`${product.name} added to wishlist`);
        } else {
            showFeedback(`${product.name} is already in your wishlist`);
        }
    }

    // Update cart count
    function updateCartCount() {
        const count = cart.reduce((total, item) => total + item.quantity, 0);
        document.querySelector('.cart-count').textContent = count;
    }

    // Update wishlist count
    function updateWishlistCount() {
        document.querySelector('.wishlist-count').textContent = wishlist.length;
    }

    // Show cart modal
    function showCartModal() {
        const cartItemsContainer = document.getElementById('cart-items');
        const cartTotalElement = document.getElementById('cart-total');
        
        cartItemsContainer.innerHTML = '';
        
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Your cart is empty</p>';
            cartTotalElement.textContent = '0';
        } else {
            let total = 0;
            
            cart.forEach(item => {
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.innerHTML = `
                    <div class="cart-item-image">
                        <img src="${item.image}" alt="${item.name}">
                    </div>
                    <div class="cart-item-details">
                        <h4 class="cart-item-title">${item.name}</h4>
                        <div class="cart-item-price">$${item.price} x ${item.quantity}</div>
                    </div>
                    <button class="cart-item-remove" data-id="${item.id}">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                cartItemsContainer.appendChild(cartItem);
                
                total += item.price * item.quantity;
            });
            
            cartTotalElement.textContent = total.toFixed(2);
            
            // Add event listeners to remove buttons
            document.querySelectorAll('.cart-item-remove').forEach(button => {
                button.addEventListener('click', function() {
                    const productId = parseInt(this.getAttribute('data-id'));
                    removeFromCart(productId);
                });
            });
        }
        
        cartModal.style.display = 'block';
    }

    // Show wishlist modal
    function showWishlistModal() {
        const wishlistItemsContainer = document.getElementById('wishlist-items');
        
        wishlistItemsContainer.innerHTML = '';
        
        if (wishlist.length === 0) {
            wishlistItemsContainer.innerHTML = '<p>Your wishlist is empty</p>';
        } else {
            wishlist.forEach(item => {
                const wishlistItem = document.createElement('div');
                wishlistItem.className = 'wishlist-item';
                wishlistItem.innerHTML = `
                    <div class="wishlist-item-image">
                        <img src="${item.image}" alt="${item.name}">
                    </div>
                    <div class="wishlist-item-details">
                        <h4 class="wishlist-item-title">${item.name}</h4>
                        <div class="wishlist-item-price">$${item.price}</div>
                    </div>
                    <button class="wishlist-item-remove" data-id="${item.id}">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                wishlistItemsContainer.appendChild(wishlistItem);
            });
            
            // Add event listeners to remove buttons
            document.querySelectorAll('.wishlist-item-remove').forEach(button => {
                button.addEventListener('click', function() {
                    const productId = parseInt(this.getAttribute('data-id'));
                    removeFromWishlist(productId);
                });
            });
        }
        
        wishlistModal.style.display = 'block';
    }

    // Remove from cart
    function removeFromCart(productId) {
        cart = cart.filter(item => item.id !== productId);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        showCartModal();
    }

    // Remove from wishlist
    function removeFromWishlist(productId) {
        wishlist = wishlist.filter(item => item.id !== productId);
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        updateWishlistCount();
        showWishlistModal();
    }

    // Show feedback message
    function showFeedback(message) {
        const feedback = document.createElement('div');
        feedback.className = 'feedback-message';
        feedback.textContent = message;
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            feedback.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            feedback.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(feedback);
            }, 300);
        }, 3000);
    }

    // Shuffle array for random product display
    function shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }

    // Add feedback message styles dynamically
    const style = document.createElement('style');
    style.textContent = `
        .feedback-message {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background-color: var(--secondary-color);
            color: var(--primary-color);
            padding: 12px 24px;
            border-radius: 30px;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            opacity: 0;
            transition: opacity 0.3s ease;
            z-index: 3000;
        }
        
        .feedback-message.show {
            opacity: 1;
        }
    `;
    document.head.appendChild(style);
});
