import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { UserPlus } from "lucide-react";
import Input from "../components/ui/Input.jsx";
import Button from "../components/ui/Button.jsx";
import useAuth from "../hooks/useAuth.js";

export default function SignupPage() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const [loading, setLoading] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const password = watch("password");

  const submit = async (data) => {
    setLoading(true);
    try {
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      toast.success("Account created successfully!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(
        error?.response?.data?.errors?.[0] ||
          error?.response?.data?.message ||
          "Signup failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-12 bg-surface paper-grain">
      <div className="dossier-card w-full max-w-md p-8">
        <h1 className="font-headline text-3xl font-bold text-ink-900">Create Your Account</h1>
        <p className="mt-1.5 text-sm text-on-surface-variant font-medium">
          Start simulating and pitching your startup ideas with AI.
        </p>

        <form onSubmit={handleSubmit(submit)} className="mt-8 space-y-5">
          <Input
            label="Full Name"
            placeholder="John Doe"
            error={errors.name?.message}
            registration={register("name", { required: "Name is required" })}
          />
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            registration={register("email", {
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Enter a valid email",
              },
            })}
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            registration={register("password", {
              required: "Password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters",
              },
            })}
          />
          <Input
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            registration={register("confirmPassword", {
              required: "Please confirm your password",
              validate: (value) =>
                value === password || "Passwords do not match",
            })}
          />
          <Button type="submit" fullWidth loading={loading} className="mt-2">
            <UserPlus size={16} />
            Sign Up
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-on-surface-variant">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-brass-700 hover:text-brass-600 transition-colors">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
