import { NavLink } from 'react-router-dom';
import { routes } from '@/shared/config/routes';

const linkBaseStyle: React.CSSProperties = {
  textDecoration: 'none',
  padding: '6px 10px',
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 500,
  color: '#6b7280',
};

export const Navbar = () => {
  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        background: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* LOGO / TITLE */}
        <div
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: '#111111',
          }}
        >
          Yose Trainer
        </div>

        {/* LINKS */}
        <div style={{ display: 'flex', gap: 8 }}>
          <NavLink
            to={routes.home}
            style={({ isActive }) => ({
              ...linkBaseStyle,
              background: isActive ? '#f3f4f6' : 'transparent',
              color: isActive ? '#111111' : '#6b7280',
            })}
          >
            Home
          </NavLink>

          <NavLink
            to={routes.cards}
            style={({ isActive }) => ({
              ...linkBaseStyle,
              background: isActive ? '#f3f4f6' : 'transparent',
              color: isActive ? '#111111' : '#6b7280',
            })}
          >
            Cards
          </NavLink>

          <NavLink
            to={routes.quiz}
            style={({ isActive }) => ({
              ...linkBaseStyle,
              background: isActive ? '#f3f4f6' : 'transparent',
              color: isActive ? '#111111' : '#6b7280',
            })}
          >
            Quiz
          </NavLink>
        </div>
      </div>
    </div>
  );
};
