import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { publicRouter } from './Routes';


function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    {publicRouter.map((route, index) => {
                        const Page = route.component;

                        // if (route.layout) {
                        //     Layout = route.layout;
                        // } 
                        // else if (route.layout === null) {
                        //     Layout = Fragment;
                        // }
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
                </Routes>
            </div>
        </Router>
    );
}

export default App;
