import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Label } from '../components/ui/label';
import { ShoppingCart, Search, Filter, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../components/ui/sheet';

export function Home() {
  const { products, addToCart, fetchProducts } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');
  const [bnplOnly, setBnplOnly] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];
  const brands = ['all', ...Array.from(new Set(products.map(p => p.brand).filter(Boolean)))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    const matchesBrand = brandFilter === 'all' || product.brand === brandFilter;
    const matchesBnpl = !bnplOnly || product.bnplEligible;
    return matchesSearch && matchesCategory && matchesBrand && matchesBnpl;
  });

  const handleAddToCart = (product: typeof products[0]) => {
    addToCart(product);
    toast.success(`${product.name} added to cart`);
  };

  const FilterContent = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Category</Label>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Brand</Label>
        <Select value={brandFilter} onValueChange={setBrandFilter}>
          <SelectTrigger><SelectValue placeholder="Brand" /></SelectTrigger>
          <SelectContent>
            {brands.map(brand => (
              <SelectItem key={brand} value={brand}>
                {brand.charAt(0).toUpperCase() + brand.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="bnplOnly"
          checked={bnplOnly}
          onChange={(e) => setBnplOnly(e.target.checked)}
          className="rounded"
        />
        <Label htmlFor="bnplOnly" className="cursor-pointer">BNPL Eligible Only</Label>
      </div>
      <Button variant="outline" className="w-full" onClick={() => {
        setCategoryFilter('all'); setBrandFilter('all'); setBnplOnly(false);
      }}>
        Reset Filters
      </Button>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-8 md:p-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Shop Now, Pay Later</h1>
        <p className="text-xl mb-6 text-blue-100">Flexible payment plans on electronics, furniture, clothing, and more</p>
        <div className="flex flex-wrap gap-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2"><p className="text-sm">0% interest on 3 months</p></div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2"><p className="text-sm">5% interest on 6 months</p></div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2"><p className="text-sm">10% interest on 12 months</p></div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2"><p className="text-sm">Instant approval</p></div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="hidden md:flex gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              {categories.map(c => (
                <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={brandFilter} onValueChange={setBrandFilter}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Brand" /></SelectTrigger>
            <SelectContent>
              {brands.map(b => (
                <SelectItem key={b} value={b}>{b.charAt(0).toUpperCase() + b.slice(1)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="outline"><Filter className="h-4 w-4 mr-2" />Filters</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader>
            <div className="mt-6"><FilterContent /></div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active Filters */}
      <div className="flex flex-wrap gap-2">
        {categoryFilter !== 'all' && (
          <Badge variant="secondary" className="cursor-pointer" onClick={() => setCategoryFilter('all')}>
            Category: {categoryFilter} ×
          </Badge>
        )}
        {brandFilter !== 'all' && (
          <Badge variant="secondary" className="cursor-pointer" onClick={() => setBrandFilter('all')}>
            Brand: {brandFilter} ×
          </Badge>
        )}
        {bnplOnly && (
          <Badge variant="secondary" className="cursor-pointer" onClick={() => setBnplOnly(false)}>
            BNPL Eligible ×
          </Badge>
        )}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredProducts.map(product => (
          <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <Link to={`/home/product/${product.id}`}>
              <div className="aspect-square overflow-hidden bg-gray-100 relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/500x500?text=No+Image'; }}
                />
                {product.bnplEligible && (
                  <Badge className="absolute top-2 right-2 bg-green-500">BNPL</Badge>
                )}
              </div>
            </Link>
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg">{product.name}</CardTitle>
                <Badge variant="secondary">{product.category}</Badge>
              </div>
              <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-2xl font-bold">${Number(product.price).toFixed(2)}</p>
                <p className="text-sm text-gray-500">
                  or ${(Number(product.price) / 3).toFixed(2)}/month for 3 months
                </p>
                {product.brand && <p className="text-xs text-gray-400">Brand: {product.brand}</p>}
                <p className="text-xs text-gray-400">{product.stock} in stock</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => handleAddToCart(product)}
                className="w-full"
                disabled={product.stock === 0}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products found</p>
        </div>
      )}
    </div>
  );
}