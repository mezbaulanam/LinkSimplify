new Vue({
    el: '#app',
    data: {
        API_URL: window.location.href , // Change this to your API URL
        token: localStorage.getItem('token'),
        username: localStorage.getItem('username') || 'NaN',
        password: '',
        newUsername: '',
        newPassword: '',
        originalUrl: '',
        customShortUrl: '',
        shortenedUrl: '',
        urls: [],
        loading: false,
        error: null,
        activeTab: 'login' 
    },
    methods: {
        async login() {
            this.loading = true;
            this.error = null;
            try {
                const response = await fetch(`${this.API_URL}api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: this.loginUsername, password: this.loginPassword })
                });
                const data = await response.json();
                if (data.token) {
                    this.token = data.token;
                    localStorage.setItem('token', this.token);
                    this.username = this.loginUsername; 
                    this.fetchUrls();
                    this.loginUsername = '';
                    this.loginPassword = '';
                } else {
                    throw new Error(data.error || 'Login failed');
                }
            } catch (error) {
                this.error = error.message;
            } finally {
                this.loading = false;
            }
        },
        
        async register() {
            this.loading = true;
            this.error = null;
            try {
                const response = await fetch(`${this.API_URL}api/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: this.registerUsername, password: this.registerPassword })
                });
                const data = await response.json();
                if (response.ok && data.token) {
                    this.token = data.token;
                    localStorage.setItem('token', this.token);
                    this.username = this.registerUsername;
                    this.fetchUrls();
                    this.registerUsername = '';
                    this.registerPassword = '';
                    alert('Registration successful!');
                } else {
                    throw new Error(data.error || 'Registration failed');
                }
            } catch (error) {
                this.error = error.message;
            } finally {
                this.loading = false;
            }
        },
        async shortenUrl() {
            this.loading = true;
            this.error = null;
            try {
                const response = await fetch(`${this.API_URL}api/url/shorten`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-auth-token': this.token
                    },
                    body: JSON.stringify({ 
                        originalUrl: this.originalUrl,
                        customShortUrl: this.customShortUrl
                    })
                });
                if (response.status === 401) {
                    this.handleUnauthorized();
                    return;
                }
                const data = await response.json();
                if (data.shortUrl) {
                    this.shortenedUrl = `${this.API_URL}${data.shortUrl}`;
                    this.fetchUrls();
                } else {
                    throw new Error(data.error || 'Failed to shorten URL');
                }
            } catch (error) {
                this.error = error.message;
            } finally {
                this.loading = false;
            }
        },
        async fetchUrls() {
            this.loading = true;
            this.error = null;
            try {
                const response = await fetch(`${this.API_URL}api/url/myurls`, {
                    headers: { 
                        'x-auth-token': this.token,
                        'Content-Type': 'application/json'
                    }
                });
                if (response.status === 401) {
                    this.handleUnauthorized();
                    return;
                }
                const data = await response.json();
                if (Array.isArray(data)) {
                    this.urls = data.map(url => ({
                        ...url,
                        fullShortUrl: `${this.API_URL}${url.shortUrl}`
                    }));
                } else {
                    throw new Error('Failed to fetch URLs');
                }
            } catch (error) {
                this.error = error.message;
            } finally {
                this.loading = false;
            }
        },
        async showAnalytics(url) {
            this.loading = true;
            this.error = null;
            try {
                const response = await fetch(`${this.API_URL}api/url/analytics/${url._id}`, {
                    headers: { 'x-auth-token': this.token }
                });
                if (response.status === 401) {
                    this.handleUnauthorized();
                    return;
                }
                const analyticsData = await response.json();
                this.$set(url, 'analyticsData', analyticsData);
                this.$set(url, 'showingAnalytics', true);
                this.$nextTick(() => {
                    this.renderChart(url);
                });
            } catch (error) {
                this.error = error.message;
            } finally {
                this.loading = false;
            }
        },
        async fetchUsername() {
            if (!this.token) return;
            
            try {
                const response = await fetch(`${this.API_URL}api/auth/username`, {
                    headers: { 'x-auth-token': this.token }
                });
                
                if (response.status === 401) {
                    this.handleUnauthorized();
                    return;
                }
                
                const data = await response.json();
                this.username = data.username;
            } catch (error) {
                console.error('Error fetching username:', error);
            }
        },
        
        async editUrl(url) {
            const newUrl = prompt('Enter new URL:', url.originalUrl);
            if (newUrl && newUrl !== url.originalUrl) {
                this.loading = true;
                this.error = null;
                try {
                    const response = await fetch(`${this.API_URL}api/url/${url._id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-auth-token': this.token
                        },
                        body: JSON.stringify({ originalUrl: newUrl })
                    });
                    if (response.status === 401) {
                        this.handleUnauthorized();
                        return;
                    }
                    this.fetchUrls();
                } catch (error) {
                    this.error = error.message;
                } finally {
                    this.loading = false;
                }
            }
        },
        async deleteUrl(urlId) {
            if (confirm('Are you sure you want to delete this URL?')) {
                this.loading = true;
                this.error = null;
                try {
                    const response = await fetch(`${this.API_URL}api/url/${urlId}`, {
                        method: 'DELETE',
                        headers: { 'x-auth-token': this.token }
                    });
                    if (response.status === 401) {
                        this.handleUnauthorized();
                        return;
                    }
                    this.fetchUrls();
                } catch (error) {
                    this.error = error.message;
                } finally {
                    this.loading = false;
                }
            }
        },
        logout() {
            this.token = null;
            localStorage.removeItem('token');
            this.urls = [];
            this.shortenedUrl = '';
            this.username = '';
        },
        copyToClipboard(text) {
            navigator.clipboard.writeText(text).then(() => {
                alert('Copied to clipboard!');
            });
        },
        truncateUrl(url) {
            return url.length > 50 ? url.substring(0, 47) + '...' : url;
        },
        closeAnalytics(url) {
            url.showingAnalytics = false;
            if (url.chart) {
                url.chart.destroy();
                url.chart = null;
            }
        },
        renderChart(url) {
            const canvas = document.getElementById(`analyticsChart-${url._id}`);
            if (canvas) {
                // Ensure the canvas has fixed dimensions
                canvas.width = 400;
                canvas.height = 300;

                // Clear previous chart if it exists
                if (url.chart) {
                    url.chart.destroy();
                } else {
                    // Get canvas context
                    var ctx = canvas.getContext('2d');
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                }

                // Calculate average clicks per day
                const createdAt = new Date(url.createdAt);
                const now = new Date();
                const diffTime = Math.abs(now - createdAt);
                const diffDays = Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 1);
                const avgClicksPerDay = (url.analyticsData.clicks / diffDays).toFixed(2);
                const backgroundColor = 'rgba(75, 192, 192, 0.7)';

                url.chart = new Chart(canvas, {
                    type: 'bar',
                    data: {
                        labels: ['Average Clicks per Day'],
                        datasets: [{
                            label: 'Clicks',
                            data: [avgClicksPerDay],
                            backgroundColor: backgroundColor,
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 1,
                            borderRadius: 5,
                        }]
                    },
                    options: {
                        responsive: false,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: false,
                            },
                            title: {
                                display: true,
                                text: `Average Clicks per Day for ${url.shortUrl}`,
                                font: {
                                    size: 16,
                                },
                                color: '#333',
                            },
                        },
                        scales: {
                            x: {
                                grid: {
                                    display: false,
                                },
                                ticks: {
                                    color: '#666',
                                },
                            },
                            y: {
                                beginAtZero: true,
                                grid: {
                                    color: 'rgba(200, 200, 200, 0.2)',
                                },
                                ticks: {
                                    stepSize: 1,
                                    color: '#666',
                                },
                            },
                        }
                    }
                });
            } else {
                console.error('Analytics chart canvas not found');
            }
        },
        
        handleUnauthorized() {
            this.logout();
            this.error = 'Session expired. Please log in again.';
        }
    },
    mounted() {
        if (this.token) {
            this.username = this.fetchUsername();
            this.fetchUrls();
        }
        AOS.init({
            duration: 800,
            once: true
        });
    },
    watch: {
        error(newError) {
            if (newError) {
                alert(newError);
            }
        }
    }
});
