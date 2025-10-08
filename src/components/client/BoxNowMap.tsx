// components/client/BoxNowMap.tsx
"use client";

import { useEffect, useRef } from "react";

type BoxNowSelection = {
  boxnowLockerId: string;
  boxnowLockerAddressLine1: string;
  boxnowLockerPostalCode: string;
  boxnowLockerName?: string;
};

declare global {
  interface Window {
    _bn_map_widget_config?: any;
  }
}

export default function BoxNowMap({
  onSelect,
  defaultZip,
}: {
  onSelect: (sel: BoxNowSelection) => void;
  defaultZip?: string;
}) {
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    window._bn_map_widget_config = {
      partnerId: 123,
      parentElement: "#boxnowmap",
      type: "popup",
      autoselect: false,
      autoclose: true,
      gps: true,
      ...(defaultZip ? { zip: defaultZip } : {}),
      afterSelect: (selected: BoxNowSelection) => {
        onSelect(selected);
      },
    };

    const s = document.createElement("script");
    s.src = "https://widget-cdn.boxnow.gr/map-widget/client/v5.js";
    s.async = true;
    s.defer = true;
    document.head.appendChild(s);

    return () => {
      document.head.removeChild(s);
    };
  }, [onSelect, defaultZip]);

  return (
    <div className="space-y-2">
      <div id="boxnowmap" />
      <button
        type="button"
        className="boxnow-map-widget-button inline-flex items-center justify-center rounded-md border border-green-600 text-green-700 px-4 py-2 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-600/30"
      >
        Επιλογή BOX NOW Locker
      </button>
    </div>
  );
}
