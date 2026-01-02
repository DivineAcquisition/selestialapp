import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  title: string;
  children: React.ReactNode;
}

export default function Layout({ title, children }: LayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar - hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      
      {/* Main content area - offset by sidebar on desktop */}
      <div className="flex-1 flex flex-col">
        <Header title={title} />
        
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
