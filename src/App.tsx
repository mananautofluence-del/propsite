/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import CreateListing from './pages/CreateListing';
import CreateBrochure from './pages/CreateBrochure';
import ListingView from './pages/ListingView';
import BrochureView from './pages/BrochureView';
import { AuthProvider } from './contexts/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="create-listing" element={<CreateListing />} />
            <Route path="create-brochure" element={<CreateBrochure />} />
            <Route path="listing/:id" element={<ListingView />} />
            <Route path="brochure/:id" element={<BrochureView />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
