import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { publicRoutes } from './Routes';

function App() {
    return (
        <Router>
            <div className="App">
            <Routes>
              {publicRoutes.map((route, index) => {
                const Page = route.component;
                const Layout = route.layout;
                // let category = route.category;

                return (
                  <Route
                    key={index}
                    path={route.path}
                    element={
                      <Layout>
                        <Page></Page>
                      </Layout>
                    }
                  >
                  </Route>
                );
              })}
            </Routes>
            </div>
        </Router>
    );
}

export default App;
