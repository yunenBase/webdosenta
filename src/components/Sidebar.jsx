import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className="fixed w-64 bg-gray-800 h-screen p-4">
      <nav className="space-y-2">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `block p-2 rounded ${
              isActive ? 'bg-purple-500 text-white' : 'text-gray-300 hover:bg-gray-700'
            }`
          }
        >
          Data Harian
        </NavLink>
        <NavLink
          to="/analytics"
          className={({ isActive }) =>
            `block p-2 rounded ${
              isActive ? 'bg-purple-500 text-white' : 'text-gray-300 hover:bg-gray-700'
            }`
          }
        >
          Lihat Analytic
        </NavLink>
        <NavLink
          to="/durations"
          className={({ isActive }) =>
            `block p-2 rounded ${
              isActive ? 'bg-purple-500 text-white' : 'text-gray-300 hover:bg-gray-700'
            }`
          }
        >
          Durasi Tidur
        </NavLink>
        <NavLink
          to="/row"
          className={({ isActive }) =>
            `block p-2 rounded ${
              isActive ? 'bg-purple-500 text-white' : 'text-gray-300 hover:bg-gray-700'
            }`
          }
        >
          Sebaran Baris
        </NavLink>
      </nav>
    </div>
  );
};

export default Sidebar;