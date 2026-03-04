import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { SellerDashboard } from "./pages/SellerDashboard";
import { ProductDetail } from "./pages/ProductDetail";
import { Cart } from "./pages/Cart";
import { Checkout } from "./pages/Checkout";
import { Orders } from "./pages/Orders";
import { Repayments } from "./pages/Repayments";
import { Profile } from "./pages/Profile";
import { MerchantDashboard } from "./pages/MerchantDashboard";
import { AdminPanel } from "./pages/AdminPanel";
import { Notifications } from "./pages/Notifications";
import { Auth } from "./pages/Auth";
import { NotFound } from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    index: true,
    path: "/",
    Component: Auth,
  },
  {
    path: "/home",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "seller", Component: SellerDashboard },
      { path: "product/:id", Component: ProductDetail },
      { path: "cart", Component: Cart },
      { path: "checkout", Component: Checkout },
      { path: "orders", Component: Orders },
      { path: "repayments", Component: Repayments },
      { path: "profile", Component: Profile },
      { path: "merchant", Component: MerchantDashboard },
      { path: "admin", Component: AdminPanel },
      { path: "notifications", Component: Notifications },
      { path: "*", Component: NotFound },
    ],
  },
]);