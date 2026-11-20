import { useState } from "react";
import SchoolManagement from "./pages/SchoolManagement";
import LocationSelector from "./components/LocationSelector";

interface SelectedLocation {
  state: string;
  division: string;
  area: string;
  agent: string;
  schoolType?: string;
}

function App() {
  const [selectedLocation, setSelectedLocation] =
    useState<SelectedLocation | null>(null);

  return (
    <div>
      {selectedLocation === null ? (
        <LocationSelector
          onContinue={(location) =>
            setSelectedLocation({
              ...location,
              schoolType: "Primary",
            })
          }
        />
      ) : (
        <SchoolManagement
          selectedLocation={selectedLocation}
        />
      )}
    </div>
  );
}

export default App;