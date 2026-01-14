<template>
    <div class="register-container">
        <div class="card">
            <h2>Create Account</h2>
            <form @submit.prevent="handleRegister">
                <div class="form-group">
                    <label>Name</label>
                    <input 
                        type="text" 
                        v-model="form.name" 
                        required
                        placeholder="Enter your full name"
                        :disabled="loading"
                    >
                    <span v-if="errors.name" class="error-text">{{ errors.name }}</span>
                </div>
                
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
                        placeholder="Enter password (min 6 characters)"
                        :disabled="loading"
                        minlength="6"
                    >
                    <span v-if="errors.password" class="error-text">{{ errors.password }}</span>
                </div>
                
                <div class="form-group">
                    <label>Confirm Password</label>
                    <input 
                        type="password" 
                        v-model="form.password_confirmation" 
                        required
                        placeholder="Confirm your password"
                        :disabled="loading"
                    >
                    <span v-if="errors.password_confirmation" class="error-text">{{ errors.password_confirmation }}</span>
                </div>
                
                <button 
                    type="submit" 
                    :disabled="loading" 
                    class="btn-register"
                >
                    <span v-if="loading">
                        <i class="spinner"></i> Creating Account...
                    </span>
                    <span v-else>Register</span>
                </button>
                
                <div v-if="serverError" class="server-error">
                    {{ serverError }}
                </div>
                
                <div v-if="success" class="success-message">
                    <i class="success-icon">✓</i>
                    Account created successfully! Redirecting to login...
                </div>
                
                <div class="login-link">
                    Already have an account? 
                    <router-link to="/login" class="link">Login here</router-link>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
export default {
    name: 'RegisterPage',
    data() {
        return {
            form: {
                name: '',
                email: '',
                password: '',
                password_confirmation: ''
            },
            errors: {
                name: '',
                email: '',
                password: '',
                password_confirmation: ''
            },
            loading: false,
            serverError: '',
            success: false
        };
    },
    
    methods: {
        validateForm() {
            this.errors = {
                name: '',
                email: '',
                password: '',
                password_confirmation: ''
            };
            
            let isValid = true;
            
            // Name validation
            if (!this.form.name.trim()) {
                this.errors.name = 'Name is required';
                isValid = false;
            } else if (this.form.name.length < 2) {
                this.errors.name = 'Name must be at least 2 characters';
                isValid = false;
            }
            
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!this.form.email.trim()) {
                this.errors.email = 'Email is required';
                isValid = false;
            } else if (!emailRegex.test(this.form.email)) {
                this.errors.email = 'Please enter a valid email address';
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
            
            // Password confirmation validation
            if (!this.form.password_confirmation) {
                this.errors.password_confirmation = 'Please confirm your password';
                isValid = false;
            } else if (this.form.password !== this.form.password_confirmation) {
                this.errors.password_confirmation = 'Passwords do not match';
                isValid = false;
            }
            
            return isValid;
        },
        
        async handleRegister() {
            if (!this.validateForm()) {
                return;
            }
            
            this.loading = true;
            this.serverError = '';
            
            try {
                const result = await this.$store.dispatch('auth/register', this.form);
                
                if (result.success) {
                    this.success = true;
                    this.resetForm();
                    
                    // Wait 2 seconds then redirect to login
                    setTimeout(() => {
                        this.$router.push('/login');
                    }, 2000);
                } else {
                    this.serverError = result.error || 'Registration failed';
                    
                    // Handle validation errors from server
                    if (result.errors) {
                        if (result.errors.name) {
                            this.errors.name = Array.isArray(result.errors.name) 
                                ? result.errors.name[0] 
                                : result.errors.name;
                        }
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
                console.error('Registration error:', error);
            } finally {
                this.loading = false;
            }
        },
        
        resetForm() {
            this.form = {
                name: '',
                email: '',
                password: '',
                password_confirmation: ''
            };
            this.errors = {
                name: '',
                email: '',
                password: '',
                password_confirmation: ''
            };
        }
    }
};
</script>

<style scoped>
.register-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
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
    border-color: #f5576c;
    box-shadow: 0 0 0 3px rgba(245, 87, 108, 0.1);
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

.btn-register {
    width: 100%;
    padding: 0.75rem;
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-top: 0.5rem;
}

.btn-register:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(245, 87, 108, 0.4);
}

.btn-register:disabled {
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

.success-message {
    background: #e7f7ef;
    color: #27ae60;
    padding: 0.75rem;
    border-radius: 8px;
    margin-top: 1rem;
    text-align: center;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}

.success-icon {
    font-weight: bold;
    font-size: 1.2rem;
}

.login-link {
    text-align: center;
    margin-top: 1.5rem;
    color: #666;
    font-size: 0.9rem;
}

.login-link .link {
    color: #f5576c;
    text-decoration: none;
    font-weight: 500;
    margin-left: 0.25rem;
}

.login-link .link:hover {
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