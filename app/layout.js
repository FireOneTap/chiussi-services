import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Chiussi Services | Dépannage Informatique La Garde-Freinet & Golfe de St-Tropez",
  description: "Expert en dépannage informatique, installation Wi-Fi et assistance administrative. Intervention rapide à La Garde-Freinet, Grimaud, Cogolin et dans tout le Golfe de Saint-Tropez.",
  keywords: ["dépannage informatique La Garde-Freinet", "réparation ordinateur Saint-Tropez", "installation wifi Cogolin", "assistance informatique Grimaud", "aide administrative Var"],
  authors: [{ name: "Chiussi Services" }],
  openGraph: {
    title: "Chiussi Services - Informatique & Administratif",
    description: "Dépannage et assistance à domicile dans le Golfe de Saint-Tropez.",
    url: "https://chiussi-services.vercel.app/",
    siteName: "Chiussi Services",
    locale: "fr_FR",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
