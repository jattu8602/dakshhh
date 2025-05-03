import ClientLayout from './ClientLayout';

export const metadata = {
  title: "Daksh Learning Platform",
  description: "A personalized learning platform for students",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Daksh Learning"
  },
  icons: {
    icon: "/icons/icon-192x192.png",
    shortcut: "/icons/icon-192x192.png",
    apple: "/icons/apple-touch-icon.png",
    other: {
      rel: "apple-touch-icon-precomposed",
      url: "/icons/apple-touch-icon-precomposed.png"
    }
  }
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#4F46E5"
};

export default function RootLayout(props) {
  return <ClientLayout {...props} />;
}