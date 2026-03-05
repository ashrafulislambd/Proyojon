import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import { ShoppingCart, Store, Package, User, Menu, CreditCard, Bell, Shield, Users, Building2, FileText, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';
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
  const { cart, userRole, setUserRole, setCurrentUser, notifications } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const unreadNotifications = notifications.filter(n => !n.read).length;

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    // Clear state
    setCurrentUser(null);
    // Clear any stored data
    localStorage.clear();
    // Redirect to login page
    navigate('/');
    toast.success('Logged out successfully');
  };

  const NavLinks = () => {
    if (userRole === 'admin') {
      return (
        <>
          <Link to="/home/admin">
            <Button variant={isActive('/home/admin') ? 'default' : 'ghost'}>
              <Shield className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </Link>
          <Link to="/home/seller">
            <Button variant={isActive('/home/seller') ? 'default' : 'ghost'}>
              <Store className="h-4 w-4 mr-2" />
              Sellers
            </Button>
          </Link>
          <Link to="/home/merchant">
            <Button variant={isActive('/home/merchant') ? 'default' : 'ghost'}>
              <Building2 className="h-4 w-4 mr-2" />
              Merchants
            </Button>
          </Link>
          <Link to="/home/orders">
            <Button variant={isActive('/home/orders') ? 'default' : 'ghost'}>
              <FileText className="h-4 w-4 mr-2" />
              Reports
            </Button>
          </Link>
        </>
      );
    }

    return (
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
        <Link to="/home/seller">
          <Button variant={isActive('/home/seller') ? 'default' : 'ghost'}>
            <Building2 className="h-4 w-4 mr-2" />
            Seller
          </Button>
        </Link>
      </>
    );
  };

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
              <Link to="/home/profile">
                <Button variant="outline" size="icon" title="Profile">
                  <User className="h-5 w-5" />
                </Button>
              </Link>

              {/* Logout Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </Button>

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