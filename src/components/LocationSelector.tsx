
import React, { useState } from "react";
import locationData from "../data/Data";

// ==============================
// TYPES
// ==============================

interface SelectedLocation {
  state: string;
  division: string;
  area: string;
  agent: string;
  schoolType?: string;
}

interface LocationSelectorProps {
  onContinue: (location: SelectedLocation) => void;
}

interface DivisionData {
  areas: string[];
  agents: string[];
}

// ==============================
// COMPONENT
// ==============================

export default function LocationSelector({
  onContinue,
}: LocationSelectorProps) {

  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedDivision, setSelectedDivision] = useState<string>("");
  const [selectedArea, setSelectedArea] = useState<string>("");
  const [selectedAgent, setSelectedAgent] = useState<string>("");

  // ==============================
  // STATES
  // ==============================

  const states = Object.keys(locationData);

  // ==============================
  // DIVISIONS
  // ==============================

  const divisions = selectedState
    ? Object.keys(locationData[selectedState] || {})
    : [];

  // ==============================
  // AREAS
  // ==============================

  const areas: string[] =
    selectedState && selectedDivision
      ? locationData[selectedState]?.[selectedDivision]?.areas || []
      : [];

  // ==============================
  // AGENTS
  // ==============================

  const agents: string[] =
    selectedState && selectedDivision
      ? locationData[selectedState]?.[selectedDivision]?.agents || []
      : [];

  // ==============================
  // STATE CHANGE
  // ==============================

  const handleStateChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    const value = e.target.value;

    setSelectedState(value);
    setSelectedDivision("");
    setSelectedArea("");
    setSelectedAgent("");
  };

  // ==============================
  // DIVISION CHANGE
  // ==============================

  const handleDivisionChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    const value = e.target.value;

    setSelectedDivision(value);
    setSelectedArea("");
    setSelectedAgent("");
  };

  // ==============================
  // AREA CHANGE
  // ==============================

  const handleAreaChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    const value = e.target.value;

    setSelectedArea(value);
    setSelectedAgent("");
  };

  // ==============================
  // AGENT CHANGE
  // ==============================

  const handleAgentChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    const value = e.target.value;

    setSelectedAgent(value);
  };

  // ==============================
  // CONTINUE
  // ==============================

  const handleContinue = (): void => {
    if (
      !selectedState ||
      !selectedDivision ||
      !selectedArea ||
      !selectedAgent
    ) {
      alert("Please select State, Division, Area and Agent.");
      return;
    }

    onContinue({
      state: selectedState,
      division: selectedDivision,
      area: selectedArea,
      agent: selectedAgent,
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">

      <div className="w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl">

        {/* ================= HEADER ================= */}

        <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 px-10 py-8 text-white">

          <h1 className="text-3xl font-bold">
            School Book Distribution CRM
          </h1>

          <p className="mt-2 text-slate-300">
            Select State, Division, Area and Agent
          </p>

        </div>

        {/* ================= CONTENT ================= */}

        <div className="p-10">

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">

            {/* ================= STATE ================= */}

            <div>
              <label className="mb-2 block font-semibold text-slate-700">
                State
              </label>

              <select
                value={selectedState}
                onChange={handleStateChange}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              >
                <option value="">
                  Select State
                </option>

                {states.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            {/* ================= DIVISION ================= */}

            <div>
              <label className="mb-2 block font-semibold text-slate-700">
                Division
              </label>

              <select
                value={selectedDivision}
                onChange={handleDivisionChange}
                disabled={!selectedState}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition disabled:cursor-not-allowed disabled:bg-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              >
                <option value="">
                  Select Division
                </option>

                {divisions.map((division) => (
                  <option key={division} value={division}>
                    {division}
                  </option>
                ))}
              </select>
            </div>

            {/* ================= AREA ================= */}

            <div>
              <label className="mb-2 block font-semibold text-slate-700">
                Area
              </label>

              <select
                value={selectedArea}
                onChange={handleAreaChange}
                disabled={!selectedDivision}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition disabled:cursor-not-allowed disabled:bg-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              >
                <option value="">
                  Select Area
                </option>

                {areas.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>

            {/* ================= AGENT ================= */}

            <div>
              <label className="mb-2 block font-semibold text-slate-700">
                Agent
              </label>

              <select
                value={selectedAgent}
                onChange={handleAgentChange}
                disabled={!selectedArea}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition disabled:cursor-not-allowed disabled:bg-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              >
                <option value="">
                  Select Agent
                </option>

                {agents.map((agent) => (
                  <option key={agent} value={agent}>
                    {agent}
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* ================= SELECTED PATH ================= */}

          {selectedState &&
            selectedDivision &&
            selectedArea &&
            selectedAgent && (
              <div className="mt-8 rounded-2xl border border-indigo-100 bg-indigo-50 p-5">

                <p className="text-sm font-semibold text-slate-500">
                  Selected Location
                </p>

                <p className="mt-2 text-lg font-bold text-slate-800">
                  {selectedState} / {selectedDivision} / {selectedArea}
                </p>

                <p className="mt-1 font-semibold text-indigo-600">
                  Agent: {selectedAgent}
                </p>

              </div>
            )}

          {/* ================= CONTINUE ================= */}

          <div className="mt-8 flex justify-end">

            <button
              onClick={handleContinue}
              className="rounded-xl bg-indigo-600 px-8 py-3 font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-indigo-700"
            >
              Continue →
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}
