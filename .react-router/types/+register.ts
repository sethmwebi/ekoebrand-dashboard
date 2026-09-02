import "react-router";

declare module "react-router" {
  interface Register {
    params: Params;
  }

  interface Future {
    unstable_middleware: true
  }
}

type Params = {
  "/": {};
  "/login": {};
  "/register": {};
  "/products": {};
  "/categories": {};
  "/coupons": {};
  "/customers": {};
  "/orders": {};
  "/staff": {};
};