"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    _bn_map_widget_config?: any;
  }
}

export default function BoxNowMap({
  onSelect,
}: {
  onSelect?: (locker: any) => void;
}) {
  useEffect(() => {
    // Αν υπάρχει ήδη script, μην το ξαναβάλεις
    if (!document.getElementById("boxnow-widget-script")) {
      const script = document.createElement("script");
      script.src = "https://widget-cdn.boxnow.gr/map-widget/client/v5.js";
      script.id = "boxnow-widget-script";
      
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    // Init config
    window._bn_map_widget_config = {
      partnerId: null, // βάλε δικό σου αν έχεις, αλλιώς demo
      parentElement: "#boxnowmap",
      afterSelect: function (selected: any) {
        console.log("Selected locker:", selected);
        if (onSelect) onSelect(selected);
      },
    };
  }, [onSelect]);

  return (
    <div
      id="boxnowmap"
      style={{ width: "100%", height: "500px", border: "1px solid #ccc" }}
    />
  );
}
export default BoxNowMap;
