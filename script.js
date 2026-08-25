// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }

    // Tips page tab functionality
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tipsContents = document.querySelectorAll('.tips-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tipsContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            this.classList.add('active');
            document.getElementById(category).classList.add('active');
        });
    });

    // Gallery filter functionality
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            
            // Remove active class from all filter buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Show/hide project cards based on filter
            projectCards.forEach(card => {
                if (filter === 'all' || card.getAttribute('data-category') === filter) {
                    card.style.display = 'block';
                    card.classList.add('fade-in');
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // Water usage tracker functionality
    const usageForm = document.getElementById('waterUsageForm');
    if (usageForm) {
        // Set today's date as default
        const dateInput = document.getElementById('date');
        if (dateInput) {
            dateInput.valueAsDate = new Date();
        }

        usageForm.addEventListener('submit', function(e) {
            e.preventDefault();
            logWaterUsage();
        });
    }

    // Contact form functionality
    const suggestionForm = document.getElementById('suggestionForm');
    if (suggestionForm) {
        suggestionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitSuggestion();
        });
    }

    // Load saved usage data
    loadUsageHistory();
    updateDashboardStats();
});

// Water usage calculation
function calculateUsage() {
    const showers = parseFloat(document.getElementById('showers').value) || 0;
    const dishwashing = parseFloat(document.getElementById('dishwashing').value) || 0;
    const laundry = parseFloat(document.getElementById('laundry').value) || 0;
    const toilet = parseFloat(document.getElementById('toilet').value) || 0;
    const cooking = parseFloat(document.getElementById('cooking').value) || 0;
    const gardening = parseFloat(document.getElementById('gardening').value) || 0;
    const other = parseFloat(document.getElementById('other').value) || 0;

    // Calculate total usage based on average consumption rates
    const totalUsage = 
        (showers * 2.5) +           // 2.5 gallons per minute
        (dishwashing * 6) +         // 6 gallons per load
        (laundry * 25) +            // 25 gallons per load
        (toilet * 1.6) +            // 1.6 gallons per flush
        cooking +                   // Direct input
        (gardening * 5) +           // 5 gallons per minute
        other;                      // Direct input

    // Display result
    const resultDiv = document.getElementById('usageResult');
    const totalSpan = document.getElementById('totalUsage');
    const comparisonText = document.getElementById('comparisonText');
    
    if (resultDiv && totalSpan && comparisonText) {
        totalSpan.textContent = totalUsage.toFixed(1);
        
        // Provide comparison with average usage
        const averageDaily = 80; // Average daily usage per person
        if (totalUsage < averageDaily * 0.8) {
            comparisonText.textContent = "Great job! You're using less water than average.";
            comparisonText.style.color = "#059669";
        } else if (totalUsage > averageDaily * 1.2) {
            comparisonText.textContent = "Consider implementing some water-saving tips to reduce usage.";
            comparisonText.style.color = "#dc2626";
        } else {
            comparisonText.textContent = "Your usage is close to the average. Small changes can make a big difference!";
            comparisonText.style.color = "#d97706";
        }
        
        resultDiv.style.display = 'block';
    }
}

// Log water usage
function logWaterUsage() {
    calculateUsage();
    
    const date = document.getElementById('date').value;
    const totalUsage = parseFloat(document.getElementById('totalUsage').textContent);
    
    if (!date || !totalUsage) {
        alert('Please calculate your usage first.');
        return;
    }
    
    // Get existing data
    let usageData = JSON.parse(localStorage.getItem('waterUsageData')) || [];
    
    // Check if entry for this date already exists
    const existingIndex = usageData.findIndex(entry => entry.date === date);
    
    if (existingIndex !== -1) {
        // Update existing entry
        usageData[existingIndex].usage = totalUsage;
    } else {
        // Add new entry
        usageData.push({
            date: date,
            usage: totalUsage,
            timestamp: new Date().toISOString()
        });
    }
    
    // Sort by date (newest first)
    usageData.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Save to localStorage
    localStorage.setItem('waterUsageData', JSON.stringify(usageData));
    
    // Update displays
    loadUsageHistory();
    updateDashboardStats();
    
    // Show success message
    alert('Water usage logged successfully!');
    
    // Reset form
    document.getElementById('waterUsageForm').reset();
    document.getElementById('date').valueAsDate = new Date();
    document.getElementById('usageResult').style.display = 'none';
}

// Load usage history
function loadUsageHistory() {
    const historyBody = document.getElementById('historyBody');
    if (!historyBody) return;
    
    const usageData = JSON.parse(localStorage.getItem('waterUsageData')) || [];
    
    if (usageData.length === 0) {
        historyBody.innerHTML = '<tr><td colspan="4" class="no-data">No usage data recorded yet. Start logging your daily usage!</td></tr>';
        return;
    }
    
    const averageUsage = usageData.reduce((sum, entry) => sum + entry.usage, 0) / usageData.length;
    
    historyBody.innerHTML = usageData.map(entry => {
        const comparison = entry.usage < averageUsage ? 'Below Average' : 
                          entry.usage > averageUsage ? 'Above Average' : 'Average';
        const comparisonClass = entry.usage < averageUsage ? 'text-green-600' : 
                               entry.usage > averageUsage ? 'text-red-600' : 'text-yellow-600';
        
        return `
            <tr>
                <td>${new Date(entry.date).toLocaleDateString()}</td>
                <td>${entry.usage.toFixed(1)}</td>
                <td class="${comparisonClass}">${comparison}</td>
                <td>
                    <button onclick="deleteUsageEntry('${entry.date}')" class="text-red-600 hover:text-red-800">
                        Delete
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Update dashboard stats
function updateDashboardStats() {
    const usageData = JSON.parse(localStorage.getItem('waterUsageData')) || [];
    
    if (usageData.length === 0) return;
    
    // Today's usage
    const today = new Date().toISOString().split('T')[0];
    const todayEntry = usageData.find(entry => entry.date === today);
    const todayUsage = todayEntry ? todayEntry.usage : 0;
    
    // Weekly average
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const weeklyData = usageData.filter(entry => new Date(entry.date) >= oneWeekAgo);
    const weeklyAverage = weeklyData.length > 0 ? 
        weeklyData.reduce((sum, entry) => sum + entry.usage, 0) / weeklyData.length : 0;
    
    // Monthly total
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const monthlyData = usageData.filter(entry => new Date(entry.date) >= oneMonthAgo);
    const monthlyTotal = monthlyData.reduce((sum, entry) => sum + entry.usage, 0);
    
    // Estimated savings (compared to average 80 gallons per day)
    const averageDaily = 80;
    const actualAverage = usageData.reduce((sum, entry) => sum + entry.usage, 0) / usageData.length;
    const dailySavings = Math.max(0, averageDaily - actualAverage);
    const totalSavings = dailySavings * usageData.length;
    
    // Update DOM elements
    const todayElement = document.getElementById('todayUsage');
    const weeklyElement = document.getElementById('weeklyAverage');
    const monthlyElement = document.getElementById('monthlyTotal');
    const savingsElement = document.getElementById('savings');
    
    if (todayElement) todayElement.textContent = todayUsage.toFixed(1);
    if (weeklyElement) weeklyElement.textContent = weeklyAverage.toFixed(1);
    if (monthlyElement) monthlyElement.textContent = monthlyTotal.toFixed(1);
    if (savingsElement) savingsElement.textContent = totalSavings.toFixed(0);
}

// Delete usage entry
function deleteUsageEntry(date) {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    
    let usageData = JSON.parse(localStorage.getItem('waterUsageData')) || [];
    usageData = usageData.filter(entry => entry.date !== date);
    
    localStorage.setItem('waterUsageData', JSON.stringify(usageData));
    
    loadUsageHistory();
    updateDashboardStats();
}

// Submit suggestion form
function submitSuggestion() {
    const formData = new FormData(document.getElementById('suggestionForm'));
    const data = Object.fromEntries(formData);
    
    // Simulate form submission (in a real app, this would send to a server)
    console.log('Suggestion submitted:', data);
    
    // Show success message
    document.getElementById('suggestionForm').style.display = 'none';
    document.getElementById('formSuccess').style.display = 'block';
    
    // Reset form after 3 seconds
    setTimeout(() => {
        document.getElementById('suggestionForm').style.display = 'block';
        document.getElementById('formSuccess').style.display = 'none';
        document.getElementById('suggestionForm').reset();
    }, 3000);
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add scroll effect to navbar
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(8, 145, 178, 0.95)';
            navbar.style.backdropFilter = 'blur(10px)';
        } else {
            navbar.style.background = 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)';
            navbar.style.backdropFilter = 'none';
        }
    }
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.feature-card, .project-card, .tip-card, .stat-item').forEach(el => {
    observer.observe(el);
});