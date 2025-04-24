import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
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

const menuItems = [
  { text: "Chamadas", icon: <HistoryIcon />, route: "/chamadas" },
  { text: "Matérias", icon: <MenuBookIcon />, route: "/materias" },
  { text: "Entidades", icon: <GroupIcon />, route: "/usuarios" },
  { text: "Disciplinas", icon: <CourseIcon />, route: "/disciplinas" },
  { text: "Cursos", icon: <SchoolIcon />, route: "/cursos" },
  { text: "Turmas", icon: <ClassIcon />, route: "/turmas" },
  { text: "Semestres", icon: <CalendarIcon />, route: "/semestres" },
];

const Layout = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  if (pathname === "/" || pathname === "/login") {
    return <Outlet />;
  }

  return (
    <div className="dashboard-container">
      <Drawer
        variant="permanent"
        anchor="left"
        PaperProps={{
          className: "drawer-custom",
        }}
      >
        <div className="menu-logo">
          <img src={logo} alt="Grupo Fasipe" />
        </div>

        <List>
          <ListItem
            button
            onClick={() => navigate("/home")}
            className={`menu-item ${pathname === "/home" ? "selected" : ""}`}
          >
            <ListItemIcon className="menu-icon">
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Início" />
          </ListItem>

          {menuItems.map((item) => {
            const isSelected = pathname === item.route;

            return (
              <ListItem
                button
                key={item.text}
                onClick={() => navigate(item.route)}
                className={`menu-item ${isSelected ? "selected" : ""}`}
              >
                <ListItemIcon className="menu-icon">{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            );
          })}
        </List>
      </Drawer>

      <main className="conteudo-principal">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
