import React, { useState } from 'react';
import { useNavigate,Link } from 'react-router-dom';
import './loginPage.css';  
import Header from '../../Components/Header/Header';
import Footer from '../../Components/Footer/Footer';
import axios from 'axios';

const login = async (username, password) => {
  try {
    
    const response = await axios.post('http://40.82.154.155:8080/auth/login', {
      username: username,
      password: password
    });

    
    if (response.status === 200) {
      console.log('Login success:', response.data);
      
      localStorage.setItem('authToken', response.data.token);
      window.location.href = '/'; 
    } else {
      console.log('Login failed:', response.data.message);
    }
  } catch (error) {
    console.error('Error during login:', error);
  }
};
function LoginPage() {
  const [userName, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  
  const handleLogin = async(e) => {
    e.preventDefault();
    if (!userName || !password) {
      setError('Please enter both username and password');
      return;
    }

    try {
      await login(userName, password); 
    } catch (error) {
      setError('Login failed, please try again!');
    }
  };


  return (
    <div>
      <Header />

      <div className="login-container">
        <form onSubmit={handleLogin} className="login-form">
          <h2>Đăng nhập</h2>
          <input
            type="text"
            placeholder="Username"
            value={userName}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p className="forgot-password">
            <Link to="/phone?type=reset" >Quên mật khẩu?</Link>
          </p>
          <p className='register'>
            Chưa có tài khoản ? <Link to='/phone?type=signup'>Đăng ký</Link>
          </p>
          
          <button type="submit">Đăng nhập</button>
        </form>
      </div>

      <Footer />
    </div>
  );
}

export default LoginPage;
