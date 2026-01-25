import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNavigate } from "react-router";

const signUpSchema = z.object({
  firstname: z.string().min(1, "Tên bắt buộc phải có"),
  lastname: z.string().min(1, "Họ bắt buộc phải có"),
  username: z.string().min(3, "Tên đăng nhập ít nhất phải có 3 ký tự"),
  email: z.email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải ít nhất 6 ký tự"),
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
  });
  const [showPassword, setShowPassword] = useState(false);
  const { signUp } = useAuthStore();
  const navigate = useNavigate();

  const onSubmit = async (data: SignUpFormValues) => {
    const { firstname, lastname, username, email, password } = data;
    await signUp(username, password, email, firstname, lastname);
    navigate("/signin");
  };
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 border-border">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              {/* header - logo */}
              <div className="flex flex-col items-center text-center gap-2">
                <a href="/" className="mx-auto block w-fit text-center ">
                  <img src="/logo.svg" alt="logo" />
                  <h1 className="text-2xl font-bold">Tạo tài khoản Moji</h1>
                  <p className="text-muted-foreground text-balance">
                    Chào mừng bạn! Hãy đăng nhập để bắt đầu
                  </p>
                </a>
              </div>
              {/* Họ & tên */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label htmlFor="lastname" className="block text-sm">
                    Họ
                  </label>
                  <Input type="text" id="lastname" {...register("lastname")} />
                  {/* todo:erro message  */}
                  {errors.lastname && (
                    <p className="text-destructive text-sm">
                      {errors.lastname.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label htmlFor="firstname" className="block text-sm">
                    Tên
                  </label>
                  <Input
                    type="text"
                    id="firstname"
                    {...register("firstname")}
                  />
                  {errors.firstname && (
                    <p className="text-destructive text-sm">
                      {errors.firstname.message}
                    </p>
                  )}
                </div>
              </div>
              {/* username */}
              <div className="flex flex-col gap-3">
                <label htmlFor="username" className="block text-sm">
                  Tên đăng nhập
                </label>
                <Input type="text" id="username" {...register("username")} />
                {errors.username && (
                  <p className="text-destructive text-sm">
                    {errors.username.message}
                  </p>
                )}
              </div>
              {/* email */}
              <div className="flex flex-col gap-3">
                <label htmlFor="email" className="block text-sm">
                  Email
                </label>
                <Input
                  type="text"
                  id="email"
                  placeholder="m@gmail.com"
                  {...register("email")}
                />

                {errors.email && (
                  <p className="text-destructive text-sm">
                    {errors.email.message}
                  </p>
                )}
              </div>
              {/* password */}
              <div className="flex flex-col gap-3">
                <label htmlFor="password" className="block text-sm">
                  Mật khẩu
                </label>
                <div className="relative flex items-center">
                  <Input
                    className="pr-10"
                    type={showPassword ? "text" : "password"}
                    id="password"
                    {...register("password")}
                  />

                  {showPassword ? (
                    <EyeOff
                      className="absolute right-3 h-5 w-5"
                      onClick={() => setShowPassword(!showPassword)}
                    />
                  ) : (
                    <Eye
                      className="absolute right-3 h-5 w-5"
                      onClick={() => setShowPassword(!showPassword)}
                    />
                  )}
                </div>

                {errors.password && (
                  <p className="text-destructive text-sm">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                Tạo tài khoản
              </Button>

              <div className="text-center text-sm">
                Đã có tài khoản?{" "}
                <a href="/signin" className="underline underline-offset-4">
                  Đăng nhập
                </a>
              </div>
            </div>
          </form>
          <div className="bg-muted relative hidden md:block">
            <img
              src="/placeholderSignUp.png"
              alt="Image"
              className="absolute top-1/2 -translate-y-1/2  object-cover"
            />
          </div>
        </CardContent>
      </Card>
      <div className="px-6 text-center">
        Bằng cách tiếp tục, bạn đồng ý với <a href="#">Điều khoản dịch vụ</a>{" "}
        and <a href="#">Chính sách bảo mật của chúng tôi</a>.
      </div>
    </div>
  );
}
