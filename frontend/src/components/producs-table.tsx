import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import { Box, Button, Collapse, Container, IconButton, InputAdornment, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField, Typography } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import type ProductI from "../interfaces/product.interface";
import CustomRow from "./custom-row";

export default function ProductsTable() {
  const [products, setProducts] = useState<ProductI[]>([]);
  const [limit, setLimit] = useState<number>(10);
  const [page, setPage] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [name, setName] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minExpiration, setMinExpiration] = useState('');
  const [maxExpiration, setMaxExpiration] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const backendBaseUrl = import.meta.env.VITE_BACKEND_URL;

  function fetchProducts(currentPage = page, currentLimit = limit) {
    axios.get(`${backendBaseUrl}/products`, {
      params: {
        page: currentPage + 1,
        limit: currentLimit,
        name,
        minPrice,
        maxPrice,
        minExpiration,
        maxExpiration,
        sortBy: sortBy == 'None' ? '' : sortBy,
        order,
      }
    })
      .then((res) => {
        setProducts(res.data.data.products),
        setTotalCount(res.data.data.total)
      })
      .catch((err) => console.error('Error fetching products:', err));
  }

  useEffect(() => {
    fetchProducts()
  }, [
    page,
    limit,
    name,
    minPrice,
    maxPrice,
    minExpiration,
    maxExpiration,
    sortBy,
    order,
  ]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleLimit = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLimit(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Container sx={{ width: '100%' }}>
      <Typography variant="h4" gutterBottom>
        Product List
      </Typography>
      <Paper
        elevation={3}
        sx={{
          p: 2,
          mb: 3,
          backgroundColor: 'theme.palette.background.paper',
        }}
      >
        <Box display="flex" gap={2} flexWrap="wrap">
          <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <TextField
            label="Min Price"
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment>, }}
          />
          <TextField
            label="Max Price"
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment>, }}
          />
          <TextField
            label="Min Expiration"
            type="date"
            value={minExpiration}
            onChange={(e) => setMinExpiration(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{
              '& input[type="date"]::-webkit-calendar-picker-indicator': {
                filter: 'invert(0.5)',
              },
            }}
          />
          <TextField
            label="Max Expiration"
            type="date"
            value={maxExpiration}
            onChange={(e) => setMaxExpiration(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{
              '& input[type="date"]::-webkit-calendar-picker-indicator': {
                filter: 'invert(0.5)',
              },
            }}
          />
          <TextField
            select
            label="Sort By"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            SelectProps={{ native: true }}
          >
            <option value="None">None</option>
            <option value="name">Name</option>
            <option value="price">Price</option>
            <option value="expiration">Expiration</option>
          </TextField>
          <TextField
            select
            label="Order"
            value={order}
            onChange={(e) => setOrder(e.target.value as 'asc' | 'desc')}
            SelectProps={{ native: true }}
          >
            <option value="asc">Asc</option>
            <option value="desc">Desc</option>
          </TextField>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
            setName('');
            setMinPrice('');
            setMaxPrice('');
            setMinExpiration('');
            setMaxExpiration('');
            setSortBy('None');
            setOrder('asc');
            setPage(0);
          }}>
            Clear Filters
          </Button>
        </Box>
      </Paper>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <TableContainer>
          <Table sx={{ minWidth: 400 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Price</strong></TableCell>
                <TableCell><strong>Expiration</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product) => (
                <CustomRow
                  product={product}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalCount}
          rowsPerPage={limit}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleLimit}
        />
      </Paper>
    </Container>
  )
}