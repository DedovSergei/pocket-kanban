// packages/client/src/App.tsx
import { Routes, Route } from 'react-router-dom';
import { BoardListPage } from './pages/BoardListPage';
import { BoardPage } from './pages/BoardPage';

function App() {
  return (
    <Routes>
      {/* Route 1: The "Home Page" */}
      <Route path="/" element={<BoardListPage />} /> 
      
      {/* Route 2: The page for a single board */}
      <Route path="/board/:id" element={<BoardPage />} />
    </Routes>
  );
}
export default App;