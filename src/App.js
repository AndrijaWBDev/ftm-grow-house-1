import { BrowserRouter as Router, Routes, Route }  from 'react-router-dom';
import './App.css';
import {NotificationContainer} from 'react-notifications';
import './assets/font/BakbakOne-Regular.ttf';
import 'react-notifications/lib/notifications.css';

import FTM from './ftm';

function App() {

  return (
    <>
      <Router>
        <Routes>
          <Route path='/' element={<FTM />} />
          <Route path='/fantom' element={<FTM />} />
        </Routes>
      </Router>
      <NotificationContainer />
    </>
  );
}

export default App;
