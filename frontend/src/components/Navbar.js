import React from "react";
import { LogOut, User as UserIcon } from "lucide-react";

function Navbar({ user, onLogout }) {
  return (
    <nav className="navbar">
      <div className="dashboard-container" style={{ width: "100%", paddingBottom: 0, marginBottom: 0, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <h1 className="navbar-brand">AI Interview Coach</h1>
          <div className="navbar-subtitle-hide" style={{ color: "var(--text-muted)", fontSize: "0.9rem", fontWeight: "500" }}>
            Practice AI-powered mock interviews
          </div>
        </div>

        {user && (
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {user.profileImage ? (
                <img src={user.profileImage} alt={user.name} style={{ width: "32px", height: "32px", borderRadius: "50%", border: "2px solid var(--primary-color)" }} />
              ) : (
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--bg-soft)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border-color)" }}>
                  <UserIcon size={18} color="var(--primary-color)" />
                </div>
              )}
              <span style={{ fontWeight: "600", fontSize: "0.95rem" }}>{user.name}</span>
            </div>
            <button 
              onClick={onLogout}
              style={{ 
                background: "none", 
                border: "none", 
                color: "var(--danger-color)", 
                cursor: "pointer", 
                display: "flex", 
                alignItems: "center", 
                gap: "6px",
                fontSize: "0.9rem",
                fontWeight: "600"
              }}
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
