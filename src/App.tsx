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

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="create-listing" element={<CreateListing />} />
          <Route path="create-brochure" element={<CreateBrochure />} />
          <Route path="listing/:slug" element={<ListingView />} />
          <Route path="brochure/:slug" element={<BrochureView />} />
        </Route>
      </Routes>
    </Router>
  );
}
