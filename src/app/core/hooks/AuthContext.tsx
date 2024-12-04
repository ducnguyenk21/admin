import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (token: string, email: string) => void; // Cập nhật để bao gồm email
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const router = useRouter();
  const pathname = usePathname(); // Lấy URL hiện tại

  // Kiểm tra token khi tải trang lần đầu
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      if (pathname !== "/login") {
        router.replace("/login"); // Chuyển hướng về login nếu chưa đăng nhập
      }
    }
  }, [pathname, router]);

  // Sử dụng useEffect để kiểm tra isAuthenticated và điều hướng khi thay đổi
  useEffect(() => {
    if (isAuthenticated && pathname === "/login") {
      // Nếu đã đăng nhập và đang ở trang login, chuyển hướng sang /users
      router.replace("/users");
    }
  }, [isAuthenticated, router, pathname]);

  // Hàm đăng nhập
  const login = (token: string, email: string) => {
    localStorage.setItem("access_token", token); // Lưu token vào localStorage
    localStorage.setItem("email", email); // Lưu email vào localStorage
    console.log("Email: " + email);
    setIsAuthenticated(true); // Cập nhật trạng thái đăng nhập
  };

  // Hàm đăng xuất
  const logout = () => {
    localStorage.removeItem("access_token"); // Xoá token
    localStorage.removeItem("email"); // Xoá email
    setIsAuthenticated(false); // Cập nhật trạng thái đăng xuất
    router.replace("/login"); // Chuyển hướng về trang login
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
