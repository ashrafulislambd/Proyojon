import { Outlet, Link, useLocation } from 'react-router';
import { ShoppingCart, Store, Package, User, Menu, CreditCard, Bell, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useApp } from '../context/AppContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from './ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';

export function Layout() {
  const { cart, userRole, setUserRole, notifications } = useApp();
  const location = useLocation();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const unreadNotifications = notifications.filter(n => !n.read).length;

  const isActive = (path: string) => location.pathname === path;

  const NavLinks = () => (
    <>
      <Link to="/home">
        <Button variant={isActive('/home') ? 'default' : 'ghost'}>
          <Store className="h-4 w-4 mr-2" />
          Shop
        </Button>
      </Link>
      <Link to="/home/orders">
        <Button variant={isActive('/home/orders') ? 'default' : 'ghost'}>
          <Package className="h-4 w-4 mr-2" />
          Orders
        </Button>
      </Link>
      <Link to="/home/repayments">
        <Button variant={isActive('/home/repayments') ? 'default' : 'ghost'}>
          <CreditCard className="h-4 w-4 mr-2" />
          Repayments
        </Button>
      </Link>
      {userRole === 'seller' && (
        <Link to="/home/seller">
          <Button variant={isActive('/home/seller') ? 'default' : 'ghost'}>
            <Store className="h-4 w-4 mr-2" />
            Seller Dashboard
          </Button>
        </Link>
      )}
      {userRole === 'admin' && (
        <Link to="/home/admin">
          <Button variant={isActive('/home/admin') ? 'default' : 'ghost'}>
            <Shield className="h-4 w-4 mr-2" />
            Admin Panel
          </Button>
        </Link>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/home" className="flex items-center gap-2">
              <div className="bg-blue-600 text-white p-2 rounded-lg">
                <Store className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">BNPL Market</h1>
                <p className="text-xs text-gray-500">Buy Now, Pay Later</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              <NavLinks />
            </nav>

            <div className="flex items-center gap-2">
              {/* Notifications Button */}
              <Link to="/home/notifications">
                <Button variant="outline" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadNotifications > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-red-500">
                      {unreadNotifications}
                    </Badge>
                  )}
                </Button>
              </Link>

              {/* Cart Button */}
              <Link to="/home/cart">
                <Button variant="outline" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0">
                      {cartCount}
                    </Badge>
                  )}
                </Button>
              </Link>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link to="/home/profile">
                    <DropdownMenuItem>
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Switch Mode</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => setUserRole('buyer')}>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${userRole === 'buyer' ? 'bg-green-500' : 'bg-gray-300'}`} />
                      Buyer Mode
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setUserRole('seller')}>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${userRole === 'seller' ? 'bg-green-500' : 'bg-gray-300'}`} />
                      Seller Mode
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setUserRole('admin')}>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${userRole === 'admin' ? 'bg-green-500' : 'bg-gray-300'}`} />
                      Admin Mode
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Menu */}
              <Sheet>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="outline" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <nav className="flex flex-col gap-4 mt-8">
                    <NavLinks />
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>&copy; 2026 BNPL Market. Buy Now, Pay Later with flexible payment plans.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}