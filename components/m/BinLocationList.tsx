"use client";

import { useEffect, useState } from "react";
import Checkbox from "@mui/material/Checkbox";
import Divider from "@mui/material/Divider";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import TableContainer from "@mui/material/TableContainer";
import { StockLocation } from "@/lib/types/StockLocation";
import IconButton from "@mui/material/IconButton";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";

interface BinLocationListProps {
    stockLocation: StockLocation[];
    selectedBins: string[];
    onBinSelectionChange: (bins: string[]) => void;
}

export default function BinLocationList({
    stockLocation,
    selectedBins,
    onBinSelectionChange,
}: BinLocationListProps) {
    const [moveQty, setMoveQty] = useState(1);

    // Auto check if only one bin location
    useEffect(() => {
        if (stockLocation.length === 1) {
            onBinSelectionChange([stockLocation[0].id]);
        }
    }, [stockLocation, onBinSelectionChange]);

    const handleToggle = (id: string) => {
        const newChecked = selectedBins.includes(id)
            ? [] // Unselect if already selected
            : [id]; // Select the bin location we clicked
        onBinSelectionChange(newChecked);
    }

    return (
        <div style={{ marginTop: "16px" }}>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell padding="checkbox"></TableCell>
                            <TableCell>Bin Location</TableCell>
                            <TableCell align="right">Qty</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {stockLocation.map((location) => {
                            const isChecked = selectedBins.includes(location.id);
                            return (
                                <TableRow
                                    key={location.id}
                                    sx={{
                                        bgcolor: isChecked ? "var(--ezoko-mint)" : "var(--ezoko-paper)",
                                    }}
                                >
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            checked={isChecked}
                                            onChange={() => handleToggle(location.id)}
                                            sx={{ color: "var(--ezoko-pine)" }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ textTransform: "uppercase" }}>
                                        {location.binLocation}
                                    </TableCell>
                                    <TableCell align="right" sx={{ fontWeight: "bold" }}>
                                        {location.qty}
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </TableContainer>

            <Divider sx={{ my: 2 }} />
            <div style={{ display: "flex", alignItems: "center" }}>
                <IconButton
                    onClick={() => setMoveQty(moveQty - 1)}
                    disabled={moveQty <= 1}
                >
                    <RemoveIcon />
                </IconButton>
                <TextField
                    label="Move Qty"
                    type="number"
                    value={moveQty}
                    onChange={(e) => setMoveQty(Number(e.target.value))}
                    fullWidth
                    slotProps={{
                        htmlInput: {
                            min: 1,
                            // max: stockLocation.find((location) => location.id === selectedBins[0])?.qty,
                        }
                    }}
                />
                <IconButton
                    onClick={() => setMoveQty(moveQty + 1)}
                >
                    <AddIcon />
                </IconButton>
            </div>
        </div>
    )
}