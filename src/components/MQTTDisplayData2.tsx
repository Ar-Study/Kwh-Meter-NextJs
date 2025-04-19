"use client";

import { useEffect, useState } from "react";
import { client } from "../lib/mqtt-client";
import { Card, CardHeader, CardContent } from "./ui/card";
import { saveData, SaveHasil, SaveHasilSumber } from "@/app/server/action";

const MQTTData = () => {
  // State for sensor data
  const [voltageR, setVoltageR] = useState<number | null>(null);
  const [voltageS, setVoltageS] = useState<number | null>(null);
  const [voltageT, setVoltageT] = useState<number | null>(null);
  const [currentR, setCurrentR] = useState<number>(0);
  const [currentS, setCurrentS] = useState<number>(0);
  const [currentT, setCurrentT] = useState<number>(0);
  const [totalEnergy, setTotalEnergy] = useState<number>(0);
  const [avgCurrents, setAvgCurrents] = useState<number>(0);
  const [energyRecords, setEnergyRecords] = useState<number[]>([]);
  const [electricalBillHours, setElectricalBillHours] = useState<number>(0);

  // State for settings
  const [setting, setSetting] = useState<any>(null);
  const [inputKalibrasiR, setInputKalibrasiR] = useState<number>(0);
  const [inputKalibrasiS, setInputKalibrasiS] = useState<number>(0);
  const [inputKalibrasiT, setInputKalibrasiT] = useState<number>(0);
  const [inputValue1, setInputValue1] = useState<number>(5.75);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Other states
  const [realTime, setRealTime] = useState<string>(
    new Date().toLocaleTimeString()
  );
  const [withoutsBooster, setWithoutBooster] = useState<number>(0);
  const [persenadd, setPersenAdd] = useState<number>(1);
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(Date.now());
  const [noDataAlert, setNoDataAlert] = useState<boolean>(false);

  // Constants
  const cosPhi = 0.95;
  const phaseMultiplier = 1.75;
  const LWBP_RATE = 1035.78;
  const WBP_RATE = 1553.67;
  const currentMonth = new Date().toLocaleString("default", { month: "long" });

  // Time updater
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setRealTime(now.toLocaleTimeString("en-GB", { hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // MQTT message handler
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

  // Fetch settings on component mount
  useEffect(() => {
    const fetchSetting = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/setting");
        if (!res.ok) throw new Error("Failed to fetch");

        const data = await res.json();
        if (data.setting) {
          setSetting(data.setting);
          setInputKalibrasiR(data.setting.multiplierR || 0);
          setInputKalibrasiS(data.setting.multiplierS || 0);
          setInputKalibrasiT(data.setting.multiplierT || 0);
          setPersenAdd(data.setting.persen);
          setInputValue1(data.setting.divider || 5.75);
        }
      } catch (error) {
        console.error("Error fetching setting:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSetting();
  }, []);

  // Save or update settings
  const handleSaveSettings = async () => {
    try {
      setIsLoading(true);
      const method = setting ? "PUT" : "POST";
      const url = setting ? `/api/setting/${setting.id}` : "/api/setting";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Model",
          multiplierR: inputKalibrasiR,
          multiplierS: inputKalibrasiS,
          multiplierT: inputKalibrasiT,
          divider: inputValue1,
          persen: persenadd,
        }),
      });

      const data = await response.json();
      setSetting(data.setting || data);
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // No data alert
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const diff = now - lastUpdateTime;

      setNoDataAlert(diff > 360000);
    }, 1000);

    return () => clearInterval(interval);
  }, [lastUpdateTime]);

  // Current calculations
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
  const avgVoltage =
    voltageR !== null && voltageS !== null && voltageT !== null
      ? (voltageR + voltageS + voltageT) / 3
      : null;

  // Calculate total energy
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
        setEnergyRecords((prev) => [...prev, kwh]);
      }
    }
  }, [avgCurrents, avgVoltage]);

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

  // Helper functions
  const getTariff = () => {
    const hour = new Date().getHours();
    return hour >= 17 && hour < 23 ? WBP_RATE : LWBP_RATE;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  // Data saving effects
  useEffect(() => {
    const handleSave = async () => {
      await saveData(avgCurrents, totalEnergy, electricalBillHours);
    };
    const interval = setInterval(handleSave, 3600000);
    return () => clearInterval(interval);
  }, [avgCurrents, totalEnergy, electricalBillHours]);

  useEffect(() => {
    const handleSaveHasil = async () => {
      await SaveHasil(withoutsBooster, avgCurrents);
    };
    const interval = setInterval(handleSaveHasil, 3600000);
    return () => clearInterval(interval);
  }, [withoutsBooster, avgCurrents]);

  useEffect(() => {
    if (avgCurrents !== null) {
      setWithoutBooster(avgCurrents * persenadd);
    }
  }, [avgCurrents, persenadd]);

  // Derived values
  const withoutBooster =
    avgCurrents !== null ? (avgCurrents * persenadd).toFixed(1) : "No data";
  const withBooster = avgCurrents !== null ? avgCurrents.toFixed(1) : "No data";
  const monthlyEnergy =
    totalEnergy !== null ? (totalEnergy * 30).toFixed(2) : "No data";

  // Event handlers
  const handleInputKalibrasiR = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputKalibrasiR(parseFloat(e.target.value) || 0);
  };

  const handleInputKalibrasiS = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputKalibrasiS(parseFloat(e.target.value) || 0);
  };

  const handleInputKalibrasiT = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputKalibrasiT(parseFloat(e.target.value) || 0);
  };

  const handleInputChangeS = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue1(parseFloat(e.target.value) || 0);
  };

  const handlePersenAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPersenAdd(parseFloat(e.target.value));
  };

  return (
    <div>
      {noDataAlert && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          ⚠️ 303 Booster Off
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 p-4">
        <div className="grid grid-rows-2 gap-4 p-4">
          <Card className="bg-muted text-natural-content p-4 rounded-lg">
            <CardHeader>Without Booster</CardHeader>
            <CardContent>{withoutBooster} A </CardContent>
            <div>
              <p>Persen Kenaikan (15%/1.15 - 30%/1.30) : </p>
              <input
                type="number"
                value={persenadd}
                onChange={handlePersenAdd}
                placeholder="Enter Value"
                className="mb-1 p-1 border rounded w-1/2"
                step="0.01"
              />
            </div>
          </Card>
          <Card className="bg-muted text-natural-content p-4 rounded-lg">
            <CardHeader>With Booster</CardHeader>
            <CardContent>{withBooster} A</CardContent>
          </Card>
          <Card className="bg-muted text-natural-content p-4 rounded-lg">
            <CardHeader>Monthly Energy Usage ({currentMonth})</CardHeader>
            <CardContent>{monthlyEnergy} kWh</CardContent>
          </Card>
        </div>

        <div className="grid grid-rows-2 gap-4 p-4">
          <div className="grid grid-cols-3 gap-4 p-4">
            <Card className="bg-muted text-natural-content p-4 rounded-lg">
              <CardHeader>Voltage R</CardHeader>
              <CardContent>
                {voltageR !== null ? `${voltageR.toFixed(2)} V` : "No data"}
              </CardContent>
            </Card>
            <Card className="bg-muted text-natural-content p-4 rounded-lg">
              <CardHeader>Voltage S</CardHeader>
              <CardContent>
                {voltageS !== null ? `${voltageS.toFixed(2)} V` : "No data"}
              </CardContent>
            </Card>
            <Card className="bg-muted text-natural-content p-4 rounded-lg">
              <CardHeader>Voltage T</CardHeader>
              <CardContent>
                {voltageT !== null ? `${voltageT.toFixed(2)} V` : "No data"}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-3 gap-4 p-4">
            {["R", "S", "T"].map((phase) => (
              <Card
                key={phase}
                className="bg-muted text-natural-content p-4 rounded-lg"
              >
                <CardHeader>Current {phase}</CardHeader>
                <CardContent className="text-center">
                  {currentR !== null
                    ? `${eval(`current${phase}`).toFixed(1)} A`
                    : "No data"}
                  <p className="text-center">+</p>
                  <div>
                    <p>Kalibrasi :</p>
                    <input
                      type="number"
                      value={eval(`inputKalibrasi${phase}`)}
                      onChange={eval(`handleInputKalibrasi${phase}`)}
                      placeholder="Enter Value"
                      className="mb-1 p-1 border rounded w-1/2"
                    />
                  </div>
                  <p className="text-center">+</p>
                  <p>Pembagi Ampere :</p>
                  <input
                    type="number"
                    value={inputValue1}
                    onChange={handleInputChangeS}
                    placeholder="Enter Value"
                    className="mb-1 p-1 border rounded w-1/2"
                    step="0.01"
                  />
                </CardContent>
                <p className="text-center">
                  Total : {eval(`aftercurrent${phase}`).toFixed(2)}
                </p>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4 p-4">
            <Card className="bg-muted text-natural-content p-4 rounded-lg">
              <CardHeader>Current Time</CardHeader>
              <CardContent>{realTime}</CardContent>
            </Card>
            <Card className="bg-muted text-natural-content p-4 rounded-lg">
              <CardHeader>Total Energy</CardHeader>
              <CardContent>
                {totalEnergy !== null
                  ? `${totalEnergy.toFixed(2)} kWh`
                  : "No data"}
              </CardContent>
            </Card>
            <Card className="bg-muted text-natural-content p-4 rounded-lg">
              <CardHeader>Electrical Bill Per Hour</CardHeader>
              <CardContent>
                {electricalBillHours !== null
                  ? formatCurrency(electricalBillHours)
                  : "No data"}
              </CardContent>
            </Card>
          </div>

          {/* Settings save button */}
          <div className="mt-4">
            <button
              onClick={handleSaveSettings}
              disabled={isLoading}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              {isLoading ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MQTTData;
