// MQTTData.tsx - Main Component (FIXED)
"use client";

import { useEffect, useState } from "react";
import { client } from "../lib/mqtt-client";
import { saveData, SaveHasil, SaveHasilSumber } from "@/app/server/action";
import EnhancedStatCard from "./StatusCard";

import {
  Activity,
  ChartBarIcon,
  ChartLineIcon,
  ChartPieIcon,
  DollarSign,
  TrendingUp,
  Zap,
  // Settings,                                                               
} from "lucide-react";
import VoltageChart from "./VoltageCharts";
import RevenueChart from "./RevenueCharts";
import KwhChart from "./KwhCharts";
import CalibrationModal from "./CalibrationModal";
// import { Button } from "./ui/button";

type Candle = {
  month: number; // timestamp1
  desktop: number; // value
};

type KwhDataPoint = {
  time: string;
  KWH: number;
};

type VoltageDataPoint = {
  time: string;
  VR: number;
  VS: number;
  VT: number;
};

type CurrentDataPoint = {
  time: string;
  IR: number;
  IS: number;
  IT: number;
};

const MQTTData = () => {
  // Basic States
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
  const [totalEnergyMonth, setTotalEnergyMonth] = useState<number>(0);
  const [electricalBillHours, setElectricalBillHours] = useState<number>(0);
  const [hourlyEnergyBuffer, setHourlyEnergyBuffer] = useState<number[]>([]);

//  const now = new Date();
// const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);

// // Ambil tanggal terakhir bulan ini
// const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

// Format ke string YYYY-MM-DD
// const formatDate = (date) => {
//   const year = date.getFullYear();
//   const month = String(date.getMonth() + 1).padStart(2, '0');
//   const day = String(date.getDate()).padStart(2, '0');
//   return `${year}-${month}-${day}`;
// };

// const startDate = formatDate(firstDay); // "YYYY-MM-01"
// const endDate = formatDate(lastDay);  
//   const result =  getKwhPricesInRange(startDate, endDate);
// console.log(result);

  // Calibration States
  const [inputKalibrasiR, setInputKalibrasiR] = useState<number>(0);
  const [inputKalibrasiS, setInputKalibrasiS] = useState<number>(0);
  const [inputKalibrasiT, setInputKalibrasiT] = useState<number>(0);
  const [inputValue1, setInputValue1] = useState<number>(5.75);
  const [persenadd, setPersenAdd] = useState<number>(1);
  const [withoutsBooster, setWithoutBooster] = useState<number>(0);

  // UI States
  const [realTime, setRealTime] = useState<string>(
    new Date().toLocaleTimeString()
  );
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(Date.now());
  const [noDataAlert, setNoDataAlert] = useState<boolean>(false);
  const [isCalibrationModalOpen, setIsCalibrationModalOpen] =
    useState<boolean>(false);

  // Constants
  const cosPhi = 0.95;
  const phaseMultiplier = 1.75;
  const LWBP_RATE = 1035.78;
  const WBP_RATE = 1553.67;

  const getTariff = () => {
    const hour = new Date().getHours();
    return hour >= 17 && hour < 23 ? WBP_RATE : LWBP_RATE;
  };

  // Update time every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setRealTime(now.toLocaleTimeString("en-GB", { hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch calibration settings
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
          setPersenAdd(data.setting.persen || 1);
          setInputValue1(data.setting.divider || 5.75);
        }
      } catch (error) {
        console.error("Error fetching setting:", error);
      }
    };

    fetchSetting();
  }, []);

  console.log(realTime);

  // MQTT Message Handler
  useEffect(() => {
    const handleMessage = (topic: string, message: Buffer) => {
      const value = parseFloat(message.toString());
      if (isNaN(value)) return;
      setLastUpdateTime(Date.now());

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

      // Save to database
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

  // Connection monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const diff = now - lastUpdateTime;

      if (diff > 360000) {
        // 6 minutes
        setNoDataAlert(true);
      } else {
        setNoDataAlert(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastUpdateTime]);

  // Calculate calibrated currents
  const aftercurrentR = currentR / inputValue1 + inputKalibrasiR;
  const aftercurrentS = currentS / inputValue1 + inputKalibrasiS;
  const aftercurrentT = currentT / inputValue1 + inputKalibrasiT;

  // Calculate average currents
  useEffect(() => {
    if (
      aftercurrentR !== null &&
      aftercurrentS !== null &&
      aftercurrentT !== null
    ) {
      setAvgCurrents((aftercurrentR + aftercurrentS + aftercurrentT) / 3);
    }
  }, [aftercurrentR, aftercurrentS, aftercurrentT]);

  // Calculate average voltage
  useEffect(() => {
    if (voltageR !== null && voltageS !== null && voltageT !== null) {
      setAvgVoltage((voltageR + voltageS + voltageT) / 3);
    }
  }, [voltageR, voltageS, voltageT]);

  // Calculate KWH
  useEffect(() => {
    if (
      avgCurrents !== null &&
      avgVoltage !== null &&
      avgCurrents > 0 &&
      avgVoltage > 0
    ) {
      const kwh = (phaseMultiplier * avgCurrents * avgVoltage * cosPhi) / 1000;
      if (isFinite(kwh)) {
        setTotalEnergy(kwh);
        setEnergyRecords((prev) => [...prev.slice(-100), kwh]); // Keep last 100 records
      }
    }
  }, [avgCurrents, avgVoltage]);

  // Collect energy data to hourly buffer
  useEffect(() => {
    if (energyRecords.length > 0) {
      const latestEnergy = energyRecords[energyRecords.length - 1];
      setHourlyEnergyBuffer((prev) => [...prev, latestEnergy]);
    }
  }, [energyRecords]);

  // Update monthly energy every hour
  useEffect(() => {
    const interval = setInterval(() => {
      if (hourlyEnergyBuffer.length > 0) {

        const averageHourlyEnergy =
          hourlyEnergyBuffer.reduce((sum, kwh) => sum + kwh, 0) /
          hourlyEnergyBuffer.length;
        setTotalEnergyMonth((prev) => prev + averageHourlyEnergy);
        setHourlyEnergyBuffer([]);
        console.log(
          `✅ Hourly average added: ${averageHourlyEnergy.toFixed(3)} kWh`
        );
      }
    }, 3600000); // 1 hour

    return () => clearInterval(interval);
  }, [hourlyEnergyBuffer]);

  // Calculate electrical bill
  useEffect(() => {
    if (energyRecords.length > 0) {
      const totalCost = energyRecords.reduce(
        (sum, kwh) => sum + (isFinite(kwh) ? kwh * getTariff() : 0),
        0
      );
      setElectricalBillHours(totalCost / energyRecords.length);
    }
  }, [energyRecords]);

  // Calculate without booster
  useEffect(() => {
    if (avgCurrents !== null) {
      setWithoutBooster(avgCurrents * persenadd);
    }
  }, [avgCurrents, persenadd]);

  // Save data every hour
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
    return () => clearInterval(intervalId);
  }, [avgVoltage, avgCurrents, totalEnergy, electricalBillHours, persenadd]);

  // Save hasil data
  useEffect(() => {
    const handleSaveHasil = async () => {
      await SaveHasil(withoutsBooster, avgCurrents);
    };

    const intervalId = setInterval(handleSaveHasil, 3600000);
    return () => clearInterval(intervalId);
  }, [withoutsBooster, avgCurrents]);

  // Chart data states
  const [voltageCandles, setVoltageCandles] = useState<Candle[]>([]);
  const [currentCandles, setCurrentCandles] = useState<{
    R: Candle[];
    S: Candle[];
    T: Candle[];
  }>({
    R: [],
    S: [],
    T: [],
  });
  const [kwhCandles, setKwhCandles] = useState<Candle[]>([]);

  // Generate voltage chart data
  useEffect(() => {
    const interval = setInterval(() => {
      if (voltageR !== null && voltageS !== null && voltageT !== null) {
        const newCandle: Candle = {
          month: Date.now(),
          desktop: (voltageR + voltageS + voltageT) / 3,
        };
        setVoltageCandles((prev) => [...prev.slice(-30), newCandle]);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [voltageR, voltageS, voltageT]);

  // Generate current chart data
  useEffect(() => {
    const interval = setInterval(() => {
      const newCandleR: Candle = { month: Date.now(), desktop: aftercurrentR };
      const newCandleS: Candle = { month: Date.now(), desktop: aftercurrentS };
      const newCandleT: Candle = { month: Date.now(), desktop: aftercurrentT };

      setCurrentCandles((prev) => ({
        R: [...prev.R.slice(-30), newCandleR],
        S: [...prev.S.slice(-30), newCandleS],
        T: [...prev.T.slice(-30), newCandleT],
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, [aftercurrentR, aftercurrentS, aftercurrentT]);

  // Generate KWH chart data
  useEffect(() => {
    const interval = setInterval(() => {
      const newCandle: Candle = {
        month: Date.now(),
        desktop: totalEnergy,
      };
      setKwhCandles((prev) => [...prev.slice(-30), newCandle]);
    }, 5000);

    return () => clearInterval(interval);
  }, [totalEnergy]);

  // Prepare chart data
  const voltageChartData: VoltageDataPoint[] = voltageCandles
    .map((candle) => ({
      time: new Date(candle.month).toLocaleTimeString("en-GB"),
      VR: voltageR || 0,
      VS: voltageS || 0,
      VT: voltageT || 0,
    }))
    .slice(-20);

  const currentChartData: CurrentDataPoint[] = currentCandles.R.map((_, i) => ({
    time: new Date(currentCandles.R[i]?.month || Date.now()).toLocaleTimeString(
      "en-GB"
    ),
    IR: currentCandles.R[i]?.desktop || 0,
    IS: currentCandles.S[i]?.desktop || 0,
    IT: currentCandles.T[i]?.desktop || 0,
  })).slice(-20);

  const kwhData: KwhDataPoint[] = kwhCandles
    .map((candle) => ({
      time: new Date(candle.month).toLocaleTimeString("en-GB"),
      KWH: parseFloat(candle.desktop.toFixed(2)),
    }))
    .slice(-20);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  const isAdmin = true;
  const isConnected = !noDataAlert;
  const hideCostWithoutBooster = false;

  return (
    <div>
      {/* Alert */}
      {noDataAlert && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          ⚠️ 303 Booster Off - No data received for 6 minutes
        </div>
      )}

      {/* Calibration Button */}
      {/* <div className="flex justify-end mb-4">
        <Button
          onClick={() => setIsCalibrationModalOpen(true)}
          variant="outline"
        >
          <Settings className="w-4 h-4 mr-2" />
          Calibration Settings
        </Button>
      </div> */}

      {/* Main Stats */}
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
              ? "Connected | Daily Auto-Reset Active"
              : "Disconnected",
            isPositive: isConnected,
          }}
          icon={<ChartPieIcon size={24} />}
          subtitle="MQTT + Database sync with daily reset"
        />
      </div>

      {/* Cost Stats */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6 animate-fade-in"
        style={{ animationDelay: "0.1s" }}
      >
        <EnhancedStatCard
          title="Today's Cost (Auto-Reset)"
          value={formatCurrency(electricalBillHours)}
          delta={{
            value: `LWBP: ${formatCurrency(LWBP_RATE)} | WBP: ${formatCurrency(
              WBP_RATE
            )}`,
            isPositive: false,
          }}
          icon={<DollarSign size={24} />}
          subtitle="Auto-resets daily at midnight (WIB)"
        />
        <EnhancedStatCard
          title="Monthly Estimate"
          value={formatCurrency(totalEnergyMonth * getTariff())}
          delta={{
            value: `Based on ${Math.floor(totalEnergyMonth)} kWh total`,
            isPositive: true,
          }}
          icon={<TrendingUp size={24} />}
          subtitle={`Monthly total: ${totalEnergyMonth.toFixed(2)} kWh`}
        />
      </div>

      {/* Additional Stats */}
      {!hideCostWithoutBooster && (
        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6 animate-fade-in"
          style={{ animationDelay: "0.2s" }}
        >
          <EnhancedStatCard
            title="Monthly kWh (Projected)"
            value={totalEnergyMonth.toFixed(2)}
            unit="kWh"
            delta={{
              value: `Based on hourly averages`,
              isPositive: true,
            }}
            icon={<Zap size={24} />}
            subtitle="From hourly statistics"
          />
          <EnhancedStatCard
            title="Cost without Booster"
            value={formatCurrency(withoutsBooster * getTariff())}
            delta={{
              value:
                persenadd > 1
                  ? `+${((persenadd - 1) * 100).toFixed(1)}% from current`
                  : "No increase applied",
              isPositive: false,
            }}
            icon={<ChartBarIcon size={24} />}
            subtitle="Without power optimization"
          />
        </div>
      )}

      {/* Charts */}
      <div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 animate-fade-in"
        style={{ animationDelay: "0.3s" }}
      >
        <VoltageChart data={voltageChartData} />
        <RevenueChart data={currentChartData} />
      </div>

      <div
        className="grid grid-cols-1 gap-6 mb-6 animate-fade-in"
        style={{ animationDelay: "0.4s" }}
      >
        <KwhChart data={kwhData} />
      </div>

      {/* Calibration Modal */}
      <CalibrationModal
        isOpen={isCalibrationModalOpen}
        onClose={() => setIsCalibrationModalOpen(false)}
        inputKalibrasiR={inputKalibrasiR}
        inputKalibrasiS={inputKalibrasiS}
        inputKalibrasiT={inputKalibrasiT}
        persenadd={persenadd}
        inputValue1={inputValue1}
        onSave={async (calibrationData) => {
          try {
            const response = await fetch("/api/setting", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(calibrationData),
            });

            if (response.ok) {
              setInputKalibrasiR(calibrationData.multiplierR);
              setInputKalibrasiS(calibrationData.multiplierS);
              setInputKalibrasiT(calibrationData.multiplierT);
              setPersenAdd(calibrationData.persen);
              setInputValue1(calibrationData.divider);
              setIsCalibrationModalOpen(false);
              console.log("✅ Calibration saved successfully");
            }
          } catch (error) {
            console.error("❌ Error saving calibration:", error);
          }
        }}
      />
    </div>
  );
};

export default MQTTData;
