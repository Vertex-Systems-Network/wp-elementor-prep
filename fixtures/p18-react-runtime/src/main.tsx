import React from 'react';
import { createRoot } from 'react-dom/client';
import ReactFixture from './ReactFixture';
import './ReactFixture.css';

createRoot(document.getElementById('root')!).render(<ReactFixture />);
