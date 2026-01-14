<template>
    <div class="login-container">
        <div class="card">
            <h2>Login</h2>
            <form @submit.prevent="handleLogin">
                <div class="form-group">
                    <label>Email</label>
                    <input 
                        type="email" 
                        v-model="form.email" 
                        required
                        placeholder="Enter your email"
                        :disabled="loading"
                    >
                    <span v-if="errors.email" class="error-text">{{ errors.email }}</span>
                </div>
                
                <div class="form-group">
                    <label>Password</label>
                    <input 
                        type="password" 
                        v-model="form.password" 
                        required
                        placeholder="Enter your password"
                        :disabled="loading"
                    >
                    <span v-if="errors.password" class="error-text">{{ errors.password }}</span>
                </div>
                
                <button 
                    type="submit" 
                    :disabled="loading" 
                    class="btn-login"
                >
                    <span v-if="loading">
                        <i class="spinner"></i> Logging in...
                    </span>
                    <span v-else>Login</span>
                </button>
                
                <div v-if="serverError" class="server-error">
                    {{ serverError }}
                </div>
                
                <div class="register-link">
                    Don't have an account? 
                    <router-link to="/register" class="link">Register here</router-link>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
export default {
    name: 'LoginPage',
    data() {
        return {
            form: {
                email: '',
                password: ''
            },
            errors: {
                email: '',
                password: ''
            },
            loading: false,
            serverError: ''
        };
    },
    
    methods: {
        validateForm() {
            this.errors = { email: '', password: '' };
            let isValid = true;
            
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!this.form.email.trim()) {
                this.errors.email = 'Email is required';
                isValid = false;
            } else if (!emailRegex.test(this.form.email)) {
                this.errors.email = 'Please enter a valid email';
                isValid = false;
            }
            
            // Password validation
            if (!this.form.password) {
                this.errors.password = 'Password is required';
                isValid = false;
            } else if (this.form.password.length < 6) {
                this.errors.password = 'Password must be at least 6 characters';
                isValid = false;
            }
            
            return isValid;
        },
        
        async handleLogin() {
            if (!this.validateForm()) {
                return;
            }
            
            this.loading = true;
            this.serverError = '';
            
            try {
                const result = await this.$store.dispatch('auth/login', this.form);
                
                if (result.success) {
                    // Redirect to dashboard
                    this.$router.push('/dashboard');
                } else {
                    this.serverError = result.error || 'Login failed';
                    
                    // Handle validation errors from server
                    if (result.errors) {
                        if (result.errors.email) {
                            this.errors.email = Array.isArray(result.errors.email) 
                                ? result.errors.email[0] 
                                : result.errors.email;
                        }
                        if (result.errors.password) {
                            this.errors.password = Array.isArray(result.errors.password) 
                                ? result.errors.password[0] 
                                : result.errors.password;
                        }
                    }
                }
            } catch (error) {
                this.serverError = 'An unexpected error occurred. Please try again.';
                console.error('Login error:', error);
            } finally {
                this.loading = false;
            }
        },
        
        resetForm() {
            this.form = { email: '', password: '' };
            this.errors = { email: '', password: '' };
            this.serverError = '';
        }
    }
};
</script>

<style scoped>
.login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 20px;
}

.card {
    background: white;
    padding: 2.5rem;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
    transition: transform 0.3s ease;
}

.card:hover {
    transform: translateY(-5px);
}

.card h2 {
    text-align: center;
    margin-bottom: 1.5rem;
    color: #333;
    font-size: 1.8rem;
    font-weight: 600;
}

.form-group {
    margin-bottom: 1.5rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #555;
}

.form-group input {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 2px solid #e1e5e9;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.3s ease;
    box-sizing: border-box;
}

.form-group input:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group input:disabled {
    background: #f8f9fa;
    cursor: not-allowed;
}

.error-text {
    display: block;
    color: #e74c3c;
    font-size: 0.85rem;
    margin-top: 0.25rem;
}

.btn-login {
    width: 100%;
    padding: 0.75rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-top: 0.5rem;
}

.btn-login:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.btn-login:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.spinner {
    display: inline-block;
    width: 1rem;
    height: 1rem;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 1s ease-in-out infinite;
    margin-right: 0.5rem;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

.server-error {
    background: #ffeaea;
    color: #e74c3c;
    padding: 0.75rem;
    border-radius: 8px;
    margin-top: 1rem;
    text-align: center;
    font-size: 0.9rem;
}

.register-link {
    text-align: center;
    margin-top: 1.5rem;
    color: #666;
    font-size: 0.9rem;
}

.register-link .link {
    color: #667eea;
    text-decoration: none;
    font-weight: 500;
    margin-left: 0.25rem;
}

.register-link .link:hover {
    text-decoration: underline;
}

@media (max-width: 480px) {
    .card {
        padding: 1.5rem;
    }
    
    .card h2 {
        font-size: 1.5rem;
    }
}
</style>