import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { publicRoutes } from './Routes';
import PhoneInputPage from './pages/Auth/phonePage';
import LoginPage from './pages/Auth/loginPage';
import SignupPage from './pages/Auth/signupPage';
import OtpPage from './pages/Auth/otpPage';
import ChangePassword from './pages/Auth/changePassword';
import AdminPage from './pages/AdminPage/AdminPage'
function App() {
    return (
        <Router>
            <div className="App">
            <Routes>
              {/* {publicRoutes.map((route, index) => {
                const Page = route.component;
                const Layout = route.layout;
                let category = route.category;

                return (
                  <Route
                    key={index}
                    path={route.path}
                    element={
                      <Layout>
                        <Page></Page>
                      </Layout>
                    }
                  > */}
                  <Route path="/phone" element={<PhoneInputPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="/otp" element={<OtpPage />} />
                  <Route path="/change-password" element={<ChangePassword />} />
                  <Route path="/change" element={<AdminPage />} />
                  {/* </Route>
                  
                );
              })} */}
            </Routes>
            </div>
        </Router>
    );
}

export default App;
