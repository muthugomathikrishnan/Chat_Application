import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // Import the CSS file

const Login = ({ setIsAuthenticated }) => {
  const [email, setemail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://10.16.49.195:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

  
      const data = await response.json();

      if (response.ok) {
        const { token, user } = data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setIsAuthenticated(true);
        navigate('/home'); // Redirect to home page
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      console.error('Login request failed', err);
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className='login1'>
    <div className="container">
      <div className="design">
        <div className="pill-1 rotate-45"></div>
        <div className="pill-2 rotate-45"></div>
        <div className="pill-3 rotate-45"></div>
        <div className="pill-4 rotate-45"></div>
      </div>

      <div className="login">
        <h3 className="title">User Login</h3>
        {error && <p className="error-text">{error}</p>}
        <form onSubmit={handleLogin}>
          <div className="text-input">
            <i className="ri-user-fill"></i>
            <input
              type="text"
              value={email}
              onChange={(e) => setemail(e.target.value)}
              placeholder="Email"
              required
            />
          </div>
          <div className="text-input">
            <i className="ri-lock-fill"></i>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
          </div>
          <button type="submit" className="login-btn">LOGIN</button>
        </form>
        {/*<a href="#" className="forgot">Forgot email/Password?</a>
        */}
      </div>
    </div>
    </div>
  );
};

export default Login;
