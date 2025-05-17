import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import CreateNFTPage from './pages/CreateNFTPage';
import MarketplacePage from './pages/MarketplacePage';
import NFTDetailPage from './pages/NFTDetailPage';
import ProfilePage from './pages/ProfilePage';
import { WalletProvider } from './context/WalletContext';
import { NFTProvider } from './context/NFTContext';
import './App.css';

function App() {
  return (
    <Router>
      <WalletProvider>
        <NFTProvider>
          <div className="app crt-screen min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/create" element={<CreateNFTPage />} />
                <Route path="/marketplace" element={<MarketplacePage />} />
                <Route path="/nft/:id" element={<NFTDetailPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </NFTProvider>
      </WalletProvider>
    </Router>
  );
}

export default App;
