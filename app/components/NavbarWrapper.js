import { headers } from "next/headers";
import Navbar from "./Navbar";

const NavbarWrapper = () => {
  const headersList = headers();
  const pathname = headersList.get("x-invoke-path") || "";
  const isHomePage = pathname === "/";
  
  return <Navbar isHomePage={isHomePage} />;
};

export default NavbarWrapper;