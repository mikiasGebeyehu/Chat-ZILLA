import { StrictMode } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Homepage'
import Login from './pages/Loginpage'
import Signup from './pages/Signuppage'
import Setting from './pages/Setting'
import Profile from './pages/profile'
import {useAuthStore} from './store/useAuthStore'
import { useEffect } from 'react'
import {Loader} from 'lucide-react'
import { Toaster } from 'react-hot-toast'

export default function App() {

  const { authUser, isCheckingAuth, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  if (isCheckingAuth && !authUser) return (
    <div className='flex justify-center items-center h-screen'>
      <Loader className= "size-10 animate-spin"/>
    </div>
  )

  console.log("Auth User in App.jsx:", authUser);

  return (
    <div>
      <Navbar/>
      <Routes>
        <Route path='/' element={authUser ? <Home/> : <Navigate to="/login" />}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/signup' element={<Signup/>}/>
        <Route path='/settings' element={<Setting/>}/>
        <Route path='/profile' element={authUser ? <Profile/> : <Navigate to="/login" />}/>
      </Routes>

      <Toaster />
    </div>
  )
}