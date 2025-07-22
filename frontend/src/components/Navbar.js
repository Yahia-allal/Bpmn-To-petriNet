import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleTransformationClick = (e) => {
    const fileData = sessionStorage.getItem('selectedBpmnFile');
    if (!fileData) {
      e.preventDefault();
      alert('Veuillez choisir un fichier BPMN 2.0 avant de continuer.');
      return;
    }
    navigate('/transformation');
  };

  const isTransformationActive = location.pathname === '/transformation';

  return (
    <nav className="navbar">
      <div className="navbar-wrapper">
        <img src="/logo-reacte.png" alt="Logo Yahia" className="navbar-logo" />
        <ul>
          <li>
            <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : '')} end>
              Accueil
            </NavLink>
          </li>
          <li>
            <a
              href="/transformation"
              onClick={handleTransformationClick}
              className={`custom-link${isTransformationActive ? ' active' : ''}`}
            >
              Transformation
            </a>
          </li>
          <li>
            <NavLink to="/contact" className={({ isActive }) => (isActive ? 'active' : '')}>
              Contactez-nous
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  );
}
