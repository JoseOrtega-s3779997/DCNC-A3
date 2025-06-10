import '../styles/style.css';
import Footer from '../components'

export const metadata = {
  title: 'RMIT STEM Assistant',
  description: 'UI for RMIT Assitant',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Header />
          <main>
            {children}
          </main>
        <Footer />
      </body>
      
    </html>
  )
}