import { Link, type MetaFunction, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";
import { SignUpSchema, type SignupFormData } from "~/schemas/signup-schema";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle, Eye, EyeOff, TriangleAlert } from "lucide-react";
import { useTheme } from "~/providers/theme-provider";
import { useState } from "react";
import { cn } from "~/lib/utils";

export function meta({}: MetaFunction) {
  return [
    {
      title: "Register | Ekoebrand",
    },
    {
      name: "description",
      content: "Ekoebrand registration page",
    },
  ];
}

export default function Register() {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, touchedFields },
    reset,
  } = useForm<SignupFormData>({
    resolver: zodResolver(SignUpSchema),
    mode: "onTouched", // Validate on blur or submit
    reValidateMode: "onChange", // Re-validate as user types to clear errors
    defaultValues: {
      role: "ADMIN",
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (formData: Omit<SignupFormData, "confirmPassword">) => {
      const response = await fetch("http://localhost:8000/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || data.message || data.details || "Registration failed"
        );
      }

      return data;
    },
    onSuccess: () => {
      toast(
        <div className="flex items-center gap-x-4">
          <CheckCircle size={28} />
          <div className="flex flex-col">
            <span className="text-sm font-extrabold">
              Registration successful
            </span>
            <span>Your account has been created</span>
          </div>
        </div>,
        {
          style: {
            background: isDarkMode
              ? "var(--color-green-700)"
              : "var(--color-green-500)",
            color: "var(--primary)",
            borderColor: "var(--color-secondary)",
          },
        }
      );
      reset();
      navigate("/login");
    },
    onError: (error: Error) => {
      toast(
        <div className="flex items-center gap-x-4">
          <TriangleAlert size={28} />
          <div className="flex flex-col">
            <span className="text-xs font-extrabold">Registration failed</span>
            <span>{error.message}</span>
          </div>
        </div>,
        {
          style: {
            background: isDarkMode
              ? "var(--color-red-700)"
              : "var(--color-red-500)",
            color: "var(--primary)",
            borderColor: "var(--color-secondary)",
          },
        }
      );
    },
  });

  const onSubmit = (data: SignupFormData) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="flex justify-center items-center w-full h-[100vh]">
      <div className="max-w-4xl flex justify-between w-full h-[100vh] md:h-[90vh] bg-background/90">
        <div className="h-full hidden md:block w-full flex-1">
          <img
            className="h-full w-full object-cover"
            src="/auth-2.jpg"
            alt="Registration"
          />
        </div>
        <div className="flex-1 px-8 flex flex-col justify-center">
          <h4 className="text-2xl font-bold -mt-8 pb-4">Create account</h4>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Enter your full name"
                className={cn(
                  "border rounded-md p-2",
                  errors.name && touchedFields.name
                    ? "border-red-500 dark:border-red-400 focus-visible:ring-0"
                    : "border-gray-300 dark:border-gray-600 focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0"
                )}
              />
              {errors.name && touchedFields.name && (
                <p className="text-sm text-red-500 dark:text-red-400">
                  {errors.name.message}
                </p>
              )}
            </div>
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
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type={confirmPasswordVisible ? "text" : "password"}
                {...register("confirmPassword")}
                placeholder="Confirm your password"
                className={cn(
                  "border rounded-md p-2",
                  errors.confirmPassword && touchedFields.confirmPassword
                    ? "border-red-500 dark:border-red-400 focus-visible:ring-0"
                    : "border-gray-300 dark:border-gray-600 focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0"
                )}
                endIcon={confirmPasswordVisible ? EyeOff : Eye}
                onEndIconClick={() =>
                  setConfirmPasswordVisible((prev) => !prev)
                }
              />
              {errors.confirmPassword && touchedFields.confirmPassword && (
                <p className="text-red-500 dark:text-red-400 text-sm">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
            <input type="hidden" {...register("role")} value="ADMIN" />

            <Button
              type="submit"
              disabled={registerMutation.isPending || !isValid}
              className="w-full bg-brand-orange disabled:cursor-not-allowed cursor-pointer hover:bg-brand-orange-dark text-white"
            >
              {registerMutation.isPending ? "Creating account..." : "Sign Up"}
            </Button>
          </form>
          <Link
            to="/login"
            className="text-xs mt-[1px] text-brand-orange cursor-pointer dark:text-brand-orange-dark hover:underline"
          >
            Already have an account? Login
          </Link>
        </div>
      </div>
    </div>
  );
}
