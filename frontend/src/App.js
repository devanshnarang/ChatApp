import './App.css';
import { Route,Routes } from 'react-router-dom';
import Homepage from './Pages/Homepage';
import Chatpage from './Pages/Chatpage';
import Login from './components/Authentication/Login';
import Signup from './components/Authentication/Signup';
import WantedBackup from './Pages/WantedBackup';

function App() {
  return (
    <div className="App">
      <Routes>
      <Route path="/" element={<Homepage/>} />
      <Route path="/backup" element={<WantedBackup/>}/>
      <Route path="/chats" element={<Chatpage/>} />
      <Route path="/login" element={<Login/>}/>
      <Route path='/signup' element={<Signup/>}/>
      </Routes>
    </div>
  );
}

export default App;