import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Header from './Components/Header';
import Login from './Components/Login';
import Baum from './Components/Baum';
import BaumAdder from './Components/BaumAdder';
import Signup from './Components/Signup';
import GruenFlaechen from './Components/GruenFlaechen';

const Home = () => <div>Home Page</div>;
const About = () => <div>About Page</div>;
const token = localStorage.getItem('token') || '';
const App: React.FC = () => (
  <Router>
    <Header />
    <nav style={{ padding: '1rem', background: '#ffeaeaff' }}>
      <Link to="/Login" >Login</Link> | <Link to="/about">About</Link> | <Link to="/Baum">Baum</Link>
      | <Link to="/Signup">Signup</Link>| <Link to="/GruenFlaechen">GruenFlaechen</Link>
    </nav>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/Baum" element={<Baum />} />
      <Route path="/Login" element={<Login></Login>} />
      <Route path='/baum-adder'element={<BaumAdder></BaumAdder>}/>
      <Route path="Signup" element={<Signup></Signup>} />
      <Route path ="/GruenFlaechen" element={<GruenFlaechen></GruenFlaechen>} />
    </Routes>
  </Router>
);

export default App;
