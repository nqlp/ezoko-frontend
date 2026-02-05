"use client";

import { useEffect } from "react";
import Alert from "@mui/material/Alert";

interface SnackbarProps {
    message: string,
    onClose: () => void;
    autoHideDuration?: number; // en millisecondes
}

export default function SnackBar({ message, onClose, autoHideDuration }: SnackbarProps) {
    useEffect(() => {
        if (message && autoHideDuration) {
            const timer = setTimeout(() => {
                onClose();
            }, autoHideDuration);

            return () => clearTimeout(timer);
        }
    }, [message, autoHideDuration, onClose]);

    if (!message) return null;

    return (
        <Alert
            onClose={onClose}
            severity="error"
            variant="filled"
            sx={{
                width: '100%',
                marginTop: '16px',
                backgroundColor: 'var(--ezoko-rust)',
                color: 'var(--ezoko-paper)',
                border: '1px solid #f5c6cb',
            }}
        >
            {message}
        </Alert>
    );
}
