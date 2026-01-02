import { useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { QuotesTable } from "@/components/dashboard/QuotesTable";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { AddQuoteDialog } from "@/components/dashboard/AddQuoteDialog";
import { 
  FileText, 
  DollarSign, 
  TrendingUp, 
  MessageSquare,
  Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [activeNav, setActiveNav] = useState("dashboard");

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeItem={activeNav} onItemClick={setActiveNav} />
      
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="flex items-center justify-between px-8 py-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
              <p className="text-sm text-muted-foreground">Welcome back, Mike! Here's your business overview.</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full animate-pulse-glow" />
              </Button>
              <AddQuoteDialog />
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Total Quotes"
              value="24"
              change="+3 this week"
              changeType="positive"
              icon={FileText}
              delay={0}
            />
            <StatsCard
              title="Pipeline Value"
              value="$47,850"
              change="+12% vs last month"
              changeType="positive"
              icon={DollarSign}
              delay={50}
            />
            <StatsCard
              title="Conversion Rate"
              value="34%"
              change="+5% improvement"
              changeType="positive"
              icon={TrendingUp}
              delay={100}
            />
            <StatsCard
              title="Messages Sent"
              value="156"
              change="89% delivery rate"
              changeType="neutral"
              icon={MessageSquare}
              delay={150}
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <QuotesTable />
            </div>
            <div>
              <ActivityFeed />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
