import './App.css';
import { Route,Routes } from 'react-router-dom';
import Homepage from './Pages/Homepage';
import Chatpage from './Pages/Chatpage';
import Login from './components/Authentication/Login';
import Signup from './components/Authentication/Signup';

function App() {
  return (
    <div className="App">
      <Routes>
      <Route path="/" Component={Homepage} />
      <Route path="/chats" Component={Chatpage} />
      <Route path="/login" Component={Login}/>
      <Route path='/signup' Component={Signup}/>
      </Routes>
    </div>
  );
}

export default App;