import { useEffect } from "react";

const BoxNowMap = () => {
  useEffect(() => {
    (window as any)._bn_map_widget_config = {
      parentElement: "#boxnowmap",
      type: "iframe", // δοκίμασε με iframe
      afterSelect: (selected: any) => {
        console.log("Locker selected:", selected);
      },
    };

    if (!document.getElementById("boxnow-widget-script")) {
      const script = document.createElement("script");
      script.id = "boxnow-widget-script";
      script.src = "https://widget-cdn.boxnow.gr/map-widget/client/v5.js";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, []);

  return (
    <div
      id="boxnowmap"
      style={{ width: "100%", height: "600px", border: "2px solid blue" }}
    />
  );
};

export default BoxNowMap;
