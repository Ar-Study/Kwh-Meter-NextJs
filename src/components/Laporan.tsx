// Laporans.tsx - Fixed version without external dependencies
import React, { useMemo, useState } from "react";
import { getHasil, getKwhPricesInRange } from "@/app/server/action";
import {
  Search,
  Download,
  FileText,
  Eye,
  AlertCircle,
  Calendar,
} from "lucide-react";

type KwhPrice = {
  id: number;
  avgampere: number;
  avgvoltase: number;
  avg: number;
  kwh: number;
  biaya: number;
  saving: number;
  timestamp: Date;
};

type ReportMetrics = {
  totalKwh: number;
  lwbpKwh: number;
  wbpKwh: number;
  totalCost: number;
  lwbpCost: number;
  wbpCost: number;
};

type SavingsData = {
  savingsPercentage: number;
  kwhBeforeBooster: number;
  costBeforeBooster: number;
  kwhSaved: number;
  costSaved: number;
};

function Laporans() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [data, setData] = useState<KwhPrice[]>([]);
  const [withBooster, setWithBooster] = useState(0);
  const [withoutBooster, setWithoutBooster] = useState(0);
  const [dateError, setDateError] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Mock user data
  const user = {
    name: "Administrator",
    email: "admin@ahcmanufacture.com",
  };

  const [summary, setSummary] = useState({
    avgAmpere: 0,
    avgVoltase: 0,
    totalKwh: 0,
  });

  // Constants
  const LWBP_RATE = 1035.78;
  const WBP_RATE = 1553.67;
  const SAVINGS_PERCENTAGE = 15; // Default 15%

  const validateDateRange = (start: string, end: string) => {
    if (!start || !end) {
      setDateError("");
      return true;
    }

    const startDateObj = new Date(start);
    const endDateObj = new Date(end);
    const diffTime = Math.abs(endDateObj.getTime() - startDateObj.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 30) {
      setDateError("Maksimal rentang tanggal adalah 30 hari");
      return false;
    }

    if (startDateObj > endDateObj) {
      setDateError("Tanggal mulai tidak boleh lebih besar dari tanggal akhir");
      return false;
    }

    setDateError("");
    return true;
  };

  const handleStartDateChange = (value: string) => {
    setStartDate(value);
    validateDateRange(value, endDate);
  };

  const handleEndDateChange = (value: string) => {
    setEndDate(value);
    validateDateRange(startDate, value);
  };

  // Calculate report metrics from data
  const reportMetrics: ReportMetrics = useMemo(() => {
    if (!data.length) {
      return {
        totalKwh: 0,
        lwbpKwh: 0,
        wbpKwh: 0,
        totalCost: 0,
        lwbpCost: 0,
        wbpCost: 0,
      };
    }

    const totalKwh = data.reduce((sum, item) => sum + item.kwh, 0);
    const totalCost = data.reduce((sum, item) => sum + item.biaya, 0);

    // Assume 60% LWBP and 40% WBP distribution
    const lwbpKwh = totalKwh * 0.6;
    const wbpKwh = totalKwh * 0.4;
    const lwbpCost = lwbpKwh * LWBP_RATE;
    const wbpCost = wbpKwh * WBP_RATE;

    return {
      totalKwh,
      lwbpKwh,
      wbpKwh,
      totalCost: lwbpCost + wbpCost,
      lwbpCost,
      wbpCost,
    };
  }, [data]);

  // Calculate savings data
  const savingsData: SavingsData = useMemo(() => {
    const { totalKwh, totalCost } = reportMetrics;
    const savingsPercentage = SAVINGS_PERCENTAGE;

    const additionalKwh = totalKwh * (savingsPercentage / 100);
    const kwhBeforeBooster = totalKwh + additionalKwh;

    const additionalCost = totalCost * (savingsPercentage / 100);
    const costBeforeBooster = totalCost + additionalCost;

    return {
      savingsPercentage,
      kwhBeforeBooster,
      costBeforeBooster,
      kwhSaved: additionalKwh,
      costSaved: additionalCost,
    };
  }, [reportMetrics]);

  const handleSearch = async () => {
    if (!startDate || !endDate) {
      alert("Silakan pilih tanggal mulai dan tanggal akhir");
      return;
    }

    setIsLoading(true);
    try {
      const result = await getKwhPricesInRange(startDate, endDate);
      const boosterData = await getHasil(startDate, endDate);

      setWithBooster(boosterData.totalBooster);
      setWithoutBooster(boosterData.totalNoBooster);
      setData(result);

      if (result.length > 0) {
        const totalAmpere = result.reduce(
          (sum, item) => sum + item.avgampere,
          0
        );
        const totalVoltase = result.reduce(
          (sum, item) => sum + item.avgvoltase,
          0
        );
        const totalKwh = result.reduce((sum, item) => sum + item.kwh, 0);

        setSummary({
          avgAmpere: totalAmpere / result.length,
          avgVoltase: totalVoltase / result.length,
          totalKwh: totalKwh,
        });
      } else {
        setSummary({
          avgAmpere: 0,
          avgVoltase: 0,
          totalKwh: 0,
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Terjadi kesalahan saat mengambil data. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const generatePDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const currentDate = new Date().toLocaleDateString("id-ID");
    const currentTime = new Date().toLocaleTimeString("id-ID");
    const periodText =
      startDate && endDate
        ? `${new Date(startDate).toLocaleDateString("id-ID")} - ${new Date(
            endDate
          ).toLocaleDateString("id-ID")}`
        : "Semua Data";

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Laporan Penggunaan Listrik - AHC Manufacture</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              padding: 30px; 
              line-height: 1.8;
              color: #333;
            }
            .company-header { 
              text-align: center; 
              font-size: 28px; 
              font-weight: bold; 
              margin-bottom: 20px;
              color: #2563eb;
            }
            .user-info { 
              margin-bottom: 20px; 
              font-size: 16px;
              background-color: #f3f4f6;
              padding: 10px;
              border-radius: 6px;
            }
            .section { 
              margin-bottom: 25px; 
              padding: 15px;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              background-color: #f9fafb;
            }
            .section-title { 
              font-weight: bold; 
              font-size: 18px; 
              margin-bottom: 10px;
              color: #1f2937;
            }
            .value { 
              font-size: 20px; 
              font-weight: bold; 
              color: #059669;
            }
            .cost-breakdown { 
              display: grid; 
              grid-template-columns: 1fr 1fr 1fr; 
              gap: 15px; 
              margin-bottom: 20px;
            }
            .cost-item { 
              text-align: center; 
              padding: 15px;
              border: 1px solid #d1d5db;
              border-radius: 6px;
              background-color: white;
            }
            .highlight { 
              background-color: #fef3c7; 
              padding: 15px; 
              border-radius: 8px; 
              margin: 15px 0;
              border-left: 4px solid #f59e0b;
            }
            .savings-section { 
              background-color: #ecfdf5; 
              border: 1px solid #10b981; 
              padding: 20px; 
              border-radius: 8px;
            }
            .data-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            .data-table th,
            .data-table td {
              border: 1px solid #d1d5db;
              padding: 8px;
              text-align: left;
              font-size: 12px;
            }
            .data-table th {
              background-color: #f3f4f6;
              font-weight: bold;
            }
            @media print { 
              body { margin: 0; padding: 20px; } 
            }
          </style>
        </head>
        <body>
          <div class="company-header">AHC Manufacture</div>
          <div class="company-header" style="font-size: 20px; margin-bottom: 30px;">Laporan Penggunaan Listrik</div>
          
          <div class="user-info">
            <strong>User:</strong> ${user.name} (${user.email}) | 
            <strong>Tanggal Laporan:</strong> ${currentDate} | 
            <strong>Waktu:</strong> ${currentTime}<br>
            <strong>Periode Data:</strong> ${periodText}
          </div>
          
          <div class="section">
            <div class="section-title">Ringkasan Konsumsi Periode</div>
            <div class="cost-breakdown">
              <div class="cost-item">
                <div><strong>Rata-rata Arus</strong></div>
                <div class="value">${summary.avgAmpere.toFixed(2)} A</div>
              </div>
              <div class="cost-item">
                <div><strong>Rata-rata Tegangan</strong></div>
                <div class="value">${summary.avgVoltase.toFixed(2)} V</div>
              </div>
              <div class="cost-item">
                <div><strong>Total kWh</strong></div>
                <div class="value">${summary.totalKwh.toFixed(2)} kWh</div>
              </div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Breakdown Tarif Listrik</div>
            <div class="cost-breakdown">
              <div class="cost-item">
                <div><strong>kWh LWBP (60%)</strong></div>
                <div class="value">${reportMetrics.lwbpKwh.toFixed(2)} kWh</div>
                <div style="font-size: 14px; color: #666;">Rp ${reportMetrics.lwbpCost.toLocaleString(
                  "id-ID"
                )}</div>
              </div>
              <div class="cost-item">
                <div><strong>kWh WBP (40%)</strong></div>
                <div class="value">${reportMetrics.wbpKwh.toFixed(2)} kWh</div>
                <div style="font-size: 14px; color: #666;">Rp ${reportMetrics.wbpCost.toLocaleString(
                  "id-ID"
                )}</div>
              </div>
              <div class="cost-item">
                <div><strong>Total Biaya</strong></div>
                <div class="value">Rp ${reportMetrics.totalCost.toLocaleString(
                  "id-ID"
                )}</div>
              </div>
            </div>
          </div>
          
          <div class="highlight">
            <strong>Analisis Biaya Listrik:</strong><br>
            LWBP: ${reportMetrics.lwbpKwh.toFixed(
              2
            )} kWh × Rp ${LWBP_RATE.toLocaleString(
      "id-ID"
    )} = Rp ${reportMetrics.lwbpCost.toLocaleString("id-ID")}<br>
            WBP: ${reportMetrics.wbpKwh.toFixed(
              2
            )} kWh × Rp ${WBP_RATE.toLocaleString(
      "id-ID"
    )} = Rp ${reportMetrics.wbpCost.toLocaleString("id-ID")}<br>
            <div class="value" style="margin-top: 10px;">Total Estimasi Biaya: Rp ${reportMetrics.totalCost.toLocaleString(
              "id-ID"
            )}</div>
          </div>
          
          <div class="savings-section">
            <div class="section-title">Analisis Penghematan dengan Power Booster</div>
            <p><strong>Persentase penghematan: ${
              savingsData.savingsPercentage
            }%</strong></p>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 15px;">
              <div>
                <p><strong>Konsumsi sebelum booster:</strong> ${savingsData.kwhBeforeBooster.toFixed(
                  2
                )} kWh</p>
                <p><strong>Konsumsi setelah booster:</strong> ${reportMetrics.totalKwh.toFixed(
                  2
                )} kWh</p>
                <p><strong>kWh yang dihemat:</strong> ${savingsData.kwhSaved.toFixed(
                  2
                )} kWh</p>
              </div>
              <div>
                <p><strong>Biaya sebelum booster:</strong> Rp ${savingsData.costBeforeBooster.toLocaleString(
                  "id-ID"
                )}</p>
                <p><strong>Biaya setelah booster:</strong> Rp ${reportMetrics.totalCost.toLocaleString(
                  "id-ID"
                )}</p>
                <p><strong>Biaya yang dihemat:</strong> Rp ${savingsData.costSaved.toLocaleString(
                  "id-ID"
                )}</p>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Ringkasan Data Booster</div>
            <p><strong>Total data dengan booster:</strong> ${withBooster.toFixed(
              2
            )}</p>
            <p><strong>Total data tanpa booster:</strong> ${withoutBooster.toFixed(
              2
            )}</p>
          </div>
          
          ${
            data.length > 0
              ? `
          <div class="section">
            <div class="section-title">Detail Data Konsumsi (Top 20)</div>
            <table class="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tanggal</th>
                  <th>Arus (A)</th>
                  <th>Tegangan (V)</th>
                  <th>kWh</th>
                  <th>Biaya (Rp)</th>
                  <th>Saving (%)</th>
                </tr>
              </thead>
              <tbody>
                ${data
                  .slice(0, 20)
                  .map(
                    (item) => `
                <tr>
                  <td>${item.id}</td>
                  <td>${new Date(item.timestamp).toLocaleDateString(
                    "id-ID"
                  )}</td>
                  <td>${item.avgampere.toFixed(2)}</td>
                  <td>${item.avgvoltase.toFixed(2)}</td>
                  <td>${item.kwh.toFixed(2)}</td>
                  <td>${item.biaya.toLocaleString("id-ID")}</td>
                  <td>${item.saving}%</td>
                </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
            ${
              data.length > 20
                ? '<p style="font-style: italic; margin-top: 10px;">* Menampilkan 20 data teratas dari total ' +
                  data.length +
                  " data</p>"
                : ""
            }
          </div>
          `
              : ""
          }
          
          <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #e5e7eb; padding-top: 20px;">
            Laporan dibuat pada ${currentDate} pukul ${currentTime} oleh ${
      user.name
    }<br>
            AHC Manufacture - Sistem Monitoring Listrik v2.0
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
    setShowPreview(false);
  };

  return (
    <div
      style={{
        padding: "24px",
        backgroundColor: "#f9fafb",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <h1
          style={{
            fontSize: "32px",
            fontWeight: "bold",
            marginBottom: "8px",
            color: "#111827",
          }}
        >
          Laporan Penggunaan Listrik
        </h1>
        <p style={{ color: "#6b7280", fontSize: "16px" }}>
          Sistem laporan konsumsi listrik AHC Manufacture
        </p>
      </div>

      {/* Date Range Card */}
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
          padding: "24px",
          marginBottom: "24px",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "16px",
          }}
        >
          <Calendar size={20} style={{ color: "#3b82f6" }} />
          <h2
            style={{
              fontSize: "18px",
              fontWeight: "600",
              margin: 0,
              color: "#111827",
            }}
          >
            Pilih Periode Laporan
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
            marginBottom: "16px",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                marginBottom: "4px",
                color: "#374151",
              }}
            >
              Tanggal Mulai
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => handleStartDateChange(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                marginBottom: "4px",
                color: "#374151",
              }}
            >
              Tanggal Akhir
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => handleEndDateChange(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "flex-end", gap: "8px" }}>
            <button
              onClick={handleSearch}
              disabled={!!dateError || !startDate || !endDate || isLoading}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                backgroundColor: isLoading ? "#9ca3af" : "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: isLoading ? "not-allowed" : "pointer",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              <Search size={16} />
              {isLoading ? "Mencari..." : "Cari Data"}
            </button>

            <button
              onClick={() => setShowPreview(true)}
              disabled={
                !!dateError || !startDate || !endDate || data.length === 0
              }
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                backgroundColor: data.length === 0 ? "#9ca3af" : "#059669",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: data.length === 0 ? "not-allowed" : "pointer",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              <FileText size={16} />
              Preview & Download PDF
            </button>
          </div>
        </div>

        {dateError && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#dc2626",
              fontSize: "14px",
              backgroundColor: "#fef2f2",
              padding: "8px 12px",
              borderRadius: "4px",
              border: "1px solid #fecaca",
            }}
          >
            <AlertCircle size={16} />
            {dateError}
          </div>
        )}
      </div>

      {/* Company Header */}
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
          padding: "32px",
          textAlign: "center",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
          marginBottom: "24px",
          background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
          color: "white",
        }}
      >
        <h1
          style={{ fontSize: "36px", fontWeight: "bold", margin: "0 0 8px 0" }}
        >
          AHC Manufacture
        </h1>
        <p style={{ fontSize: "18px", opacity: 0.9, margin: 0 }}>
          KWH Meter & Monitoring System
        </p>
      </div>

      {/* Results Display */}
      {data.length > 0 && (
        <div style={{ display: "grid", gap: "24px" }}>
          {/* Summary Stats */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "20px",
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                padding: "20px",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                borderLeft: "4px solid #3b82f6",
              }}
            >
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  margin: "0 0 8px 0",
                  color: "#3b82f6",
                }}
              >
                Rata-rata Ampere
              </h3>
              <p
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  margin: 0,
                  color: "#111827",
                }}
              >
                {summary.avgAmpere.toFixed(2)} A
              </p>
            </div>

            <div
              style={{
                backgroundColor: "white",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                padding: "20px",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                borderLeft: "4px solid #10b981",
              }}
            >
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  margin: "0 0 8px 0",
                  color: "#10b981",
                }}
              >
                Rata-rata Voltase
              </h3>
              <p
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  margin: 0,
                  color: "#111827",
                }}
              >
                {summary.avgVoltase.toFixed(2)} V
              </p>
            </div>

            <div
              style={{
                backgroundColor: "white",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                padding: "20px",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                borderLeft: "4px solid #f59e0b",
              }}
            >
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  margin: "0 0 8px 0",
                  color: "#f59e0b",
                }}
              >
                Total Kwh
              </h3>
              <p
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  margin: 0,
                  color: "#111827",
                }}
              >
                {summary.totalKwh.toFixed(2)} kWh
              </p>
            </div>

            <div
              style={{
                backgroundColor: "white",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                padding: "20px",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                borderLeft: "4px solid #8b5cf6",
              }}
            >
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  margin: "0 0 8px 0",
                  color: "#8b5cf6",
                }}
              >
                Jumlah Data
              </h3>
              <p
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  margin: 0,
                  color: "#111827",
                }}
              >
                {data.length}
              </p>
            </div>
          </div>

          {/* Booster Data */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "20px",
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                padding: "20px",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                borderLeft: "4px solid #10b981",
              }}
            >
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  margin: "0 0 8px 0",
                  color: "#10b981",
                }}
              >
                Total Data With Booster
              </h3>
              <p
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  margin: 0,
                  color: "#111827",
                }}
              >
                {withBooster.toFixed(2)}
              </p>
            </div>

            <div
              style={{
                backgroundColor: "white",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                padding: "20px",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                borderLeft: "4px solid #f59e0b",
              }}
            >
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  margin: "0 0 8px 0",
                  color: "#f59e0b",
                }}
              >
                Total Data Without Booster
              </h3>
              <p
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  margin: 0,
                  color: "#111827",
                }}
              >
                {withoutBooster.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Data Table */}
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              padding: "24px",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
              overflowX: "auto",
            }}
          >
            <h3
              style={{
                fontSize: "20px",
                fontWeight: "600",
                margin: "0 0 16px 0",
                color: "#111827",
              }}
            >
              Detail Data Konsumsi
            </h3>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: "700px",
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#f3f4f6" }}>
                  <th
                    style={{
                      border: "1px solid #d1d5db",
                      padding: "12px",
                      textAlign: "left",
                      fontWeight: "600",
                    }}
                  >
                    ID
                  </th>
                  <th
                    style={{
                      border: "1px solid #d1d5db",
                      padding: "12px",
                      textAlign: "left",
                      fontWeight: "600",
                    }}
                  >
                    Tanggal
                  </th>
                  <th
                    style={{
                      border: "1px solid #d1d5db",
                      padding: "12px",
                      textAlign: "left",
                      fontWeight: "600",
                    }}
                  >
                    Rata-rata Ampere
                  </th>
                  <th
                    style={{
                      border: "1px solid #d1d5db",
                      padding: "12px",
                      textAlign: "left",
                      fontWeight: "600",
                    }}
                  >
                    Rata-rata Voltase
                  </th>
                  <th
                    style={{
                      border: "1px solid #d1d5db",
                      padding: "12px",
                      textAlign: "left",
                      fontWeight: "600",
                    }}
                  >
                    Kwh
                  </th>
                  <th
                    style={{
                      border: "1px solid #d1d5db",
                      padding: "12px",
                      textAlign: "left",
                      fontWeight: "600",
                    }}
                  >
                    Biaya
                  </th>
                  <th
                    style={{
                      border: "1px solid #d1d5db",
                      padding: "12px",
                      textAlign: "left",
                      fontWeight: "600",
                    }}
                  >
                    Estimasi Saving
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr
                    key={item.id}
                    style={{
                      backgroundColor: index % 2 === 0 ? "white" : "#f9fafb",
                    }}
                  >
                    <td
                      style={{ border: "1px solid #d1d5db", padding: "10px" }}
                    >
                      {item.id}
                    </td>
                    <td
                      style={{ border: "1px solid #d1d5db", padding: "10px" }}
                    >
                      {new Date(item.timestamp).toLocaleString("id-ID")}
                    </td>
                    <td
                      style={{ border: "1px solid #d1d5db", padding: "10px" }}
                    >
                      {item.avgampere.toFixed(2)}
                    </td>
                    <td
                      style={{ border: "1px solid #d1d5db", padding: "10px" }}
                    >
                      {item.avgvoltase.toFixed(2)}
                    </td>
                    <td
                      style={{ border: "1px solid #d1d5db", padding: "10px" }}
                    >
                      {item.kwh.toFixed(2)}
                    </td>
                    <td
                      style={{ border: "1px solid #d1d5db", padding: "10px" }}
                    >
                      {item.biaya.toLocaleString("id-ID")}
                    </td>
                    <td
                      style={{ border: "1px solid #d1d5db", padding: "10px" }}
                    >
                      {item.saving} %
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "24px",
              maxWidth: "90vw",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
              width: "800px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
                borderBottom: "1px solid #e5e7eb",
                paddingBottom: "16px",
              }}
            >
              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: "600",
                  margin: 0,
                  color: "#111827",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Eye size={20} />
                Preview Laporan PDF
              </h2>
              <button
                onClick={() => setShowPreview(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#6b7280",
                }}
              >
                ×
              </button>
            </div>

            <div
              style={{
                textAlign: "center",
                marginBottom: "16px",
                padding: "16px",
                backgroundColor: "#f3f4f6",
                borderRadius: "8px",
              }}
            >
              <p style={{ margin: 0, fontSize: "14px", color: "#6b7280" }}>
                Preview laporan sebelum download. Klik Download PDF untuk
                menyimpan file.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                gap: "8px",
                justifyContent: "flex-end",
                marginTop: "24px",
              }}
            >
              <button
                onClick={() => setShowPreview(false)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#f3f4f6",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#374151",
                }}
              >
                Batal
              </button>
              <button
                onClick={generatePDF}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 16px",
                  backgroundColor: "#3b82f6",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "white",
                }}
              >
                <Download size={16} />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Laporans;
