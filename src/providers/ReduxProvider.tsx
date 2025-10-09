"use client";

import { useState, useEffect } from "react";
import { Provider } from "react-redux";
import { store, persistor } from "@/store/store";
import { PersistGate } from "redux-persist/integration/react";
import Lottie from "lottie-react";

// 👇 Εφόσον είναι στον ίδιο φάκελο με αυτό το αρχείο
import loadingAnimation from "./loading.json";

export default function ReduxProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const Loader = (
    <div className="flex justify-center items-center h-screen">
      <Lottie animationData={loadingAnimation} loop className="w-40 h-40" />
    </div>
  );

  if (!isMounted) {
    return Loader;
  }

  return (
    <Provider store={store}>
      <PersistGate loading={Loader} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
