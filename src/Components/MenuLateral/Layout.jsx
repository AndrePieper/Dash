import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import LogoutIcon from "@mui/icons-material/Logout";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos"; // IMPORTADO ícone de flecha
import {
  Drawer,
  List,
  ListItemIcon,
  ListItemText,
  ListItemButton,
} from "@mui/material";
import {
  History as HistoryIcon,
  School as SchoolIcon,
  Group as GroupIcon,
  Class as ClassIcon,
  MenuBook as MenuBookIcon,
  CalendarMonth as CalendarIcon,
  ImportContacts as CourseIcon,
  Dashboard as DashboardIcon,
} from "@mui/icons-material";
import "./Layout.css";
import logo from "/src/assets/grupo-fasipe.png";

const Layout = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const tipoUsuario = localStorage.getItem("tipo");

  const [collapsed, setCollapsed] = useState(false);

  // Função para alternar o menu lateral
  const toggleDrawer = () => {
    setCollapsed((prev) => !prev);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };

    handleResize(); 
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (pathname === "/" || pathname === "/login") {
    return <Outlet />;
  }

  const menuItemsProfessor = [
    { text: "Chamadas", icon: <HistoryIcon />, route: "/chamada" },
    { text: "Matérias", icon: <MenuBookIcon />, route: "/materias" },
  ];

  const menuItemsAdm = [
    { text: "Home", icon: <DashboardIcon />, route: "/homeadm" },
    { text: "Entidades", icon: <GroupIcon />, route: "/usuarios" },
    { text: "Disciplinas", icon: <CourseIcon />, route: "/disciplinas" },
    { text: "Cursos", icon: <SchoolIcon />, route: "/cursos" },
    { text: "Turmas", icon: <ClassIcon />, route: "/turmas" },
    { text: "Semestres", icon: <CalendarIcon />, route: "/semestres" },
  ];

  const menuItems =
    tipoUsuario === "1"
      ? menuItemsProfessor
      : tipoUsuario === "2"
      ? menuItemsAdm
      : [];

  return (
    <div className="dashboard-container">
      <Drawer
        variant="permanent"
        anchor="left"
        PaperProps={{
          className: `drawer-custom ${collapsed ? "collapsed" : ""}`,
          style: {
            width: collapsed ? 72 : 240,
          },
        }}
      >
        <div className="menu-logo" onClick={toggleDrawer} style={{ cursor: "pointer" }}>
          {collapsed ? (
            <ArrowForwardIosIcon className="menu-toggle-icon" />
          ) : (
            <img src={logo} alt="Grupo Fasipe" />
          )}
        </div>

        <List>
          {tipoUsuario === "1" && (
            <ListItemButton
              onClick={() => navigate("/home")}
              className={`menu-item ${pathname === "/home" ? "selected" : ""}`}
            >
              <ListItemIcon className="menu-icon">
                <DashboardIcon />
              </ListItemIcon>
              {!collapsed && <ListItemText primary="Início" />}
            </ListItemButton>
          )}

          {menuItems.map((item) => {
            const isSelected = pathname.startsWith(item.route);
            return (
              <ListItemButton
                key={item.text}
                onClick={() => navigate(item.route)}
                className={`menu-item ${isSelected ? "selected" : ""}`}
              >
                <ListItemIcon className="menu-icon">{item.icon}</ListItemIcon>
                {!collapsed && <ListItemText primary={item.text} />}
              </ListItemButton>
            );
          })}
        </List>

        <div style={{ marginTop: "auto" }}>
          <ListItemButton
            onClick={() => {
              localStorage.clear();
              navigate("/login");
            }}
            className="menu-item"
          >
            <ListItemIcon className="menu-icon">
              <LogoutIcon />
            </ListItemIcon>
            {!collapsed && <ListItemText primary="Sair" />}
          </ListItemButton>
        </div>
      </Drawer>

      <main className="conteudo-principal">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
