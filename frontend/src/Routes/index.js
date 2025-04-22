import Admin from '../pages/AdminPage/AdminPage';
import Home from '../pages/Home/Home';
import userLayout from '../Components/UserLayout/userLayout';
import adminLayout from '../pages/AdminPage/adminLayout';
// Public Routes
const publicRoutes = [
    { path: '/', component: Home, layout: userLayout },
    { path: '/admin', component: Admin, layout: adminLayout },
];

const privateRoutes = [];

export { publicRoutes, privateRoutes };
