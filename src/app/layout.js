export const metadata = {
  title: 'RMIT STEM Assistant',
  description: 'UI for RMIT Assitant',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}