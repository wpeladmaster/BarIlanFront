import React from 'react';
import '../style/Footer.scss';

const Footer = () => {
  return (
    <footer className="footer">
        <div className='footer-bg'></div>
        <div className='inner'>
            <p>&copy; {(new Date().getFullYear())} Bar Ilan University. All rights reserved.</p>
        </div>
    </footer>
  );
};

export default Footer;
