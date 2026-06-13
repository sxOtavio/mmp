import Header from "@/components/Header";
import Login from "@/components/Login";
import Footer from "@/components/Footer";
import Hero from "@/components/user/Hero";

export default function loginPage() {
  return (
    <main>
      <Header />
      <Hero/>
      <Login />
      <Footer />
    </main>
  );
}