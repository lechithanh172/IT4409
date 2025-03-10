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
];

const privateRouter = [];

export { publicRouter, privateRouter };
