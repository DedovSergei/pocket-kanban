import { Routes, Route } from 'react-router-dom';
import { BoardListPage } from './pages/BoardListPage';
import { BoardPage } from './pages/BoardPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<BoardListPage />} /> 
      
      <Route path="/board/:id" element={<BoardPage />} />
    </Routes>
  );
}
export default App;