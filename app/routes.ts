import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  route("login", "routes/login.tsx"),
  route("register", "routes/register.tsx"),
  layout("./components/dashboard-layout.tsx", [
    index("routes/dashboard.tsx"),
    route("products", "routes/products.tsx"),
    route("categories", "routes/categories.tsx"),
    route("coupons", "routes/coupons.tsx"),
    route("customers", "routes/customers.tsx"),
    route("orders", "routes/orders.tsx"),
    route("staff", "routes/staff.tsx"),
  ]),
] satisfies RouteConfig;
