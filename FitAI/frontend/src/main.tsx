// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import './styles/index.css'
import { AuthProvider } from "react-oidc-context";

const isDev = window.location.hostname === "localhost";

const cognitoAuthConfig = {
  authority: "https://cognito-idp.ap-northeast-2.amazonaws.com/ap-northeast-2_mZUHXhxIV",
  client_id: "4ms22p52tnirk6qric8oq420j1",
  redirect_uri: isDev
    ? "http://localhost:5173/"
    : "https://main.dka06770r9jf2.amplifyapp.com/",
  response_type: "code",
  scope: "openid email profile aws.cognito.signin.user.admin",
  extraQueryParams: {
    lang: "ko",
  },
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider {...cognitoAuthConfig}>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
