import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { SignInSchema, type SigninFormData } from "~/schemas/signin-schema";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle, Eye, EyeOff, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "~/providers/theme-provider";
import { useState } from "react";
import { useAuthStore } from "~/store/auth";
import { cn } from "~/lib/utils";
import { Link, useNavigate, type MetaFunction } from "react-router";
import { useForm } from "react-hook-form";

export const meta: MetaFunction = () => {
  return [
    {
      title: "Login | Ekoebrand",
    },
    {
      name: "description",
      content: "Ekoebrand login page",
    },
  ];
};

type LoginResponse = {
  accessToken: string;
  user: {
    id: string;
    email: string;
    image: string | null;
    name: string;
    role: string;
  };
};

export default function Login() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const { isDarkMode } = useTheme();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, touchedFields },
  } = useForm<SigninFormData>({
    resolver: zodResolver(SignInSchema),
    mode: "onTouched", // Validate on blur or submit
    reValidateMode: "onChange", // Re-validate as user types to clear errors
  });

  const loginMutation = useMutation({
    mutationFn: async (formData: SigninFormData) => {
      const response = await fetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok)
        throw new Error(data.error || data.message || "Login failed");
      return data as LoginResponse;
    },
    onSuccess: (data: LoginResponse) => {
      setAuth(data.user, data.accessToken);
      toast(
        <div className="flex items-center gap-x-2">
          <CheckCircle size={28} />
          <div className="flex flex-col">
            <span className="text-sm font-extrabold">Login successful</span>
            <span>{`Welcome back, ${data.user.name.split(" ")[0]}!`}</span>
          </div>
        </div>,
        {
          style: {
            background: isDarkMode
              ? "var(--color-green-700)"
              : "var(--color-green-500)",
            color: "var(--color-white)",
            borderColor: "var(--color-secondary)",
          },
        }
      );
      navigate("/");
    },
    onError: (error: Error) => {
      toast(
        <div className="flex items-center gap-x-4">
          <TriangleAlert size={28} />
          <div className="flex flex-col">
            <span className="text-xs font-extrabold">Login failed</span>
            <span>{error.message}</span>
          </div>
        </div>,
        {
          style: {
            background: isDarkMode
              ? "var(--color-red-700)"
              : "var(--color-red-500)",
            color: "var(--color-white)",
            borderColor: "var(--color-secondary)",
          },
        }
      );
    },
  });

  const onSubmit = (data: SigninFormData) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="flex justify-center items-center w-full h-[100vh]">
      <div className="max-w-4xl flex justify-between w-full h-[100vh] md:h-[90vh] bg-background/90">
        <div className="h-full hidden md:block w-full flex-1">
          <img className="h-full w-full object-cover" src="/auth-2.jpg" />
        </div>
        <div className="flex-1 px-8 flex flex-col justify-center">
          <h4 className="text-2xl font-bold -mt-8 pb-4">Welcome back</h4>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="Enter your email"
                className={cn(
                  "border rounded-md p-2",
                  errors.email && touchedFields.email
                    ? "border-red-500 dark:border-red-400 focus-visible:ring-0"
                    : "border-gray-300 dark:border-gray-600 focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0"
                )}
              />
              {errors.email && touchedFields.email && (
                <p className="text-red-500 dark:text-red-400 text-sm">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type={passwordVisible ? "text" : "password"}
                {...register("password")}
                placeholder="Enter your password"
                className={cn(
                  "border rounded-md p-2",
                  errors.password && touchedFields.password
                    ? "border-red-500 dark:border-red-400 focus-visible:ring-0"
                    : "border-gray-300 dark:border-gray-600 focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0"
                )}
                endIcon={passwordVisible ? EyeOff : Eye}
                onEndIconClick={() => setPasswordVisible((prev) => !prev)}
              />
              {errors.password && touchedFields.password && (
                <p className="text-red-500 dark:text-red-400 text-sm">
                  {errors.password.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              disabled={loginMutation.isPending || !isValid}
              className="w-full disabled:cursor-not-allowed bg-brand-orange hover:bg-brand-orange-dark text-white cursor-pointer"
            >
              {loginMutation.isPending ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <Link
            to="/register"
            className="text-xs mt-[1px] text-brand-orange cursor-pointer dark:text-brand-orange-dark hover:underline"
          >
            Don't have an account? Register
          </Link>
        </div>
      </div>
    </div>
  );
}
