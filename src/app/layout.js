import '../styles/globals.css';
import '../styles/layout.css';
import Footer from '../components/Footer.js';
import Header from '../components/Header.js';

export const metadata = {
  title: 'RMIT STEM Assistant',
  description: 'UI for RMIT Assistant',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="page-wrapper">
        <Header />
        <main className="content">{children}</main>
        <Footer />
      </body>
    </html>
  );
}