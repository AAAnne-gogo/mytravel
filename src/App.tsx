import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import CreateTrip from './pages/CreateTrip';
import TripDetail from './pages/TripDetail';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateTrip />} />
          <Route path="/trip/:id" element={<TripDetail />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
