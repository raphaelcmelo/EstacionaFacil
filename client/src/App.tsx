import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import MobileNav from "@/components/layout/mobile-nav";
import Home from "@/pages/home";
import Login from "@/pages/login";
import Register from "@/pages/register";
import QuickBuy from "@/pages/quick-buy";
import PurchaseOptions from "@/pages/purchase-options";
import CheckPermit from "@/pages/check-permit";
import PermitConfirmation from "@/pages/permit-confirmation";
import UserDashboard from "@/pages/user/dashboard";
import UserVehicles from "@/pages/user/vehicles";
import UserHistory from "@/pages/user/history";
import FiscalDashboard from "@/pages/fiscal/dashboard";
import FiscalVerify from "@/pages/fiscal/verify";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminUsers from "@/pages/admin/users";
import AdminZones from "@/pages/admin/zones";
import AdminPrices from "@/pages/admin/prices";
import { useAuth } from "@/context/auth";
import { Suspense, lazy } from "react";
import { LoadingSpinner } from "@/components/ui/spinner";

function ProtectedRoute({
  component: Component,
  roles = ["CITIZEN", "FISCAL", "MANAGER", "ADMIN"],
  ...rest
}: {
  component: React.ComponentType<any>;
  roles?: string[];
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Login />;
  }

  if (!roles.includes(user.role)) {
    return <NotFound />;
  }

  return <Component {...rest} />;
}

function Router() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/purchase" component={PurchaseOptions} />
        <Route path="/quick-buy" component={QuickBuy} />
        <Route path="/check-permit" component={CheckPermit} />
        <Route path="/permit-confirmation" component={PermitConfirmation} />

        {/* User routes */}
        <Route path="/dashboard">
          {() => (
            <ProtectedRoute
              component={UserDashboard}
              roles={["CITIZEN", "FISCAL", "MANAGER", "ADMIN"]}
            />
          )}
        </Route>
        <Route path="/vehicles">
          {() => (
            <ProtectedRoute
              component={UserVehicles}
              roles={["CITIZEN", "FISCAL", "MANAGER", "ADMIN"]}
            />
          )}
        </Route>
        <Route path="/history">
          {() => (
            <ProtectedRoute
              component={UserHistory}
              roles={["CITIZEN", "FISCAL", "MANAGER", "ADMIN"]}
            />
          )}
        </Route>

        {/* Fiscal routes */}
        <Route path="/fiscal">
          {() => (
            <ProtectedRoute
              component={FiscalDashboard}
              roles={["FISCAL", "ADMIN"]}
            />
          )}
        </Route>
        <Route path="/fiscal/verify">
          {() => (
            <ProtectedRoute
              component={FiscalVerify}
              roles={["FISCAL", "ADMIN"]}
            />
          )}
        </Route>

        {/* Admin routes */}
        <Route path="/admin">
          {() => (
            <ProtectedRoute
              component={AdminDashboard}
              roles={["MANAGER", "ADMIN"]}
            />
          )}
        </Route>
        <Route path="/admin/users">
          {() => <ProtectedRoute component={AdminUsers} roles={["ADMIN"]} />}
        </Route>
        <Route path="/admin/zones">
          {() => (
            <ProtectedRoute
              component={AdminZones}
              roles={["MANAGER", "ADMIN"]}
            />
          )}
        </Route>
        <Route path="/admin/prices">
          {() => (
            <ProtectedRoute
              component={AdminPrices}
              roles={["MANAGER", "ADMIN"]}
            />
          )}
        </Route>

        {/* Fallback to 404 */}
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-6 md:py-8">
          <Router />
        </main>
        <Footer />
        <MobileNav />
      </div>
      <Toaster />
    </>
  );
}

export default App;
