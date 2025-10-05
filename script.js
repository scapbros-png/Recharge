// PhonePe Mobile Recharge Website JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    
    // Check if returning from PhonePe payment
    checkPaymentReturn();
});

function checkPaymentReturn() {
    // Check if we have payment data indicating a return from PhonePe
    const paymentData = JSON.parse(localStorage.getItem('paymentData'));
    
    if (paymentData && paymentData.status === 'pending') {
        // We're returning from PhonePe, process the payment
        setTimeout(() => {
            handlePaymentReturn();
        }, 1000);
    }
}

// Backup initialization in case DOMContentLoaded doesn't fire
window.addEventListener('load', function() {
    // Check if timer is already running
    if (!window.countdownInterval) {
        console.log('Backup timer initialization...');
        startCountdown();
    }
});

// Additional backup - run after a delay
setTimeout(function() {
    if (!window.countdownInterval) {
        console.log('Delayed timer initialization...');
        startCountdown();
    }
}, 1000);

let currentSlideIndex = 0;
const slides = document.querySelectorAll('.carousel-slide');
const indicators = document.querySelectorAll('.indicator');

function initializeApp() {
    setupEventListeners();
    initializeFormValidation();
    initializeCarousel();
    setupMobileOptimizations();
    
    // Start countdown immediately
    startCountdown();
}

function setupEventListeners() {
    // Form submission
    const rechargeForm = document.getElementById('rechargeForm');
    rechargeForm.addEventListener('submit', handleFormSubmission);

    // Mobile number input formatting
    const mobileInput = document.getElementById('mobileNumber');
    mobileInput.addEventListener('input', formatMobileNumber);
    mobileInput.addEventListener('keypress', function(e) {
        // Only allow numbers, spaces, and + sign
        if (!/[0-9\s+]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter'].includes(e.key)) {
            e.preventDefault();
        }
    });

    // Provider selection
    const providerOptions = document.querySelectorAll('input[name="provider"]');
    providerOptions.forEach(option => {
        option.addEventListener('change', function() {
            updateProviderSelection(this.value);
        });
    });

    // Modal close events
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeAllModals();
        }
    });

    // Escape key to close modals
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
}

function formatMobileNumber() {
    const input = document.getElementById('mobileNumber');
    let value = input.value.replace(/\D/g, ''); // Remove non-digits
    
    // Limit to 10 digits only
    if (value.length > 10) {
        value = value.substring(0, 10);
    }
    
    input.value = value;
}

function updateProviderSelection(provider) {
    console.log('Selected provider:', provider);
    // You can add provider-specific logic here
}

function handleFormSubmission(e) {
    e.preventDefault();
    
    const mobileNumber = document.getElementById('mobileNumber').value;
    const selectedProvider = document.querySelector('input[name="provider"]:checked').value;
    
    // Validate form
    if (!validateForm(mobileNumber, selectedProvider)) {
        return;
    }
    
    // Show plan selection modal
    showPlanModal();
}

function validateForm(mobileNumber, selectedProvider) {
    // Clean mobile number for validation
    const cleanNumber = mobileNumber.replace(/\D/g, '');
    
    if (cleanNumber.length !== 10) { // 10 digits only
        showNotification('Please enter a valid 10-digit mobile number', 'error');
        return false;
    }
    
    if (!selectedProvider) {
        showNotification('Please select a network provider', 'error');
        return false;
    }
    
    return true;
}

function showPlanModal() {
    const modal = document.getElementById('planModal');
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closePlanModal() {
    const modal = document.getElementById('planModal');
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
}

function selectPlan(price, validity, data, planName) {
    console.log('Selected plan:', { price, validity, data, planName });
    
    // Store the selected plan details
    const selectedPlan = {
        price: price,
        validity: validity,
        data: data,
        planName: planName
    };
    
    // Store in localStorage for payment processing
    localStorage.setItem('selectedPlan', JSON.stringify(selectedPlan));
    
    closePlanModal();
    showPaymentModal();
    
    // Simulate payment processing
    setTimeout(() => {
        showSuccessMessage(price);
    }, 3000);
}

function showPaymentModal() {
    const modal = document.getElementById('paymentModal');
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
    
    // Get selected plan details
    const selectedPlan = JSON.parse(localStorage.getItem('selectedPlan'));
    const amount = selectedPlan ? selectedPlan.price : '₹0';
    
    // Update payment header with amount
    const paymentHeader = modal.querySelector('.payment-header h2');
    if (paymentHeader) {
        paymentHeader.textContent = `Redirecting to UPI Payment for ${amount}...`;
    }
    
    // Simulate redirect to Razorpay UPI after 2 seconds
    setTimeout(() => {
        redirectToRazorpayUPI(amount);
    }, 2000);
}

function redirectToRazorpayUPI(amount) {
    // Store payment details for return
    const selectedPlan = JSON.parse(localStorage.getItem('selectedPlan'));
    const paymentData = {
        amount: amount,
        plan: selectedPlan,
        timestamp: new Date().toISOString(),
        status: 'pending'
    };
    
    localStorage.setItem('paymentData', JSON.stringify(paymentData));
    
    // Your Razorpay UPI payment link
    const razorpayUPIUrl = `upi://pay?ver=01&mode=19&pa=arjunyadav216386.rzp@icici&pn=ARJUNYADAV&tr=RZPQqDORedM5eLJ70qrv2&cu=INR&mc=5732&qrMedium=04&tn=PaymenttoARJUNYADAV&am=${amount.replace('₹', '')}.00`;
    
    // Show redirect message
    const modal = document.getElementById('paymentModal');
    const paymentHeader = modal.querySelector('.payment-header h2');
    if (paymentHeader) {
        paymentHeader.textContent = 'Redirecting to UPI Payment...';
    }
    
    // Try to open UPI app
    try {
        // Create a hidden iframe to attempt the redirect
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = razorpayUPIUrl;
        document.body.appendChild(iframe);
        
        // Fallback: Try to open the UPI link directly
        setTimeout(() => {
            window.location.href = razorpayUPIUrl;
        }, 1000);
        
        // Clean up iframe
        setTimeout(() => {
            if (document.body.contains(iframe)) {
                document.body.removeChild(iframe);
            }
        }, 2000);
        
    } catch (error) {
        console.log('UPI app not available, using direct redirect');
        // Fallback to direct redirect
        window.location.href = razorpayUPIUrl;
    }
    
    // Simulate payment success after redirect (in real implementation, this would be handled by UPI callback)
    setTimeout(() => {
        simulateRazorpayPayment();
    }, 5000);
}

function simulateRazorpayPayment() {
    // Simulate successful payment from Razorpay UPI
    const paymentData = JSON.parse(localStorage.getItem('paymentData'));
    if (paymentData) {
        paymentData.status = 'success';
        paymentData.paymentId = 'RZP' + Date.now();
        localStorage.setItem('paymentData', JSON.stringify(paymentData));
    }
    
    // Simulate redirect back to our page
    handlePaymentReturn();
}

function handlePaymentReturn() {
    // Check if we're returning from Razorpay UPI payment
    const paymentData = JSON.parse(localStorage.getItem('paymentData'));
    
    if (paymentData && paymentData.status === 'success') {
        // Close payment modal
        closePaymentModal();
        
        // Show success message
        showSuccessMessage(paymentData.amount);
        
        // Clear payment data
        localStorage.removeItem('paymentData');
    } else {
        // Handle payment failure or cancellation
        handlePaymentFailure();
    }
}

function handlePaymentFailure() {
    closePaymentModal();
    
    // Show failure modal
    const failureModal = document.createElement('div');
    failureModal.className = 'modal show';
    failureModal.innerHTML = `
        <div class="modal-content payment-modal">
            <div class="payment-header">
                <div class="error-icon">
                    <i class="fas fa-times-circle"></i>
                </div>
                <h2>Payment Failed</h2>
            </div>
            <div class="payment-messages">
                <p>Your payment could not be processed.</p>
                <p>Please try again or contact support if the issue persists.</p>
            </div>
            <button class="recharge-btn" onclick="closeFailureModal()">Try Again</button>
        </div>
    `;
    
    document.body.appendChild(failureModal);
    document.body.style.overflow = 'hidden';
}

function closeFailureModal() {
    const failureModal = document.querySelector('.modal.show');
    if (failureModal) {
        failureModal.remove();
    }
    document.body.style.overflow = 'auto';
    
    // Clear any stored payment data
    localStorage.removeItem('paymentData');
}

function closePaymentModal() {
    const modal = document.getElementById('paymentModal');
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
}

function showSuccessMessage(amount) {
    closePaymentModal();
    
    // Get selected plan details for success message
    const selectedPlan = JSON.parse(localStorage.getItem('selectedPlan'));
    const planDetails = selectedPlan ? 
        `${selectedPlan.planName} - ${selectedPlan.validity} - ${selectedPlan.data}` : 
        'Selected Plan';
    
    // Create success modal
    const successModal = document.createElement('div');
    successModal.className = 'modal show';
    successModal.innerHTML = `
        <div class="modal-content payment-modal">
            <div class="payment-header">
                <div class="success-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h2>Recharge Successful!</h2>
            </div>
            <div class="payment-messages">
                <p>Your mobile recharge of ${amount} has been completed successfully.</p>
                <p><strong>Plan Details:</strong> ${planDetails}</p>
                <p>You will receive a confirmation SMS shortly.</p>
                <p>Thank you for using our recharge service!</p>
            </div>
            <button class="recharge-btn" onclick="closeSuccessModal()">Done</button>
        </div>
    `;
    
    document.body.appendChild(successModal);
    document.body.style.overflow = 'hidden';
}

function closeSuccessModal() {
    const successModal = document.querySelector('.modal.show');
    if (successModal) {
        successModal.remove();
        document.body.style.overflow = 'auto';
    }
}

function closeAllModals() {
    const modals = document.querySelectorAll('.modal.show');
    modals.forEach(modal => {
        modal.classList.remove('show');
    });
    document.body.style.overflow = 'auto';
}

function startCountdown() {
    const timerElement = document.querySelector('.timer');
    
    if (!timerElement) {
        console.log('Timer element not found, retrying...');
        // Retry after a short delay
        setTimeout(startCountdown, 200);
        return;
    }
    
    console.log('Timer element found, starting countdown...');
    
    // Start with 6 minutes (360 seconds total)
    let timeLeft = 6 * 60;
    
    function updateTimer() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        
        // Format with leading zeros
        const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        timerElement.textContent = formattedTime;
        
        // Add visual effects based on time remaining
        const countdownSection = document.querySelector('.countdown-section');
        const countdown = document.querySelector('.countdown');
        
            if (timeLeft <= 60) {
                // Last minute - add urgent styling
                if (countdownSection) countdownSection.style.background = 'white';
                if (countdown) {
                    countdown.style.animation = 'pulse 1s infinite';
                    countdown.style.background = 'rgba(220, 53, 69, 0.1)';
                    countdown.style.borderColor = 'rgba(220, 53, 69, 0.3)';
                }
                timerElement.style.color = '#dc3545';
                timerElement.style.fontWeight = '900';
            } else if (timeLeft <= 300) {
                // Last 5 minutes - add warning styling
                if (countdownSection) countdownSection.style.background = 'white';
                if (countdown) {
                    countdown.style.animation = 'none';
                    countdown.style.background = 'rgba(255, 193, 7, 0.1)';
                    countdown.style.borderColor = 'rgba(255, 193, 7, 0.3)';
                }
                timerElement.style.color = '#dc3545';
                timerElement.style.fontWeight = '700';
            } else {
                // Normal styling
                if (countdownSection) countdownSection.style.background = 'white';
                if (countdown) {
                    countdown.style.animation = 'none';
                    countdown.style.background = 'rgba(95, 37, 159, 0.1)';
                    countdown.style.borderColor = 'rgba(95, 37, 159, 0.2)';
                }
                timerElement.style.color = '#dc3545';
                timerElement.style.fontWeight = '700';
            }
        
        // Decrease the timer
        if (timeLeft > 0) {
            timeLeft--;
        } else {
            // When timer reaches 0, reset to 6:00 or show expired message
            timeLeft = 6 * 60; // Reset to 6:00
            showNotification('Special offer has ended! New offers coming soon.', 'warning');
            
                // Reset styling
                if (countdownSection) countdownSection.style.background = 'white';
                if (countdown) {
                    countdown.style.animation = 'none';
                    countdown.style.background = 'rgba(95, 37, 159, 0.1)';
                    countdown.style.borderColor = 'rgba(95, 37, 159, 0.2)';
                }
                timerElement.style.color = '#dc3545';
                timerElement.style.fontWeight = '700';
        }
    }
    
    // Initial call to set the timer immediately
    updateTimer();
    
    // Update every second
    const countdownInterval = setInterval(updateTimer, 1000);
    
    // Store interval ID for potential cleanup
    window.countdownInterval = countdownInterval;
    
    console.log('Countdown timer started successfully!');
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${getNotificationIcon(type)}"></i>
        <span>${message}</span>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        z-index: 3000;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideInRight 0.3s ease;
        max-width: 400px;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

function getNotificationColor(type) {
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
    };
    return colors[type] || '#17a2b8';
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .success-icon {
        width: 60px;
        height: 60px;
        background: #28a745;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 1rem;
    }
    
    .success-icon i {
        font-size: 2rem;
        color: white;
    }
`;
document.head.appendChild(style);

// Carousel Functions
function initializeCarousel() {
    // Auto-advance carousel every 5 seconds
    setInterval(() => {
        changeSlide(1);
    }, 5000);
}

function changeSlide(direction) {
    slides[currentSlideIndex].classList.remove('active');
    indicators[currentSlideIndex].classList.remove('active');
    
    currentSlideIndex += direction;
    
    if (currentSlideIndex >= slides.length) {
        currentSlideIndex = 0;
    } else if (currentSlideIndex < 0) {
        currentSlideIndex = slides.length - 1;
    }
    
    slides[currentSlideIndex].classList.add('active');
    indicators[currentSlideIndex].classList.add('active');
}

function currentSlide(slideNumber) {
    slides[currentSlideIndex].classList.remove('active');
    indicators[currentSlideIndex].classList.remove('active');
    
    currentSlideIndex = slideNumber - 1;
    
    slides[currentSlideIndex].classList.add('active');
    indicators[currentSlideIndex].classList.add('active');
}

// Mobile Optimizations
function setupMobileOptimizations() {
    // Prevent zoom on input focus (iOS)
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            if (window.innerWidth <= 768) {
                const viewport = document.querySelector('meta[name="viewport"]');
                if (viewport) {
                    viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
                }
            }
        });
        
        input.addEventListener('blur', function() {
            if (window.innerWidth <= 768) {
                const viewport = document.querySelector('meta[name="viewport"]');
                if (viewport) {
                    viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
                }
            }
        });
    });

    // Touch event optimizations
    let touchStartY = 0;
    let touchEndY = 0;

    document.addEventListener('touchstart', function(e) {
        touchStartY = e.changedTouches[0].screenY;
    });

    document.addEventListener('touchend', function(e) {
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartY - touchEndY;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe up - next slide
                changeSlide(1);
            } else {
                // Swipe down - previous slide
                changeSlide(-1);
            }
        }
    }

    // Prevent double-tap zoom
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(event) {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);

    // Optimize carousel for mobile
    if (window.innerWidth <= 768) {
        // Slower auto-advance on mobile
        clearInterval(window.carouselInterval);
        window.carouselInterval = setInterval(() => {
            changeSlide(1);
        }, 7000); // 7 seconds on mobile vs 5 on desktop
    }
}

// Manual timer start function
function startTimerManually() {
    console.log('Starting timer manually...');
    startCountdown();
}

// Export functions for global access
window.closePlanModal = closePlanModal;
window.selectPlan = selectPlan;
window.closeSuccessModal = closeSuccessModal;
window.showNotification = showNotification;
window.changeSlide = changeSlide;
window.currentSlide = currentSlide;
window.startTimerManually = startTimerManually;