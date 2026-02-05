"use client";

import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Typography from "@mui/material/Typography";

interface AppBarProps {
    title: string;
    onMenuClick: () => void;
}

export default function AppBarProps({ title, onMenuClick }: AppBarProps) {
    const handleMenuClick = () => {
        onMenuClick();
    }
    return (
        <AppBar position="absolute">
            <Toolbar>
                {/* Hamburger menu */}
                <IconButton edge="start" color="inherit" aria-label="menu" onClick={handleMenuClick}>
                    <MenuIcon />
                </IconButton>

                {/* Title */}
                <Typography variant="h6" color="inherit" component="div">
                    {title}
                </Typography>

                {/* Logo Ezoko */}
                <img
                    src="/favicon.ico"
                    alt="Ezoko Logo"
                    width={32}
                    height={32}
                    className="wms-logo"
                />
            </Toolbar>
        </AppBar>
    );
}