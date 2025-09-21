import React, { useState } from 'react';
import { API_BASE_URL } from '../constants';
interface SignupFormData {
    username: string;
    email: string;
    password: string;
}

const Signup: React.FC = () => {
    const [formData, setFormData] = useState<SignupFormData>({
        username: '',
        email: '',
        password: '',
    });
    const [correctPasswordCheck, setCorrectPasswordCheck] = useState('');
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        
             // Simple validation
        if (!formData.username || !formData.email || !formData.password) {
            setError('All fields are required.');
            return;
        }
        if(formData.password !== correctPasswordCheck){
            setError('Passwords do not match');
            return;
        }
        try{
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            if(data.token){
                localStorage.setItem('token', data.token);
            }
            setSuccess('Signup successful!');
            setFormData({ username: '', email: '', password: '' });
        }
        catch(error){
            setError('Error during signup: ' + error);
            return;
        }
       
        // Simulate signup success
        setSuccess('Signup successful!');
        setFormData({ username: '', email: '', password: '' });
    };

    return (
        <div >
            <h2>Sign Up</h2>
            
                <div>
                    <label htmlFor="username">Username:</label>
                    <input
                        type="text"
                        name="username"
                        id="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        name="password"
                        id="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        name="correctPasswordCheck"
                        id="correctPasswordCheck"
                        value={correctPasswordCheck}
                        onChange={e => setCorrectPasswordCheck(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" onClick={handleSubmit}>Sign Up</button>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                {success && <p style={{ color: 'green' }}>{success}</p>}
            
        </div>
    );
};

export default Signup;