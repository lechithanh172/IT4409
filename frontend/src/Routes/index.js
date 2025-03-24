import Admin from "../Pages/Admin";
import Home from "../Pages/Home";

// Public Routes
const publicRouter = [
    {
        path: '/',
        component: Home,
    },
    {
        path: '/login',
        component: Home,
    },
    {
        path: '/admin/*',
        component: Admin,
    }
];

const privateRouter = [];

export { publicRouter, privateRouter };
