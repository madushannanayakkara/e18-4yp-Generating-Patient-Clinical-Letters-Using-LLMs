import React, { useRef, useEffect, useState } from "react";
import "./PatientSearchResults.css";
import QueuePlayNextIcon from "@mui/icons-material/QueuePlayNext";
import UpdateIcon from "@mui/icons-material/Update";

interface PatientDetails {
  patient_id: number;
  patient_name: string;
  birthdate: string;
}

interface Props {
  patientsSearched: Record<number, string>;
  setPatientsSearched: React.Dispatch<React.SetStateAction<object>>;
  setSearchResultListOpened: React.Dispatch<React.SetStateAction<boolean>>;
  setSearchBarInput: React.Dispatch<React.SetStateAction<string>>;
  setSelectedPatientDetails: React.Dispatch<
    React.SetStateAction<PatientDetails>
  >;
}

const PatientSearchResults: React.FC<Props> = ({
  patientsSearched,
  setPatientsSearched,
  setSearchResultListOpened,
  setSearchBarInput,
  setSelectedPatientDetails,
}) => {
  const node = useRef<HTMLDivElement>(null);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);

  const handleListItemClick = async (key: number) => {
    setSearchBarInput(patientsSearched[key]);
    setSearchResultListOpened(false);
    setPatientsSearched({});

    //add patient data fetching api
    const response = await fetch("http://localhost:8080/api/patient-details", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        patient_id: key,
      }),
    });

    const results = await response.json();
    setSelectedPatientDetails(results);
  };

  useEffect(() => {
    // Close the search results if clicked outside
    function handleClickOutside(event: MouseEvent) {
      if (node.current && !node.current.contains(event.target as Node)) {
        setSearchResultListOpened(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if ("error" in patientsSearched) {
    if (patientsSearched.error == "No query provided") {
      return <></>;
    }
  }

  return (
    <div
      ref={node}
      className="search-result-container absolute w-full bg-slate-600 rounded-md top-full left-0 z-50 mt-2 mr-2"
      style={{
        width: `calc(100% - 0.5rem)`,
        boxShadow: "0px 0px 6px #7d7d7d",
      }}
    >
      <div
        className="search-results-list"
        style={{
          maxHeight: "300px",
          overflowY: "auto",
        }}
      >
        {Object.keys(patientsSearched).map((key) => {
          const patientId = parseInt(key, 10);
          return (
            <div
              key={key}
              className="relative px-3 py-2 font-sans font-medium hover:bg-slate-500 rounded-md text-slate-200 hover:text-slate-300 text-sm cursor-pointer"
              onMouseEnter={() => setHoveredItem(patientId)}
              onMouseLeave={() => setHoveredItem(null)}
              onClick={() => handleListItemClick(patientId)}
            >
              {patientId.toString().padStart(4, "0") +
                " - " +
                patientsSearched[patientId]}
              {hoveredItem === patientId && (
                <>
                  <div
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
                    onClick={() => {
                      alert("update: " + patientsSearched[patientId]);
                    }}
                  >
                    <UpdateIcon />
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
      <div
        className="addPatient px-3 py-1 border-t-2 border-slate-500 text-sm cursor-pointer"
        onClick={() => {
          alert("add new patient");
        }}
      >
        <QueuePlayNextIcon className="text-blue-300 pr-1" />
        <label className="pl-3 text-blue-300 font-medium font-sans cursor-pointer">
          Add new patient
        </label>
      </div>
    </div>
  );
};

export default PatientSearchResults;
