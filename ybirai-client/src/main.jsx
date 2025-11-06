import React from "react";
import ReactDOM from "react-dom/client";
import { Amplify } from "aws-amplify";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import "./i18n";
import { NextUIProvider } from "@nextui-org/react";
import { lightTheme } from "./theme.js";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { UserDataProvider } from "./contexts/UserContext.jsx";
import { CourseProvider } from "./contexts/CourseContext.jsx";
import { VideoPlayerProvider } from "./contexts/VideoPlayerContext.jsx";
import { Toaster } from "sonner";
import { WebSocketProvider } from "./contexts/WebSocketContext";
import { CourseProgressProvider } from "./contexts/CourseProgressContext.jsx";
import { EnrollmentProvider } from "./contexts/EnrollmentContext.jsx";
import { LanguageProvider } from "./contexts/LanguageContext.jsx";

Amplify.configure({
  Auth: {
    Cognito: {
      region: import.meta.env.VITE_AWS_COGNITO_REGION,
      userPoolId: import.meta.env.VITE_AWS_USER_POOLS_ID,
      userPoolClientId: import.meta.env.VITE_AWS_USER_POOLS_WEB_CLIENT_ID,
    },
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 1000 * 60 * 60 * 24, // 24 hours
    },
  },
});

const persister = createSyncStoragePersister({
  storage: window.localStorage,
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <WebSocketProvider>
          <UserDataProvider>
            <CourseProvider>
              <PersistQueryClientProvider
                client={queryClient}
                persistOptions={{ persister }}
              >
                <EnrollmentProvider>
                  <CourseProgressProvider>
                    <VideoPlayerProvider>
                      <NextUIProvider theme={lightTheme}>
                        <LanguageProvider>
                          <Toaster richColors />
                          <App />
                        </LanguageProvider>
                      </NextUIProvider>
                    </VideoPlayerProvider>
                  </CourseProgressProvider>
                </EnrollmentProvider>
              </PersistQueryClientProvider>
            </CourseProvider>
          </UserDataProvider>
        </WebSocketProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
