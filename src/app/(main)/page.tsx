"use client";

import { useSession } from "next-auth/react";
import DisplayData from "@/components/MQTTDisplayData2";
import DisplayDatas from "@/components/MQTTDisplayData3";
import React from "react";

const Home = () => {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Not authenticated</p>
      </div>
    );
  }

  return (
    <>{session.user.role === "admin" ? <DisplayData /> : <DisplayDatas />}</>
  );
};

export default Home;
