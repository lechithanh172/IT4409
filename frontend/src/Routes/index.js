import Admin from '../Pages/AdminPage/AdminPage';
import Home from '../Pages/Home/Home';
import userLayout from '../Components/UserLayout/userLayout';
import adminLayout from '../Pages/AdminPage/adminLayout';
// Public Routes
const publicRoutes = [
    { path: '/', component: Home, layout: userLayout },
    { path: '/admin', component: Admin, layout: adminLayout },
];

const privateRoutes = [];

export { publicRoutes, privateRoutes };
