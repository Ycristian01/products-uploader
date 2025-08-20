import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import { Box, Collapse, IconButton, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { useState } from "react";
import type ProductI from "../interfaces/product.interface";

interface CustomRowProps {
  product: ProductI;
}

export default function CustomRow({ product }: CustomRowProps) {
  const [open, setOpen] = useState(false);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);

  return (
    <>
      <TableRow key={product.id}>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell>{product.name}</TableCell>
        <TableCell>{formatCurrency(product.price)}</TableCell>
        <TableCell>{new Date(product.expiration).toLocaleDateString()}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Exchange Rates
              </Typography>
              <Table size="small" aria-label="exchange-rates">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Currency</strong></TableCell>
                    <TableCell><strong>Conversion </strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {product.exchangeRates.map((rate) => (
                    <TableRow key={rate.id}>
                      <TableCell>{rate.currency.toLocaleUpperCase()}</TableCell>
                      <TableCell>{formatCurrency(rate.conversion)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );

}