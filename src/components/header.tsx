import React from 'react';
import { css } from '@emotion/css';
import bannerImage from '../images/banner.webp';

const Header = () => {
    return (
        <header className={headerStyles}>
            <div className={bannerStyles}>
                <img src={bannerImage} alt="Banner" />
                <div className={overlayStyles}></div>
            </div>
            <div className={logoStyles}>AniList</div>
            <h5 className={textStyles}>Find Your Favorite Anime here and Create a New Collection</h5>
        </header>
    );
};

const headerStyles = css`
  position: relative;
  width: 100%;
  height: 500px;
  background-color: #f2f2f2;
`;

const bannerStyles = css`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const overlayStyles = css`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); /* Adjust the opacity (0.5) as needed */
`;

const logoStyles = css`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 50px;
  font-weight: bold;
  color: white;
  font-family: 'StretchPro', sans-serif;
`;

const textStyles = css`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 25px;
  font-weight: bold;
  color: white;
  font-family: 'StretchPro', sans-serif;
`;

export default Header;
