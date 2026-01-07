"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Globe } from "./globe";
import {
  MessageSquare,
  Zap,
  TrendingUp,
  Clock,
  Bot,
  CreditCard,
  BarChart3,
  Users,
} from "lucide-react";

interface FeatureCardProps {
  children?: React.ReactNode;
  className?: string;
}

const FeatureCard = ({ children, className }: FeatureCardProps) => {
  return (
    <div className={cn("p-4 sm:p-6 relative overflow-hidden", className)}>
      {children}
    </div>
  );
};

const FeatureTitle = ({ children }: { children?: React.ReactNode }) => {
  return (
    <p className="text-left tracking-tight text-gray-900 text-lg md:text-xl font-semibold">
      {children}
    </p>
  );
};

const FeatureDescription = ({ children }: { children?: React.ReactNode }) => {
  return (
    <p className="text-sm text-gray-500 text-left my-2 max-w-sm">
      {children}
    </p>
  );
};

// Skeleton for Quote Pipeline visualization
const SkeletonQuotePipeline = () => {
  const stages = [
    { label: "New", count: 12, color: "bg-blue-500" },
    { label: "Sent", count: 8, color: "bg-amber-500" },
    { label: "Viewed", count: 5, color: "bg-purple-500" },
    { label: "Won", count: 15, color: "bg-emerald-500" },
  ];

  return (
    <div className="relative flex py-6 gap-4 h-full">
      <div className="w-full p-4 mx-auto bg-white rounded-xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-700">Quote Pipeline</span>
          <span className="text-xs text-gray-400">Live</span>
        </div>
        <div className="flex gap-2">
          {stages.map((stage, idx) => (
            <motion.div
              key={stage.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex-1"
            >
              <div className={cn("h-20 rounded-lg flex items-end justify-center pb-2", stage.color)}>
                <span className="text-white font-bold text-lg">{stage.count}</span>
              </div>
              <p className="text-xs text-center mt-1 text-gray-500">{stage.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
      <div className="absolute bottom-0 z-40 inset-x-0 h-20 bg-gradient-to-t from-white to-transparent w-full pointer-events-none" />
    </div>
  );
};

// Skeleton for AI Smart Replies
const SkeletonAIReplies = () => {
  const replies = [
    "Thanks for your interest! I can come by tomorrow at 2pm.",
    "Great news! I've got availability this week.",
    "I'll send over a detailed quote shortly.",
  ];

  return (
    <div className="relative flex flex-col items-start p-4 gap-3 h-full overflow-hidden">
      <div className="flex items-center gap-2 mb-2">
        <Bot className="h-5 w-5 text-primary" />
        <span className="text-sm font-medium text-gray-700">AI Suggestions</span>
      </div>
      {replies.map((reply, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.15 }}
          whileHover={{ scale: 1.02 }}
          className="w-full p-3 bg-primary/5 border border-primary/20 rounded-xl cursor-pointer hover:bg-primary/10 transition-colors"
        >
          <p className="text-sm text-gray-700">{reply}</p>
        </motion.div>
      ))}
      <div className="absolute left-0 z-[100] inset-y-0 w-10 bg-gradient-to-r from-white to-transparent h-full pointer-events-none" />
    </div>
  );
};

// Skeleton for Analytics Chart
const SkeletonAnalytics = () => {
  const data = [40, 70, 45, 90, 60, 85, 95];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="relative flex py-4 h-full">
      <div className="w-full p-4 mx-auto">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-700">Win Rate Trend</span>
          <span className="text-xs text-emerald-600 font-medium">+12%</span>
        </div>
        <div className="flex items-end justify-between gap-2 h-32">
          {data.map((value, idx) => (
            <motion.div
              key={idx}
              initial={{ height: 0 }}
              animate={{ height: `${value}%` }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="flex-1 bg-gradient-to-t from-primary to-[#9D96FF] rounded-t-md"
            />
          ))}
        </div>
        <div className="flex justify-between mt-2">
          {days.map((day) => (
            <span key={day} className="text-[10px] text-gray-400 flex-1 text-center">{day}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

// Skeleton for Globe/Coverage
const SkeletonGlobe = () => {
  return (
    <div className="h-60 md:h-72 flex flex-col items-center relative bg-transparent mt-4">
      <Globe className="absolute -right-10 md:-right-20 -bottom-40 md:-bottom-32" />
    </div>
  );
};

export function FeaturesBento() {
  const features = [
    {
      title: "Smart Quote Pipeline",
      description:
        "Track every quote from creation to conversion with our visual pipeline. Never lose a lead again.",
      skeleton: <SkeletonQuotePipeline />,
      icon: TrendingUp,
      className: "col-span-1 lg:col-span-4 border-b lg:border-r border-gray-200",
    },
    {
      title: "AI-Powered Replies",
      description:
        "Get intelligent response suggestions based on conversation context and your business style.",
      skeleton: <SkeletonAIReplies />,
      icon: Bot,
      className: "border-b col-span-1 lg:col-span-2 border-gray-200",
    },
    {
      title: "Real-Time Analytics",
      description:
        "Monitor your win rates, response times, and revenue trends with beautiful visualizations.",
      skeleton: <SkeletonAnalytics />,
      icon: BarChart3,
      className: "col-span-1 lg:col-span-3 lg:border-r border-gray-200",
    },
    {
      title: "Nationwide Coverage",
      description:
        "Join 500+ home service businesses across the country winning more jobs with Selestial.",
      skeleton: <SkeletonGlobe />,
      icon: Users,
      className: "col-span-1 lg:col-span-3 border-b lg:border-none",
    },
  ];

  return (
    <div className="relative z-20 py-8 lg:py-12">
      <div className="px-4 mb-8">
        <h4 className="text-2xl lg:text-3xl max-w-3xl mx-auto text-center tracking-tight font-bold text-gray-900">
          Everything you need to win more jobs
        </h4>
        <p className="text-sm lg:text-base max-w-2xl my-4 mx-auto text-gray-500 text-center">
          From automated follow-ups to AI-powered responses, Selestial has all the tools you need to convert more quotes into paying customers.
        </p>
      </div>

      <div className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-6 border rounded-2xl border-gray-200 bg-white/50 backdrop-blur-sm overflow-hidden">
          {features.map((feature) => (
            <FeatureCard key={feature.title} className={feature.className}>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <feature.icon className="h-4 w-4 text-primary" />
                </div>
                <FeatureTitle>{feature.title}</FeatureTitle>
              </div>
              <FeatureDescription>{feature.description}</FeatureDescription>
              <div className="h-full w-full">{feature.skeleton}</div>
            </FeatureCard>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FeaturesBento;
