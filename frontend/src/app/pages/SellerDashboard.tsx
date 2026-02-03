import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Package, DollarSign, TrendingUp, Loader2 } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface SellerProduct {
  id: number;
  name: string;
  description: string;
  brand: string;
  price: number;
  stock: number;
  image_url: string;
  bnpl_eligible: boolean;
  category: string;
  total_sold: number;
}

export function SellerDashboard() {
  const { currentUser } = useApp();
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // The seller's merchant_id is the same as their user ID for demo purposes
  // In a real system, there would be a merchant association
  const merchantId = (currentUser as any)?.merchant_id || 1;

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/api/seller/products?merchantId=${merchantId}`);
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error('Failed to fetch seller products', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [merchantId]);

  const totalRevenue = products.reduce((s, p) => s + Number(p.price) * p.total_sold, 0);
  const totalSold = products.reduce((s, p) => s + p.total_sold, 0);
  const lowStock = products.filter(p => p.stock <= 5).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Seller Dashboard</h1>
        <p className="text-gray-500 mt-1">Manage your products and track sales</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-gray-500">Total Products</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold">{products.length}</p>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
            <p className="text-xs text-red-500 mt-1">{lowStock} low stock</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-gray-500">Total Units Sold</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold">{totalSold}</p>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-gray-500">Estimated Revenue</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold">${totalRevenue.toFixed(0)}</p>
              <DollarSign className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader><CardTitle>My Products</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : products.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No products found for your store.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Sold</TableHead>
                  <TableHead>BNPL</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map(product => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img src={product.image_url} alt={product.name}
                          className="h-10 w-10 rounded object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.brand}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="secondary">{product.category}</Badge></TableCell>
                    <TableCell className="font-medium">${Number(product.price).toFixed(2)}</TableCell>
                    <TableCell>
                      <span className={product.stock <= 5 ? 'text-red-600 font-semibold' : ''}>
                        {product.stock}
                      </span>
                    </TableCell>
                    <TableCell>{product.total_sold}</TableCell>
                    <TableCell>
                      {product.bnpl_eligible ? (
                        <Badge className="bg-green-100 text-green-800">Eligible</Badge>
                      ) : (
                        <Badge variant="outline">No</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
