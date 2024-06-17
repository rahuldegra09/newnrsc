// App.js
import React from 'react';
import Home from './Home';
import Map from './Map';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import './App.css';
function App() {
  return (
    <div className='  h-screen'>
        <Navbar />
        <div className="bg-neutral-800  ">
          <Home />
          <div className=''><Map /></div>
        </div>
        <Footer />

    </div>
  );
}

export default App;
