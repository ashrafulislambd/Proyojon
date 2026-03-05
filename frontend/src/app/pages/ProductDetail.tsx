import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useApp, Product } from '../context/AppContext';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ShoppingCart, ArrowLeft, CreditCard, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useApp();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/api/products/${id}`);
        if (!res.ok) throw new Error('Product not found');
        const data = await res.json();
        const mappedProduct = {
          ...data,
          image: data.image || data.image_url,
          bnplEligible: data.bnplEligible !== undefined ? data.bnplEligible : data.bnpl_eligible
        };
        setProduct(mappedProduct);
      } catch (err) {
        toast.error('Failed to load product');
        navigate('/home');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!product) return null;

  const monthlyPrice = (Number(product.price) / 3).toFixed(2);

  return (
    <div className="space-y-8">
      <Button variant="ghost" onClick={() => navigate('/home')}>
        <ArrowLeft className="h-4 w-4 mr-2" />Back to Products
      </Button>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Image */}
        <div>
          <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/500x500?text=No+Image'; }}
            />
          </div>
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">{product.category}</Badge>
              {product.bnplEligible && <Badge className="bg-green-500">BNPL Eligible</Badge>}
            </div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            {product.brand && <p className="text-gray-500">by {product.brand}</p>}
          </div>

          <div>
            <p className="text-4xl font-bold">${Number(product.price).toFixed(2)}</p>
            {product.bnplEligible && (
              <p className="text-sm text-gray-500 mt-1">
                or ${monthlyPrice}/month for 3 months (0% interest)
              </p>
            )}
          </div>

          <p className="text-gray-600">{product.description}</p>

          <div className="text-sm text-gray-500">
            {product.stock > 0 ? (
              <span className="text-green-600">✓ In Stock ({product.stock} available)</span>
            ) : (
              <span className="text-red-600">✗ Out of Stock</span>
            )}
          </div>

          {/* Quantity */}
          <div className="flex items-center gap-4">
            <span className="font-semibold">Quantity:</span>
            <div className="flex items-center gap-2 border rounded-lg overflow-hidden">
              <button className="px-3 py-1 hover:bg-gray-100" onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
              <span className="px-4 py-1 border-x">{quantity}</span>
              <button className="px-3 py-1 hover:bg-gray-100" onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}>+</button>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              className="flex-1"
              onClick={() => {
                for (let i = 0; i < quantity; i++) addToCart(product);
                toast.success(`${product.name} added to cart`);
              }}
              disabled={product.stock === 0}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />Add to Cart
            </Button>
          </div>

          {product.bnplEligible && (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-blue-600" />BNPL Options
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <div className="flex justify-between"><span>3 months (0% interest)</span><span className="font-medium">${monthlyPrice}/mo</span></div>
                <div className="flex justify-between"><span>6 months (5% interest)</span><span className="font-medium">${((Number(product.price) * 1.05) / 6).toFixed(2)}/mo</span></div>
                <div className="flex justify-between"><span>12 months (10% interest)</span><span className="font-medium">${((Number(product.price) * 1.10) / 12).toFixed(2)}/mo</span></div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
