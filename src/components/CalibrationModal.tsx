// CalibrationModal.tsx - Simple Version (No External UI Dependencies)
import React, { useState, useEffect } from "react";

interface CalibrationData {
  multiplierR: number;
  multiplierS: number;
  multiplierT: number;
  divider: number;
  persen: number;
}

interface CalibrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  inputKalibrasiR: number;
  inputKalibrasiS: number;
  inputKalibrasiT: number;
  persenadd: number;
  inputValue1: number;
  onSave: (data: CalibrationData) => Promise<void>;
}

const CalibrationModal: React.FC<CalibrationModalProps> = ({
  isOpen,
  onClose,
  inputKalibrasiR,
  inputKalibrasiS,
  inputKalibrasiT,
  persenadd,
  inputValue1,
  onSave,
}) => {
  const [formData, setFormData] = useState<CalibrationData>({
    multiplierR: inputKalibrasiR,
    multiplierS: inputKalibrasiS,
    multiplierT: inputKalibrasiT,
    divider: inputValue1,
    persen: persenadd,
  });

  const [isLoading, setIsLoading] = useState(false);

  // Update form data when props change
  useEffect(() => {
    setFormData({
      multiplierR: inputKalibrasiR,
      multiplierS: inputKalibrasiS,
      multiplierT: inputKalibrasiT,
      divider: inputValue1,
      persen: persenadd,
    });
  }, [
    inputKalibrasiR,
    inputKalibrasiS,
    inputKalibrasiT,
    inputValue1,
    persenadd,
  ]);

  const handleInputChange = (field: keyof CalibrationData, value: string) => {
    const numericValue = parseFloat(value) || 0;
    setFormData((prev) => ({
      ...prev,
      [field]: numericValue,
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onSave(formData);
      console.log("✅ Calibration data saved successfully");
    } catch (error) {
      console.error("❌ Error saving calibration:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      multiplierR: 0,
      multiplierS: 0,
      multiplierT: 0,
      divider: 5.75,
      persen: 1,
    });
  };

  if (!isOpen) return null;

  return (
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
          maxWidth: "600px",
          width: "90%",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Header */}
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
            }}
          >
            Kalibrasi Current & Biaya
          </h2>
          <button
            onClick={onClose}
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

        {/* Current Calibration Section */}
        <div style={{ marginBottom: "24px" }}>
          <h3
            style={{
              fontSize: "18px",
              fontWeight: "500",
              marginBottom: "16px",
              color: "#374151",
            }}
          >
            Kalibrasi Arus (Current)
          </h3>

          {/* Global Divider */}
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                marginBottom: "4px",
                color: "#374151",
              }}
            >
              Pembagi Global (Divider)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.divider}
              onChange={(e) => handleInputChange("divider", e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            />
            <p
              style={{
                fontSize: "12px",
                color: "#6b7280",
                marginTop: "4px",
                margin: "4px 0 0 0",
              }}
            >
              Nilai pembagi yang diterapkan ke semua current (IR, IS, IT)
            </p>
          </div>

          {/* Individual Current Multipliers */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
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
                IR Penambah
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.multiplierR}
                onChange={(e) =>
                  handleInputChange("multiplierR", e.target.value)
                }
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
                IS Penambah
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.multiplierS}
                onChange={(e) =>
                  handleInputChange("multiplierS", e.target.value)
                }
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
                IT Penambah
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.multiplierT}
                onChange={(e) =>
                  handleInputChange("multiplierT", e.target.value)
                }
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  fontSize: "14px",
                }}
              />
            </div>
          </div>
        </div>

        {/* Cost Calculation Section */}
        <div style={{ marginBottom: "24px" }}>
          <h3
            style={{
              fontSize: "18px",
              fontWeight: "500",
              marginBottom: "16px",
              color: "#374151",
            }}
          >
            Kalibrasi Biaya
          </h3>
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
              Multiplier Biaya
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.persen}
              onChange={(e) => handleInputChange("persen", e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            />
            <p
              style={{
                fontSize: "12px",
                color: "#6b7280",
                marginTop: "4px",
                margin: "4px 0 0 0",
              }}
            >
              Pengali untuk perhitungan Cost without Booster (1.0 = 100%, 1.2 =
              120%)
            </p>
          </div>
        </div>

        {/* Formula Preview */}
        <div
          style={{
            backgroundColor: "#f9fafb",
            padding: "16px",
            borderRadius: "6px",
            marginBottom: "24px",
          }}
        >
          <h4
            style={{
              fontSize: "16px",
              fontWeight: "500",
              marginBottom: "8px",
              color: "#374151",
            }}
          >
            Formula yang Digunakan:
          </h4>
          <div
            style={{
              fontSize: "14px",
              color: "#4b5563",
              lineHeight: "1.5",
            }}
          >
            <p>
              <strong>Calibrated Current:</strong> (Raw Current /{" "}
              {formData.divider}) + Offset
            </p>
            <p>
              <strong>IR Kalibrasi:</strong> (IR / {formData.divider}) +{" "}
              {formData.multiplierR}
            </p>
            <p>
              <strong>IS Kalibrasi:</strong> (IS / {formData.divider}) +{" "}
              {formData.multiplierS}
            </p>
            <p>
              <strong>IT Kalibrasi:</strong> (IT / {formData.divider}) +{" "}
              {formData.multiplierT}
            </p>
            <p>
              <strong>Cost without Booster:</strong> Current × {formData.persen}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          <button
            onClick={handleReset}
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
            Reset ke Default
          </button>

          <div
            style={{
              display: "flex",
              gap: "8px",
            }}
          >
            <button
              onClick={onClose}
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
              onClick={handleSave}
              disabled={isLoading}
              style={{
                padding: "8px 16px",
                backgroundColor: isLoading ? "#9ca3af" : "#3b82f6",
                border: "none",
                borderRadius: "4px",
                cursor: isLoading ? "not-allowed" : "pointer",
                fontSize: "14px",
                fontWeight: "500",
                color: "white",
              }}
            >
              {isLoading ? "Menyimpan..." : "Simpan Kalibrasi"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalibrationModal;
