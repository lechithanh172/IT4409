import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { publicRouter } from './Routes';
import Admin from './Pages/Admin';


function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    {publicRouter.map((route, index) => {
                        const Page = route.component;
                        return (
                            <Route
                                key={index}
                                path={route.path}
                                element={
                                        <Page />
                                }
                            />
                        );
                    })}
                {/* <Route path="/admin" element={<Admin />} /> */}
                </Routes>
            </div>
        </Router>
    );
}

export default App;
