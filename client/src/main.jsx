import React, { lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Shell from './components/Shell';
import { AuthProvider } from './context/AuthContext';
import { CreatorProvider } from './context/CreatorContext';
import './styles/main.css';

const ContentDetail = lazy(() => import('./pages/ContentDetail'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Explore = lazy(() => import('./pages/Explore'));
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));

function App() {
  return <CreatorProvider><AuthProvider><BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><Suspense fallback={<div className="empty-state app-loading"><span className="brand-mark">cs.</span><span>Opening CreativeStudio…</span></div>}><Routes><Route element={<Shell />}><Route index element={<Home />} /><Route path="explore" element={<Explore />} /><Route path="content/:id" element={<ContentDetail />} /><Route path="login" element={<Login />} /><Route path="dashboard" element={<Dashboard />} /><Route path="*" element={<Home />} /></Route></Routes></Suspense></BrowserRouter></AuthProvider></CreatorProvider>;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
