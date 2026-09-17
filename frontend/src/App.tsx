import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { ScrollToTop } from './components/layout/ScrollToTop';
import { StoreShell } from './components/layout/StoreShell';
import { AdminShell } from './components/layout/AdminShell';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductPage } from './pages/ProductPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { ReceiptPage } from './pages/ReceiptPage';
import { StudioPage } from './pages/StudioPage';
import { LoginPage } from './pages/admin/LoginPage';
import { DashboardPage } from './pages/admin/DashboardPage';
import { ProductsPage } from './pages/admin/ProductsPage';
import { ProductFormPage } from './pages/admin/ProductFormPage';
import { OrdersPage } from './pages/admin/OrdersPage';
import { OrderDetailPage } from './pages/admin/OrderDetailPage';

export default function App() {
  const bootstrap = useAuthStore((s) => s.bootstrap);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<StoreShell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/tienda" element={<ShopPage />} />
          <Route path="/tienda/:slug" element={<ProductPage />} />
          <Route path="/carrito" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/pedido/:number" element={<ReceiptPage />} />
          <Route path="/estudio" element={<StudioPage />} />
        </Route>
        <Route path="/admin/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminShell />}>
            <Route path="/admin" element={<DashboardPage />} />
            <Route path="/admin/productos" element={<ProductsPage />} />
            <Route path="/admin/productos/nuevo" element={<ProductFormPage />} />
            <Route path="/admin/productos/:id" element={<ProductFormPage />} />
            <Route path="/admin/pedidos" element={<OrdersPage />} />
            <Route path="/admin/pedidos/:id" element={<OrderDetailPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
