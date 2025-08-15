// Preloader
window.addEventListener('load', function() {
    const preloader = document.getElementById('preloader');
    setTimeout(() => {
        preloader.classList.add('fade-out');
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 500);
    }, 1500);
});

// Mobile Navigation
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');

    navToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    });

    // Close menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav-link, .nav-cta');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });

    // Initialize the application
    initializeApp();
});

// Smooth Scrolling for Anchor Links
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

// Navbar Scroll Effect
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});

// Global App State
let appState = {
    walletConnected: false,
    walletAddress: null,
    tokenBalance: 0,
    ethBalance: 0,
    stakedAmount: 0,
    earnedRewards: 0,
    tokenData: null,
    verifiedProjects: []
};

// VOLVOT Token Configuration
const VOLVOT_CONFIG = {
    pairAddress: '0x67C28Ff783721Bd6482348646D32E76c6C177397',
    tokenAddress: '0x0bc057c3F103AC2Ccf6949b736818e42b13bc724',
    dexscreenerAPI: 'https://api.dexscreener.com/latest/dex/pairs/base/',
    imageUrl: 'https://dd.dexscreener.com/ds-data/tokens/base/0x0bc057c3f103ac2ccf6949b736818e42b13bc724.png?key=1192d0'
};

// Initialize Application
function initializeApp() {
    fetchTokenData();
    loadVerifiedProjects();
    updatePortfolioData();
    setupEventListeners();
    
    // Update token data every 30 seconds
    setInterval(fetchTokenData, 30000);
    setInterval(updatePortfolioData, 30000);
}

// Fetch Real Token Data from Dexscreener API
async function fetchTokenData() {
    try {
        const response = await fetch(`${VOLVOT_CONFIG.dexscreenerAPI}${VOLVOT_CONFIG.pairAddress}`);
        const data = await response.json();
        
        if (data && data.pair) {
            appState.tokenData = data.pair;
            updateTokenStats();
        }
    } catch (error) {
        console.error('Error fetching token data:', error);
        // Fallback to demo data if API fails
        updateTokenStats();
    }
}

// Update Token Statistics from Real Data
function updateTokenStats() {
    if (!appState.tokenData) {
        // Fallback demo data
        appState.tokenData = {
            priceUsd: "0.00001655",
            priceChange: { h24: 249 },
            volume: { h24: 5408.26 },
            marketCap: 16554,
            liquidity: { usd: 12500.61 }
        };
    }
    
    const priceElement = document.getElementById('token-price');
    const changeElement = document.getElementById('price-change');
    const marketCapElement = document.getElementById('market-cap');
    const volumeElement = document.getElementById('volume');
    const liquidityElement = document.getElementById('liquidity');
    
    if (priceElement) {
        priceElement.textContent = `$${parseFloat(appState.tokenData.priceUsd).toFixed(8)}`;
    }
    
    if (changeElement) {
        const change = appState.tokenData.priceChange?.h24 || 0;
        changeElement.textContent = `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
        changeElement.className = `stat-change ${change >= 0 ? 'positive' : 'negative'}`;
    }
    
    if (marketCapElement) {
        const marketCap = appState.tokenData.marketCap || appState.tokenData.fdv || 0;
        marketCapElement.textContent = `$${formatNumber(marketCap)}`;
    }
    
    if (volumeElement) {
        const volume = appState.tokenData.volume?.h24 || 0;
        volumeElement.textContent = `$${formatNumber(volume)}`;
    }
    
    if (liquidityElement) {
        const liquidity = appState.tokenData.liquidity?.usd || 0;
        liquidityElement.textContent = `$${formatNumber(liquidity)}`;
    }
    
    // Update exchange rate in trading interface
    updateExchangeRate();
}

// Update Exchange Rate
function updateExchangeRate() {
    const exchangeRateEl = document.getElementById('exchange-rate');
    if (exchangeRateEl && appState.tokenData) {
        const priceInETH = parseFloat(appState.tokenData.priceNative || "0.000000003583");
        const rate = 1 / priceInETH;
        exchangeRateEl.textContent = `1 WETH = ${formatNumber(rate)} VOLVOT`;
    }
}

// Load Verified Projects for Explorer Mode
function loadVerifiedProjects() {
    // Sample verified projects data (in production, this would come from your backend)
    appState.verifiedProjects = [
        {
            id: 'volvot',
            name: 'Volvot',
            symbol: 'VOLVOT',
            logo: VOLVOT_CONFIG.imageUrl,
            category: 'defi',
            price: appState.tokenData?.priceUsd || "0.00001655",
            marketCap: appState.tokenData?.marketCap || 16554,
            volume24h: appState.tokenData?.volume?.h24 || 5408,
            liquidity: appState.tokenData?.liquidity?.usd || 12500,
            badges: ['kyc', 'audited', 'premium'],
            description: 'Gateway to Crypto, built for humans. Revolutionary platform for new crypto users.',
            verified: true,
            auditScore: 95,
            kycCompleted: true,
            website: 'https://www.volvot.org',
            dexscreener: `https://dexscreener.com/base/${VOLVOT_CONFIG.pairAddress}`
        },
        {
            id: 'base-protocol',
            name: 'Base Protocol',
            symbol: 'BASE',
            logo: 'https://icons.llamao.fi/icons/protocols/base?w=48&h=48',
            category: 'infrastructure',
            price: "1.2450",
            marketCap: 125400000,
            volume24h: 2500000,
            liquidity: 45000000,
            badges: ['kyc', 'audited'],
            description: 'Ethereum Layer 2 solution built by Coinbase for secure, low-cost transactions.',
            verified: true,
            auditScore: 98,
            kycCompleted: true
        },
        {
            id: 'compound-base',
            name: 'Compound',
            symbol: 'COMP',
            logo: 'https://icons.llamao.fi/icons/protocols/compound?w=48&h=48',
            category: 'defi',
            price: "45.20",
            marketCap: 450200000,
            volume24h: 12500000,
            liquidity: 125000000,
            badges: ['kyc', 'audited', 'premium'],
            description: 'Decentralized lending protocol enabling users to earn interest on crypto assets.',
            verified: true,
            auditScore: 96,
            kycCompleted: true
        },
        {
            id: 'aave-base',
            name: 'Aave',
            symbol: 'AAVE',
            logo: 'https://icons.llamao.fi/icons/protocols/aave?w=48&h=48',
            category: 'defi',
            price: "89.50", 
            marketCap: 1250000000,
            volume24h: 45000000,
            liquidity: 250000000,
            badges: ['kyc', 'audited', 'premium'],
            description: 'Open source liquidity protocol for earning interest and borrowing crypto assets.',
            verified: true,
            auditScore: 97,
            kycCompleted: true
        },
        {
            id: 'uniswap-base',
            name: 'Uniswap',
            symbol: 'UNI',
            logo: 'https://icons.llamao.fi/icons/protocols/uniswap?w=48&h=48',
            category: 'defi',
            price: "7.25",
            marketCap: 7250000000,
            volume24h: 125000000,
            liquidity: 850000000,
            badges: ['kyc', 'audited', 'premium'],
            description: 'Leading decentralized exchange protocol for automated token trading.',
            verified: true,
            auditScore: 98,
            kycCompleted: true
        }
    ];
    
    displayVerifiedProjects();
}

// Display Verified Projects
function displayVerifiedProjects(filter = 'all') {
    const projectsContainer = document.getElementById('verified-projects');
    if (!projectsContainer) return;
    
    let filteredProjects = appState.verifiedProjects;
    
    if (filter !== 'all') {
        filteredProjects = appState.verifiedProjects.filter(project => project.category === filter);
    }
    
    const projectsHTML = filteredProjects.map(project => `
        <div class="project-card" data-category="${project.category}">
            <div class="project-header">
                <img src="${project.logo}" alt="${project.name}" class="project-logo" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2248%22 height=%2248%22 viewBox=%220 0 48 48%22><circle cx=%2224%22 cy=%2224%22 r=%2222%22 fill=%22%23667eea%22/><text x=%2224%22 y=%2230%22 text-anchor=%22middle%22 fill=%22white%22 font-size=%2214%22 font-weight=%22bold%22>${project.symbol.charAt(0)}</text></svg>'">
                <div class="project-info">
                    <h3>${project.name}</h3>
                    <div class="symbol">${project.symbol}</div>
                </div>
            </div>
            
            <div class="verification-badges">
                ${project.badges.map(badge => `<span class="badge ${badge}">${badge.toUpperCase()}</span>`).join('')}
            </div>
            
            <p>${project.description}</p>
            
            <div class="project-stats">
                <div class="stat-item">
                    <div class="label">Price</div>
                    <div class="value">$${project.price}</div>
                </div>
                <div class="stat-item">
                    <div class="label">Market Cap</div>
                    <div class="value">$${formatNumber(project.marketCap)}</div>
                </div>
                <div class="stat-item">
                    <div class="label">24h Volume</div>
                    <div class="value">$${formatNumber(project.volume24h)}</div>
                </div>
                <div class="stat-item">
                    <div class="label">Liquidity</div>
                    <div class="value">$${formatNumber(project.liquidity)}</div>
                </div>
            </div>
            
            <div class="project-actions">
                <button class="action-button primary" onclick="tradeProject('${project.id}')">Trade</button>
                <a href="${project.dexscreener || '#'}" target="_blank" class="action-button">View Chart</a>
            </div>
        </div>
    `).join('');
    
    projectsContainer.innerHTML = projectsHTML;
}

// Trade Project Function
function tradeProject(projectId) {
    if (projectId === 'volvot') {
        scrollToSection('trading');
    } else {
        showNotification(`Trading for ${projectId.toUpperCase()} will be available soon!`, 'info');
    }
}

// Wallet Connection
document.getElementById('connect-wallet')?.addEventListener('click', async function() {
    if (!appState.walletConnected) {
        await connectWallet();
    } else {
        disconnectWallet();
    }
});

async function connectWallet() {
    try {
        // Check if MetaMask is available
        if (typeof window.ethereum !== 'undefined') {
            // Request account access
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });
            
            if (accounts.length > 0) {
                appState.walletConnected = true;
                appState.walletAddress = accounts[0];
                
                // Simulate fetching balances
                appState.ethBalance = Math.random() * 2;
                appState.tokenBalance = Math.random() * 10000;
                
                updateWalletUI();
                updatePortfolioData();
                
                showNotification('Wallet connected successfully!', 'success');
            }
        } else {
            // Simulate connection for demo purposes
            appState.walletConnected = true;
            appState.walletAddress = '0x742d35cc9b5c47ec35c6c4c8b34c9b2ee9d4e7f4';
            appState.ethBalance = 1.5;
            appState.tokenBalance = 5000;
            
            updateWalletUI();
            updatePortfolioData();
            
            showNotification('Demo wallet connected!', 'success');
        }
    } catch (error) {
        console.error('Error connecting wallet:', error);
        showNotification('Failed to connect wallet', 'error');
    }
}

function disconnectWallet() {
    appState.walletConnected = false;
    appState.walletAddress = null;
    appState.ethBalance = 0;
    appState.tokenBalance = 0;
    appState.stakedAmount = 0;
    appState.earnedRewards = 0;
    
    updateWalletUI();
    updatePortfolioData();
    
    showNotification('Wallet disconnected', 'info');
}

function updateWalletUI() {
    const connectButton = document.getElementById('connect-wallet');
    const swapButton = document.getElementById('swap-button');
    const stakeButton = document.getElementById('stake-btn');
    
    if (appState.walletConnected) {
        if (connectButton) {
            connectButton.textContent = `${appState.walletAddress.slice(0, 6)}...${appState.walletAddress.slice(-4)}`;
        }
        if (swapButton) {
            swapButton.textContent = 'Swap';
            swapButton.disabled = false;
        }
        if (stakeButton) {
            stakeButton.textContent = 'Stake VOLVOT';
            stakeButton.disabled = false;
        }
        
        // Update balances
        const ethBalanceEl = document.getElementById('eth-balance');
        const volvotBalanceEl = document.getElementById('volvot-balance');
        const stakeBalanceEl = document.getElementById('stake-balance');
        
        if (ethBalanceEl) ethBalanceEl.textContent = appState.ethBalance.toFixed(4);
        if (volvotBalanceEl) volvotBalanceEl.textContent = formatNumber(appState.tokenBalance);
        if (stakeBalanceEl) stakeBalanceEl.textContent = formatNumber(appState.tokenBalance);
        
    } else {
        if (connectButton) connectButton.textContent = 'Connect Wallet';
        if (swapButton) {
            swapButton.textContent = 'Connect Wallet';
            swapButton.disabled = true;
        }
        if (stakeButton) {
            stakeButton.textContent = 'Connect Wallet';
            stakeButton.disabled = true;
        }
    }
}

// Trading Interface
function setupEventListeners() {
    // Explorer Mode Filter Tabs
    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            filterTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            const filter = this.dataset.filter;
            displayVerifiedProjects(filter);
        });
    });
    
    // Project Search
    const searchInput = document.getElementById('project-search');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const projectCards = document.querySelectorAll('.project-card');
            
            projectCards.forEach(card => {
                const projectName = card.querySelector('h3').textContent.toLowerCase();
                const projectSymbol = card.querySelector('.symbol').textContent.toLowerCase();
                
                if (projectName.includes(searchTerm) || projectSymbol.includes(searchTerm)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }
    
    // Swap functionality
    const fromAmountInput = document.getElementById('from-amount');
    const toAmountInput = document.getElementById('to-amount');
    const swapButton = document.getElementById('swap-button');
    
    if (fromAmountInput) {
        fromAmountInput.addEventListener('input', function() {
            calculateSwapAmount();
        });
    }
    
    if (swapButton) {
        swapButton.addEventListener('click', executeSwap);
    }
    
    // Staking functionality
    const stakeAmountInput = document.getElementById('stake-amount');
    const stakeMaxButton = document.getElementById('stake-max');
    const stakeButton = document.getElementById('stake-btn');
    
    if (stakeAmountInput) {
        stakeAmountInput.addEventListener('input', calculateStakingRewards);
    }
    
    if (stakeMaxButton) {
        stakeMaxButton.addEventListener('click', function() {
            if (stakeAmountInput) {
                stakeAmountInput.value = appState.tokenBalance;
                calculateStakingRewards();
            }
        });
    }
    
    if (stakeButton) {
        stakeButton.addEventListener('click', executeStake);
    }
    
    // Chart timeframe selection
    const timeframes = document.querySelectorAll('.timeframe');
    timeframes.forEach(button => {
        button.addEventListener('click', function() {
            timeframes.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            updateChart(this.dataset.period);
        });
    });
}

function calculateSwapAmount() {
    const fromAmount = parseFloat(document.getElementById('from-amount')?.value || 0);
    if (!appState.tokenData) return;
    
    const priceInETH = parseFloat(appState.tokenData.priceNative || "0.000000003583");
    const exchangeRate = 1 / priceInETH;
    const toAmount = fromAmount * exchangeRate;
    
    const toAmountInput = document.getElementById('to-amount');
    if (toAmountInput) {
        toAmountInput.value = toAmount.toFixed(2);
    }
}

async function executeSwap() {
    if (!appState.walletConnected) {
        showNotification('Please connect your wallet first', 'error');
        return;
    }
    
    const fromAmount = parseFloat(document.getElementById('from-amount')?.value || 0);
    if (fromAmount <= 0 || fromAmount > appState.ethBalance) {
        showNotification('Invalid swap amount', 'error');
        return;
    }
    
    // Simulate swap transaction
    showNotification('Executing swap...', 'info');
    
    setTimeout(() => {
        const priceInETH = parseFloat(appState.tokenData?.priceNative || "0.000000003583");
        const exchangeRate = 1 / priceInETH;
        const receivedTokens = fromAmount * exchangeRate;
        
        appState.ethBalance -= fromAmount;
        appState.tokenBalance += receivedTokens;
        
        updateWalletUI();
        updatePortfolioData();
        
        // Clear inputs
        document.getElementById('from-amount').value = '';
        document.getElementById('to-amount').value = '';
        
        showNotification(`Swapped ${fromAmount} WETH for ${receivedTokens.toFixed(2)} VOLVOT!`, 'success');
        
        // Add to transaction history
        addTransaction('swap', `${fromAmount} WETH → ${receivedTokens.toFixed(2)} VOLVOT`);
    }, 2000);
}

// Staking functionality
function calculateStakingRewards() {
    const stakeAmount = parseFloat(document.getElementById('stake-amount')?.value || 0);
    const dailyRate = 0.152 / 365; // 15.2% APY
    const dailyEarnings = stakeAmount * dailyRate;
    
    const dailyEarningsEl = document.getElementById('daily-earnings');
    if (dailyEarningsEl) {
        dailyEarningsEl.textContent = `${dailyEarnings.toFixed(4)} VOLVOT`;
    }
}

async function executeStake() {
    if (!appState.walletConnected) {
        showNotification('Please connect your wallet first', 'error');
        return;
    }
    
    const stakeAmount = parseFloat(document.getElementById('stake-amount')?.value || 0);
    if (stakeAmount <= 0 || stakeAmount > appState.tokenBalance) {
        showNotification('Invalid stake amount', 'error');
        return;
    }
    
    // Simulate staking transaction
    showNotification('Staking tokens...', 'info');
    
    setTimeout(() => {
        appState.tokenBalance -= stakeAmount;
        appState.stakedAmount += stakeAmount;
        
        updateWalletUI();
        updatePortfolioData();
        updateStakingPositions();
        
        // Clear input
        document.getElementById('stake-amount').value = '';
        
        showNotification(`Successfully staked ${stakeAmount} VOLVOT!`, 'success');
        
        // Add to transaction history
        addTransaction('stake', `${stakeAmount} VOLVOT staked`);
    }, 2000);
}

function updateStakingPositions() {
    const positionsContainer = document.getElementById('staking-positions');
    if (!positionsContainer) return;
    
    if (appState.stakedAmount > 0) {
        positionsContainer.innerHTML = `
            <div class="staking-position">
                <div class="position-header">
                    <strong>${appState.stakedAmount.toFixed(2)} VOLVOT</strong>
                    <span class="apy-badge">15.2% APY</span>
                </div>
                <div class="position-info">
                    <div class="info-row">
                        <span>Staked Amount</span>
                        <span>${appState.stakedAmount.toFixed(2)} VOLVOT</span>
                    </div>
                    <div class="info-row">
                        <span>Rewards Earned</span>
                        <span class="text-success">${appState.earnedRewards.toFixed(4)} VOLVOT</span>
                    </div>
                    <div class="info-row">
                        <span>Lock Remaining</span>
                        <span>6 days</span>
                    </div>
                </div>
                <button class="unstake-button" onclick="unstakeTokens()">Unstake</button>
            </div>
        `;
    } else {
        positionsContainer.innerHTML = `
            <div class="empty-state">
                <p>No active staking positions</p>
                <small>Start staking to earn passive income</small>
            </div>
        `;
    }
}

function unstakeTokens() {
    if (appState.stakedAmount > 0) {
        showNotification('Unstaking tokens...', 'info');
        
        setTimeout(() => {
            appState.tokenBalance += appState.stakedAmount + appState.earnedRewards;
            appState.stakedAmount = 0;
            appState.earnedRewards = 0;
            
            updateWalletUI();
            updatePortfolioData();
            updateStakingPositions();
            
            showNotification('Successfully unstaked tokens!', 'success');
        }, 2000);
    }
}

// Portfolio Updates
function updatePortfolioData() {
    const tokenPrice = parseFloat(appState.tokenData?.priceUsd || "0.00001655");
    const ethPrice = 3000; // Assuming ETH price
    
    const portfolioValue = (appState.tokenBalance + appState.stakedAmount) * tokenPrice + appState.ethBalance * ethPrice;
    
    const portfolioValueEl = document.getElementById('portfolio-value');
    const totalVolvotEl = document.getElementById('total-volvot');
    const totalRewardsEl = document.getElementById('total-rewards');
    const userStakedEl = document.getElementById('user-staked');
    const userEarningsEl = document.getElementById('user-earnings');
    
    if (portfolioValueEl) {
        portfolioValueEl.textContent = `$${portfolioValue.toFixed(2)}`;
    }
    
    if (totalVolvotEl) {
        totalVolvotEl.textContent = formatNumber(appState.tokenBalance + appState.stakedAmount);
    }
    
    if (totalRewardsEl) {
        totalRewardsEl.textContent = appState.earnedRewards.toFixed(4);
    }
    
    if (userStakedEl) {
        userStakedEl.textContent = `${appState.stakedAmount.toFixed(2)} VOLVOT`;
    }
    
    if (userEarningsEl) {
        userEarningsEl.textContent = `$${(appState.earnedRewards * tokenPrice).toFixed(2)} earned`;
    }
    
    // Update portfolio change (simulate)
    const portfolioChangeEl = document.getElementById('portfolio-change');
    if (portfolioChangeEl) {
        const change = parseFloat(appState.tokenData?.priceChange?.h24 || 0);
        portfolioChangeEl.textContent = `${change >= 0 ? '+' : ''}${change.toFixed(2)}% (24h)`;
        portfolioChangeEl.className = `stat-change ${change >= 0 ? 'positive' : 'negative'}`;
    }
}

function addTransaction(type, description) {
    const transactionsList = document.getElementById('recent-transactions');
    if (!transactionsList) return;
    
    const timestamp = new Date().toLocaleTimeString();
    const transactionHtml = `
        <div class="transaction-item">
            <div class="transaction-icon">${type === 'swap' ? '💱' : '🏦'}</div>
            <div class="transaction-details">
                <div class="transaction-desc">${description}</div>
                <div class="transaction-time">${timestamp}</div>
            </div>
        </div>
    `;
    
    if (transactionsList.querySelector('.empty-state')) {
        transactionsList.innerHTML = transactionHtml;
    } else {
        transactionsList.insertAdjacentHTML('afterbegin', transactionHtml);
    }
}

// Chart Updates
function updateChart(period) {
    const dataPoints = document.querySelectorAll('.data-point');
    dataPoints.forEach((point, index) => {
        const height = Math.random() * 80 + 20;
        point.style.height = `${height}%`;
        point.style.animationDelay = `${index * 0.1}s`;
    });
}

// Real-time Updates Simulation
function simulateRealTimeUpdates() {
    // Simulate staking rewards accumulation
    setInterval(() => {
        if (appState.stakedAmount > 0) {
            const rewardRate = 0.152 / 365 / 24 / 60; // Per minute for demo
            appState.earnedRewards += appState.stakedAmount * rewardRate;
            updatePortfolioData();
            updateStakingPositions();
        }
    }, 60000); // Update every minute
    
    // Simulate price movements
    setInterval(() => {
        updateChart('1h'); // Refresh chart
    }, 10000); // Update every 10 seconds
}

// Advanced AI Guide System
const aiGuide = {
    isOpen: false,
    currentContext: 'general',
    conversationHistory: [],
    
    init() {
        this.setupEventListeners();
        this.startContextTracking();
        this.showWelcomeBubble();
    },
    
    setupEventListeners() {
        const avatar = document.getElementById('ai-avatar');
        const closeBtn = document.getElementById('ai-close');
        
        avatar?.addEventListener('click', () => this.toggle());
        closeBtn?.addEventListener('click', () => this.close());
        
        // Context-aware tooltips
        this.setupContextualHelp();
    },
    
    showWelcomeBubble() {
        setTimeout(() => {
            const bubble = document.getElementById('ai-chat-bubble');
            if (bubble) {
                bubble.classList.add('show');
                setTimeout(() => bubble.classList.remove('show'), 5000);
            }
        }, 3000);
    },
    
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    },
    
    open() {
        const panel = document.getElementById('ai-panel');
        const bubble = document.getElementById('ai-chat-bubble');
        
        if (panel) {
            panel.classList.add('show');
            this.isOpen = true;
            
            // Update context help based on current page section
            this.updateContextHelp();
            
            // Focus input
            setTimeout(() => {
                const input = document.getElementById('ai-input');
                input?.focus();
            }, 300);
        }
        
        if (bubble) {
            bubble.classList.remove('show');
        }
    },
    
    close() {
        const panel = document.getElementById('ai-panel');
        if (panel) {
            panel.classList.remove('show');
            this.isOpen = false;
        }
    },
    
    updateContextHelp() {
        const contextHelp = document.getElementById('ai-context-help');
        if (!contextHelp) return;
        
        const section = this.getCurrentSection();
        const contextCards = {
            hero: {
                title: '🚀 Welcome to VOLVOT',
                description: 'Get started with crypto trading made simple.',
                actions: [
                    { text: 'What is VOLVOT?', action: () => this.askQuestion('What is VOLVOT token?') },
                    { text: 'How to start?', action: () => this.startTour() }
                ]
            },
            explorer: {
                title: '🧭 Explorer Mode Guide',
                description: 'Learn about verified projects and security.',
                actions: [
                    { text: 'Explain verification', action: () => this.askQuestion('What does verified mean?') },
                    { text: 'How to research?', action: () => this.askQuestion('How to research projects?') }
                ]
            },
            trading: {
                title: '💱 Trading Assistant',
                description: 'Master crypto trading step-by-step.',
                actions: [
                    { text: 'Trading tutorial', action: () => this.startTradingTutorial() },
                    { text: 'Explain fees', action: () => this.askQuestion('What are trading fees?') }
                ]
            },
            staking: {
                title: '🏦 Staking Guide',
                description: 'Maximize your rewards with smart staking.',
                actions: [
                    { text: 'Staking tutorial', action: () => this.startStakingTutorial() },
                    { text: 'Risk analysis', action: () => this.askQuestion('What are staking risks?') }
                ]
            },
            tokenomics: {
                title: '📊 Tokenomics Explained',
                description: 'Understand VOLVOT token economics.',
                actions: [
                    { text: 'Explain utility', action: () => this.askQuestion('What is VOLVOT utility?') },
                    { text: 'Token distribution', action: () => this.askQuestion('How are tokens distributed?') }
                ]
            },
            portfolio: {
                title: '📈 Portfolio Optimization',
                description: 'Track and optimize your investments.',
                actions: [
                    { text: 'Portfolio tips', action: () => this.askQuestion('How to optimize portfolio?') },
                    { text: 'Risk management', action: () => this.askQuestion('How to manage risk?') }
                ]
            }
        };
        
        const context = contextCards[section] || contextCards.hero;
        
        contextHelp.innerHTML = `
            <div class="context-card">
                <h4>${context.title}</h4>
                <p>${context.description}</p>
                <div class="quick-actions">
                    ${context.actions.map((action, index) => 
                        `<button class="quick-action" onclick="aiGuide.contextActions['${section}'][${index}]()">${action.text}</button>`
                    ).join('')}
                </div>
            </div>
        `;
        
        // Store actions for execution
        this.contextActions = this.contextActions || {};
        this.contextActions[section] = context.actions.map(action => action.action);
    },
    
    getCurrentSection() {
        const sections = ['hero', 'explorer', 'trading', 'staking', 'tokenomics', 'portfolio'];
        const scrollPosition = window.scrollY + 200;
        
        for (const section of sections) {
            const element = document.getElementById(section === 'hero' ? 'features' : section);
            if (element && scrollPosition < element.offsetTop) {
                return section;
            }
        }
        
        return 'portfolio';
    },
    
    askQuestion(question) {
        const input = document.getElementById('ai-input');
        if (input) {
            input.value = question;
            this.sendMessage();
        }
    },
    
    sendMessage() {
        const input = document.getElementById('ai-input');
        const message = input?.value.trim();
        
        if (!message) return;
        
        this.addMessage('user', message);
        input.value = '';
        
        // Show typing indicator
        this.showTypingIndicator();
        
        setTimeout(() => {
            const response = this.generateAdvancedResponse(message);
            this.hideTypingIndicator();
            this.addMessage('ai', response);
        }, 1000 + Math.random() * 1000);
    },
    
    addMessage(type, content) {
        const messages = document.getElementById('ai-messages');
        if (!messages) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `ai-message ${type === 'user' ? 'user-message' : ''}`;
        
        messageDiv.innerHTML = `
            <div class="message-avatar">${type === 'user' ? '👤' : '🤖'}</div>
            <div class="message-content">${content}</div>
        `;
        
        messages.appendChild(messageDiv);
        messages.scrollTop = messages.scrollHeight;
        
        // Store in conversation history
        this.conversationHistory.push({ type, content, timestamp: Date.now() });
    },
    
    showTypingIndicator() {
        const messages = document.getElementById('ai-messages');
        if (!messages) return;
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'ai-message typing-indicator';
        typingDiv.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-content">
                <div class="typing-dots">
                    <span></span><span></span><span></span>
                </div>
            </div>
        `;
        
        messages.appendChild(typingDiv);
        messages.scrollTop = messages.scrollHeight;
    },
    
    hideTypingIndicator() {
        const typing = document.querySelector('.typing-indicator');
        typing?.remove();
    },
    
    generateAdvancedResponse(message) {
        const lowerMessage = message.toLowerCase();
        const currentPrice = appState.tokenData?.priceUsd || "0.00001655";
        const section = this.getCurrentSection();
        
        // Context-aware responses
        if (section === 'trading' && (lowerMessage.includes('how') || lowerMessage.includes('trade'))) {
            return this.getTradingGuidance(message);
        } else if (section === 'staking' && (lowerMessage.includes('stake') || lowerMessage.includes('reward'))) {
            return this.getStakingGuidance(message);
        } else if (section === 'tokenomics' && (lowerMessage.includes('token') || lowerMessage.includes('utility'))) {
            return this.getTokenomicsGuidance(message);
        }
        
        // General responses with more intelligence
        if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
            return `💰 Current VOLVOT price: $${currentPrice}<br><br>
                📈 24h change: ${appState.tokenData?.priceChange?.h24?.toFixed(2) || 'N/A'}%<br>
                📊 Market cap: $${formatNumber(appState.tokenData?.marketCap || 16554)}<br><br>
                💡 <strong>Pro tip:</strong> Price is just one factor. Check our tokenomics section to understand long-term value drivers!`;
        }
        
        if (lowerMessage.includes('verified') || lowerMessage.includes('audit')) {
            return `🔒 Our verification process ensures only legitimate projects:<br><br>
                ✅ <strong>KYC Completed:</strong> All team members identified<br>
                ✅ <strong>Smart Contract Audited:</strong> Security verified by experts<br>  
                ✅ <strong>Premium Rated:</strong> Meets our quality standards<br><br>
                🛡️ This means you can trade with confidence knowing these projects have passed rigorous security checks.`;
        }
        
        if (lowerMessage.includes('wallet') || lowerMessage.includes('connect')) {
            return `🔗 <strong>Connecting your wallet is easy:</strong><br><br>
                1️⃣ Click "Connect Wallet" in the top right<br>
                2️⃣ Select MetaMask or your preferred wallet<br>
                3️⃣ Approve the connection<br>
                4️⃣ Switch to Base network if prompted<br><br>
                💡 <strong>New to wallets?</strong> I can guide you through setting up MetaMask step-by-step!`;
        }
        
        if (lowerMessage.includes('risk') || lowerMessage.includes('safe')) {
            return `⚠️ <strong>Smart risk management:</strong><br><br>
                🎯 <strong>Diversification:</strong> Don't put all funds in one asset<br>
                📊 <strong>Position sizing:</strong> Never invest more than you can lose<br>
                ⏰ <strong>Dollar-cost averaging:</strong> Spread purchases over time<br>
                🔍 <strong>Research:</strong> Use our Explorer Mode for verified projects<br><br>
                📚 Want me to explain any of these strategies in detail?`;
        }
        
        // Default intelligent response
        return `🤔 I understand you're asking about "${message}"<br><br>
            Based on your current section (${section}), here's what I can help with:<br><br>
            💡 Step-by-step tutorials<br>
            📊 Real-time market analysis<br>
            🔍 Project research guidance<br>
            ⚡ Trading strategies<br>
            🏦 Staking optimization<br><br>
            What specific aspect would you like me to dive deeper into?`;
    },
    
    getTradingGuidance(message) {
        return `💱 <strong>Trading Tutorial - Let's get you started:</strong><br><br>
            <strong>Step 1:</strong> Connect your wallet (top right button)<br>
            <strong>Step 2:</strong> Ensure you have WETH on Base network<br>
            <strong>Step 3:</strong> Enter amount in "From" field<br>
            <strong>Step 4:</strong> Review rate and fees<br>
            <strong>Step 5:</strong> Click "Swap" and confirm<br><br>
            💡 <strong>Pro tips:</strong><br>
            • Start with small amounts to learn<br>
            • Check gas fees during low network activity<br>
            • Use our 1% slippage setting for stable trades<br><br>
            🔥 Current VOLVOT rate: ${appState.tokenData ? 
                `1 WETH = ${formatNumber(1 / parseFloat(appState.tokenData.priceNative || "0.000000003583"))} VOLVOT` : 
                'Loading...'}<br><br>
            Ready to make your first trade? I'll guide you through each step!`;
    },
    
    getStakingGuidance(message) {
        return `🏦 <strong>Staking Guide - Earn while you hold:</strong><br><br>
            <strong>Current APY:</strong> 15.2% (Updated hourly)<br>
            <strong>Minimum lock:</strong> 7 days<br>
            <strong>Rewards:</strong> Paid continuously<br><br>
            📋 <strong>How to stake:</strong><br>
            1️⃣ Connect wallet and have VOLVOT tokens<br>
            2️⃣ Navigate to Staking section<br>
            3️⃣ Enter amount or click "MAX"<br>
            4️⃣ Confirm transaction<br>
            5️⃣ Watch rewards accumulate!<br><br>
            💰 <strong>Earnings calculator:</strong><br>
            • 1,000 VOLVOT staked = ~0.42 VOLVOT daily<br>
            • 10,000 VOLVOT staked = ~4.2 VOLVOT daily<br><br>
            ⚠️ <strong>Important:</strong> Tokens are locked for 7 days minimum. Plan accordingly!<br><br>
            Want me to calculate potential earnings for a specific amount?`;
    },
    
    getTokenomicsGuidance(message) {
        return `📊 <strong>VOLVOT Tokenomics - Designed for Growth:</strong><br><br>
            💎 <strong>Total Supply:</strong> 1,000,000,000 VOLVOT<br>
            🔥 <strong>Deflationary:</strong> 25% of fees burned monthly<br>
            ⚡ <strong>Network:</strong> Base Chain (low fees)<br><br>
            🎯 <strong>Utility Benefits:</strong><br>
            • 50% trading fee discounts<br>
            • Governance voting rights<br>
            • Revenue sharing from platform profits<br>
            • Premium feature access<br>
            • 15.2% staking rewards<br><br>
            📈 <strong>Distribution:</strong><br>
            • 40% Community & Ecosystem<br>
            • 25% Liquidity & Trading<br>
            • 20% Development<br>
            • 10% Team (4-year vesting)<br>
            • 5% Reserve Fund<br><br>
            🔥 <strong>Burn Mechanism:</strong><br>
            Every trade burns tokens, reducing supply over time!<br><br>
            Want to see the detailed tokenomics breakdown?`;
    },
    
    startTour() {
        this.addMessage('ai', `🎯 <strong>Welcome to your VOLVOT tour!</strong><br><br>
            I'll guide you through each section. Let's start:<br><br>
            📍 <strong>Current:</strong> Hero section - Live token data<br>
            📍 <strong>Next:</strong> Explorer Mode - Verified projects<br><br>
            Scroll down when ready, and I'll explain each feature as we go!<br><br>
            <em>Type "next" to continue the tour anytime.</em>`);
    },
    
    startTradingTutorial() {
        if (!appState.walletConnected) {
            this.addMessage('ai', `🔗 <strong>Let's start with wallet connection:</strong><br><br>
                1️⃣ Click "Connect Wallet" (top right)<br>
                2️⃣ I'll guide you through each step<br><br>
                Once connected, we'll do a practice trade together!`);
        } else {
            this.addMessage('ai', `💱 <strong>Great! Wallet connected. Let's trade:</strong><br><br>
                I see you have ${appState.ethBalance.toFixed(4)} WETH available.<br><br>
                Let's do a small test trade:<br>
                1️⃣ Try 0.001 WETH first<br>
                2️⃣ See the rate calculation<br>
                3️⃣ Review fees<br><br>
                Go ahead and enter 0.001 in the "From" field!`);
        }
    },
    
    startStakingTutorial() {
        this.addMessage('ai', `🏦 <strong>Staking Tutorial - Let's optimize your rewards:</strong><br><br>
            Current setup: 15.2% APY, 7-day minimum lock<br><br>
            💡 <strong>Strategy recommendations:</strong><br>
            • Start with 25% of your VOLVOT holdings<br>
            • Compound rewards weekly<br>
            • Monitor APY changes<br><br>
            Ready to start? Navigate to the Staking section and I'll guide you!`);
    },
    
    setupContextualHelp() {
        // Add contextual tooltips on hover
        const elements = document.querySelectorAll('[data-tooltip]');
        elements.forEach(el => {
            el.addEventListener('mouseenter', (e) => this.showTooltip(e));
            el.addEventListener('mouseleave', () => this.hideTooltip());
        });
    },
    
    showTooltip(event) {
        const tooltip = document.createElement('div');
        tooltip.className = 'contextual-tooltip show';
        tooltip.textContent = event.target.dataset.tooltip;
        
        const rect = event.target.getBoundingClientRect();
        tooltip.style.left = rect.left + (rect.width / 2) + 'px';
        tooltip.style.top = rect.top - 10 + 'px';
        
        document.getElementById('contextual-tooltips').appendChild(tooltip);
    },
    
    hideTooltip() {
        const tooltip = document.querySelector('.contextual-tooltip');
        tooltip?.remove();
    },
    
    startContextTracking() {
        // Update context help when scrolling
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    if (this.isOpen) {
                        this.updateContextHelp();
                    }
                    ticking = false;
                });
                ticking = true;
            }
        });
    }
};

// Initialize AI Guide when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    aiGuide.init();
});

// Update the old functions to work with new AI system
function openAIChat() {
    aiGuide.open();
}

function closeAIChat() {
    aiGuide.close();
}

function handleAIEnter(event) {
    if (event.key === 'Enter') {
        aiGuide.sendMessage();
    }
}

// Add chart drawing for tokenomics
function drawDistributionChart() {
    const canvas = document.getElementById('distribution-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 80;
    
    const data = [
        { label: 'Community & Ecosystem', value: 40, color: '#667eea' },
        { label: 'Liquidity & Trading', value: 25, color: '#48bb78' },
        { label: 'Development & Marketing', value: 20, color: '#f6ad55' },
        { label: 'Team & Advisors', value: 10, color: '#fc8181' },
        { label: 'Reserve Fund', value: 5, color: '#9f7aea' }
    ];
    
    let currentAngle = -Math.PI / 2;
    
    data.forEach(segment => {
        const sliceAngle = (segment.value / 100) * 2 * Math.PI;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = segment.color;
        ctx.fill();
        
        currentAngle += sliceAngle;
    });
    
    // Add inner circle for donut effect
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();
}

// Utility Functions
function formatNumber(num) {
    if (num >= 1000000000) {
        return (num / 1000000000).toFixed(1) + 'B';
    } else if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toFixed(0);
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

function showComingSoon() {
    showNotification('This feature is coming soon! Stay tuned for updates.', 'info');
}

// Early Access Form
document.getElementById('early-access-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = this.querySelector('input[type="email"]').value;
    const button = this.querySelector('button');
    const originalText = button.textContent;
    
    // Validation
    if (!email || !isValidEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    // Loading state
    button.textContent = 'Joining...';
    button.classList.add('loading');
    
    // Simulate API call
    setTimeout(() => {
        button.textContent = 'Joined! ✓';
        button.classList.remove('loading');
        button.classList.add('success');
        
        showNotification('Successfully joined the early access list!', 'success');
        
        // Reset form
        this.reset();
        
        // Reset button after 3 seconds
        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('success');
        }, 3000);
    }, 2000);
});

// Email Validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Notification System
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${getNotificationIcon(type)}</span>
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 90px;
        right: 20px;
        background: ${type === 'success' ? '#48bb78' : type === 'error' ? '#f56565' : type === 'info' ? '#667eea' : '#667eea'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        z-index: 10001;
        animation: slideIn 0.3s ease;
        max-width: 350px;
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
    
    // Manual close
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    });
}

function getNotificationIcon(type) {
    switch(type) {
        case 'success': return '✓';
        case 'error': return '✗';
        case 'info': return 'ℹ';
        default: return 'ℹ';
    }
}

// Initialize real-time updates and draw charts
document.addEventListener('DOMContentLoaded', function() {
    simulateRealTimeUpdates();
    setTimeout(drawDistributionChart, 1000); // Draw chart after page loads
});

// Parallax Effect for Hero Section
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const shapes = document.querySelectorAll('.geometric-shape');
    
    shapes.forEach((shape, index) => {
        const speed = (index + 1) * 0.5;
        shape.style.transform = `translateY(${scrolled * speed}px) rotate(${scrolled * 0.1}deg)`;
    });
});

// Intersection Observer for Animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', function() {
    const animateElements = document.querySelectorAll('.feature-card, .mode-card, .section-header, .stat-card, .project-card');
    
    animateElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(element);
    });
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        margin-left: auto;
    }
    
    .notification-close:hover {
        opacity: 0.8;
    }
    
    .staking-position {
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        padding: 20px;
        margin-bottom: 15px;
    }
    
    .position-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
    }
    
    .unstake-button {
        width: 100%;
        padding: 10px;
        background: #f56565;
        color: white;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        margin-top: 15px;
        transition: background 0.3s ease;
    }
    
    .unstake-button:hover {
        background: #e53e3e;
    }
    
    .transaction-item {
        display: flex;
        align-items: center;
        gap: 15px;
        padding: 15px;
        border-bottom: 1px solid #e2e8f0;
    }
    
    .transaction-item:last-child {
        border-bottom: none;
    }
    
    .transaction-icon {
        font-size: 1.5rem;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f8fafc;
        border-radius: 50%;
    }
    
    .transaction-details {
        flex: 1;
    }
    
    .transaction-desc {
        font-weight: 600;
        color: #2d3748;
        margin-bottom: 5px;
    }
    
    .transaction-time {
        font-size: 0.8rem;
        color: #666;
    }
`;
document.head.appendChild(style);

// Copy to clipboard functionality
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Copied to clipboard!', 'success');
    }).catch(() => {
        showNotification('Failed to copy to clipboard', 'error');
    });
}

// Social Trading Functions
function followTrader(traderName) {
    showNotification(`Started following ${traderName}! 🎯`, 'success');
    
    // Simulate adding the trader to following list
    setTimeout(() => {
        showNotification(`${traderName} just made a new trade! Check signals.`, 'info');
    }, 5000);
}

function createPost() {
    const input = document.getElementById('new-post-input');
    const content = input.value.trim();
    
    if (!content) {
        showNotification('Please enter a message to post', 'error');
        return;
    }
    
    if (!appState.walletConnected) {
        showNotification('Please connect your wallet to post', 'error');
        return;
    }
    
    const feed = document.getElementById('social-feed');
    const newPost = document.createElement('div');
    newPost.className = 'feed-post';
    newPost.innerHTML = `
        <div class="post-header">
            <div class="post-avatar">🎯</div>
            <div class="post-info">
                <div class="post-author">You</div>
                <div class="post-time">Just now</div>
            </div>
        </div>
        <div class="post-content">${content}</div>
        <div class="post-actions">
            <button class="like-btn">❤️ 0</button>
            <button class="comment-btn">💬 0</button>
            <button class="share-btn">🔄 0</button>
        </div>
    `;
    
    feed.insertBefore(newPost, feed.firstChild);
    input.value = '';
    
    showNotification('Post shared with the community! 🚀', 'success');
}

function openSignalsModal() {
    showNotification('Opening live signals dashboard...', 'info');
    // Would open a detailed signals modal
}

function openCopyTradingModal() {
    showNotification('Copy trading feature coming soon! 🚀', 'info');
    // Would open copy trading setup modal
}

// Academy Functions
function continueCourse() {
    showNotification('Resuming Digital Wallets & Security module...', 'info');
    
    // Simulate course progress
    setTimeout(() => {
        showNotification('Module completed! +50 VOLVOT earned! 🎓', 'success');
        updateCourseProgress();
    }, 3000);
}

function updateCourseProgress() {
    const progressBar = document.querySelector('.progress-fill');
    const progressText = document.querySelector('.progress-text');
    
    if (progressBar && progressText) {
        progressBar.style.width = '80%';
        progressText.textContent = '80% Complete';
        
        // Update module status
        const activeModule = document.querySelector('.module-item.active');
        const nextModule = activeModule?.nextElementSibling;
        
        if (activeModule) {
            activeModule.classList.remove('active');
            activeModule.classList.add('completed');
            activeModule.querySelector('.module-status').textContent = '✅';
        }
        
        if (nextModule) {
            nextModule.classList.add('active');
            nextModule.querySelector('.module-status').textContent = '▶️';
        }
    }
}

function openPracticeMode() {
    showNotification('Launching practice trading simulator...', 'info');
    
    // Simulate opening practice mode
    setTimeout(() => {
        showNotification('Practice mode loaded! Try risk-free trading! 🎮', 'success');
    }, 2000);
}

function submitDailyQuiz() {
    const selectedOption = document.querySelector('input[name="daily-quiz"]:checked');
    
    if (!selectedOption) {
        showNotification('Please select an answer', 'error');
        return;
    }
    
    const isCorrect = selectedOption.value === 'd'; // Correct answer is "All of the above"
    
    if (isCorrect) {
        showNotification('Correct! +25 VOLVOT earned! 🎯', 'success');
        updateQuizStats(true);
    } else {
        showNotification('Not quite right. The correct answer is "All of the above" 📚', 'info');
        updateQuizStats(false);
    }
    
    // Disable quiz after submission
    const quizOptions = document.querySelectorAll('input[name="daily-quiz"]');
    const submitBtn = document.querySelector('.submit-quiz-btn');
    
    quizOptions.forEach(option => option.disabled = true);
    submitBtn.disabled = true;
    submitBtn.textContent = 'Completed ✓';
    submitBtn.style.background = '#48bb78';
}

function updateQuizStats(isCorrect) {
    const accuracyStat = document.querySelector('.quiz-stats .stat-value');
    const streakStat = document.querySelector('.quiz-stats .stat-item:nth-child(2) .stat-value');
    const earnedStat = document.querySelector('.quiz-stats .stat-item:nth-child(3) .stat-value');
    
    if (isCorrect) {
        // Update accuracy (simplified calculation)
        if (streakStat) {
            const currentStreak = parseInt(streakStat.textContent);
            streakStat.textContent = currentStreak + 1;
        }
        
        if (earnedStat) {
            const currentEarned = parseInt(earnedStat.textContent);
            earnedStat.textContent = currentEarned + 25;
        }
    }
}

// Enhanced Live Feeds
function simulateLiveFeeds() {
    setInterval(() => {
        updateLiveTrades();
        updateSocialFeed();
    }, 30000); // Update every 30 seconds
}

function updateLiveTrades() {
    const tradesFeed = document.getElementById('live-trades-feed');
    if (!tradesFeed) return;
    
    const sampleSignals = [
        {
            type: 'buy',
            pair: 'VOLVOT/WETH',
            price: '$0.000018',
            reason: 'Bullish divergence detected',
            followers: Math.floor(Math.random() * 200) + 50,
            successRate: Math.floor(Math.random() * 20) + 75
        },
        {
            type: 'sell',
            pair: 'ETH/USDC',
            price: '$3,456',
            reason: 'Overbought RSI levels',
            followers: Math.floor(Math.random() * 150) + 30,
            successRate: Math.floor(Math.random() * 15) + 80
        }
    ];
    
    const randomSignal = sampleSignals[Math.floor(Math.random() * sampleSignals.length)];
    const signalElement = document.createElement('div');
    signalElement.className = `trade-signal ${randomSignal.type}`;
    signalElement.innerHTML = `
        <div class="signal-header">
            <span class="signal-type">${randomSignal.type === 'buy' ? '🟢 BUY SIGNAL' : '🔴 SELL SIGNAL'}</span>
            <span class="signal-time">Just now</span>
        </div>
        <div class="signal-content">
            <strong>${randomSignal.pair}</strong> at ${randomSignal.price}
            <div class="signal-reason">${randomSignal.reason}</div>
        </div>
        <div class="signal-stats">
            <span>👥 ${randomSignal.followers} following</span>
            <span class="success-rate">✅ ${randomSignal.successRate}% success rate</span>
        </div>
    `;
    
    // Add new signal at the top
    tradesFeed.insertBefore(signalElement, tradesFeed.firstChild);
    
    // Remove old signals (keep max 5)
    while (tradesFeed.children.length > 5) {
        tradesFeed.removeChild(tradesFeed.lastChild);
    }
    
    // Add animation
    signalElement.style.opacity = '0';
    signalElement.style.transform = 'translateY(-20px)';
    setTimeout(() => {
        signalElement.style.transition = 'all 0.3s ease';
        signalElement.style.opacity = '1';
        signalElement.style.transform = 'translateY(0)';
    }, 100);
}

function updateSocialFeed() {
    const socialFeed = document.getElementById('social-feed');
    if (!socialFeed) return;
    
    const samplePosts = [
        {
            avatar: '🚀',
            author: 'RocketTrader',
            time: 'Just now',
            content: 'Base network is absolutely crushing it! The ecosystem growth is insane. 📈 #BaseChain #DeFi'
        },
        {
            avatar: '💎',
            author: 'CrystalBall',
            time: '2m ago',
            content: 'Technical analysis showing strong support at current levels. Accumulation zone! 💪 #TechnicalAnalysis'
        },
        {
            avatar: '🌟',
            author: 'StarGazer',
            time: '5m ago',
            content: 'Just completed another course in VOLVOT Academy! Learning never stops in crypto 🎓'
        }
    ];
    
    const randomPost = samplePosts[Math.floor(Math.random() * samplePosts.length)];
    const postElement = document.createElement('div');
    postElement.className = 'feed-post';
    postElement.innerHTML = `
        <div class="post-header">
            <div class="post-avatar">${randomPost.avatar}</div>
            <div class="post-info">
                <div class="post-author">${randomPost.author}</div>
                <div class="post-time">${randomPost.time}</div>
            </div>
        </div>
        <div class="post-content">${randomPost.content}</div>
        <div class="post-actions">
            <button class="like-btn" onclick="likePost(this)">❤️ ${Math.floor(Math.random() * 20)}</button>
            <button class="comment-btn">💬 ${Math.floor(Math.random() * 10)}</button>
            <button class="share-btn">🔄 ${Math.floor(Math.random() * 5)}</button>
        </div>
    `;
    
    // Add new post at the top
    if (socialFeed.children.length >= 3) {
        socialFeed.removeChild(socialFeed.lastChild);
    }
    socialFeed.insertBefore(postElement, socialFeed.firstChild);
    
    // Add animation
    postElement.style.opacity = '0';
    postElement.style.transform = 'translateY(-20px)';
    setTimeout(() => {
        postElement.style.transition = 'all 0.3s ease';
        postElement.style.opacity = '1';
        postElement.style.transform = 'translateY(0)';
    }, 100);
}

function likePost(button) {
    const currentLikes = parseInt(button.textContent.match(/\d+/)[0]);
    button.innerHTML = `❤️ ${currentLikes + 1}`;
    button.style.color = '#f56565';
    
    // Add heart animation
    const heart = document.createElement('span');
    heart.textContent = '❤️';
    heart.style.position = 'absolute';
    heart.style.fontSize = '1.5rem';
    heart.style.pointerEvents = 'none';
    heart.style.zIndex = '1000';
    heart.style.animation = 'heartFloat 1s ease forwards';
    
    const rect = button.getBoundingClientRect();
    heart.style.left = rect.left + 'px';
    heart.style.top = rect.top + 'px';
    
    document.body.appendChild(heart);
    
    setTimeout(() => {
        heart.remove();
    }, 1000);
}

// Enhanced Navigation for new sections
function updateNavigation() {
    const navMenu = document.getElementById('nav-menu');
    if (navMenu) {
        // Add new navigation items
        const socialTradingLink = document.createElement('a');
        socialTradingLink.href = '#social-trading';
        socialTradingLink.className = 'nav-link';
        socialTradingLink.textContent = 'Social';
        
        const academyLink = document.createElement('a');
        academyLink.href = '#academy';
        academyLink.className = 'nav-link';
        academyLink.textContent = 'Academy';
        
        // Insert before the connect wallet button
        const connectBtn = document.getElementById('connect-wallet');
        navMenu.insertBefore(socialTradingLink, connectBtn);
        navMenu.insertBefore(academyLink, connectBtn);
    }
}

// Initialize new features
document.addEventListener('DOMContentLoaded', function() {
    updateNavigation();
    simulateLiveFeeds();
    
    // Add smooth scrolling for new sections
    document.querySelectorAll('a[href^="#social-trading"], a[href^="#academy"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    
    // Add category switching functionality
    document.querySelectorAll('.category-item').forEach(item => {
        item.addEventListener('click', function() {
            document.querySelector('.category-item.active')?.classList.remove('active');
            this.classList.add('active');
            
            const category = this.dataset.category;
            showNotification(`Switched to ${category} courses`, 'info');
        });
    });
});

// $SPLASH Website Interactive Features
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all animations and interactions
    initializeAnimations();
    initializeCounters();
    initializeParticleEffects();
    
    // Add smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
    
    // Add scroll effects
    window.addEventListener('scroll', handleScrollEffects);
    
    // Initialize intersection observer for animations
    initializeScrollAnimations();
});

// Copy contract address to clipboard
function copyAddress() {
    const address = document.getElementById('contract-address').textContent;
    
    navigator.clipboard.writeText(address).then(function() {
        showNotification('Address copied to clipboard! 📋', 'success');
        
        // Visual feedback
        const copyBtn = document.querySelector('.copy-btn');
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '✅';
        copyBtn.style.color = '#10b981';
        
        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.style.color = '#fbbf24';
        }, 2000);
    }).catch(function() {
        showNotification('Failed to copy address', 'error');
    });
}

// Show notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#06b6d4'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        z-index: 10001;
        animation: slideInNotification 0.3s ease;
        max-width: 350px;
        font-weight: 600;
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutNotification 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
    
    // Manual close
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.style.animation = 'slideOutNotification 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    });
}

// Initialize scroll-triggered animations
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                
                // Special animations for specific elements
                if (entry.target.classList.contains('tokenomics-grid')) {
                    animateTokenomicsChart();
                }
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll('.mission-content, .tokenomics-grid, .listings-grid');
    animateElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(element);
    });
}

// Animate tokenomics chart
function animateTokenomicsChart() {
    const chart = document.getElementById('pieChart');
    if (chart) {
        chart.style.transform = 'scale(0)';
        chart.style.transition = 'transform 1s ease';
        
        setTimeout(() => {
            chart.style.transform = 'scale(1)';
        }, 200);
    }
}

// Initialize particle effects
function initializeParticleEffects() {
    createFloatingBubbles();
    createSplashEffect();
}

// Create floating bubbles
function createFloatingBubbles() {
    const bubbleContainer = document.querySelector('.floating-elements');
    const bubbleEmojis = ['💧', '🌊', '💦', '🐟', '🌀', '🐋', '🏄‍♂️', '🌊'];
    
    setInterval(() => {
        if (document.querySelectorAll('.bubble').length < 15) {
            const bubble = document.createElement('div');
            bubble.className = 'bubble dynamic-bubble';
            bubble.textContent = bubbleEmojis[Math.floor(Math.random() * bubbleEmojis.length)];
            bubble.style.left = Math.random() * 100 + '%';
            bubble.style.fontSize = (Math.random() * 2 + 1) + 'rem';
            bubble.style.animationDuration = (Math.random() * 10 + 10) + 's';
            bubble.style.opacity = Math.random() * 0.5 + 0.2;
            
            bubbleContainer.appendChild(bubble);
            
            // Remove bubble after animation
            setTimeout(() => {
                if (bubble.parentNode) {
                    bubble.remove();
                }
            }, 20000);
        }
    }, 3000);
}

// Create splash effect on button hover
function createSplashEffect() {
    const buttons = document.querySelectorAll('.buy-button, .community-btn, .nav-link.buy-btn');
    
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function(e) {
            const splash = document.createElement('div');
            splash.className = 'splash-ripple';
            splash.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                width: 0;
                height: 0;
                background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
                border-radius: 50%;
                transform: translate(-50%, -50%);
                animation: rippleEffect 0.6s ease-out;
                pointer-events: none;
                z-index: 1;
            `;
            
            this.style.position = 'relative';
            this.appendChild(splash);
            
            setTimeout(() => {
                if (splash.parentNode) {
                    splash.remove();
                }
            }, 600);
        });
    });
}

// Initialize animations
function initializeAnimations() {
    // Animate elements on load
    setTimeout(() => {
        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            heroContent.style.opacity = '1';
            heroContent.style.transform = 'translateY(0)';
        }
    }, 500);
    
    // Add floating animation to splash logo
    const splashLogo = document.querySelector('.splash-logo');
    if (splashLogo) {
        setInterval(() => {
            splashLogo.style.transform = 'translateY(' + (Math.sin(Date.now() * 0.001) * 10) + 'px)';
        }, 50);
    }
}

// Handle scroll effects
function handleScrollEffects() {
    const navbar = document.querySelector('.navbar');
    const scrollY = window.scrollY;
    
    // Navbar background opacity
    if (scrollY > 50) {
        navbar.style.background = 'rgba(30, 58, 138, 0.98)';
    } else {
        navbar.style.background = 'rgba(30, 58, 138, 0.95)';
    }
    
    // Parallax effect for hero background
    const heroBackground = document.querySelector('.water-animation');
    if (heroBackground) {
        const speed = scrollY * 0.5;
        heroBackground.style.transform = `translateY(${speed}px)`;
    }
}

// Initialize counters (for future use)
function initializeCounters() {
    // Could be used for counting up to target numbers
    // Implementation for future stats counters
}

// Add water wave effect on scroll
window.addEventListener('scroll', function() {
    const waves = document.querySelectorAll('.water-waves');
    waves.forEach(wave => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        wave.style.transform = `translate3d(0, ${rate}px, 0)`;
    });
});

// Add dynamic lighting effects
function addLightingEffects() {
    const hero = document.querySelector('.hero');
    
    hero.addEventListener('mousemove', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const angleX = (y - centerY) / centerY;
        const angleY = (centerX - x) / centerX;
        
        this.style.background = `
            radial-gradient(circle at ${x}px ${y}px, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
            linear-gradient(135deg, #0ea5e9 0%, #1e40af 50%, #1e3a8a 100%)
        `;
    });
}

// Initialize lighting effects
document.addEventListener('DOMContentLoaded', addLightingEffects);

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInNotification {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutNotification {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    @keyframes rippleEffect {
        0% { width: 0; height: 0; opacity: 1; }
        100% { width: 300px; height: 300px; opacity: 0; }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0;
        margin-left: auto;
        opacity: 0.8;
        transition: opacity 0.3s ease;
    }
    
    .notification-close:hover {
        opacity: 1;
    }
    
    .dynamic-bubble {
        position: absolute !important;
        bottom: -20px !important;
        animation: floatUp 15s linear forwards !important;
    }
    
    @keyframes floatUp {
        0% {
            bottom: -10%;
            transform: translateX(0) rotate(0deg) scale(0.5);
            opacity: 0;
        }
        10% {
            opacity: 0.6;
        }
        90% {
            opacity: 0.2;
        }
        100% {
            bottom: 110%;
            transform: translateX(50px) rotate(360deg) scale(1.5);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Easter egg: Click on whale for special effect
document.addEventListener('DOMContentLoaded', function() {
    const whale = document.querySelector('.whale-emoji');
    if (whale) {
        let clickCount = 0;
        whale.addEventListener('click', function() {
            clickCount++;
            if (clickCount === 5) {
                createMassiveSplash();
                showNotification('🌊 MASSIVE SPLASH! You found the easter egg! 🐋', 'success');
                clickCount = 0;
            } else {
                this.style.animation = 'none';
                setTimeout(() => {
                    this.style.animation = 'swim 8s ease-in-out infinite';
                }, 10);
                
                // Create small splash
                createSplashRipple(this);
            }
        });
    }
});

function createMassiveSplash() {
    // Create multiple splash effects
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            const splash = document.createElement('div');
            splash.textContent = '💦';
            splash.style.cssText = `
                position: fixed;
                font-size: 3rem;
                z-index: 9999;
                pointer-events: none;
                left: ${Math.random() * 100}%;
                top: 50%;
                animation: explosiveSplash 2s ease-out forwards;
            `;
            
            document.body.appendChild(splash);
            
            setTimeout(() => splash.remove(), 2000);
        }, i * 100);
    }
    
    // Add screen shake effect
    document.body.style.animation = 'shake 0.5s ease-in-out';
    setTimeout(() => {
        document.body.style.animation = '';
    }, 500);
}

function createSplashRipple(element) {
    const ripple = document.createElement('div');
    ripple.textContent = '💦';
    ripple.style.cssText = `
        position: absolute;
        font-size: 2rem;
        z-index: 100;
        pointer-events: none;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        animation: splashRipple 1s ease-out forwards;
    `;
    
    element.style.position = 'relative';
    element.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 1000);
}

// Add more animations
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    @keyframes explosiveSplash {
        0% {
            transform: scale(0) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: scale(2) rotate(360deg) translateY(-200px);
            opacity: 0;
        }
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
        20%, 40%, 60%, 80% { transform: translateX(10px); }
    }
    
    @keyframes splashRipple {
        0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 1;
        }
        100% {
            transform: translate(-50%, -50%) scale(3);
            opacity: 0;
        }
    }
`;
document.head.appendChild(additionalStyles);

// Console welcome message
console.log('%c🌊 $SPLASH - Making waves on Base! 💧', 'color: #06b6d4; font-size: 20px; font-weight: bold;');
console.log('%cDive into the future of DeFi! 🏄‍♂️', 'color: #fbbf24; font-size: 14px; font-weight: bold;');
console.log('%cClick the whale 5 times for a surprise! 🐋', 'color: #10b981; font-size: 12px;');
