import { Route, Routes } from 'react-router-dom'
import CourseDetailsPage from './pages/CourseDetailsPage'
import CoursesPage from './pages/CoursesPage'

function App() {
  return (
    <div className="container">
      <Routes>
        <Route path="/" element={<CoursesPage />} />
        <Route path="/courses/:id" element={<CourseDetailsPage />} />
      </Routes>
    </div>
  )
}

export default App
