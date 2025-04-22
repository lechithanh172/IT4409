import Admin from '../Pages/AdminPage/AdminPage';
import Home from '../Pages/Home/Home';
import userLayout from '../Components/UserLayout/userLayout';
import adminLayout from '../Pages/AdminPage/adminLayout';
import PhonePage from '../Pages/Auth/phonePage';
import LoginPage from '../Pages/Auth/loginPage';
import SignupPage from '../Pages/Auth/signupPage';
import OtpPage from '../Pages/Auth/otpPage';
import ChangePassword from '../Pages/Auth/changePassword';

// Public Routes
const publicRoutes = [
    { path: '/', component: Home, layout: userLayout },
    { path: '/phone', component: PhonePage, layout: userLayout },
    { path: '/login', component: LoginPage, layout: userLayout },
    { path: '/signup', component: SignupPage, layout: userLayout },
    { path: '/otp', component: OtpPage, layout: userLayout },
    { path: '/change-password', component: ChangePassword, layout: userLayout },
    { path: '/admin', component: Admin, layout: adminLayout },
];

const privateRoutes = [];

export { publicRoutes, privateRoutes };
