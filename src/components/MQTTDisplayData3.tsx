"use client";

import { useEffect, useRef, useState } from "react";
import { client } from "../lib/mqtt-client";
import { Card, CardHeader, CardContent } from "./ui/card";
import { saveData, SaveHasil, SaveHasilSumber } from "@/app/server/action";
// import ApexChart from "react-apexcharts";
import EnhancedStatCard from "./StatusCard";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip } from "./ui/chart";
import {
  Activity,
  ChartBarIcon,
  ChartLineIcon,
  ChartPieIcon,
  DollarSign,
  TrendingUp,
  Zap,
} from "lucide-react";

type Candle = {
  month: number; // timestamp
  desktop: number; // open, high, low, close
};

const MQTTData = () => {
  // const session = auth();
  const [voltageR, setVoltageR] = useState<number | null>(null);
  const [voltageS, setVoltageS] = useState<number | null>(null);
  const [voltageT, setVoltageT] = useState<number | null>(null);
  const [currentR, setCurrentR] = useState<number>(0);
  const [currentS, setCurrentS] = useState<number>(0);
  const [currentT, setCurrentT] = useState<number>(0);
  const [totalEnergy, setTotalEnergy] = useState<number>(0);
  const [avgCurrents, setAvgCurrents] = useState<number>(0);
  const [avgVoltage, setAvgVoltage] = useState<number>(0);
  const [energyRecords, setEnergyRecords] = useState<number[]>([]);
  const [electricalBillHours, setElectricalBillHours] = useState<number>(0);

  const [inputKalibrasiR, setInputKalibrasiR] = useState<number>(0);
  const [inputKalibrasiS, setInputKalibrasiS] = useState<number>(0);
  const [inputKalibrasiT, setInputKalibrasiT] = useState<number>(0);
  const [inputValue1, setInputValue1] = useState<number>(5.75);
  const [persenadd, setPersenAdd] = useState<number>(1);

  const [realTime, setRealTime] = useState<string>(
    new Date().toLocaleTimeString()
  );
  // const [inputKalibrasiR, setInputKalibrasiR] = useState<number>(0);
  // const [inputKalibrasiS, setInputKalibrasiS] = useState<number>(0);
  // const [inputKalibrasiT, setInputKalibrasiT] = useState<number>(0);
  // const [inputValue1, setInputValue1] = useState<number>(5.75);
  const [withoutsBooster, setWithoutBooster] = useState<number>(0);
  // const [persenadd, setPersenAdd] = useState<number>(1);

  // const handleInputKalibrasiR = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setInputKalibrasiR(parseFloat(e.target.value) || 0);
  // };

  // const handleInputKalibrasiS = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setInputKalibrasiS(parseFloat(e.target.value) || 0);
  // };

  // const handleInputKalibrasiT = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setInputKalibrasiT(parseFloat(e.target.value) || 0);
  // };

  // const handleInputChangeS = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setInputValue1(parseFloat(e.target.value) || 0);
  // };

  // const handlePersenAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setPersenAdd(parseFloat(e.target.value));
  // };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setRealTime(now.toLocaleTimeString("en-GB", { hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const cosPhi = 0.95;
  const phaseMultiplier = 1.75;
  const LWBP_RATE = 1035.78;
  const WBP_RATE = 1553.67;
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(Date.now());
  const [noDataAlert, setNoDataAlert] = useState<boolean>(false);
  const getTariff = () => {
    const hour = new Date().getHours();
    return hour >= 17 && hour < 23 ? WBP_RATE : LWBP_RATE;
  };

  useEffect(() => {
    const fetchSetting = async () => {
      try {
        const res = await fetch("/api/setting");
        if (!res.ok) throw new Error("Failed to fetch");

        const data = await res.json();
        if (data.setting) {
          setInputKalibrasiR(data.setting.multiplierR || 0);
          setInputKalibrasiS(data.setting.multiplierS || 0);
          setInputKalibrasiT(data.setting.multiplierT || 0);
          setPersenAdd(data.setting.persen || 0);
          setInputValue1(data.setting.divider || 5.75);
        }
      } catch (error) {
        console.error("Error fetching setting:", error);
      }
    };

    fetchSetting();
  }, []);

  // useEffect(() => {
  //   const fetchSetting = async () => {
  //     try {
  //       const res = await fetch("/api/data");
  //       if (!res.ok) throw new Error("Failed to fetch");

  //       const data = await res.json();
  //       if (data) {
  //       }
  //       console.log(data);
  //     } catch (error) {
  //       console.error("Error fetching setting:", error);
  //     }
  //   };

  //   fetchSetting();
  // }, []);

  useEffect(() => {
    const handleMessage = (topic: string, message: Buffer) => {
      const value = parseFloat(message.toString());
      if (isNaN(value)) return;
      setLastUpdateTime(Date.now()); // Update setiap ada data masuk

      switch (topic) {
        case "SABDA/VR":
          setVoltageR(value);
          break;
        case "SABDA/VS":
          setVoltageS(value);
          break;
        case "SABDA/VT":
          setVoltageT(value);
          break;
        case "SABDA/IR":
          setCurrentR(parseFloat(value.toFixed(1)));
          break;
        case "SABDA/IS":
          setCurrentS(parseFloat(value.toFixed(1)));
          break;
        case "SABDA/IT":
          setCurrentT(parseFloat(value.toFixed(1)));
          break;
        default:
          break;
      }
      const handleSaveSumber = async () => {
        await SaveHasilSumber(topic, value);
      };

      handleSaveSumber();
    };

    client.on("message", handleMessage);
    return () => {
      client.off("message", handleMessage);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const diff = now - lastUpdateTime;

      if (diff > 360000) {
        // jika lebih dari 5 detik tidak ada update
        setNoDataAlert(true);
      } else {
        setNoDataAlert(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastUpdateTime]);

  const aftercurrentR = currentR / inputValue1 + inputKalibrasiR;
  const aftercurrentS = currentS / inputValue1 + inputKalibrasiS;
  const aftercurrentT = currentT / inputValue1 + inputKalibrasiT;

  useEffect(() => {
    if (
      aftercurrentR !== null &&
      aftercurrentS !== null &&
      aftercurrentT !== null
    ) {
      setAvgCurrents((aftercurrentR + aftercurrentS + aftercurrentT) / 3);
    }
  }, [aftercurrentR, aftercurrentS, aftercurrentT]); // Dependencies

  useEffect(() => {
    if (voltageR !== null && voltageS !== null && voltageT !== null) {
      setAvgVoltage((voltageR + voltageS + voltageT) / 3);
    }
  }, [voltageR, voltageS, voltageT]);

  useEffect(() => {
    if (
      avgCurrents !== null &&
      avgVoltage !== null &&
      avgCurrents > 0 &&
      avgVoltage > 0
    ) {
      const kwh = (phaseMultiplier * avgCurrents * avgVoltage * cosPhi) / 1000;
      if (isFinite(kwh)) {
        // Memastikan kwh bukan Infinity
        setTotalEnergy(kwh);
        // setAvgCurrents{avgCurrent};
        setEnergyRecords((prev) => [...prev, kwh]);
      }
    }
  }, [avgCurrents, avgVoltage]);

  useEffect(() => {
    if (energyRecords.length > 0) {
      const totalCost = energyRecords.reduce(
        (sum, kwh) => sum + (isFinite(kwh) ? kwh * getTariff() : 0),
        0
      );
      setElectricalBillHours(totalCost / energyRecords.length);
    }
  }, [energyRecords]);

  // const withoutBooster =
  //   avgCurrents !== null ? (avgCurrents * persenadd).toFixed(1) : "No data";

  // const withBooster = avgCurrents !== null ? avgCurrents.toFixed(1) : "No data";
  useEffect(() => {
    if (avgCurrents !== null) {
      setWithoutBooster(avgCurrents * 5.75);
    }
  }, [avgCurrents]); // Dependencies
  const currentMonth = new Date().toLocaleString("default", { month: "long" });
  const monthlyEnergy =
    totalEnergy !== null ? (totalEnergy * 30).toFixed(2) : "No data";

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  useEffect(() => {
    const handleSave = async () => {
      await saveData(
        avgCurrents,
        avgVoltage,
        avgCurrents,
        totalEnergy,
        electricalBillHours,
        (persenadd - 1) * 100
      );
    };

    const intervalId = setInterval(handleSave, 3600000);
    return () => clearInterval(intervalId); // cleanup
  }, [avgVoltage, avgCurrents, totalEnergy, electricalBillHours, persenadd]);

  useEffect(() => {
    const handleSaveHasil = async () => {
      await SaveHasil(withoutsBooster, avgCurrents);
    };

    setInterval(handleSaveHasil, 3600000);
  });

  // MQTT subscribe... (pake lib seperti mqtt.js)

  const [candles, setCandles] = useState<Candle[]>([]);
  const [candlesS, setCandlesS] = useState<Candle[]>([]);
  const [candlesT, setCandlesT] = useState<Candle[]>([]);
  const [candlesKwh, setCandlesKWh] = useState<Candle[]>([]);

  const tempValues = useRef<number[]>([]); // buffer per menit

  useEffect(() => {
    // Interval untuk menyimpan currentR setiap detik ke buffer
    const intervalPush = setInterval(() => {
      tempValues.current.push(currentR - 13000);
    }, 5000); // tiap 1 detik

    // console.log(tempValues);

    // Interval untuk membuat candlestick setiap 1 menit
    const intervalCandle = setInterval(() => {
      const vals = tempValues.current;
      if (vals.length === 0) return;

      const newCandle: Candle = {
        month: Date.now(),
        desktop: aftercurrentR,
      };
      // console.log(open);
      // console.log(newCandle);

      setCandles((prev) => [...prev.slice(-30), newCandle]); // max 30 candle
      tempValues.current = []; // reset buffer
    }, 5000); // tiap 1 menit

    return () => {
      clearInterval(intervalPush);
      clearInterval(intervalCandle);
    };
  }, [aftercurrentR]);

  useEffect(() => {
    // Interval untuk membuat candlestick setiap 1 menit
    const intervalCandle = setInterval(() => {
      const newCandle: Candle = {
        month: Date.now(),
        desktop: aftercurrentS,
      };
      // console.log(open);
      // console.log(newCandle);

      setCandlesS((prev) => [...prev.slice(-30), newCandle]); // max 30 candle
    }, 5000); // tiap 1 menit

    return () => {
      clearInterval(intervalCandle);
    };
  }, [aftercurrentS]);

  useEffect(() => {
    // Interval untuk membuat candlestick setiap 1 menit
    const intervalCandle = setInterval(() => {
      const newCandle: Candle = {
        month: Date.now(),
        desktop: aftercurrentT,
      };
      // console.log(open);
      // console.log(newCandle);

      setCandlesT((prev) => [...prev.slice(-30), newCandle]); // max 30 candle
    }, 5000); // tiap 1 menit

    return () => {
      clearInterval(intervalCandle);
    };
  }, [aftercurrentT]);

  useEffect(() => {
    // Interval untuk membuat candlestick setiap 1 menit
    const intervalCandle = setInterval(() => {
      const newCandle: Candle = {
        month: Date.now(),
        desktop: totalEnergy,
      };
      // console.log(open);
      // console.log(newCandle);

      setCandlesKWh((prev) => [...prev.slice(-30), newCandle]); // max 30 candle
    }, 5000); // tiap 1 menit

    return () => {
      clearInterval(intervalCandle);
    };
  }, [totalEnergy]);

  // console.log(candles);

  const chartConfig = {
    desktop: {
      label: "Desktop",
      color: "hsl(var(--chart-1))",
    },
  };

  const isAdmin = true; // Simulating admin state, replace with actual logic
  const isConnected = true; // Simulating connection state, replace with actual logic
  const hideCostWithoutBooster = false; // Simulating state, replace with actual logic
  return (
    <div>
      {noDataAlert && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          ⚠️ 303 Booster Off
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6 animate-fade-in">
        <EnhancedStatCard
          title="Average Voltage"
          value={avgVoltage.toFixed(2)}
          unit="V"
          delta={{ value: "Normal Range", isPositive: true }}
          icon={<ChartLineIcon size={24} />}
          subtitle="Real-time voltage monitoring"
        />
        <EnhancedStatCard
          title="Average Current"
          value={avgCurrents.toFixed(2)}
          unit="A"
          delta={{
            value: isAdmin ? "Calibrated Data" : "Current Reading",
            isPositive: true,
          }}
          icon={<Activity size={24} />}
          subtitle={
            isAdmin ? "After calibration applied" : "Live current measurement"
          }
        />
        <EnhancedStatCard
          title="Today's Consumption"
          value={totalEnergy.toFixed(2)}
          unit="kWh"
          delta={{ value: "Daily reset at 00:00 WIB", isPositive: true }}
          icon={<Zap size={24} />}
          subtitle="Cumulative with automatic daily reset"
        />
        <EnhancedStatCard
          title="System Status"
          value={isConnected ? "Online" : "Offline"}
          delta={{
            value: isConnected
              ? `Connected | Daily Auto-Reset Active`
              : "Disconnected",
            isPositive: isConnected,
          }}
          icon={<ChartPieIcon size={24} />}
          subtitle="MQTT + Database sync with daily reset"
        />
      </div>

      <div
        className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6 animate-fade-in"
        style={{ animationDelay: "0.1s" }}
      >
        <EnhancedStatCard
          title="Today's Cost (Auto-Reset)"
          value={` ${formatCurrency(electricalBillHours)}`}
          delta={{
            value: `LWBP: Rp ${formatCurrency(
              electricalBillHours
            )}| WBP: Rp ${formatCurrency(electricalBillHours)}`,
            isPositive: false,
          }}
          icon={<DollarSign size={24} />}
          subtitle="Auto-resets daily at midnight (WIB)"
        />
        <EnhancedStatCard
          title="Monthly Estimate (From Daily Stats)"
          value={` ${formatCurrency(electricalBillHours)}`}
          delta={{
            value: `Day ${electricalBillHours}/30 (${electricalBillHours.toFixed(
              1
            )}%)`,
            isPositive: true,
          }}
          icon={<TrendingUp size={24} />}
          subtitle={`Avg: ${electricalBillHours.toFixed(
            2
          )} kWh/day (recorded daily)`}
        />
      </div>

      {!hideCostWithoutBooster && (
        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6 animate-fade-in"
          style={{ animationDelay: "0.2s" }}
        >
          <EnhancedStatCard
            title="Monthly kWh (Projected)"
            value={totalEnergy.toFixed(2)}
            unit="kWh"
            delta={{
              value: `Based on ${totalEnergy.toFixed(
                2
              )} days of recorded daily data`,
              isPositive: true,
            }}
            icon={<Zap size={24} />}
            subtitle="From daily_statistics table"
          />
          <EnhancedStatCard
            title="Cost without Booster"
            value={`${formatCurrency(electricalBillHours)}`}
            delta={{
              value:
                electricalBillHours > 0
                  ? `+${electricalBillHours}% from Monthly Estimate`
                  : "No calibration applied",
              isPositive: false,
            }}
            icon={<ChartBarIcon size={24} />}
            subtitle="Without power optimization"
          />
        </div>
      )}
    </div>
  );
};

export default MQTTData;
